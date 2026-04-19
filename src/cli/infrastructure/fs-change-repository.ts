import path from 'path';
import yaml from 'js-yaml';
import type { Change, ChangeRepository, FileSystemPort } from '../domain/repositories.js';
import { PATHS } from '../constants.js';
import { ChangeConfigSchema, parseYaml, getValidationErrors } from '../validation/schemas.js';
import { z } from 'zod';

export class FsChangeRepository implements ChangeRepository {
  constructor(private fs: FileSystemPort) {}

  private getChangePath(name: string): string {
    return path.join(PATHS.CHANGES_DIR, name);
  }

  private getConfigPath(name: string): string {
    return path.join(this.getChangePath(name), PATHS.CHANGE_CONFIG);
  }

  async exists(name: string): Promise<boolean> {
    return await this.fs.pathExists(this.getConfigPath(name));
  }

  async getChange(name: string): Promise<Change | null> {
    const configPath = this.getConfigPath(name);
    const content = await this.fs.readFile(configPath);
    if (!content) return null;

    const parsed = parseYaml(content, ChangeConfigSchema);
    if (!parsed) {
      throw new z.ZodError([
        {
          code: 'custom',
          message: `Invalid change config for '${name}'`,
          path: ['change', name],
        },
      ]);
    }

    return {
      name: parsed.name,
      schema: parsed.schema,
      created: parsed.created,
      path: this.getChangePath(name),
      artifacts: parsed.artifacts || [],
    };
  }

  async save(change: Change): Promise<void> {
    const validation = ChangeConfigSchema.safeParse(change);
    if (!validation.success) {
      const errors = getValidationErrors(change, ChangeConfigSchema);
      throw new z.ZodError([
        {
          code: 'custom',
          message: `Invalid change data: ${errors.join(', ')}`,
          path: ['change', change.name],
        },
      ]);
    }

    const changePath = this.getChangePath(change.name);
    await this.fs.ensureDir(changePath);

    const config = {
      name: change.name,
      schema: change.schema,
      created: change.created,
      artifacts: change.artifacts || [],
    };

    const configPath = this.getConfigPath(change.name);
    await this.fs.writeFile(configPath, yaml.dump(config));
  }

  async list(): Promise<string[]> {
    const dirs = await this.fs.listDirs(PATHS.CHANGES_DIR);
    const changes: string[] = [];

    for (const dir of dirs) {
      if (dir === 'archive') continue;
      if (await this.exists(dir)) {
        changes.push(dir);
      }
    }

    return changes;
  }

  async archive(name: string, archiveId: string): Promise<void> {
    const changePath = this.getChangePath(name);
    const archivePath = path.join(PATHS.ARCHIVE_DIR, `${archiveId}-${name}`);

    await this.fs.ensureDir(PATHS.ARCHIVE_DIR);
    await this.fs.moveDir(changePath, archivePath);
  }
}
