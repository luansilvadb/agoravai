import type { FileSystemPort } from '../domain/repositories.js';
import { join } from 'path';

export interface SpecInfo {
  id: string;
  name: string;
  path: string;
  content: string;
}

export interface ArtifactInfo {
  id: string;
  name: string;
  path: string;
  content: string;
  status: 'ready' | 'in-progress' | 'done' | 'pending';
}

const DEFAULT_CONCURRENCY = 10;

export async function loadSpecsParallel(
  specsDir: string,
  fs: FileSystemPort,
  concurrency: number = DEFAULT_CONCURRENCY
): Promise<SpecInfo[]> {
  const dirs = await fs.listDirs(specsDir);

  const specs = await batchProcess(
    dirs.filter(dir => dir !== 'specs.md'),
    async (dir) => {
      const specPath = join(specsDir, dir, 'specs.md');
      if (!(await fs.pathExists(specPath))) return null;

      const content = await fs.readFile(specPath);
      if (!content) return null;

      const nameMatch = content.match(/^# (.+)$/m);
      return {
        id: dir,
        name: nameMatch?.[1] ?? dir,
        path: specPath,
        content,
      };
    },
    concurrency
  );

  return specs.filter((s): s is SpecInfo => s !== null);
}

export async function loadArtifactsParallel(
  changePath: string,
  artifactIds: string[],
  fs: FileSystemPort,
  concurrency: number = DEFAULT_CONCURRENCY
): Promise<ArtifactInfo[]> {
  const artifacts = await batchProcess(
    artifactIds,
    async (id) => {
      const artifactPath = id === 'specs' 
        ? join(changePath, 'specs', 'specs.md')
        : join(changePath, `${id}.md`);
      if (!(await fs.pathExists(artifactPath))) return null;

      const content = await fs.readFile(artifactPath);
      if (!content) return null;

      const nameMatch = content.match(/^# (.+)$/m);
      return {
        id,
        name: nameMatch?.[1] ?? id,
        path: artifactPath,
        content,
        status: 'ready',
      };
    },
    concurrency
  );

  return artifacts.filter((a): a is ArtifactInfo => a !== null);
}

export async function batchReadFiles(
  filePaths: string[],
  fs: FileSystemPort,
  concurrency: number = DEFAULT_CONCURRENCY
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  const contents = await batchProcess(
    filePaths,
    async (path) => ({ path, content: await fs.readFile(path) }),
    concurrency
  );

  for (const item of contents) {
    results.set(item.path, item.content);
  }

  return results;
}

async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}

export async function parallelMap<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
  concurrency: number = DEFAULT_CONCURRENCY
): Promise<R[]> {
  return batchProcess(items, mapper, concurrency);
}

export async function parallelFilter<T>(
  items: T[],
  predicate: (item: T) => Promise<boolean>,
  concurrency: number = DEFAULT_CONCURRENCY
): Promise<T[]> {
  const results = await batchProcess(
    items,
    async (item) => ({ item, keep: await predicate(item) }),
    concurrency
  );

  return results.filter(r => r.keep).map(r => r.item);
}
