import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository, GlobalConfigRepository } from '../domain/repositories.js';
import { MESSAGES, EXIT_CODES } from '../constants.js';
import { formatSimplePreview } from '../utils/formatters.js';

export async function archiveCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.change as string;
  const jsonOutput = options.json === true;
  const dryRun = options.dryRun === true;

  const container = Container.getInstance();
  const repository = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  if (!changeName) {
    // List available changes
    const changes = await repository.list();

    if (jsonOutput) {
      console.log(JSON.stringify({ changes }, null, 2));
    } else {
      if (changes.length === 0) {
        console.log(MESSAGES.INFO_NO_CHANGES());
      } else {
        console.log('Active changes (use: npm run specskills:archive <name>):');
        for (const change of changes) {
          console.log(`  - ${change}`);
        }
      }
    }
    return;
  }

  const change = await repository.getChange(changeName);

  if (!change) {
    const error = MESSAGES.ERROR_CHANGE_NOT_FOUND(changeName);
    if (jsonOutput) {
      console.log(JSON.stringify({ error }, null, 2));
    } else {
      console.error(`✖ Error: ${error}`);
    }
    process.exit(EXIT_CODES.NOT_FOUND);
  }

  const configRepo = container.resolve<GlobalConfigRepository>(TOKENS.GLOBAL_CONFIG_REPOSITORY);
  const archiveId = await configRepo.getNextArchiveId();
  const archiveIdStr = String(archiveId).padStart(3, '0');

  if (dryRun) {
    const preview = formatSimplePreview(
      'Archive change',
      changeName,
      [`Move to: archive/${archiveIdStr}-${changeName}`]
    );
    console.log(preview);
    return;
  }

  await repository.archive(changeName, archiveIdStr);

  const successMsg = MESSAGES.SUCCESS_CHANGE_ARCHIVED(changeName, archiveIdStr);
  if (jsonOutput) {
    console.log(JSON.stringify({
      success: true,
      change: changeName,
      archiveId: archiveIdStr,
      message: successMsg
    }, null, 2));
  } else {
    console.log(`✔ ${successMsg}`);
  }
}
