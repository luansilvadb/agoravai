import { describe, it, expect, vi } from 'vitest';
import { withFallback, CriticalDependencyError } from '../../../src/infrastructure/resilience/index.js';

describe('Fallback by Criticality', () => {
  describe('Task 4.5: Fallback P0/P1/P2', () => {
    it('P0: deve lançar erro crítico sem fallback', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Critical API down'));

      await expect(
        withFallback(fn, {
          criticality: 'P0',
          fallback: 'fallback-value',
        })
      ).rejects.toThrow(CriticalDependencyError);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('P1: deve usar fallback com warning', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('API timeout'));
      const onFallbackUsed = vi.fn();
      const fallback = { cached: true };

      const result = await withFallback(fn, {
        criticality: 'P1',
        fallback,
        onFallbackUsed,
      });

      expect(result).toBe(fallback);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(onFallbackUsed).toHaveBeenCalledWith('API timeout');
    });

    it('P2: deve usar fallback silencioso', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Non-critical error'));
      const onFallbackUsed = vi.fn();
      const fallback = 'default-value';

      const result = await withFallback(fn, {
        criticality: 'P2',
        fallback,
        onFallbackUsed,
      });

      expect(result).toBe(fallback);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(onFallbackUsed).not.toHaveBeenCalled();
    });

    it('deve retornar valor real se função suceder', async () => {
      const fn = vi.fn().mockResolvedValue('real-value');
      const fallback = 'fallback-value';

      const result = await withFallback(fn, {
        criticality: 'P1',
        fallback,
      });

      expect(result).toBe('real-value');
    });

    it('deve incluir cause no CriticalDependencyError', async () => {
      const originalError = new Error('Original error');
      const fn = vi.fn().mockRejectedValue(originalError);

      try {
        await withFallback(fn, { criticality: 'P0', fallback: '' });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CriticalDependencyError);
        expect((e as CriticalDependencyError).cause).toBe(originalError);
      }
    });
  });
});
