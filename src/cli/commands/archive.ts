import { getChangePath, getArchivePath } from '../utils/config.js';
import { pathExists, listDirs, moveDir } from '../utils/fs-utils.js';
import { getNextArchiveId } from '../utils/global-config.js';

export async function archiveCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.change as string;
  const jsonOutput = options.json === true;

  if (!changeName) {
    // Listar changes disponíveis
    if (!pathExists('specskill/changes')) {
      if (jsonOutput) {
        console.log(JSON.stringify({ error: 'No changes found' }, null, 2));
      } else {
        console.log('No changes found.');
      }
      return;
    }

    const allChanges = await listDirs('specskill/changes');
    const activeChanges = allChanges.filter(c => c !== 'archive');
    
    if (jsonOutput) {
      console.log(JSON.stringify({ changes: activeChanges }, null, 2));
    } else {
      if (activeChanges.length === 0) {
        console.log('No active changes to archive.');
      } else {
        console.log('Active changes (use: npm run specskill:archive -- --change <name>):');
        for (const change of activeChanges) {
          console.log(`  - ${change}`);
        }
      }
    }
    return;
  }

  const changePath = getChangePath(changeName);
  
  if (!pathExists(changePath)) {
    if (jsonOutput) {
      console.log(JSON.stringify({ error: `Change '${changeName}' not found` }, null, 2));
    } else {
      console.error(`✖ Error: Change '${changeName}' not found`);
    }
    process.exit(1);
  }

  // Gerar próximo ID
  const archiveId = await getNextArchiveId();
  const archivePath = getArchivePath(changeName, archiveId);
  
  // Verificar se já existe no archive (segurança extra)
  if (pathExists(archivePath)) {
    console.error(`✖ Error: Archive already exists at ${archivePath}`);
    console.error('Options: delete existing archive or rename the change');
    process.exit(1);
  }

  // Mover para archive
  await moveDir(changePath, archivePath);

  if (jsonOutput) {
    console.log(JSON.stringify({ 
      success: true,
      change: changeName,
      archiveId: archiveId,
      archivedTo: archivePath
    }, null, 2));
  } else {
    console.log(`✔ Archived change '${changeName}' to ${archivePath}`);
  }
}
