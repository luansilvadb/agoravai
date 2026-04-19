import { CONFIG, getChangePath } from '../utils/config.js';
import { listDirs, pathExists } from '../utils/fs-utils.js';
import { join } from 'path';

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
    console.error('Erro: --change <name> é obrigatório');
    process.exit(1);
  }

  const changePath = getChangePath(changeName);
  
  if (!pathExists(changePath)) {
    const availableChanges = await listDirs('specskill/changes');
    const activeChanges = availableChanges.filter(c => !c.includes('archive'));
    
    if (jsonOutput) {
      console.log(JSON.stringify({ error: `Change '${changeName}' not found`, available: activeChanges }, null, 2));
    } else {
      console.error(`✖ Error: Change '${changeName}' not found. Available changes:`);
      for (const change of activeChanges) {
        console.error(`  ${change}`);
      }
    }
    process.exit(1);
  }

  const schemaName = CONFIG.DEFAULT_SCHEMA;
  const schema = CONFIG.SCHEMAS[schemaName];
  
  const artifacts: ArtifactStatus[] = [];
  let doneCount = 0;
  
  // Contar specs granulares
  const specsDir = join(changePath, 'specs');
  let granularSpecsCount = 0;
  if (pathExists(specsDir)) {
    const specDirs = await listDirs(specsDir);
    granularSpecsCount = specDirs.filter(d => d !== 'spec.md' && pathExists(join(specsDir, d, 'spec.md'))).length;
  }

  // Helper para obter caminho do artefato
  const getArtifactPath = (name: string): string => {
    return name === 'specs' 
      ? join(changePath, 'specs', 'spec.md')
      : join(changePath, `${name}.md`);
  };

  for (const artifactName of schema.artifacts) {
    const artifactPath = getArtifactPath(artifactName);
    const exists = pathExists(artifactPath);
    
    // Verificar dependências
    const deps = schema.dependencies[artifactName as keyof typeof schema.dependencies] || [];
    const depsDone = deps.every(dep => {
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
      console.log(`Use --specs flag or run specskill:generate to manage ${granularSpecsCount} granular specs`);
    }
  }
}
