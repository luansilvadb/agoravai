import { listDirs, pathExists } from '../utils/fs-utils.js';

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
  
  if (!pathExists('specskill/changes')) {
    if (jsonOutput) {
      console.log(JSON.stringify({ changes: [] }, null, 2));
    } else {
      console.log(activeOnly ? 'No active changes found.' : 'No changes found.');
    }
    return;
  }

  const allChanges = await listDirs('specskill/changes');
  const activeChanges = allChanges.filter(c => c !== 'archive');
  
  // Se --active, mostra só ativas. Senão, mostra todas
  const changesToShow = activeOnly ? activeChanges : allChanges.filter(c => c !== 'archive' || pathExists(`specskill/changes/archive/${c}`));

  if (jsonOutput) {
    const result: ListOutput = {
      changes: changesToShow.map(name => ({ name, schema: 'spec-driven' }))
    };
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (changesToShow.length === 0) {
      console.log(activeOnly ? 'No active changes found.' : 'No changes found.');
    } else {
      const label = activeOnly ? 'Active changes' : 'Changes';
      console.log(`${label}:`);
      for (const change of changesToShow) {
        const isArchived = !activeChanges.includes(change);
        const status = isArchived ? ' [ARCHIVED]' : '';
        console.log(`  - ${change}${status}`);
      }
    }
  }
}
