import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository, Change } from '../domain/repositories.js';
import { MESSAGES, EXIT_CODES, SCHEMAS, DEFAULTS } from '../constants.js';
import { formatPreview, type PreviewItem } from '../utils/formatters.js';

export async function newChangeCommand(name: string, options: Record<string, string | boolean> = {}): Promise<void> {
  if (!name) {
    console.error(MESSAGES.ERROR_INVALID_NAME());
    console.error('Usage: specskills new change <name> [--schema <schema>]');
    process.exit(EXIT_CODES.ERROR);
  }

  const repository = Container.getInstance().resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  const exists = await repository.exists(name);

  if (exists) {
    console.error(MESSAGES.ERROR_CHANGE_EXISTS(name));
    process.exit(EXIT_CODES.ALREADY_EXISTS);
  }

  // Determine schema
  const schemaName = (options.schema as string) || DEFAULTS.SCHEMA;

  if (schemaName !== SCHEMAS.SPEC_DRIVEN && schemaName !== SCHEMAS.MINIMAL) {
    console.error(MESSAGES.ERROR_INVALID_SCHEMA(schemaName));
    console.error(`Valid schemas: ${SCHEMAS.SPEC_DRIVEN}, ${SCHEMAS.MINIMAL}`);
    process.exit(EXIT_CODES.VALIDATION_ERROR);
  }

  const dryRun = options.dryRun === true;

  if (dryRun) {
    const items: PreviewItem[] = [
      { action: 'create', path: `specskills/changes/${name}/.specskills.yaml`, description: 'config' },
      { action: 'create', path: `specskills/changes/${name}/proposal.md`, description: 'artifact' },
      { action: 'create', path: `specskills/changes/${name}/design.md`, description: 'artifact' },
      { action: 'create', path: `specskills/changes/${name}/specs/specs.md`, description: 'artifact' },
      { action: 'create', path: `specskills/changes/${name}/tasks.md`, description: 'artifact' },
    ];
    console.log(formatPreview({
      title: `Create change '${name}' (${schemaName})`,
      items,
    }));
    return;
  }

  // Create change via repository
  const change: Change = {
    name,
    schema: schemaName as 'spec-driven' | 'minimal',
    created: new Date().toISOString(),
    path: `specskills/changes/${name}`,
    artifacts: ['proposal', 'design', 'specs', 'tasks'],
  };

  await repository.save(change);

  console.log(MESSAGES.SUCCESS_CHANGE_CREATED(name));
}
