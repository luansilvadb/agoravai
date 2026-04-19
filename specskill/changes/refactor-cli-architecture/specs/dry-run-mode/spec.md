# Spec: Dry-Run Mode

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

Comandos destrutivos (archive, generate) não têm modo preview. Usuário não pode ver o que será feito antes de executar.

## Objetivo

Implementar `--dry-run` flag para comandos destrutivos, mostrando preview sem executar ações.

## Affected Commands

1. `archive` - Move diretórios
2. `generate` - Escreve arquivos
3. `new` - Cria diretórios e arquivos

## Implementation

### Archive Command

```typescript
// src/cli/commands/archive.ts

interface ArchiveOptions {
  change?: string;
  dryRun?: boolean;
  json?: boolean;
}

export async function archiveCommand(options: ArchiveOptions): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  const configRepo = container.resolve<GlobalConfigRepository>(TOKENS.GLOBAL_CONFIG_REPOSITORY);

  // List mode (no change specified)
  if (!options.change) {
    const changes = await repo.list();
    
    if (options.json) {
      console.log(JSON.stringify({ changes }, null, 2));
    } else {
      console.log(`Active changes: ${changes.length}`);
      for (const change of changes) {
        console.log(`  - ${change}`);
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

  // Get next archive ID
  const nextId = await configRepo.getNextArchiveId();
  const destPath = repo.getArchivePath(change.name, nextId);

  // Check if destination exists
  const fs = container.resolve<FileSystemPort>(TOKENS.FILE_SYSTEM);
  if (fs.pathExists(destPath)) {
    const error = MESSAGES.WARNING_ARCHIVE_ALREADY_EXISTS(destPath);
    if (options.json) {
      console.log(JSON.stringify({ error }, null, 2));
    } else {
      console.error(`✖ ${error}`);
      console.error('Options: delete existing archive or rename the change');
    }
    process.exit(EXIT_CODES.ERROR_FILESYSTEM);
  }

  // DRY RUN MODE
  if (options.dryRun) {
    const preview = {
      operation: 'archive',
      source: change.path,
      destination: destPath,
      change: {
        name: change.name,
        schema: change.schema,
        created: change.created.toISOString()
      }
    };

    if (options.json) {
      console.log(JSON.stringify({ 
        dryRun: true,
        preview 
      }, null, 2));
    } else {
      console.log('═══════════════════════════════════════');
      console.log('  DRY RUN - No changes will be made');
      console.log('═══════════════════════════════════════');
      console.log();
      console.log('Operation:', preview.operation);
      console.log('Change:', preview.change.name);
      console.log('Schema:', preview.change.schema);
      console.log();
      console.log('From:');
      console.log('  ', preview.source);
      console.log();
      console.log('To:');
      console.log('  ', preview.destination);
      console.log();
      console.log('To execute, run without --dry-run');
    }
    return;
  }

  // EXECUTE
  await repo.archive(change.name, nextId);
  
  if (options.json) {
    console.log(JSON.stringify({
      success: true,
      operation: 'archive',
      change: change.name,
      archiveId: nextId,
      archivedTo: destPath
    }, null, 2));
  } else {
    console.log(MESSAGES.SUCCESS_CHANGE_ARCHIVED(change.name, destPath));
  }
}
```

### New Change Command

```typescript
// src/cli/commands/new-change.ts

interface NewChangeOptions {
  schema?: string;
  dryRun?: boolean;
}

export async function newChangeCommand(
  name: string,
  options: NewChangeOptions
): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  if (await repo.exists(name)) {
    throw new Error(MESSAGES.ERROR_CHANGE_EXISTS(name));
  }

  const schema = options.schema || DEFAULTS.SCHEMA;
  const change = {
    name,
    schema,
    created: new Date(),
    path: join(PATHS.CHANGES_DIR, name)
  };

  // DRY RUN MODE
  if (options.dryRun) {
    const schemaDef = SCHEMA_DEFINITIONS[schema as SchemaType];
    const files: string[] = [
      join(change.path, PATHS.CHANGE_CONFIG),
      ...schemaDef.artifacts.map(a => 
        a === 'specs' 
          ? join(change.path, 'specs', 'spec.md')
          : join(change.path, `${a}.md`)
      )
    ];

    if (options.json) {
      console.log(JSON.stringify({
        dryRun: true,
        preview: {
          operation: 'create',
          change: {
            name: change.name,
            schema: change.schema
          },
          directories: [change.path, join(change.path, 'specs')],
          files
        }
      }, null, 2));
    } else {
      console.log('═══════════════════════════════════════');
      console.log('  DRY RUN - No changes will be made');
      console.log('═══════════════════════════════════════');
      console.log();
      console.log('Operation: create change');
      console.log('Name:', change.name);
      console.log('Schema:', change.schema);
      console.log();
      console.log('Directories to create:');
      console.log('  -', change.path);
      console.log('  -', join(change.path, 'specs'));
      console.log();
      console.log('Files to create:');
      for (const file of files) {
        console.log('  -', file);
      }
      console.log();
      console.log('To execute, run without --dry-run');
    }
    return;
  }

  // EXECUTE
  await repo.save(change);
  
  // Create artifact templates...
  const schemaDef = SCHEMA_DEFINITIONS[schema as SchemaType];
  // ... create files

  console.log(MESSAGES.SUCCESS_CHANGE_CREATED(name, change.path));
}
```

### Generate Command

```typescript
// src/cli/commands/generate.ts

interface GenerateOptions {
  change: string;
  auto?: boolean;
  dryRun?: boolean;
  json?: boolean;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  const fs = container.resolve<FileSystemPort>(TOKENS.FILE_SYSTEM);

  const change = await repo.getChange(options.change);
  if (!change) {
    throw new Error(MESSAGES.ERROR_CHANGE_NOT_FOUND(options.change));
  }

  // Detect specs to generate
  const specsToGenerate = await detectSpecs(change, fs);

  // DRY RUN MODE
  if (options.dryRun) {
    if (options.json) {
      console.log(JSON.stringify({
        dryRun: true,
        preview: {
          operation: 'generate',
          change: change.name,
          specs: specsToGenerate.map(s => ({
            id: s.id,
            name: s.name,
            path: join(change.path, 'specs', s.id, 'spec.md')
          }))
        }
      }, null, 2));
    } else {
      console.log('═══════════════════════════════════════');
      console.log('  DRY RUN - No changes will be made');
      console.log('═══════════════════════════════════════');
      console.log();
      console.log(`Found ${specsToGenerate.length} specs to generate:`);
      for (const spec of specsToGenerate) {
        console.log(`  - ${spec.id}: ${spec.name}`);
        console.log(`    → ${join(change.path, 'specs', spec.id, 'spec.md')}`);
      }
      console.log();
      console.log('To execute, run without --dry-run');
    }
    return;
  }

  // EXECUTE
  for (const spec of specsToGenerate) {
    await generateSpec(change.path, spec, fs);
  }

  if (options.json) {
    console.log(JSON.stringify({
      success: true,
      generated: specsToGenerate.length,
      specs: specsToGenerate.map(s => s.id)
    }, null, 2));
  } else {
    console.log(`Generated ${specsToGenerate.length} specs`);
  }
}
```

## CLI Integration

```typescript
// src/cli/index.ts

program
  .command('archive')
  .description(MESSAGES.CMD_ARCHIVE_DESCRIPTION())
  .option('-c, --change <name>', MESSAGES.OPT_CHANGE_DESCRIPTION())
  .option('--dry-run', MESSAGES.OPT_DRY_RUN_DESCRIPTION())
  .option('--json', MESSAGES.OPT_JSON_DESCRIPTION())
  .action(archiveCommand);

program
  .command('new')
  .description(MESSAGES.CMD_NEW_DESCRIPTION())
  .argument('<name>', MESSAGES.OPT_CHANGE_DESCRIPTION())
  .option('-s, --schema <schema>', MESSAGES.OPT_SCHEMA_DESCRIPTION(), 'spec-driven')
  .option('--dry-run', MESSAGES.OPT_DRY_RUN_DESCRIPTION())
  .action(newChangeCommand);

program
  .command('generate')
  .description(MESSAGES.CMD_GENERATE_DESCRIPTION())
  .requiredOption('-c, --change <name>', MESSAGES.OPT_CHANGE_DESCRIPTION())
  .option('--auto', 'Auto-detect specs from tasks')
  .option('--dry-run', MESSAGES.OPT_DRY_RUN_DESCRIPTION())
  .option('--json', MESSAGES.OPT_JSON_DESCRIPTION())
  .action(generateCommand);
```

## Example Usage

```bash
# Preview archive
$ specskill archive --change my-feature --dry-run
═══════════════════════════════════════
  DRY RUN - No changes will be made
═══════════════════════════════════════

Operation: archive
Change: my-feature
Schema: spec-driven

From:
   specskill/changes/my-feature

To:
   specskill/changes/archive/001-my-feature

To execute, run without --dry-run

# Preview new change
$ specskill new my-feature --dry-run
═══════════════════════════════════════
  DRY RUN - No changes will be made
═══════════════════════════════════════

Operation: create change
Name: my-feature
Schema: spec-driven

Directories to create:
  - specskill/changes/my-feature
  - specskill/changes/my-feature/specs

Files to create:
  - specskill/changes/my-feature/.specskill.yaml
  - specskill/changes/my-feature/proposal.md
  - specskill/changes/my-feature/design.md
  - specskill/changes/my-feature/specs/spec.md
  - specskill/changes/my-feature/tasks.md

To execute, run without --dry-run
```

## Checklist de Implementação

- [ ] Adicionar `--dry-run` option a `archiveCommand`
- [ ] Adicionar `--dry-run` option a `newChangeCommand`
- [ ] Adicionar `--dry-run` option a `generateCommand`
- [ ] Criar função helper `formatDryRunPreview()`
- [ ] Implementar lógica de preview para cada comando
- [ ] Garantir que dry-run nunca execute ações destrutivas
- [ ] Adicionar testes para dry-run mode
- [ ] Documentar uso no help da CLI
