import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository } from '../domain/repositories.js';
import { MESSAGES } from '../constants.js';

interface ChangeInfo {
  name: string;
  schema: string;
}

interface ListOutput {
  changes: ChangeInfo[];
}

export async function listCommand(options: Record<string, string | boolean>): Promise<void> {
  const jsonOutput = options.json === true;
  const activeOnly = options.active === true;

  const container = Container.getInstance();
  const repository = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  const changes = await repository.list();

  if (jsonOutput) {
    const result: ListOutput = {
      changes: changes.map(name => ({ name, schema: 'spec-driven' }))
    };
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (changes.length === 0) {
      console.log(MESSAGES.INFO_NO_CHANGES());
    } else {
      const label = activeOnly ? 'Active changes' : 'Changes';
      console.log(`${label}:`);
      for (const change of changes) {
        console.log(`  - ${change}`);
      }
    }
  }
}
