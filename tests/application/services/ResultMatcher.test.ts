import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultMatcher } from '../../../src/application/services/ResultMatcher.js';
import type { Skill } from '../../../src/domain/entities/Skill.js';

vi.mock('@xenova/transformers', () => ({
  cos_sim: vi.fn((a: Float32Array, b: Float32Array) => {
    // Mock simples: cosine similarity de vetores iguais = 1
    if (a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }),
}));

describe('ResultMatcher', () => {
  let matcher: ResultMatcher;

  beforeEach(() => {
    matcher = new ResultMatcher();
  });

  describe('calculateSimilarity', () => {
    it('deve retornar 1 para vetores idênticos', () => {
      const vec = new Float32Array([1, 2, 3, 4, 5]);
      const similarity = matcher.calculateSimilarity(vec, vec);
      expect(similarity).toBeCloseTo(1, 5);
    });

    it('deve retornar valor menor que 1 para vetores diferentes', () => {
      const vecA = new Float32Array([1, 0, 0]);
      const vecB = new Float32Array([0, 1, 0]);
      const similarity = matcher.calculateSimilarity(vecA, vecB);
      expect(similarity).toBeCloseTo(0, 5);
    });
  });

  describe('filterByThreshold', () => {
    it('deve filtrar corretamente abaixo do threshold', () => {
      const results: Skill[] = [
        { filePath: 'a.md', content: '', similarity: 0.8 },
        { filePath: 'b.md', content: '', similarity: 0.2 },
        { filePath: 'c.md', content: '', similarity: 0.5 },
      ];

      const filtered = matcher.filterByThreshold(results, 0.3);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((r) => (r.similarity ?? 0) > 0.3)).toBe(true);
    });

    it('deve retornar array vazio quando nenhum acima do threshold', () => {
      const results: Skill[] = [
        { filePath: 'a.md', content: '', similarity: 0.1 },
        { filePath: 'b.md', content: '', similarity: 0.2 },
      ];

      const filtered = matcher.filterByThreshold(results, 0.5);

      expect(filtered).toEqual([]);
    });
  });

  describe('selectTopK', () => {
    it('deve retornar apenas top K ordenados por similaridade desc', () => {
      const results: Skill[] = [
        { filePath: 'low.md', content: '', similarity: 0.3 },
        { filePath: 'high.md', content: '', similarity: 0.9 },
        { filePath: 'mid.md', content: '', similarity: 0.6 },
        { filePath: 'extra.md', content: '', similarity: 0.8 },
      ];

      const topK = matcher.selectTopK(results, 2);

      expect(topK).toHaveLength(2);
      expect(topK[0].filePath).toBe('high.md');
      expect(topK[1].filePath).toBe('extra.md');
    });

    it('deve retornar todos quando K maior que array', () => {
      const results: Skill[] = [
        { filePath: 'a.md', content: '', similarity: 0.5 },
        { filePath: 'b.md', content: '', similarity: 0.3 },
      ];

      const topK = matcher.selectTopK(results, 5);

      expect(topK).toHaveLength(2);
    });

    it('deve lidar com skills sem similarity definida', () => {
      const results: Skill[] = [
        { filePath: 'a.md', content: '' },
        { filePath: 'b.md', content: '', similarity: 0.5 },
      ];

      const topK = matcher.selectTopK(results, 2);

      expect(topK).toHaveLength(2);
      expect(topK[0].filePath).toBe('b.md');
    });
  });
});
