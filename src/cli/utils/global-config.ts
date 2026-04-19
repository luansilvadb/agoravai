import { readFile, writeFile, pathExists, ensureDir } from './fs-utils.js';

export const GLOBAL_CONFIG_PATH = 'specskill/.specskill.global.yaml';

interface GlobalConfig {
  version: string;
  lastArchiveId: number;
  defaultSchema: string;
  created: string;
}

const DEFAULT_CONFIG: GlobalConfig = {
  version: '1.0.0',
  lastArchiveId: 0,
  defaultSchema: 'spec-driven',
  created: new Date().toISOString()
};

function serializeConfig(config: GlobalConfig): string {
  return `# SpecSkill Global Configuration
# File: .specskill.global.yaml
version: ${config.version}
lastArchiveId: ${config.lastArchiveId}
defaultSchema: ${config.defaultSchema}
created: ${config.created}
`;
}

function parseConfig(content: string): GlobalConfig {
  const lines = content.split('\n');
  const config: Partial<GlobalConfig> = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed.includes(':')) continue;
    
    const [key, ...valueParts] = trimmed.split(':');
    const value = valueParts.join(':').trim();
    
    if (key === 'lastArchiveId') {
      config.lastArchiveId = parseInt(value, 10) || 0;
    } else if (key === 'version') {
      config.version = value;
    } else if (key === 'defaultSchema') {
      config.defaultSchema = value;
    } else if (key === 'created') {
      config.created = value;
    }
  }
  
  return {
    version: config.version || DEFAULT_CONFIG.version,
    lastArchiveId: config.lastArchiveId ?? DEFAULT_CONFIG.lastArchiveId,
    defaultSchema: config.defaultSchema || DEFAULT_CONFIG.defaultSchema,
    created: config.created || DEFAULT_CONFIG.created
  };
}

export async function getGlobalConfig(): Promise<GlobalConfig> {
  if (!pathExists(GLOBAL_CONFIG_PATH)) {
    return { ...DEFAULT_CONFIG };
  }
  
  const content = await readFile(GLOBAL_CONFIG_PATH);
  if (!content) {
    return { ...DEFAULT_CONFIG };
  }
  
  return parseConfig(content);
}

export async function saveGlobalConfig(config: GlobalConfig): Promise<void> {
  await ensureDir('specskill');
  await writeFile(GLOBAL_CONFIG_PATH, serializeConfig(config));
}

export async function getNextArchiveId(): Promise<string> {
  const config = await getGlobalConfig();
  const nextId = config.lastArchiveId + 1;
  
  config.lastArchiveId = nextId;
  await saveGlobalConfig(config);
  
  return String(nextId).padStart(3, '0');
}
