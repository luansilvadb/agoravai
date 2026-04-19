import { cos_sim } from '@xenova/transformers';
import type { IResultMatcher } from '../../domain/interfaces/IResultMatcher.js';
import type { Skill } from '../../domain/entities/Skill.js';
import type { Vector } from '../../domain/entities/Vector.js';

export class ResultMatcher implements IResultMatcher {
  calculateSimilarity(vectorA: Vector, vectorB: Vector): number {
    // @ts-expect-error cos_sim é exportado mas tipo está incorreto
    return cos_sim(vectorA, vectorB);
  }

  filterByThreshold(results: Skill[], threshold: number): Skill[] {
    return results.filter(
      (result): result is Skill & { similarity: number } =>
        result.similarity !== undefined && result.similarity > threshold
    );
  }

  selectTopK(results: Skill[], k: number): Skill[] {
    const sorted = [...results].sort((a, b) => {
      const simA = a.similarity ?? 0;
      const simB = b.similarity ?? 0;
      return simB - simA;
    });
    return sorted.slice(0, k);
  }
}
