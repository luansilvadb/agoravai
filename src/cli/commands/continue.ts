import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository } from '../domain/repositories.js';
import { getChangePath, CONFIG } from '../utils/config.js';
import { pathExists, listDirs } from '../utils/fs-utils.js';
import { join } from 'path';
import { MESSAGES, EXIT_CODES } from '../constants.js';

export async function continueCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.name as string;

  const container = Container.getInstance();
  const repository = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  if (!changeName) {
    // List available changes
    const changes = await repository.list();

    if (changes.length === 0) {
      console.log(MESSAGES.INFO_NO_CHANGES());
    } else {
      console.log('Active changes (use: npm run specskills:continue <name>):');
      for (const change of changes) {
        console.log(`  - ${change}`);
      }
    }
    return;
  }

  const change = await repository.getChange(changeName);

  if (!change) {
    console.error(`✖ Error: ${MESSAGES.ERROR_CHANGE_NOT_FOUND(changeName)}`);
    process.exit(EXIT_CODES.NOT_FOUND);
  }

  console.log(`Continuing change: ${changeName}`);

  const changePath = getChangePath(changeName);

  // Check missing artifacts
  const schema = CONFIG.SCHEMAS[CONFIG.DEFAULT_SCHEMA];
  const missingArtifacts: string[] = [];

  const getArtifactPath = (name: string): string => {
    return name === 'specs'
      ? join(changePath, 'specs', 'specs.md')
      : join(changePath, `${name}.md`);
  };

  for (const artifact of schema.artifacts) {
    const artifactPath = getArtifactPath(artifact);
    if (!pathExists(artifactPath)) {
      missingArtifacts.push(artifact);
    }
  }

  // Check granular specs
  const specsDir = join(changePath, 'specs');
  let granularSpecs: string[] = [];
  if (pathExists(specsDir)) {
    const specDirs = await listDirs(specsDir);
    granularSpecs = specDirs.filter(d => d !== 'specs.md' && pathExists(join(specsDir, d, 'specs.md')));
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
        console.log(`  - specs/${spec}/specs.md`);
      }
      if (granularSpecs.length > 5) {
        console.log(`  ... and ${granularSpecs.length - 5} more`);
      }
    }

    console.log('');
    console.log('Use npm run specskills:apply ' + changeName + ' to start implementing.');
    if (granularSpecs.length > 0) {
      console.log('Or apply a specific spec: npm run specskills:apply ' + changeName + ' --spec <spec-id>');
    }
  }
}
