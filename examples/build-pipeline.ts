/**
 * Example: Build Pipeline com Resiliência
 *
 * Demonstra:
 * - Pipeline de 7 etapas
 * - Validação de input com coerce
 * - Geração atômica de arquivo
 * - Chunk isolation
 */

import { runBuildPipeline } from '../src/infrastructure/build/index.js';
import { validate, assertValid } from '../src/infrastructure/validation/index.js';
import { generateInTemp, validateOutput, atomicMove } from '../src/infrastructure/atomic-io/index.js';
import { processChunks } from '../src/infrastructure/resilience/index.js';
import { writeFile } from 'fs/promises';

// Schema de validação
const reportSchema = {
  title: { type: 'string', required: true },
  data: { type: 'array', required: true },
  format: { type: 'string', required: true, domain: ['json', 'csv', 'pdf'] },
  maxItems: { type: 'number', defaultValue: 100, min: 1, max: 1000 },
} as const;

// Pipeline completo
async function generateReport(input: unknown) {
  const report = await runBuildPipeline(
    input,
    {
      // Etapa 1: Parse
      PARSE: async (ctx) => {
        try {
          const parsed = typeof ctx.intent === 'string' ? JSON.parse(ctx.intent) : ctx.intent;
          return { success: true, data: parsed };
        } catch (e) {
          return {
            success: false,
            error: {
              step: 1,
              stepName: 'Parse',
              errorType: 'PARSE',
              message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
              inputSnapshot: JSON.stringify(ctx.intent),
              nextStep: 'provide_valid_json',
            },
          };
        }
      },

      // Etapa 2: Validate
      VALIDATE: async (ctx) => {
        const data = ctx.data.get('parsed');
        const result = validate(data, reportSchema);

        if (!result.valid) {
          return {
            success: false,
            error: {
              step: 2,
              stepName: 'Validate',
              errorType: 'VALIDATION',
              message: result.errors.map(e => e.message).join(', '),
              inputSnapshot: JSON.stringify(data),
              nextStep: 'fix_validation_errors',
            },
          };
        }

        return {
          success: true,
          data: result.value,
          warnings: result.warnings.map(w => w.message),
        };
      },

      // Etapa 3: Env Check (simplificado)
      ENV_CHECK: async () => ({ success: true }),

      // Etapa 4: Deps (simplificado)
      DEPENDENCY_RESOLUTION: async () => ({ success: true }),

      // Etapa 5: Build com chunk isolation
      BUILD: async (ctx) => {
        const { data, maxItems } = ctx.data.get('validated') as { data: unknown[]; maxItems: number };

        const chunks = data.slice(0, maxItems);
        const { results, failed } = await processChunks(
          chunks,
          async (item, index) => formatItem(item, index),
          { maxConcurrency: 4, timeoutPerChunkMs: 5000 }
        );

        const content = {
          meta: { generated: new Date().toISOString(), items: results.length },
          items: results,
          errors: failed.map(f => ({ index: f.index, error: f.error?.message })),
        };

        const tempPath = await generateInTemp(content, async (data, path) => {
          await writeFile(path, JSON.stringify(data, null, 2));
        });

        return {
          success: true,
          data: { tempPath, failedCount: failed.length },
        };
      },

      // Etapa 6: Output Validation
      OUTPUT_VALIDATION: async (ctx) => {
        const { tempPath } = ctx.data.get('buildResult') as { tempPath: string };

        const result = await validateOutput(tempPath, {
          minSize: 10,
          validator: (path) => {
            try {
              const content = require('fs').readFileSync(path, 'utf-8');
              JSON.parse(content);
              return { valid: true };
            } catch (e) {
              return { valid: false, errors: [`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`] };
            }
          },
        });

        if (!result.valid) {
          return {
            success: false,
            error: {
              step: 6,
              stepName: 'Output Validation',
              errorType: 'OUTPUT',
              message: result.errors.join(', '),
              inputSnapshot: '',
              nextStep: 'investigate_build_output',
            },
          };
        }

        return { success: true, data: { tempPath } };
      },

      // Etapa 7: Deliver
      DELIVER: async (ctx) => {
        const { tempPath } = ctx.data.get('outputResult') as { tempPath: string };
        const result = await atomicMove(tempPath, './output/report.json', 'version');

        return {
          success: true,
          data: { finalPath: result.finalPath, versioned: result.versioned },
        };
      },
    },
    { timeoutPerStepMs: 60000 }
  );

  return report;
}

function formatItem(item: unknown, index: number): { id: number; formatted: string } {
  return {
    id: index,
    formatted: JSON.stringify(item),
  };
}

// Execução de exemplo
if (import.meta.main) {
  const input = {
    title: 'Sales Report',
    data: [{ value: 100 }, { value: 200 }, { value: 300 }],
    format: 'json',
  };

  generateReport(input)
    .then(report => {
      console.log('Build Status:', report.status);
      console.log('Duration:', report.durationMs, 'ms');
      console.log('Steps completed:', report.steps.length);
      console.log('Events:', report.events.map(e => e.type).join(', '));
    })
    .catch(console.error);
}
