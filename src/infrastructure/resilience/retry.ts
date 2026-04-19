import { ValidationError } from '../validation/types.js';

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class IntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntegrityError';
  }
}

export class CriticalDependencyError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = 'CriticalDependencyError';
  }
}

export type RetryableError = Error & { retryable?: boolean };

const NON_RETRYABLE_ERRORS = new Set([
  ValidationError,
  PermissionError,
  IntegrityError,
  SyntaxError,
  TypeError,
]);

export interface RetryConfig {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, max: number, delay: number, reason: string) => void;
}

export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return true;

  for (const errorType of NON_RETRYABLE_ERRORS) {
    if (error instanceof errorType) return false;
  }

  return true;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1000, maxDelayMs = 30000, onRetry } = config;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error)) {
        throw error;
      }

      if (attempt === maxAttempts) {
        break;
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      const reason = error instanceof Error ? error.message : String(error);

      onRetry?.(attempt, maxAttempts, delay, reason);

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
