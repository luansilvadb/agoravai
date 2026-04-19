import path from 'path';
import yaml from 'js-yaml';
import type { GlobalConfig, GlobalConfigRepository, FileSystemPort } from '../domain/repositories.js';
import { PATHS, DEFAULTS } from '../constants.js';
import { GlobalConfigSchema, parseYaml, getValidationErrors } from '../validation/schemas.js';
import { z } from 'zod';

export class FsGlobalConfigRepository implements GlobalConfigRepository {
  private configCache: GlobalConfig | null = null;

  constructor(private fs: FileSystemPort) {}

  private getConfigPath(): string {
    return PATHS.GLOBAL_CONFIG;
  }

  async getConfig(): Promise<GlobalConfig | null> {
    if (this.configCache) return this.configCache;

    const content = await this.fs.readFile(this.getConfigPath());
    if (!content) return null;

    const parsed = parseYaml(content, GlobalConfigSchema);
    if (!parsed) {
      throw new z.ZodError([
        {
          code: 'custom',
          message: 'Invalid global config file',
          path: ['config'],
        },
      ]);
    }

    this.configCache = parsed;
    return this.configCache;
  }

  async saveConfig(config: GlobalConfig): Promise<void> {
    const validation = GlobalConfigSchema.safeParse(config);
    if (!validation.success) {
      const errors = getValidationErrors(config, GlobalConfigSchema);
      throw new z.ZodError([
        {
          code: 'custom',
          message: `Invalid global config: ${errors.join(', ')}`,
          path: ['config'],
        },
      ]);
    }

    this.configCache = config;
    const configPath = this.getConfigPath();
    await this.fs.ensureDir(path.dirname(configPath));
    await this.fs.writeFile(configPath, yaml.dump(config));
  }

  async getNextArchiveId(): Promise<number> {
    const config = await this.getConfig();
    const nextId = (config?.lastArchiveId ?? 0) + 1;

    if (config) {
      config.lastArchiveId = nextId;
      await this.saveConfig(config);
    } else {
      await this.saveConfig({
        version: DEFAULTS.VERSION,
        lastArchiveId: nextId,
        defaultSchema: DEFAULTS.SCHEMA,
        created: new Date().toISOString(),
      });
    }

    return nextId;
  }
}
