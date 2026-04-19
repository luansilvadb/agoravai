import type { BuildError, BuildEvent, BuildCheckpoint, BuildReport } from './types.js';
import { BuildEventFactory } from './types.js';

export type BuildStep =
  | 'PARSE'
  | 'VALIDATE'
  | 'ENV_CHECK'
  | 'DEPENDENCY_RESOLUTION'
  | 'BUILD'
  | 'OUTPUT_VALIDATION'
  | 'DELIVER';

export interface BuildContext {
  intent: unknown;
  config: BuildConfig;
  checkpoints: BuildCheckpoint[];
  events: BuildEvent[];
  errors: BuildError[];
  data: Map<string, unknown>;
}

export interface BuildConfig {
  timeoutPerStepMs?: number;
  maxRetries?: number;
  tempDir?: string;
  onStepComplete?: (checkpoint: BuildCheckpoint) => void;
  onEvent?: (event: BuildEvent) => void;
}

export interface StepResult {
  success: boolean;
  data?: unknown;
  error?: BuildError;
  warnings?: string[];
}

export type StepFunction = (context: BuildContext) => Promise<StepResult>;

const STEP_ORDER: BuildStep[] = [
  'PARSE',
  'VALIDATE',
  'ENV_CHECK',
  'DEPENDENCY_RESOLUTION',
  'BUILD',
  'OUTPUT_VALIDATION',
  'DELIVER',
];

const STEP_NAMES: Record<BuildStep, string> = {
  PARSE: 'Parse',
  VALIDATE: 'Validate',
  ENV_CHECK: 'Environment Check',
  DEPENDENCY_RESOLUTION: 'Dependency Resolution',
  BUILD: 'Build',
  OUTPUT_VALIDATION: 'Output Validation',
  DELIVER: 'Deliver',
};

function createCheckpoint(step: number, stepName: string, status: BuildCheckpoint['status'], data?: unknown): BuildCheckpoint {
  return {
    step,
    stepName,
    status,
    timestamp: new Date(),
    data,
  };
}

function createError(
  step: number,
  stepName: string,
  errorType: BuildError['errorType'],
  message: string,
  inputSnapshot: string,
  nextStep: string,
  attemptedFix?: string
): BuildError {
  return {
    step,
    stepName,
    errorType,
    message,
    inputSnapshot: inputSnapshot.slice(0, 200),
    nextStep,
    attemptedFix,
  };
}

export async function runBuildPipeline(
  intent: unknown,
  steps: Partial<Record<BuildStep, StepFunction>>,
  config: BuildConfig = {}
): Promise<BuildReport> {
  const startTime = new Date();
  const context: BuildContext = {
    intent,
    config,
    checkpoints: [],
    events: [],
    errors: [],
    data: new Map(),
  };

  let currentStep = 0;
  let aborted = false;

  for (const stepName of STEP_ORDER) {
    currentStep++;
    const stepFn = steps[stepName];

    if (!stepFn) {
      const checkpoint = createCheckpoint(currentStep, STEP_NAMES[stepName], 'completed', { skipped: true });
      context.checkpoints.push(checkpoint);
      config.onStepComplete?.(checkpoint);
      continue;
    }

    const checkpoint = createCheckpoint(currentStep, STEP_NAMES[stepName], 'running');
    context.checkpoints.push(checkpoint);

    try {
      const timeoutMs = config.timeoutPerStepMs ?? 30000;
      const result = await Promise.race([
        stepFn(context),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Step ${stepName} timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);

      if (!result.success) {
        aborted = true;
        if (result.error) {
          context.errors.push(result.error);
        }
        checkpoint.status = 'failed';
        context.events.push(BuildEventFactory.abort(currentStep, result.error?.message ?? 'Step failed', result.error?.nextStep ?? 'investigate'));
        break;
      }

      checkpoint.status = 'completed';
      checkpoint.data = result.data;

      if (result.warnings) {
        for (const warning of result.warnings) {
          const event = BuildEventFactory.warning(warning);
          context.events.push(event);
          config.onEvent?.(event);
        }
      }

      config.onStepComplete?.(checkpoint);
    } catch (error) {
      aborted = true;
      checkpoint.status = 'failed';
      const errorMessage = error instanceof Error ? error.message : String(error);
      const buildError = createError(
        currentStep,
        STEP_NAMES[stepName],
        'TIMEOUT',
        errorMessage,
        JSON.stringify(intent),
        'retry_with_longer_timeout_or_simplify_input',
        undefined
      );
      context.errors.push(buildError);
      context.events.push(BuildEventFactory.abort(currentStep, errorMessage, 'retry_with_longer_timeout'));
      break;
    }
  }

  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();

  let status: BuildReport['status'] = 'SUCCESS';
  if (aborted) {
    status = 'FAILED';
  } else if (context.events.some(e => e.type === 'WARNING' || e.type === 'CHUNK_FAILED')) {
    status = 'PARTIAL';
  }

  if (status === 'SUCCESS') {
    context.events.push(BuildEventFactory.success());
  }

  const report: BuildReport = {
    status,
    startTime,
    endTime,
    durationMs,
    steps: context.checkpoints,
    events: context.events,
    errors: context.errors,
  };

  return report;
}
