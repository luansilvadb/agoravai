import { describe, it, expect, vi } from 'vitest';
import { FsChangeRepository } from '../../../src/cli/infrastructure/fs-change-repository.js';
import { FsGlobalConfigRepository } from '../../../src/cli/infrastructure/fs-global-config-repository.js';
import { MockChangeRepository } from '../../../src/cli/infrastructure/mock-change-repository.js';
import type { Change, FileSystemPort } from '../../../src/cli/domain/repositories.js';

describe('Repositories', () => {
  const createMockFs = (overrides: Partial<FileSystemPort> = {}): FileSystemPort => ({
    readFile: vi.fn().mockResolvedValue(null),
    writeFile: vi.fn().mockResolvedValue(undefined),
    ensureDir: vi.fn().mockResolvedValue(undefined),
    pathExists: vi.fn().mockResolvedValue(false),
    listDirs: vi.fn().mockResolvedValue([]),
    moveDir: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  describe('FsChangeRepository', () => {
    describe('exists', () => {
      it('should return true when config exists', async () => {
        const mockFs = createMockFs({
          pathExists: vi.fn().mockResolvedValue(true),
        });
        const repo = new FsChangeRepository(mockFs);

        const result = await repo.exists('my-change');

        expect(result).toBe(true);
      });

      it('should return false when config does not exist', async () => {
        const mockFs = createMockFs({
          pathExists: vi.fn().mockResolvedValue(false),
        });
        const repo = new FsChangeRepository(mockFs);

        const result = await repo.exists('my-change');

        expect(result).toBe(false);
      });
    });

    describe('getChange', () => {
      it('should return null when change does not exist', async () => {
        const mockFs = createMockFs({
          readFile: vi.fn().mockResolvedValue(null),
        });
        const repo = new FsChangeRepository(mockFs);

        const result = await repo.getChange('my-change');

        expect(result).toBeNull();
      });

      it('should return change when config exists', async () => {
        const mockFs = createMockFs({
          readFile: vi.fn().mockResolvedValue(`
name: my-change
schema: spec-driven
created: 2024-01-15T10:30:00Z
artifacts:
  - proposal
  - design
`),
        });
        const repo = new FsChangeRepository(mockFs);

        const result = await repo.getChange('my-change');

        expect(result).not.toBeNull();
        expect(result?.name).toBe('my-change');
        expect(result?.schema).toBe('spec-driven');
        expect(result?.artifacts ?? []).toEqual(['proposal', 'design']);
      });

      it('should throw ZodError for invalid config', async () => {
        const mockFs = createMockFs({
          readFile: vi.fn().mockResolvedValue('invalid: yaml: ::'),
        });
        const repo = new FsChangeRepository(mockFs);

        await expect(repo.getChange('my-change')).rejects.toThrow();
      });
    });

    describe('save', () => {
      it('should save change to filesystem', async () => {
        const writeFile = vi.fn().mockResolvedValue(undefined);
        const mockFs = createMockFs({ writeFile });
        const repo = new FsChangeRepository(mockFs);

        const change: Change = {
          name: 'my-change',
          schema: 'spec-driven',
          created: '2024-01-15T10:30:00Z',
          path: 'specskills/changes/my-change',
          artifacts: ['proposal'],
        };

        await repo.save(change);

        expect(writeFile).toHaveBeenCalled();
        const content = (writeFile.mock.calls[0]?.[1] as string) ?? '';
        expect(content).toContain('name: my-change');
      });

      it('should throw for invalid change data', async () => {
        const mockFs = createMockFs();
        const repo = new FsChangeRepository(mockFs);

        const invalidChange = {
          name: '',
          schema: 'invalid-schema',
          created: 'invalid-date',
          path: 'specskills/changes/test',
        };

        await expect(repo.save(invalidChange as Change)).rejects.toThrow();
      });
    });

    describe('list', () => {
      it('should list all changes excluding archive', async () => {
        const mockFs = createMockFs({
          listDirs: vi.fn().mockResolvedValue(['change-a', 'change-b', 'archive']),
          pathExists: vi.fn().mockResolvedValue(true),
        });
        const repo = new FsChangeRepository(mockFs);

        const result = await repo.list();

        expect(result).toContain('change-a');
        expect(result).toContain('change-b');
        expect(result).not.toContain('archive');
      });
    });

    describe('archive', () => {
      it('should move change to archive', async () => {
        const moveDir = vi.fn().mockResolvedValue(undefined);
        const mockFs = createMockFs({ moveDir });
        const repo = new FsChangeRepository(mockFs);

        await repo.archive('my-change', '001');

        expect(moveDir).toHaveBeenCalledWith(
          expect.stringContaining('my-change'),
          expect.stringContaining('001-my-change')
        );
      });
    });
  });

  describe('FsGlobalConfigRepository', () => {
    describe('getConfig', () => {
      it('should return null when no config exists', async () => {
        const mockFs = createMockFs({
          readFile: vi.fn().mockResolvedValue(null),
        });
        const repo = new FsGlobalConfigRepository(mockFs);

        const result = await repo.getConfig();

        expect(result).toBeNull();
      });

      it('should return parsed config', async () => {
        const mockFs = createMockFs({
          readFile: vi.fn().mockResolvedValue(`
version: 1.0.0
lastArchiveId: 5
defaultSchema: spec-driven
created: 2024-01-15T10:30:00Z
`),
        });
        const repo = new FsGlobalConfigRepository(mockFs);

        const result = await repo.getConfig();

        expect(result).not.toBeNull();
        expect(result?.version).toBe('1.0.0');
        expect(result?.lastArchiveId).toBe(5);
      });

      it('should cache config after first read', async () => {
        const readFile = vi.fn().mockResolvedValue(`
version: 1.0.0
lastArchiveId: 0
defaultSchema: spec-driven
created: 2024-01-15T10:30:00Z
`);
        const mockFs = createMockFs({ readFile });
        const repo = new FsGlobalConfigRepository(mockFs);

        await repo.getConfig();
        await repo.getConfig();

        expect(readFile).toHaveBeenCalledTimes(1);
      });
    });

    describe('saveConfig', () => {
      it('should save config to filesystem', async () => {
        const writeFile = vi.fn().mockResolvedValue(undefined);
        const mockFs = createMockFs({ writeFile });
        const repo = new FsGlobalConfigRepository(mockFs);

        const config = {
          version: '1.0.0',
          lastArchiveId: 0,
          defaultSchema: 'spec-driven' as const,
          created: '2024-01-15T10:30:00Z',
        };

        await repo.saveConfig(config);

        expect(writeFile).toHaveBeenCalled();
      });

      it('should update cache when saving', async () => {
        const mockFs = createMockFs();
        const repo = new FsGlobalConfigRepository(mockFs);

        const config = {
          version: '1.0.0',
          lastArchiveId: 5,
          defaultSchema: 'spec-driven' as const,
          created: '2024-01-15T10:30:00Z',
        };

        await repo.saveConfig(config);
        const result = await repo.getConfig();

        expect(result?.lastArchiveId).toBe(5);
      });
    });

    describe('getNextArchiveId', () => {
      it('should return 1 for first archive', async () => {
        const mockFs = createMockFs({
          readFile: vi.fn().mockResolvedValue(null),
        });
        const repo = new FsGlobalConfigRepository(mockFs);

        const id = await repo.getNextArchiveId();

        expect(id).toBe(1);
      });

      it('should increment existing archiveId', async () => {
        const yamlContent = 'version: 1.0.0\nlastArchiveId: 3\ndefaultSchema: spec-driven\ncreated: 2024-01-15T10:30:00Z';
        const mockFs = createMockFs({
          readFile: vi.fn().mockResolvedValue(yamlContent),
        });
        const repo = new FsGlobalConfigRepository(mockFs);

        const id = await repo.getNextArchiveId();

        expect(id).toBe(4);
      });
    });
  });

  describe('MockChangeRepository', () => {
    it('should store and retrieve changes', async () => {
      const repo = new MockChangeRepository();
      const change: Change = {
        name: 'test',
        schema: 'spec-driven',
        created: '2024-01-15T10:30:00Z',
        path: 'specskills/changes/test',
      };

      await repo.save(change);
      const result = await repo.getChange('test');

      expect(result).toEqual(change);
    });

    it('should list all changes', async () => {
      const repo = new MockChangeRepository();
      await repo.save({
        name: 'a',
        schema: 'spec-driven',
        created: '2024-01-15T10:30:00Z',
        path: 'specskills/changes/a',
      });
      await repo.save({
        name: 'b',
        schema: 'spec-driven',
        created: '2024-01-15T10:30:00Z',
        path: 'specskills/changes/b',
      });

      const list = await repo.list();

      expect(list).toContain('a');
      expect(list).toContain('b');
    });

    it('should archive changes', async () => {
      const repo = new MockChangeRepository();
      await repo.save({
        name: 'test',
        schema: 'spec-driven',
        created: '2024-01-15T10:30:00Z',
        path: 'specskills/changes/test',
      });

      await repo.archive('test', '001');
      const result = await repo.getChange('test');

      expect(result).toBeNull();
    });
  });
});
