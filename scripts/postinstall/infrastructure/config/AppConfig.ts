import { z } from 'zod';
import { LogLevel } from '../../domain/ports/ILogger.js';
import { ConfigValidationError } from '../../domain/errors/ConfigValidationError.js';

const logLevelSchema = z.enum([LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]);

const configSchema = z.object({
  logLevel: logLevelSchema.default(LogLevel.INFO),
  projectRoot: z.string().default(process.cwd()),
  windsurfDir: z.string().default('.windsurf'),
  specskillDir: z.string().default('specskill'),
  ragDir: z.string().default('.rag'),
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(): AppConfig {
  try {
    const logLevelEnv = process.env.LOG_LEVEL?.toLowerCase();
    const validatedLogLevel = logLevelSchema.safeParse(logLevelEnv);

    return configSchema.parse({
      logLevel: validatedLogLevel.success ? validatedLogLevel.data : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      throw new ConfigValidationError(
        firstIssue.path.join('.'),
        firstIssue.message,
        error
      );
    }
    throw new ConfigValidationError('unknown', String(error), error);
  }
}
