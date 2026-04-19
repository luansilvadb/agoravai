import { join } from 'path';

export const CONFIG = {
  CHANGES_DIR: 'specskills/changes',
  ARCHIVE_DIR: 'specskills/archive',
  SPECS_DIR: 'specskills/specs',
  DEFAULT_SCHEMA: 'spec-driven',
  SCHEMAS: {
    'spec-driven': {
      artifacts: ['proposal', 'design', 'specs', 'tasks'],
      dependencies: {
        proposal: [],
        design: ['proposal'],
        specs: ['proposal'],
        tasks: ['design', 'specs']
      }
    },
    'minimal': {
      artifacts: ['proposal', 'tasks'],
      dependencies: {
        proposal: [],
        tasks: ['proposal']
      }
    }
  }
} as const;

export function getChangePath(name: string): string {
  return join(CONFIG.CHANGES_DIR, name);
}

export function getArchivePath(name: string, id: string): string {
  return join(CONFIG.ARCHIVE_DIR, `${id}-${name}`);
}

export function formatArchiveId(id: number): string {
  return String(id).padStart(3, '0');
}

export function getConfigPath(name: string): string {
  return join(getChangePath(name), '.specskills.yaml');
}
