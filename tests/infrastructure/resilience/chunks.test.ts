import { describe, it, expect, vi } from 'vitest';
import { processChunks, createChunks } from '../../../src/infrastructure/resilience/index.js';

describe('Chunk Isolation', () => {
  describe('Task 4.3: Processamento de chunks', () => {
    it('deve processar todos os chunks com sucesso', async () => {
      const processor = vi.fn((item: number) => Promise.resolve(item * 2));

      const { results, failed, events } = await processChunks(
        [1, 2, 3, 4, 5],
        processor,
        { maxConcurrency: 2 }
      );

      expect(results).toEqual([2, 4, 6, 8, 10]);
      expect(failed).toHaveLength(0);
      expect(events).toHaveLength(0);
      expect(processor).toHaveBeenCalledTimes(5);
    });

    it('deve isolar falhas em chunks individuais', async () => {
      const processor = vi.fn((item: number) => {
        if (item === 3) throw new Error('Item 3 failed');
        return Promise.resolve(item * 2);
      });

      const { results, failed, events } = await processChunks(
        [1, 2, 3, 4, 5],
        processor,
        { maxConcurrency: 1 } // Sequencial para garantir ordem
      );

      expect(results).toEqual([2, 4, 8, 10]); // Sem o 3
      expect(failed).toHaveLength(1);
      expect(failed[0]!.index).toBe(2); // Index do item 3
      expect(failed[0]!.error!.message).toBe('Item 3 failed');
      expect(events).toHaveLength(1);
      expect(events[0]!.type).toBe('CHUNK_FAILED');
    });

    it('deve respeitar maxConcurrency', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const processor = async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise(resolve => setTimeout(resolve, 10));
        concurrent--;
        return 'done';
      };

      await processChunks([1, 2, 3, 4, 5, 6, 7, 8], processor, { maxConcurrency: 3 });

      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });

    it('deve respeitar timeout por chunk', async () => {
      const processor = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'done';
      });

      const { results, failed } = await processChunks(
        [1, 2],
        processor,
        { timeoutPerChunkMs: 50 }
      );

      expect(results).toHaveLength(0);
      expect(failed).toHaveLength(2);
      expect(failed[0]!.error!.message).toContain('timed out');
    });

    it('deve chamar onChunkComplete para cada chunk', async () => {
      const onChunkComplete = vi.fn();

      await processChunks(
        [1, 2, 3],
        (item) => Promise.resolve(item * 2),
        { onChunkComplete }
      );

      expect(onChunkComplete).toHaveBeenCalledTimes(3);
      expect(onChunkComplete).toHaveBeenNthCalledWith(1, expect.objectContaining({ index: 0, success: true }));
      expect(onChunkComplete).toHaveBeenNthCalledWith(2, expect.objectContaining({ index: 1, success: true }));
      expect(onChunkComplete).toHaveBeenNthCalledWith(3, expect.objectContaining({ index: 2, success: true }));
    });
  });

  describe('createChunks', () => {
    it('deve criar chunks do tamanho correto', () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const chunks = createChunks(items, 3);

      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('deve lidar com array vazio', () => {
      const chunks = createChunks([], 5);
      expect(chunks).toEqual([]);
    });
  });
});
