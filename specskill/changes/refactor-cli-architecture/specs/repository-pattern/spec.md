# Spec: Repository Pattern

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

Todos os comandos CLI dependem diretamente de `fs-utils.ts` e paths hardcoded. Isso cria acoplamento forte ao filesystem, dificultando testes unitários e impedindo a troca de implementação de storage.

## Objetivo

Desacoplar comandos do filesystem através do Repository Pattern, permitindo:
- Mocking fácil para testes unitários
- Troca de implementação (FS, S3, DB, etc.)
- Testes de integração isolados

## Interface Repository

```typescript
// src/cli/domain/repositories.ts

export interface Change {
  name: string;
  schema: string;
  created: Date;
  path: string;
}

export interface ChangeRepository {
  exists(name: string): Promise<boolean>;
  getChange(name: string): Promise<Change | null>;
  save(change: Change): Promise<void>;
  list(): Promise<string[]>;
  archive(name: string, archiveId: string): Promise<void>;
  getArchivePath(name: string, archiveId: string): string;
}

export interface FileSystemPort {
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, content: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  pathExists(path: string): boolean;
  listDirs(path: string): Promise<string[]>;
  moveDir(src: string, dest: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ mtime: Date } | null>;
}

export interface GlobalConfigRepository {
  get(): Promise<GlobalConfig>;
  save(config: GlobalConfig): Promise<void>;
  getNextArchiveId(): Promise<string>;
}

export interface GlobalConfig {
  version: string;
  lastArchiveId: number;
  defaultSchema: string;
  created: string;
}
```

## Implementação FS

```typescript
// src/cli/infrastructure/fs-repository.ts

import { ChangeRepository, FileSystemPort, Change } from '../domain/repositories.js';
import { PATHS } from '../constants.js';
import { join } from 'path';

export class FsChangeRepository implements ChangeRepository {
  constructor(private fs: FileSystemPort) {}

  async exists(name: string): Promise<boolean> {
    return this.fs.pathExists(join(PATHS.CHANGES_DIR, name));
  }

  async getChange(name: string): Promise<Change | null> {
    const changePath = join(PATHS.CHANGES_DIR, name);
    if (!this.fs.pathExists(changePath)) return null;

    const configPath = join(changePath, PATHS.CHANGE_CONFIG);
    const configContent = await this.fs.readFile(configPath);
    if (!configContent) return null;

    // Parse YAML simples
    const lines = configContent.split('\n');
    const config: Record<string, string> = {};
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        config[key.trim()] = valueParts.join(':').trim();
      }
    }

    return {
      name: config.name || name,
      schema: config.schema || 'spec-driven',
      created: new Date(config.created || Date.now()),
      path: changePath
    };
  }

  async save(change: Change): Promise<void> {
    await this.fs.ensureDir(change.path);
    
    const configContent = `schema: ${change.schema}
name: ${change.name}
created: ${change.created.toISOString()}
`;
    await this.fs.writeFile(
      join(change.path, PATHS.CHANGE_CONFIG),
      configContent
    );
  }

  async list(): Promise<string[]> {
    if (!this.fs.pathExists(PATHS.CHANGES_DIR)) return [];
    const dirs = await this.fs.listDirs(PATHS.CHANGES_DIR);
    return dirs.filter(d => d !== 'archive');
  }

  async archive(name: string, archiveId: string): Promise<void> {
    const sourcePath = join(PATHS.CHANGES_DIR, name);
    const destPath = this.getArchivePath(name, archiveId);
    
    if (!this.fs.pathExists(sourcePath)) {
      throw new Error(`Change '${name}' not found`);
    }
    
    await this.fs.moveDir(sourcePath, destPath);
  }

  getArchivePath(name: string, archiveId: string): string {
    return join(PATHS.ARCHIVE_DIR, `${archiveId}-${name}`);
  }
}
```

## Implementação FileSystemPort

```typescript
// src/cli/infrastructure/fs-adapter.ts

import { FileSystemPort } from '../domain/repositories.js';
import { promises as fs, existsSync, statSync } from 'fs';
import { dirname } from 'path';

export class NodeFileSystemAdapter implements FileSystemPort {
  async readFile(path: string): Promise<string | null> {
    try {
      return await fs.readFile(path, 'utf-8');
    } catch {
      return null;
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.ensureDir(dirname(path));
    await fs.writeFile(path, content, 'utf-8');
  }

  async ensureDir(dir: string): Promise<void> {
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  pathExists(path: string): boolean {
    return existsSync(path);
  }

  async listDirs(path: string): Promise<string[]> {
    if (!existsSync(path)) return [];
    const entries = await fs.readdir(path, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  }

  async moveDir(src: string, dest: string): Promise<void> {
    await this.ensureDir(dirname(dest));
    await fs.rename(src, dest);
  }

  async readDir(path: string): Promise<string[]> {
    if (!existsSync(path)) return [];
    const entries = await fs.readdir(path, { withFileTypes: true });
    return entries.map(e => e.name);
  }

  async stat(path: string): Promise<{ mtime: Date } | null> {
    try {
      const stats = await fs.stat(path);
      return { mtime: stats.mtime };
    } catch {
      return null;
    }
  }
}
```

## Testes Mock

```typescript
// src/cli/infrastructure/mock-repository.ts

import { ChangeRepository, Change, FileSystemPort } from '../domain/repositories.js';

export class MockChangeRepository implements ChangeRepository {
  private changes: Map<string, Change> = new Map();
  private archived: Map<string, Change> = new Map();

  async exists(name: string): Promise<boolean> {
    return this.changes.has(name);
  }

  async getChange(name: string): Promise<Change | null> {
    return this.changes.get(name) || null;
  }

  async save(change: Change): Promise<void> {
    this.changes.set(change.name, change);
  }

  async list(): Promise<string[]> {
    return Array.from(this.changes.keys());
  }

  async archive(name: string, archiveId: string): Promise<void> {
    const change = this.changes.get(name);
    if (!change) throw new Error(`Change '${name}' not found`);
    
    this.changes.delete(name);
    this.archived.set(`${archiveId}-${name}`, change);
  }

  getArchivePath(name: string, archiveId: string): string {
    return `archive/${archiveId}-${name}`;
  }

  // Helper para testes
  clear(): void {
    this.changes.clear();
    this.archived.clear();
  }
}

export class MockFileSystem implements FileSystemPort {
  private files: Map<string, string> = new Map();
  private dirs: Set<string> = new Set();

  async readFile(path: string): Promise<string | null> {
    return this.files.get(path) || null;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
    this.addDirPath(path);
  }

  private addDirPath(filePath: string): void {
    const parts = filePath.split('/');
    let current = '';
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      this.dirs.add(current);
    }
  }

  async ensureDir(dir: string): Promise<void> {
    this.dirs.add(dir);
  }

  pathExists(path: string): boolean {
    return this.files.has(path) || this.dirs.has(path);
  }

  async listDirs(path: string): Promise<string[]> {
    const result: string[] = [];
    for (const dir of this.dirs) {
      if (dir.startsWith(path + '/') || (path === '' && !dir.includes('/'))) {
        const relative = dir.slice(path.length + 1).split('/')[0];
        if (relative && !result.includes(relative)) {
          result.push(relative);
        }
      }
    }
    return result;
  }

  async moveDir(src: string, dest: string): Promise<void> {
    // Simplified mock
  }

  async readDir(path: string): Promise<string[]> {
    return [];
  }

  async stat(path: string): Promise<{ mtime: Date } | null> {
    return { mtime: new Date() };
  }
}
```

## Checklist de Implementação

- [ ] Criar `src/cli/domain/repositories.ts` com as interfaces
- [ ] Criar `src/cli/infrastructure/fs-repository.ts` com implementação FS
- [ ] Criar `src/cli/infrastructure/fs-adapter.ts` com adapter Node.js
- [ ] Criar `src/cli/infrastructure/mock-repository.ts` com mocks para testes
- [ ] Atualizar comandos para usar Repository via DI
- [ ] Adicionar testes unitários usando mocks
