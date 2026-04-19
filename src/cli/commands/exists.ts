import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository } from '../domain/repositories.js';
import { MESSAGES, EXIT_CODES } from '../constants.js';

export async function existsCommand(options: Record<string, string | boolean>): Promise<void> {
  const name = options.name as string;
  const jsonOutput = options.json === true;

  if (!name) {
    console.error(MESSAGES.ERROR_INVALID_NAME());
    console.error('Usage: specskill exists <name> [--json]');
    process.exit(EXIT_CODES.ERROR);
  }

  const repository = Container.getInstance().resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  const exists = await repository.exists(name);

  if (jsonOutput) {
    console.log(JSON.stringify({ name, exists }, null, 2));
  } else {
    console.log(exists ? `✔ Change '${name}' exists` : MESSAGES.ERROR_CHANGE_NOT_FOUND(name));
  }
}
