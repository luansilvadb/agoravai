import type { Skill } from '../entities/Skill.js';

export interface IOutputWriter {
  write(results: Skill[], prompt: string): Promise<void>;
}
