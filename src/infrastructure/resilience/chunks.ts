import type { BuildEvent } from '../build/types.js';
import { BuildEventFactory } from '../build/types.js';

export interface ChunkResult<T> {
  index: number;
  success: boolean;
  data?: T;
  error?: Error;
}

export interface ChunkConfig {
  maxConcurrency?: number;
  timeoutPerChunkMs?: number;
  onChunkComplete?: (result: ChunkResult<unknown>) => void;
}

export async function processChunks<T, R>(
  chunks: T[],
  processor: (chunk: T, index: number) => Promise<R>,
  config: ChunkConfig = {}
): Promise<{ results: R[]; failed: ChunkResult<unknown>[]; events: BuildEvent[] }> {
  const { maxConcurrency = 4, timeoutPerChunkMs = 30000, onChunkComplete } = config;
  const results: R[] = [];
  const failed: ChunkResult<unknown>[] = [];
  const events: BuildEvent[] = [];

  const processWithTimeout = async (chunk: T, index: number): Promise<ChunkResult<R>> => {
    try {
      const result = await Promise.race([
        processor(chunk, index),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Chunk ${index} timed out`)), timeoutPerChunkMs)
        ),
      ]);

      return { index, success: true, data: result };
    } catch (error) {
      return {
        index,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  // Process in batches for concurrency control
  for (let i = 0; i < chunks.length; i += maxConcurrency) {
    const batch = chunks.slice(i, i + maxConcurrency);
    const batchPromises = batch.map((chunk, batchIndex) =>
      processWithTimeout(chunk, i + batchIndex)
    );

    const batchResults = await Promise.all(batchPromises);

    for (const result of batchResults) {
      onChunkComplete?.(result);

      if (result.success && result.data !== undefined) {
        results.push(result.data);
      } else {
        failed.push(result);
        events.push(BuildEventFactory.chunkFailed(result.index, result.error?.message ?? 'Unknown error'));
      }
    }
  }

  // Sort results by original index
  results.sort((a, b) => {
    const indexA = failed.find(f => f.data === a)?.index ?? -1;
    const indexB = failed.find(f => f.data === b)?.index ?? -1;
    return indexA - indexB;
  });

  return { results, failed, events };
}

export function createChunks<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}
