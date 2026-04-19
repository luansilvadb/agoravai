import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository, FileSystemPort } from '../domain/repositories.js';
import { getChangePath } from '../utils/config.js';
import { pathExists, readFile } from '../utils/fs-utils.js';
import { join } from 'path';
import { loadSpecsParallel } from '../utils/parallel-io.js';
import { MESSAGES, EXIT_CODES } from '../constants.js';
import { formatSimplePreview } from '../utils/formatters.js';

export async function applyCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.change as string;
  const jsonOutput = options.json === true;
  const specFilter = options.spec as string | undefined;
  const dryRun = options.dryRun === true;

  if (!changeName) {
    console.error('Error: <name> is required');
    process.exit(EXIT_CODES.ERROR);
  }

  const container = Container.getInstance();
  const repository = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  const change = await repository.getChange(changeName);

  if (!change) {
    console.error(`✖ Error: ${MESSAGES.ERROR_CHANGE_NOT_FOUND(changeName)}`);
    process.exit(EXIT_CODES.NOT_FOUND);
  }

  if (dryRun) {
    const specMsg = specFilter ? ` (filtered by: ${specFilter})` : '';
    console.log(formatSimplePreview(
      'Apply change tasks',
      `${changeName}${specMsg}`,
      ['Read tasks.md', 'Show pending tasks', 'List granular specs']
    ));
    return;
  }

  const changePath = getChangePath(changeName);

  // Check if tasks.md exists
  const tasksPath = join(changePath, 'tasks.md');

  if (!pathExists(tasksPath)) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        error: 'Tasks file not found',
        state: 'blocked',
        message: 'Use specskill:continue to generate tasks'
      }, null, 2));
    } else {
      console.error('✖ Error: tasks.md not found');
      console.error('Use: npm run specskill:continue ' + changeName);
    }
    process.exit(EXIT_CODES.NOT_FOUND);
  }

  // Read tasks
  const tasksContent = await readFile(tasksPath) || '';
  const lines = tasksContent.split('\n');

  const pendingTasks: string[] = [];
  let allTasksCount = 0;

  for (const line of lines) {
    const match = line.match(/^- \[([ x])\] (.+)$/);
    if (match) {
      allTasksCount++;
      if (match[1] !== 'x') {
        const task = match[2];
        if (task) pendingTasks.push(task);
      }
    }
  }

  const completeTasks = allTasksCount - pendingTasks.length;

  // Load granular specs using parallel I/O
  const fs = container.resolve<FileSystemPort>(TOKENS.FILE_SYSTEM);
  const specsDir = join(changePath, 'specs');
  const granularSpecs = pathExists(specsDir)
    ? await loadSpecsParallel(specsDir, fs)
    : [];

  // Filter if spec specified
  const targetSpecs = specFilter
    ? granularSpecs.filter(s => s.id === specFilter || s.name.toLowerCase().includes(specFilter.toLowerCase()))
    : granularSpecs;

  if (jsonOutput) {
    const result: Record<string, unknown> = {
      change: changeName,
      progress: {
        total: allTasksCount,
        complete: completeTasks,
        remaining: pendingTasks.length
      },
      pendingTasks,
      state: pendingTasks.length === 0 ? 'all_done' : 'ready',
      specs: {
        total: granularSpecs.length,
        target: targetSpecs.length,
        list: targetSpecs.map(s => ({ id: s.id, name: s.name }))
      }
    };

    if (specFilter) {
      result.filter = specFilter;
    }

    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Apply for ${changeName}`);
    console.log(`Progress: ${completeTasks}/${allTasksCount} tasks complete`);
    console.log('');

    // Show granular specs available
    if (granularSpecs.length > 0) {
      console.log(`Granular specs available (${granularSpecs.length}):`);
      for (const spec of granularSpecs) {
        const isTarget = targetSpecs.find(t => t.id === spec.id);
        const marker = isTarget ? '→' : '  ';
        console.log(`${marker} ${spec.id}`);
        console.log(`   ${spec.name}`);
      }
      console.log('');

      if (specFilter && targetSpecs.length === 0) {
        console.log(`⚠ No specs match filter: "${specFilter}"`);
        console.log('Available specs:');
        for (const spec of granularSpecs) {
          console.log(`  - ${spec.id}`);
        }
      } else if (specFilter) {
        console.log(`✓ Filtered to ${targetSpecs.length} spec(s)`);
      }
    }

    console.log('');
    if (pendingTasks.length === 0) {
      console.log(MESSAGES.INFO_ALL_DONE());
    } else {
      console.log('Pending tasks:');
      for (const task of pendingTasks) {
        console.log(`  - ${task}`);
      }
      console.log('');
      console.log('Usage:');
      console.log(`  Apply all:          npm run specskill:apply ${changeName}`);
      console.log(`  Apply specific:     npm run specskill:apply ${changeName} --spec <spec-id>`);
    }
  }
}
