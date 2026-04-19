# Spec: Commander Migration

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

O parser de argumentos atual em `src/cli/index.ts` é custom e frágil. Não suporta:
- Valores com espaços
- Short flags
- Validação automática
- Help automático

## Objetivo

Migrar para Commander.js para obter parsing robusto, validação automática e melhor UX.

## Instalação

```bash
npm install commander
npm install -D @types/commander
```

## Nova Estrutura CLI

```typescript
// src/cli/index.ts

#!/usr/bin/env node
import { Command } from 'commander';
import { registerDefaults, Container, TOKENS } from './infrastructure/module.js';

// Register dependencies
registerDefaults();

const program = new Command();

program
  .name('specskill')
  .description('Spec-driven change management CLI')
  .version('1.0.0');

// Import commands
import { newChangeCommand } from './commands/new-change.js';
import { statusCommand } from './commands/status.js';
import { listCommand } from './commands/list.js';
import { archiveCommand } from './commands/archive.js';
import { applyCommand } from './commands/apply.js';
import { continueCommand } from './commands/continue.js';
import { generateCommand } from './commands/generate.js';
import { existsCommand } from './commands/exists.js';

// Register commands
program
  .command('new')
  .description('Create a new change')
  .argument('<name>', 'Change name')
  .option('-s, --schema <schema>', 'Schema type', 'spec-driven')
  .action(async (name, options) => {
    try {
      await newChangeCommand(name, options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show change status')
  .requiredOption('-c, --change <name>', 'Change name')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      await statusCommand(options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List changes')
  .option('--json', 'Output as JSON')
  .option('--active', 'Show only active changes')
  .action(async (options) => {
    try {
      await listCommand(options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('archive')
  .description('Archive a completed change')
  .option('-c, --change <name>', 'Change name')
  .option('--dry-run', 'Show what would be archived without moving')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      await archiveCommand(options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('apply')
  .description('Apply tasks from a change')
  .requiredOption('-c, --change <name>', 'Change name')
  .option('-s, --spec <id>', 'Apply specific spec only')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      await applyCommand(options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('continue [name]')
  .description('Continue a blocked change')
  .action(async (name, options) => {
    try {
      await continueCommand({ name, ...options });
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate additional specs automatically')
  .requiredOption('-c, --change <name>', 'Change name')
  .option('--auto', 'Auto-detect specs from tasks')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      await generateCommand(options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('exists <name>')
  .description('Check if change exists')
  .option('--json', 'Output as JSON')
  .action(async (name, options) => {
    try {
      await existsCommand({ name, ...options });
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
```

## Command Signature Updates

```typescript
// src/cli/commands/new-change.ts

interface NewChangeOptions {
  schema?: string;
}

export async function newChangeCommand(
  name: string,
  options: NewChangeOptions
): Promise<void> {
  // Implementation
}
```

```typescript
// src/cli/commands/status.ts

interface StatusOptions {
  change: string;
  json?: boolean;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  // Implementation
}
```

```typescript
// src/cli/commands/archive.ts

interface ArchiveOptions {
  change?: string;
  dryRun?: boolean;
  json?: boolean;
}

export async function archiveCommand(options: ArchiveOptions): Promise<void> {
  // Implementation with dry-run support
}
```

```typescript
// src/cli/commands/apply.ts

interface ApplyOptions {
  change: string;
  spec?: string;
  json?: boolean;
}

export async function applyCommand(options: ApplyOptions): Promise<void> {
  // Implementation
}
```

## Help Output Example

```bash
$ specskill --help
Usage: specskill [options] [command]

Spec-driven change management CLI

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  new <name>                   Create a new change
  status                       Show change status
  list                         List changes
  archive                      Archive a completed change
  apply                        Apply tasks from a change
  continue [name]              Continue a blocked change
  generate                     Generate additional specs automatically
  exists <name>                Check if change exists
  help [command]               display help for command

$ specskill new --help
Usage: specskill new [options] <name>

Create a new change

Arguments:
  name                         Change name

Options:
  -s, --schema <schema>        Schema type (default: "spec-driven")
  -h, --help                   display help for command
```

## Checklist de Implementação

- [ ] Instalar `commander` e `@types/commander`
- [ ] Reescrever `src/cli/index.ts` usando Commander.js
- [ ] Atualizar tipos de opções em todos os comandos
- [ ] Adicionar `--dry-run` ao comando `archive`
- [ ] Adicionar tratamento de erros consistente
- [ ] Testar todos os comandos manualmente
- [ ] Atualizar scripts npm se necessário
