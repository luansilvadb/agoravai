import type { Skill } from '../entities/Skill.js';
import type { Vector } from '../entities/Vector.js';

export interface IResultMatcher {
  calculateSimilarity(vectorA: Vector, vectorB: Vector): number;
  filterByThreshold(results: Skill[], threshold: number): Skill[];
  selectTopK(results: Skill[], k: number): Skill[];
}
