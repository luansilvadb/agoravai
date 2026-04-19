export interface Change {
  name: string;
  schema: 'spec-driven' | 'minimal';
  created: string;
  path: string;
  artifacts?: string[];
}

export interface GlobalConfig {
  version: string;
  lastArchiveId: number;
  defaultSchema: 'spec-driven' | 'minimal';
  created: string;
}

export interface ChangeRepository {
  exists(name: string): Promise<boolean>;
  getChange(name: string): Promise<Change | null>;
  save(change: Change): Promise<void>;
  list(): Promise<string[]>;
  archive(name: string, archiveId: string): Promise<void>;
}

export interface GlobalConfigRepository {
  getConfig(): Promise<GlobalConfig | null>;
  saveConfig(config: GlobalConfig): Promise<void>;
  getNextArchiveId(): Promise<number>;
}

export interface FileSystemPort {
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, content: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  pathExists(path: string): Promise<boolean>;
  listDirs(path: string): Promise<string[]>;
  moveDir(src: string, dest: string): Promise<void>;
}
