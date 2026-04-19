import { describe, it, expect, vi } from 'vitest';
import { withRetry, isRetryableError, PermissionError } from '../../../src/infrastructure/resilience/index.js';
import { ValidationError } from '../../../src/infrastructure/validation/index.js';

describe('Retry Pattern', () => {
  describe('Task 4.1: Retry com backoff', () => {
    it('deve retry com backoff exponencial', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      const result = await withRetry(fn, {
        maxAttempts: 3,
        baseDelayMs: 10,
        onRetry,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);

      // Verificar backoff: primeira tentativa = 10ms, segunda = 20ms
      expect(onRetry.mock.calls[0]![1]).toBe(3); // max
      expect(onRetry.mock.calls[1]![0]).toBe(2); // attempt 2
    });

    it('deve respeitar teto de 30s', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));
      const onRetry = vi.fn();

      await expect(
        withRetry(fn, {
          maxAttempts: 5,
          baseDelayMs: 10000, // 10s base
          maxDelayMs: 30000,
          onRetry,
        })
      ).rejects.toThrow('Always fails');

      // Primeiro retry: 10s, segundo: 20s, terceiro: 30s (teto)
      expect(onRetry.mock.calls[0]![2]).toBe(10000);
      expect(onRetry.mock.calls[1]![2]).toBe(20000);
      expect(onRetry.mock.calls[2]![2]).toBe(30000); // Teto atingido
    });
  });

  describe('Task 4.2: NON_RETRYABLE errors', () => {
    it('não deve retry em ValidationError', async () => {
      const fn = vi.fn().mockRejectedValue(
        new ValidationError('field', 'code', 'message')
      );

      await expect(withRetry(fn)).rejects.toThrow(ValidationError);
      expect(fn).toHaveBeenCalledTimes(1); // No retry
    });

    it('não deve retry em PermissionError', async () => {
      const fn = vi.fn().mockRejectedValue(
        new PermissionError('Access denied')
      );

      await expect(withRetry(fn)).rejects.toThrow(PermissionError);
      expect(fn).toHaveBeenCalledTimes(1); // No retry
    });

    it('deve retry em erros genéricos', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { baseDelayMs: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isRetryableError', () => {
    it('deve identificar ValidationError como não-retryable', () => {
      expect(isRetryableError(new ValidationError('f', 'c', 'm'))).toBe(false);
    });

    it('deve identificar erro genérico como retryable', () => {
      expect(isRetryableError(new Error('generic'))).toBe(true);
    });

    it('deve tratar string como retryable', () => {
      expect(isRetryableError('error')).toBe(true);
    });
  });
});
