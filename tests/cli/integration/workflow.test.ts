import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container, TOKENS } from '../../../src/cli/infrastructure/container.js';
import { MockChangeRepository } from '../../../src/cli/infrastructure/mock-change-repository.js';
import type { ChangeRepository, GlobalConfigRepository, Change } from '../../../src/cli/domain/repositories.js';
import { newChangeCommand } from '../../../src/cli/commands/new-change.js';
import { archiveCommand } from '../../../src/cli/commands/archive.js';

describe('Integration: Full Workflow', () => {
  beforeEach(() => {
    Container.reset();
    const mockRepo = new MockChangeRepository();
    Container.getInstance().register(TOKENS.CHANGE_REPOSITORY, mockRepo);

    // Mock GlobalConfigRepository for archive tests
    const mockConfigRepo = {
      getConfig: vi.fn().mockResolvedValue(null),
      saveConfig: vi.fn().mockResolvedValue(undefined),
      getNextArchiveId: vi.fn().mockResolvedValue(1),
    };
    Container.getInstance().register(TOKENS.GLOBAL_CONFIG_REPOSITORY, mockConfigRepo);
  });

  describe('new → status → archive workflow', () => {
    it('should create a new change', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await newChangeCommand('test-change', { schema: 'spec-driven' });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Created change 'test-change'"));

      consoleSpy.mockRestore();
    });

    it('should detect duplicate change names', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

      // Create first change
      await newChangeCommand('duplicate-test', { schema: 'spec-driven' });

      // Try to create duplicate
      await expect(newChangeCommand('duplicate-test', { schema: 'spec-driven' }))
        .rejects.toThrow('exit');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("already exists"));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should archive an existing change', async () => {
      // Create change first
      const repo = Container.getInstance().resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
      await repo.save({
        name: 'archive-test',
        schema: 'spec-driven',
        created: new Date().toISOString(),
        path: 'specskills/changes/archive-test',
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await archiveCommand({ change: 'archive-test' });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Archived'));

      consoleSpy.mockRestore();
    });

    it('should show error for non-existent change on archive', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

      await expect(archiveCommand({ change: 'non-existent' }))
        .rejects.toThrow('exit');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('dry-run modes', () => {
    it('should preview new change without creating', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await newChangeCommand('dry-run-test', { schema: 'spec-driven', dryRun: true });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[DRY-RUN]'));

      // Verify change was NOT created
      const repo = Container.getInstance().resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
      const change = await repo.getChange('dry-run-test');
      expect(change).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should preview archive without archiving', async () => {
      // Create change first
      const repo = Container.getInstance().resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
      await repo.save({
        name: 'archive-dry-run',
        schema: 'spec-driven',
        created: new Date().toISOString(),
        path: 'specskills/changes/archive-dry-run',
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await archiveCommand({ change: 'archive-dry-run', dryRun: true });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[DRY-RUN]'));

      // Verify change still exists
      const change = await repo.getChange('archive-dry-run');
      expect(change).not.toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('error scenarios', () => {
    it('should handle missing change name', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

      await expect(newChangeCommand('', {})).rejects.toThrow('exit');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid change name'));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle invalid schema', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

      await expect(newChangeCommand('test', { schema: 'invalid-schema' }))
        .rejects.toThrow('exit');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid schema'));

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('multiple changes', () => {
    it('should handle multiple active changes', async () => {
      const repo = Container.getInstance().resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

      await repo.save({
        name: 'change-a',
        schema: 'spec-driven',
        created: new Date().toISOString(),
        path: 'specskills/changes/change-a',
      });
      await repo.save({
        name: 'change-b',
        schema: 'spec-driven',
        created: new Date().toISOString(),
        path: 'specskills/changes/change-b',
      });

      const list = await repo.list();

      expect(list).toContain('change-a');
      expect(list).toContain('change-b');
      expect(list).toHaveLength(2);
    });

    it('should archive one change while keeping others', async () => {
      const repo = Container.getInstance().resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

      await repo.save({
        name: 'keep-me',
        schema: 'spec-driven',
        created: new Date().toISOString(),
        path: 'specskills/changes/keep-me',
      });
      await repo.save({
        name: 'archive-me',
        schema: 'spec-driven',
        created: new Date().toISOString(),
        path: 'specskills/changes/archive-me',
      });

      await repo.archive('archive-me', '001');

      const list = await repo.list();
      expect(list).toContain('keep-me');
      expect(list).not.toContain('archive-me');
    });
  });
});
