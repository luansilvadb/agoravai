#!/usr/bin/env node
import { newChangeCommand } from './commands/new-change.js';
import { statusCommand } from './commands/status.js';
import { listCommand } from './commands/list.js';
import { instructionsCommand } from './commands/instructions.js';
import { applyCommand } from './commands/apply.js';
import { continueCommand } from './commands/continue.js';
import { archiveCommand } from './commands/archive.js';
import { existsCommand } from './commands/exists.js';
import { generateCommand } from './commands/generate.js';

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log('SpecSkill CLI - Gerenciamento de Changes');
  console.log('');
  console.log('Uso: specskill <comando> [opções]');
  console.log('');
  console.log('Comandos:');
  console.log('  new change <name> [--schema <schema>]  Cria uma nova change');
  console.log('  status --change <name> [--json]        Mostra status de uma change');
  console.log('  list [--json] [--active]               Lista changes');
  console.log('  instructions <id> --change <name>        Mostra instruções de um artefato');
  console.log('  apply --change <name> [--json]         Aplica tarefas de uma change');
  console.log('  continue [<name>]                      Continua uma change bloqueada');
  console.log('  archive --change <name> [--json]        Arquiva uma change completa');
  console.log('  exists <name> [--json]                 Verifica se change existe');
  console.log('  generate --change <name> [--auto]      Gera specs adicionais automaticamente');
  console.log('');
  console.log('Opções globais:');
  console.log('  --change <name>       Nome da change');
  console.log('  --schema <schema>     Schema da change (spec-driven, minimal)');
  console.log('  --json                Saída em formato JSON');
  console.log('  --active              Mostra apenas changes ativas (não arquivadas)');
  process.exit(0);
}

async function main() {
  try {
    switch (command) {
      case 'new':
        if (args[1] === 'change') {
          await newChangeCommand(args[2], parseArgs(args.slice(3)));
        } else {
          console.error('Uso: specskill new change <name> [--schema <schema>]');
          process.exit(1);
        }
        break;
      case 'exists':
        await existsCommand(parseArgs(args.slice(1)));
        break;
      case 'status':
        await statusCommand(parseArgs(args.slice(1)));
        break;
      case 'list':
        await listCommand(parseArgs(args.slice(1)));
        break;
      case 'instructions':
        await instructionsCommand(parseArgs(args.slice(1)));
        break;
      case 'apply':
        await applyCommand(parseArgs(args.slice(1)));
        break;
      case 'continue':
        await continueCommand(parseArgs(args.slice(1)));
        break;
      case 'archive':
        await archiveCommand(parseArgs(args.slice(1)));
        break;
      case 'generate':
        await generateCommand(parseArgs(args.slice(1)));
        break;
      default:
        console.error(`Comando desconhecido: ${command}`);
        console.error('Use "specskill" sem argumentos para ver os comandos disponíveis.');
        process.exit(1);
    }
  } catch (error) {
    console.error('Erro:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function parseArgs(args: string[]): Record<string, string | boolean> {
  const options: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    } else {
      options['_args'] = options['_args'] || '';
      options['_args'] += (options['_args'] ? ' ' : '') + args[i];
    }
  }
  return options;
}

main();
