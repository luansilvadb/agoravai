import { getChangePath } from '../utils/config.js';
import { pathExists, readFile, listDirs } from '../utils/fs-utils.js';
import { join } from 'path';

interface SpecInfo {
  id: string;
  name: string;
  path: string;
  content: string;
}

async function loadGranularSpecs(changePath: string): Promise<SpecInfo[]> {
  const specsDir = join(changePath, 'specs');
  if (!pathExists(specsDir)) {
    return [];
  }

  const specs: SpecInfo[] = [];
  const dirs = await listDirs(specsDir);

  for (const dir of dirs) {
    // Ignorar o spec.md principal (não é granular)
    if (dir === 'spec.md') continue;

    const specPath = join(specsDir, dir, 'spec.md');
    if (pathExists(specPath)) {
      const content = await readFile(specPath) || '';
      // Extrair nome da primeira linha (# Nome)
      const nameMatch = content.match(/^# (.+)$/m);
      const name = nameMatch?.[1] ?? dir;

      specs.push({
        id: dir,
        name: name.replace(/^# /, ''),
        path: specPath,
        content
      });
    }
  }

  return specs;
}

export async function applyCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.change as string;
  const jsonOutput = options.json === true;
  const specFilter = options.spec as string | undefined;

  if (!changeName) {
    console.error('Erro: --change <name> é obrigatório');
    process.exit(1);
  }

  const changePath = getChangePath(changeName);

  if (!pathExists(changePath)) {
    console.error(`✖ Error: Change '${changeName}' not found`);
    process.exit(1);
  }

  // Verificar se existe tasks.md
  const tasksPath = join(changePath, 'tasks.md');

  if (!pathExists(tasksPath)) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        error: 'Tasks file not found',
        state: 'blocked',
        message: 'Use specskill:continue para gerar tasks'
      }, null, 2));
    } else {
      console.error('✖ Error: tasks.md not found');
      console.error('Use: npm run specskill:continue -- --change "' + changeName + '"');
    }
    process.exit(1);
  }

  // Ler tasks
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

  // Carregar specs granulares
  const granularSpecs = await loadGranularSpecs(changePath);

  // Se especificou uma spec, filtrar
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

    // Mostrar specs granulares disponíveis
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
      console.log('✓ All tasks complete! Ready to archive.');
    } else {
      console.log('Pending tasks:');
      for (const task of pendingTasks) {
        console.log(`  - ${task}`);
      }
      console.log('');
      console.log('Usage:');
      console.log(`  Apply all:          npm run specskill:apply -- --change ${changeName}`);
      console.log(`  Apply specific:     npm run specskill:apply -- --change ${changeName} --spec <spec-id>`);
    }
  }
}
