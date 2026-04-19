export interface BuildError {
  step: number;
  stepName: string;
  errorType: 'PARSE' | 'VALIDATION' | 'ENV' | 'DEPENDENCY' | 'BUILD' | 'OUTPUT' | 'DELIVERY' | 'TIMEOUT' | 'IO';
  message: string;
  inputSnapshot: string;
  attemptedFix?: string;
  nextStep: string;
}

export type BuildEventType =
  | 'SUCCESS'
  | 'PARTIAL'
  | 'ABORT'
  | 'WARNING'
  | 'CHUNK_FAILED'
  | 'RETRY'
  | 'DEGRADE'
  | 'DELIVERED_WITH_WARNING';

export interface BuildEvent {
  type: BuildEventType;
  step?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface BuildCheckpoint {
  step: number;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: Date;
  data?: unknown;
}

export interface BuildReport {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  startTime: Date;
  endTime: Date;
  durationMs: number;
  artifactPath?: string;
  sizeBytes?: number;
  steps: BuildCheckpoint[];
  events: BuildEvent[];
  errors: BuildError[];
}

export const BuildEventFactory = {
  success: (details?: Record<string, unknown>): BuildEvent => ({
    type: 'SUCCESS',
    message: 'Build completed successfully',
    details,
  }),

  partial: (delivered: number, failed: number, details?: Record<string, unknown>): BuildEvent => ({
    type: 'PARTIAL',
    message: `Delivered ${delivered} items, ${failed} failed`,
    details: { delivered, failed, ...details },
  }),

  abort: (step: number, reason: string, nextStep: string): BuildEvent => ({
    type: 'ABORT',
    step,
    message: reason,
    details: { nextStep },
  }),

  warning: (message: string, details?: Record<string, unknown>): BuildEvent => ({
    type: 'WARNING',
    message,
    details,
  }),

  chunkFailed: (index: number, reason: string): BuildEvent => ({
    type: 'CHUNK_FAILED',
    message: `Chunk ${index} failed: ${reason}`,
    details: { index, reason },
  }),

  retry: (attempt: number, max: number, delay: number, reason: string): BuildEvent => ({
    type: 'RETRY',
    message: `Retry ${attempt}/${max} after ${delay}s: ${reason}`,
    details: { attempt, max, delay, reason },
  }),

  degrade: (tool: string, fallback: string, reason: string): BuildEvent => ({
    type: 'DEGRADE',
    message: `Degraded from ${tool} to ${fallback}: ${reason}`,
    details: { tool, fallback, reason },
  }),

  deliveredWithWarning: (path: string, warning: string): BuildEvent => ({
    type: 'DELIVERED_WITH_WARNING',
    message: `Delivered to ${path} with warning: ${warning}`,
    details: { path, warning },
  }),
};
