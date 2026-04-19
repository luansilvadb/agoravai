import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository, FileSystemPort } from '../domain/repositories.js';
import { pathExists } from '../utils/fs-utils.js';
import { getChangePath, CONFIG } from '../utils/config.js';
import { join } from 'path';
import { MESSAGES, EXIT_CODES } from '../constants.js';
import { detectCycleInDeps, findCircularPath } from '../utils/graph.js';
import { loadSpecsParallel } from '../utils/parallel-io.js';

interface ArtifactStatus {
  name: string;
  status: 'ready' | 'in-progress' | 'done' | 'pending';
  path?: string;
}

interface ChangeStatus {
  schemaName: string;
  name: string;
  progress: string;
  artifacts: ArtifactStatus[];
  state?: 'ready' | 'blocked' | 'all_done';
}

export async function statusCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.change as string;
  const jsonOutput = options.json === true;

  if (!changeName) {
    console.error('Error: <name> is required');
    process.exit(EXIT_CODES.ERROR);
  }

  const container = Container.getInstance();
  const repository = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  const change = await repository.getChange(changeName);

  if (!change) {
    const availableChanges = await repository.list();

    if (jsonOutput) {
      console.log(JSON.stringify({ error: MESSAGES.ERROR_CHANGE_NOT_FOUND(changeName), available: availableChanges }, null, 2));
    } else {
      console.error(`✖ Error: ${MESSAGES.ERROR_CHANGE_NOT_FOUND(changeName)}. Available changes:`);
      for (const c of availableChanges) {
        console.error(`  ${c}`);
      }
    }
    process.exit(EXIT_CODES.NOT_FOUND);
  }

  const changePath = getChangePath(changeName);

  const schemaName = CONFIG.DEFAULT_SCHEMA;
  const schema = CONFIG.SCHEMAS[schemaName];

  // Check for circular dependencies in schema
  const deps: Record<string, string[]> = Object.fromEntries(
    Object.entries(schema.dependencies).map(([k, v]) => [k, [...v]])
  );
  if (detectCycleInDeps(deps)) {
    const cycle = findCircularPath(deps);
    console.error(`Error: Circular dependency detected in schema: ${cycle?.join(' -> ')}`);
    process.exit(EXIT_CODES.ERROR);
  }

  const artifacts: ArtifactStatus[] = [];
  let doneCount = 0;

  // Load granular specs using parallel I/O
  const specsDir = join(changePath, 'specs');
  let granularSpecsCount = 0;
  if (pathExists(specsDir)) {
    const fs = container.resolve<FileSystemPort>(TOKENS.FILE_SYSTEM);
    const granularSpecs = await loadSpecsParallel(specsDir, fs);
    granularSpecsCount = granularSpecs.length;
  }

  // Helper para obter caminho do artefato
  const getArtifactPath = (name: string): string => {
    return name === 'specs' 
      ? join(changePath, 'specs', 'specs.md')
      : join(changePath, `${name}.md`);
  };

  for (const artifactName of schema.artifacts) {
    const artifactPath = getArtifactPath(artifactName);
    const exists = pathExists(artifactPath);
    
    // Check dependencies
    const deps = schema.dependencies[artifactName as keyof typeof schema.dependencies] || [];
    const depsDone = deps.every((dep: string) => {
      const depPath = getArtifactPath(dep);
      return pathExists(depPath);
    });

    let status: ArtifactStatus['status'];
    if (exists) {
      status = 'done';
      doneCount++;
    } else if (depsDone) {
      status = 'ready';
    } else {
      status = 'pending';
    }

    artifacts.push({
      name: artifactName,
      status,
      path: exists ? artifactPath : undefined
    });
  }

  // Determinar estado geral
  let state: ChangeStatus['state'] = 'ready';
  if (doneCount === artifacts.length) {
    state = 'all_done';
  } else if (artifacts.some(a => a.status === 'pending')) {
    state = 'blocked';
  }

  const progress = `${doneCount}/${artifacts.length}`;

  if (jsonOutput) {
    const result: ChangeStatus & { granularSpecs: number } = {
      schemaName,
      name: changeName,
      progress,
      artifacts,
      state,
      granularSpecs: granularSpecsCount
    };
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Change: ${changeName}`);
    console.log(`Schema: ${schemaName}`);
    console.log(`Progress: ${progress} artifacts complete`);
    if (granularSpecsCount > 0) {
      console.log(`Granular specs: ${granularSpecsCount}`);
    }
    console.log('');
    for (const artifact of artifacts) {
      const symbol = artifact.status === 'done' ? '[x]' : 
                      artifact.status === 'ready' ? '[-]' : '[ ]';
      const deps = schema.dependencies[artifact.name as keyof typeof schema.dependencies] || [];
      const depsStr = deps.length > 0 && artifact.status !== 'done' 
        ? ` (blocked by: ${deps.join(', ')})` 
        : '';
      console.log(`${symbol} ${artifact.name}${depsStr}`);
    }
    
    if (granularSpecsCount > 0) {
      console.log('');
      console.log(`Use --specs flag or run specskills:generate to manage ${granularSpecsCount} granular specs`);
    }
  }
}
