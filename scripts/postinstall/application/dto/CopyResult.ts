import type { CopyTask } from './CopyTask.js';

export interface CopyResult {
  task: CopyTask;
  success: boolean;
  copiedFiles: number;
  skippedFiles: number;
  error?: Error;
}
