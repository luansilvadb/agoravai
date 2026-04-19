import { describe, it, expect, vi } from 'vitest';
import {
  loadSpecsParallel,
  loadArtifactsParallel,
  batchReadFiles,
  parallelMap,
  parallelFilter,
} from '../../../src/cli/utils/parallel-io.js';
import type { FileSystemPort } from '../../../src/cli/domain/repositories.js';

describe('Parallel I/O', () => {
  const createMockFs = (overrides: Partial<FileSystemPort> = {}): FileSystemPort => ({
    readFile: vi.fn().mockResolvedValue(null),
    writeFile: vi.fn().mockResolvedValue(undefined),
    ensureDir: vi.fn().mockResolvedValue(undefined),
    pathExists: vi.fn().mockResolvedValue(false),
    listDirs: vi.fn().mockResolvedValue([]),
    moveDir: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  describe('loadSpecsParallel', () => {
    it('should load specs from directories', async () => {
      const mockFs = createMockFs({
        listDirs: vi.fn().mockResolvedValue(['spec-a', 'spec-b']),
        pathExists: vi.fn().mockResolvedValue(true),
        readFile: vi.fn().mockResolvedValue('# Spec Title\nContent'),
      });

      const specs = await loadSpecsParallel('/specs', mockFs);

      expect(specs).toHaveLength(2);
      expect(specs[0]).toHaveProperty('id');
      expect(specs[0]).toHaveProperty('name');
      expect(specs[0]).toHaveProperty('path');
      expect(specs[0]).toHaveProperty('content');
      expect(specs.length).toBeGreaterThan(0);
    });

    it('should skip directories without spec.md', async () => {
      const mockFs = createMockFs({
        listDirs: vi.fn().mockResolvedValue(['spec-a', 'spec-b']),
        pathExists: vi.fn().mockResolvedValue(false),
      });

      const specs = await loadSpecsParallel('/specs', mockFs);

      expect(specs).toHaveLength(0);
    });

    it('should skip specs.md directory', async () => {
      const mockFs = createMockFs({
        listDirs: vi.fn().mockResolvedValue(['specs.md', 'spec-a']),
        pathExists: vi.fn().mockResolvedValue(true),
        readFile: vi.fn().mockResolvedValue('# Title'),
      });

      const specs = await loadSpecsParallel('/specs', mockFs);

      expect(specs).toHaveLength(1);
      expect(specs[0]?.id).toBe('spec-a');
    });

    it('should extract name from spec content', async () => {
      const mockFs = createMockFs({
        listDirs: vi.fn().mockResolvedValue(['spec-a']),
        pathExists: vi.fn().mockResolvedValue(true),
        readFile: vi.fn().mockResolvedValue('# My Spec Title\nContent here'),
      });

      const specs = await loadSpecsParallel('/specs', mockFs);

      expect(specs[0]?.name).toBe('My Spec Title');
    });

    it('should use directory name when no title found', async () => {
      const mockFs = createMockFs({
        listDirs: vi.fn().mockResolvedValue(['spec-a']),
        pathExists: vi.fn().mockResolvedValue(true),
        readFile: vi.fn().mockResolvedValue('Content without title'),
      });

      const specs = await loadSpecsParallel('/specs', mockFs);

      expect(specs[0]?.name).toBe('spec-a');
    });
  });

  describe('loadArtifactsParallel', () => {
    it('should load artifacts by ID', async () => {
      const mockFs = createMockFs({
        pathExists: vi.fn().mockResolvedValue(true),
        readFile: vi.fn().mockResolvedValue('# Artifact Title'),
      });

      const artifacts = await loadArtifactsParallel('/change', ['a', 'b'], mockFs);

      expect(artifacts).toHaveLength(2);
    });

    it('should filter out non-existent artifacts', async () => {
      const mockFs = createMockFs({
        pathExists: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
        readFile: vi.fn().mockResolvedValue('# Title'),
      });

      const artifacts = await loadArtifactsParallel('/change', ['a', 'b'], mockFs);

      expect(artifacts).toHaveLength(1);
      expect(artifacts[0]?.id).toBe('a');
    });

    it('should set status to ready', async () => {
      const mockFs = createMockFs({
        pathExists: vi.fn().mockResolvedValue(true),
        readFile: vi.fn().mockResolvedValue('# Title'),
      });

      const artifacts = await loadArtifactsParallel('/change', ['a'], mockFs);

      expect(artifacts[0]?.status).toBe('ready');
    });
  });

  describe('batchReadFiles', () => {
    it('should read multiple files', async () => {
      const mockFs = createMockFs({
        readFile: vi.fn().mockImplementation((p: string) =>
          Promise.resolve(`content of ${p}`)
        ),
      });

      const results = await batchReadFiles(['/file1', '/file2'], mockFs);

      expect(results.get('/file1')).toBe('content of /file1');
      expect(results.get('/file2')).toBe('content of /file2');
    });

    it('should handle null content', async () => {
      const mockFs = createMockFs({
        readFile: vi.fn().mockResolvedValue(null),
      });

      const results = await batchReadFiles(['/file1'], mockFs);

      expect(results.get('/file1')).toBeNull();
    });

    it('should respect concurrency limit', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const mockFs = createMockFs({
        readFile: vi.fn().mockImplementation(async () => {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          await new Promise(r => setTimeout(r, 10));
          concurrent--;
          return 'content';
        }),
      });

      const files = Array(10).fill(0).map((_, i) => `/file${i}`);
      await batchReadFiles(files, mockFs, 3);

      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });
  });

  describe('parallelMap', () => {
    it('should map items in parallel', async () => {
      const mapper = async (x: number) => x * 2;

      const results = await parallelMap([1, 2, 3], mapper);

      expect(results).toEqual([2, 4, 6]);
    });

    it('should handle async operations', async () => {
      const mapper = async (x: number) => {
        await new Promise(r => setTimeout(r, 1));
        return x + 1;
      };

      const results = await parallelMap([1, 2, 3], mapper);

      expect(results).toEqual([2, 3, 4]);
    });
  });

  describe('parallelFilter', () => {
    it('should filter items based on async predicate', async () => {
      const predicate = async (x: number) => x % 2 === 0;

      const results = await parallelFilter([1, 2, 3, 4, 5], predicate);

      expect(results).toEqual([2, 4]);
    });

    it('should handle all false predicate', async () => {
      const predicate = async () => false;

      const results = await parallelFilter([1, 2, 3], predicate);

      expect(results).toEqual([]);
    });

    it('should handle all true predicate', async () => {
      const predicate = async () => true;

      const results = await parallelFilter([1, 2, 3], predicate);

      expect(results).toEqual([1, 2, 3]);
    });
  });
});
