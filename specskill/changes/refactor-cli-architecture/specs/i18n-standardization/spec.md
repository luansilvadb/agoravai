# Spec: i18n Standardization

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

Mensagens de erro estão misturadas entre português e inglês, criando inconsistência.

## Objetivo

Padronizar todas as mensagens da CLI em inglês, preparando estrutura para futura internacionalização.

## Message Catalog

```typescript
// src/cli/constants.ts

export const MESSAGES = {
  // Errors
  ERROR_CHANGE_NOT_FOUND: (name: string): string => 
    `Change '${name}' not found`,
  
  ERROR_CHANGE_EXISTS: (name: string): string => 
    `Change '${name}' already exists`,
  
  ERROR_INVALID_SCHEMA: (schema: string, valid: string[]): string => 
    `Invalid schema '${schema}'. Valid schemas: ${valid.join(', ')}`,
  
  ERROR_REQUIRED_OPTION: (option: string): string => 
    `Required option '${option}' not provided`,
  
  ERROR_ARTIFACT_BLOCKED: (artifact: string, deps: string[]): string => 
    `Artifact '${artifact}' is blocked by: ${deps.join(', ')}`,
  
  ERROR_CIRCULAR_DEPENDENCY: (cycle: string[]): string => 
    `Circular dependency detected: ${cycle.join(' -> ')}`,
  
  ERROR_FILESYSTEM: (operation: string, path: string): string => 
    `Filesystem error during '${operation}' on '${path}'`,
  
  ERROR_VALIDATION_FAILED: (details: string): string => 
    `Validation failed: ${details}`,
  
  // Success
  SUCCESS_CHANGE_CREATED: (name: string, path: string): string => 
    `Created change '${name}' at ${path}`,
  
  SUCCESS_CHANGE_ARCHIVED: (name: string, dest: string): string => 
    `Archived change '${name}' to ${dest}`,
  
  SUCCESS_ARTIFACT_GENERATED: (id: string, path: string): string => 
    `Generated artifact '${id}' at ${path}`,
  
  SUCCESS_ALL_TASKS_COMPLETE: (): string => 
    `All tasks complete!`,
  
  // Warnings
  WARNING_DRY_RUN_MODE: (): string => 
    'DRY RUN: No changes will be made',
  
  WARNING_INCOMPLETE_ARTIFACTS: (count: number): string => 
    `${count} artifact(s) incomplete`,
  
  WARNING_INCOMPLETE_TASKS: (incomplete: number, total: number): string => 
    `${incomplete}/${total} task(s) incomplete`,
  
  WARNING_ARCHIVE_ALREADY_EXISTS: (path: string): string => 
    `Archive already exists at ${path}`,
  
  // Info
  INFO_AVAILABLE_CHANGES: (count: number): string => 
    `${count} change(s) available`,
  
  INFO_PROGRESS: (done: number, total: number): string => 
    `Progress: ${done}/${total}`,
  
  INFO_ARTIFACT_STATUS_DONE: (name: string): string => 
    `[x] ${name}`,
  
  INFO_ARTIFACT_STATUS_READY: (name: string): string => 
    `[-] ${name}`,
  
  INFO_ARTIFACT_STATUS_PENDING: (name: string, deps: string[]): string => 
    `[ ] ${name} (blocked by: ${deps.join(', ')})`,
  
  // CLI Help
  CLI_DESCRIPTION: (): string => 
    'Spec-driven change management CLI',
  
  CLI_VERSION: (): string => 
    '1.0.0',
  
  // Command descriptions
  CMD_NEW_DESCRIPTION: (): string => 
    'Create a new change',
  
  CMD_STATUS_DESCRIPTION: (): string => 
    'Show change status',
  
  CMD_LIST_DESCRIPTION: (): string => 
    'List changes',
  
  CMD_ARCHIVE_DESCRIPTION: (): string => 
    'Archive a completed change',
  
  CMD_APPLY_DESCRIPTION: (): string => 
    'Apply tasks from a change',
  
  CMD_CONTINUE_DESCRIPTION: (): string => 
    'Continue a blocked change',
  
  CMD_GENERATE_DESCRIPTION: (): string => 
    'Generate additional specs automatically',
  
  CMD_EXISTS_DESCRIPTION: (): string => 
    'Check if change exists',
  
  // Option descriptions
  OPT_CHANGE_DESCRIPTION: (): string => 
    'Change name',
  
  OPT_SCHEMA_DESCRIPTION: (): string => 
    'Schema type',
  
  OPT_JSON_DESCRIPTION: (): string => 
    'Output as JSON',
  
  OPT_ACTIVE_DESCRIPTION: (): string => 
    'Show only active changes',
  
  OPT_DRY_RUN_DESCRIPTION: (): string => 
    'Show what would be done without making changes',
  
  OPT_SPEC_DESCRIPTION: (): string => 
    'Apply specific spec only'
} as const;
```

## Command Updates

```typescript
// src/cli/commands/archive.ts (DEPOIS)

import { MESSAGES } from '../constants.js';

export async function archiveCommand(options: ArchiveOptions): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  // Validate change name provided
  if (!options.change) {
    // List available changes
    const changes = await repo.list();
    
    if (options.json) {
      console.log(JSON.stringify({ changes }, null, 2));
    } else {
      if (changes.length === 0) {
        console.log(MESSAGES.INFO_AVAILABLE_CHANGES(0));
      } else {
        console.log('Active changes:');
        for (const change of changes) {
          console.log(`  - ${change}`);
        }
      }
    }
    return;
  }

  const change = await repo.getChange(options.change);
  
  if (!change) {
    const error = MESSAGES.ERROR_CHANGE_NOT_FOUND(options.change);
    if (options.json) {
      console.log(JSON.stringify({ error }, null, 2));
    } else {
      console.error(`✖ ${error}`);
    }
    process.exit(EXIT_CODES.ERROR_CHANGE_NOT_FOUND);
  }

  // Dry run mode
  if (options.dryRun) {
    console.log(MESSAGES.WARNING_DRY_RUN_MODE());
    console.log(`Would archive: ${change.name}`);
    console.log(`From: ${change.path}`);
    
    const nextId = await container.resolve<GlobalConfigRepository>(TOKENS.GLOBAL_CONFIG_REPOSITORY)
      .getNextArchiveId();
    const dest = repo.getArchivePath(change.name, nextId);
    console.log(`To: ${dest}`);
    return;
  }

  // Perform archive
  const configRepo = container.resolve<GlobalConfigRepository>(TOKENS.GLOBAL_CONFIG_REPOSITORY);
  const archiveId = await configRepo.getNextArchiveId();
  
  await repo.archive(change.name, archiveId);
  
  const dest = repo.getArchivePath(change.name, archiveId);
  console.log(MESSAGES.SUCCESS_CHANGE_ARCHIVED(change.name, dest));
}
```

```typescript
// src/cli/commands/new-change.ts (DEPOIS)

export async function newChangeCommand(
  name: string,
  options: NewChangeOptions
): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  if (!name) {
    const error = MESSAGES.ERROR_REQUIRED_OPTION('name');
    console.error(`✖ ${error}`);
    process.exit(EXIT_CODES.ERROR_INVALID_ARGS);
  }

  if (await repo.exists(name)) {
    const error = MESSAGES.ERROR_CHANGE_EXISTS(name);
    console.error(`✖ ${error}`);
    process.exit(EXIT_CODES.ERROR_CHANGE_EXISTS);
  }

  // Validate schema
  const schema = options.schema || DEFAULTS.SCHEMA;
  if (!Object.values(SCHEMAS).includes(schema as SchemaType)) {
    const error = MESSAGES.ERROR_INVALID_SCHEMA(schema, Object.values(SCHEMAS));
    console.error(`✖ ${error}`);
    process.exit(EXIT_CODES.ERROR_INVALID_ARGS);
  }

  const change = {
    name,
    schema,
    created: new Date(),
    path: join(PATHS.CHANGES_DIR, name)
  };

  await repo.save(change);
  console.log(MESSAGES.SUCCESS_CHANGE_CREATED(name, change.path));
}
```

## CLI Setup with i18n

```typescript
// src/cli/index.ts

import { Command } from 'commander';
import { MESSAGES, CLI_DESCRIPTION, CLI_VERSION } from './constants.js';

const program = new Command();

program
  .name('specskill')
  .description(MESSAGES.CLI_DESCRIPTION())
  .version(CLI_VERSION);

program
  .command('new')
  .description(MESSAGES.CMD_NEW_DESCRIPTION())
  .argument('<name>', MESSAGES.OPT_CHANGE_DESCRIPTION())
  .option('-s, --schema <schema>', MESSAGES.OPT_SCHEMA_DESCRIPTION(), 'spec-driven')
  .action(newChangeCommand);

program
  .command('status')
  .description(MESSAGES.CMD_STATUS_DESCRIPTION())
  .requiredOption('-c, --change <name>', MESSAGES.OPT_CHANGE_DESCRIPTION())
  .option('--json', MESSAGES.OPT_JSON_DESCRIPTION())
  .action(statusCommand);

program
  .command('archive')
  .description(MESSAGES.CMD_ARCHIVE_DESCRIPTION())
  .option('-c, --change <name>', MESSAGES.OPT_CHANGE_DESCRIPTION())
  .option('--dry-run', MESSAGES.OPT_DRY_RUN_DESCRIPTION())
  .option('--json', MESSAGES.OPT_JSON_DESCRIPTION())
  .action(archiveCommand);

// ... other commands
```

## Migration Checklist

### Commands to Update
- [ ] `src/cli/commands/new-change.ts` - PT → EN
- [ ] `src/cli/commands/status.ts` - Mixed → EN
- [ ] `src/cli/commands/archive.ts` - EN (already good)
- [ ] `src/cli/commands/apply.ts` - Mixed → EN
- [ ] `src/cli/commands/continue.ts` - Mixed → EN
- [ ] `src/cli/commands/list.ts` - EN (already good)
- [ ] `src/cli/commands/generate.ts` - EN (already good)
- [ ] `src/cli/commands/exists.ts` - EN (already good)

### Messages to Replace
- [ ] `'Erro: --change <name> é obrigatório'` → `MESSAGES.ERROR_REQUIRED_OPTION('change')`
- [ ] `'✖ Error: Change...'` → `MESSAGES.ERROR_CHANGE_NOT_FOUND(name)`
- [ ] `'Criar change'` → `'Create change'`
- [ ] `'Arquivar change'` → `'Archive change'`

## Checklist de Implementação

- [ ] Atualizar todas as mensagens em português para inglês
- [ ] Usar `MESSAGES.*` em todos os comandos
- [ ] Atualizar descrições de comandos no Commander.js
- [ ] Atualizar descrições de opções
- [ ] Verificar consistência em toda a CLI
- [ ] Criar estrutura para futura tradução (opcional)
