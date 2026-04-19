import type { Vector } from '../entities/Vector.js';

export interface IVectorizer {
  vectorize(text: string): Promise<Vector>;
}
