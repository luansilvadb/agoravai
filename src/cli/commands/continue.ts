import { CONFIG, getChangePath } from '../utils/config.js';
import { pathExists, listDirs } from '../utils/fs-utils.js';
import { join } from 'path';

export async function continueCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options._args as string || options.change as string;
  
  if (!changeName) {
    // Listar changes disponíveis
    if (!pathExists('specskill/changes')) {
      console.log('No changes found.');
      return;
    }

    const allChanges = await listDirs('specskill/changes');
    const activeChanges = allChanges.filter(c => c !== 'archive');
    
    if (activeChanges.length === 0) {
      console.log('No active changes found.');
    } else {
      console.log('Active changes (use: npm run specskill:continue -- <name>):');
      for (const change of activeChanges) {
        console.log(`  - ${change}`);
      }
    }
    return;
  }

  const changePath = getChangePath(changeName);
  
  if (!pathExists(changePath)) {
    console.error(`✖ Error: Change '${changeName}' not found`);
    process.exit(1);
  }

  console.log(`Continuing change: ${changeName}`);
  
  // Verificar artefatos faltantes
  const schema = CONFIG.SCHEMAS[CONFIG.DEFAULT_SCHEMA];
  const missingArtifacts: string[] = [];
  
  // Helper para obter caminho do artefato
  const getArtifactPath = (name: string): string => {
    return name === 'specs' 
      ? join(changePath, 'specs', 'spec.md')
      : join(changePath, `${name}.md`);
  };
  
  for (const artifact of schema.artifacts) {
    const artifactPath = getArtifactPath(artifact);
    if (!pathExists(artifactPath)) {
      missingArtifacts.push(artifact);
    }
  }

  // Verificar specs granulares
  const specsDir = join(changePath, 'specs');
  let granularSpecs: string[] = [];
  if (pathExists(specsDir)) {
    const specDirs = await listDirs(specsDir);
    granularSpecs = specDirs.filter(d => d !== 'spec.md' && pathExists(join(specsDir, d, 'spec.md')));
  }

  if (missingArtifacts.length > 0) {
    console.log('');
    console.log('Missing artifacts:');
    for (const artifact of missingArtifacts) {
      console.log(`  - ${artifact}.md`);
    }
    console.log('');
    console.log('To generate missing artifacts, use the propose workflow.');
  } else {
    console.log('✓ All artifacts exist.');
    
    if (granularSpecs.length > 0) {
      console.log('');
      console.log(`Found ${granularSpecs.length} granular specs:`);
      for (const spec of granularSpecs.slice(0, 5)) {
        console.log(`  - specs/${spec}/spec.md`);
      }
      if (granularSpecs.length > 5) {
        console.log(`  ... and ${granularSpecs.length - 5} more`);
      }
    }
    
    console.log('');
    console.log('Use npm run specskill:apply -- --change ' + changeName + ' to start implementing.');
    if (granularSpecs.length > 0) {
      console.log('Or apply a specific spec: npm run specskill:apply -- --change ' + changeName + ' --spec <spec-id>');
    }
  }
}
