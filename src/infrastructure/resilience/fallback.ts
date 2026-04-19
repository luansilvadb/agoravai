import { CriticalDependencyError } from './retry.js';

export type Criticality = 'P0' | 'P1' | 'P2';

export interface FallbackConfig<T> {
  criticality: Criticality;
  fallback: T;
  onFallbackUsed?: (reason: string) => void;
}

export async function withFallback<T>(
  fn: () => Promise<T>,
  config: FallbackConfig<T>
): Promise<T> {
  const { criticality, fallback, onFallbackUsed } = config;

  try {
    return await fn();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    switch (criticality) {
      case 'P0':
        // P0: No fallback, bubble up the error
        throw new CriticalDependencyError(`Critical dependency failed: ${reason}`, { cause: error instanceof Error ? error : undefined });

      case 'P1':
        // P1: Use fallback but warn
        onFallbackUsed?.(reason);
        return fallback;

      case 'P2':
        // P2: Silent fallback for non-critical features
        return fallback;

      default:
        throw error;
    }
  }
}

export function getFallbackForCriticality<T>(
  criticality: Criticality,
  fallbacks: Record<Criticality, T>
): T {
  return fallbacks[criticality];
}
