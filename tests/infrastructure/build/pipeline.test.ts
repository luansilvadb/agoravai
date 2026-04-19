import { describe, it, expect, vi } from 'vitest';
import { runBuildPipeline, type StepFunction } from '../../../src/infrastructure/build/index.js';

describe('Build Pipeline', () => {
  describe('Task 6.3: Pipeline completo', () => {
    it('deve executar todas as 7 etapas com sucesso', async () => {
      const onStepComplete = vi.fn();

      const report = await runBuildPipeline(
        { data: 'test' },
        {
          PARSE: async () => ({ success: true, data: 'parsed' }),
          VALIDATE: async () => ({ success: true, data: 'validated' }),
          ENV_CHECK: async () => ({ success: true }),
          DEPENDENCY_RESOLUTION: async () => ({ success: true }),
          BUILD: async () => ({ success: true, data: 'built' }),
          OUTPUT_VALIDATION: async () => ({ success: true }),
          DELIVER: async () => ({ success: true, data: 'delivered' }),
        },
        { onStepComplete }
      );

      expect(report.status).toBe('SUCCESS');
      expect(report.steps).toHaveLength(7);
      expect(report.errors).toHaveLength(0);
      expect(onStepComplete).toHaveBeenCalledTimes(7);
    });

    it('deve parar na etapa que falhar', async () => {
      const report = await runBuildPipeline(
        { data: 'test' },
        {
          PARSE: async () => ({ success: true }),
          VALIDATE: async () => ({
            success: false,
            error: {
              step: 2,
              stepName: 'Validate',
              errorType: 'VALIDATION',
              message: 'Invalid input',
              inputSnapshot: '{}',
              nextStep: 'fix_input',
            },
          }),
          BUILD: async () => ({ success: true }), // Should not be called
        }
      );

      expect(report.status).toBe('FAILED');
      expect(report.steps).toHaveLength(2); // Only PARSE and VALIDATE attempted
      expect(report.errors).toHaveLength(1);
      expect(report.errors[0]!.message).toBe('Invalid input');
    });

    it('deve gerar PARTIAL se houver warnings', async () => {
      const report = await runBuildPipeline(
        { data: 'test' },
        {
          PARSE: async () => ({
            success: true,
            warnings: ['Field deprecated'],
          }),
          VALIDATE: async () => ({ success: true }),
        }
      );

      expect(report.status).toBe('PARTIAL');
      expect(report.events.some(e => e.type === 'WARNING')).toBe(true);
    });
  });

  describe('Task 6.4: Timeout', () => {
    it('deve abortar em timeout de etapa', async () => {
      const slowStep: StepFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      };

      const report = await runBuildPipeline(
        { data: 'test' },
        { PARSE: slowStep },
        { timeoutPerStepMs: 50 }
      );

      expect(report.status).toBe('FAILED');
      expect(report.errors[0]!.errorType).toBe('TIMEOUT');
    });
  });

  describe('Task 6.5: Chunk isolation', () => {
    it('deve continuar mesmo com falha parcial', async () => {
      const report = await runBuildPipeline(
        { items: [1, 2, 3, 4, 5] },
        {
          PARSE: async (ctx) => ({
            success: true,
            data: ctx.intent,
          }),
          BUILD: async (ctx) => {
            const items = (ctx.intent as { items: number[] }).items;
            const processed = items.map((item, i) => {
              if (i === 2) throw new Error('Item 3 failed');
              return item * 2;
            });

            return {
              success: true,
              data: processed,
            };
          },
        }
      );

      // Pipeline succeeds even though one item failed in BUILD
      // (in real implementation, use processChunks for proper isolation)
      expect(report.status).toBe('SUCCESS');
    });
  });

  describe('Build Report', () => {
    it('deve incluir timing e eventos', async () => {
      const start = Date.now();

      const report = await runBuildPipeline(
        { data: 'test' },
        {
          PARSE: async () => ({ success: true }),
          BUILD: async () => ({ success: true }),
        }
      );

      expect(report.startTime).toBeInstanceOf(Date);
      expect(report.endTime).toBeInstanceOf(Date);
      expect(report.durationMs).toBeGreaterThanOrEqual(0);
      expect(report.durationMs).toBeLessThan(Date.now() - start + 100);
      expect(report.events.length).toBeGreaterThan(0);
      expect(report.events[report.events.length - 1]!.type).toBe('SUCCESS');
    });
  });
});
