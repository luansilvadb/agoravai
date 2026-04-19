#!/usr/bin/env node
import { Command } from 'commander';
import { z } from 'zod';
import { newChangeCommand } from './commands/new-change.js';
import { statusCommand } from './commands/status.js';
import { listCommand } from './commands/list.js';
import { instructionsCommand } from './commands/instructions.js';
import { applyCommand } from './commands/apply.js';
import { continueCommand } from './commands/continue.js';
import { archiveCommand } from './commands/archive.js';
import { existsCommand } from './commands/exists.js';
import { generateCommand } from './commands/generate.js';
import { registerDefaults } from './infrastructure/index.js';

registerDefaults();

const program = new Command();

program
  .name('specskills')
  .description('Spec-driven change management CLI')
  .version('1.0.16');

program
  .command('new')
  .alias('create')
  .description('Create a new change')
  .argument('[type]', 'Type (must be "change")')
  .argument('<name>', 'Change name')
  .option('-s, --schema <schema>', 'Schema type (spec-driven, minimal)', 'spec-driven')
  .option('--dry-run', 'Preview changes without applying')
  .action(async (type, name, options) => {
    // Support both: 'specskills new <name>' and 'specskills new change <name>'
    if (type && type !== 'change') {
      console.error(`Invalid type '${type}'. Expected 'change'`);
      process.exit(1);
    }
    await newChangeCommand(name, options);
  });

program
  .command('exists')
  .description('Check if a change exists')
  .argument('<name>', 'Change name')
  .option('--json', 'Output as JSON')
  .action(async (name, options) => {
    await existsCommand({ name, ...options });
  });

program
  .command('status')
  .description('Show change status')
  .argument('<name>', 'Change name')
  .option('--json', 'Output as JSON')
  .action(async (name, options) => {
    await statusCommand({ change: name, ...options });
  });

program
  .command('list')
  .description('List all changes')
  .option('--json', 'Output as JSON')
  .option('--active', 'Show only active changes')
  .action(async (options) => {
    await listCommand(options);
  });

program
  .command('instructions')
  .description('Show instructions for an artifact')
  .argument('<name>', 'Change name')
  .argument('[id]', 'Artifact ID (apply, spec, etc.)', 'apply')
  .option('--json', 'Output as JSON')
  .action(async (name, id, options) => {
    await instructionsCommand({ change: name, id, ...options });
  });

program
  .command('apply')
  .description('Apply pending tasks from a change')
  .argument('<name>', 'Change name')
  .option('--json', 'Output as JSON')
  .option('--dry-run', 'Preview changes without applying')
  .option('-s, --spec <filter>', 'Filter by spec ID')
  .action(async (name, options) => {
    await applyCommand({ change: name, ...options });
  });

program
  .command('continue')
  .description('Continue a blocked change')
  .argument('[name]', 'Change name (optional)')
  .action(async (name) => {
    await continueCommand({ name });
  });

program
  .command('archive')
  .description('Archive a completed change')
  .argument('<name>', 'Change name')
  .option('--json', 'Output as JSON')
  .option('--dry-run', 'Preview changes without applying')
  .action(async (name, options) => {
    await archiveCommand({ change: name, ...options });
  });

program
  .command('generate')
  .description('Generate additional specs automatically')
  .argument('<name>', 'Change name')
  .option('--auto', 'Auto-generate without prompting')
  .option('--json', 'Output as JSON')
  .action(async (name, options) => {
    await generateCommand({ change: name, ...options });
  });

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'value';
    return `  - ${path}: ${issue.message}`;
  }).join('\n');
}

async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:\n' + formatZodError(error));
    } else {
      console.error('Error:', error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }
}

main();
