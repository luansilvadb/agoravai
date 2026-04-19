import { getChangePath } from '../utils/config.js';
import { pathExists } from '../utils/fs-utils.js';

export async function existsCommand(options: Record<string, string | boolean>): Promise<void> {
  const name = options._args as string || options.change as string;
  const jsonOutput = options.json === true;

  if (!name) {
    console.error('Erro: Nome da change é obrigatório');
    console.error('Uso: specskill exists <name> [--json]');
    process.exit(1);
  }

  const changePath = getChangePath(name);
  const exists = pathExists(changePath);

  if (jsonOutput) {
    console.log(JSON.stringify({ name, exists }, null, 2));
  } else {
    console.log(exists ? `✔ Change '${name}' exists` : `✖ Change '${name}' not found`);
  }
}
