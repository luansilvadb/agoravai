import { DomainError } from './DomainError.js';

export class ConfigValidationError extends DomainError {
  public readonly code = 'CONFIG_VALIDATION_ERROR';

  constructor(
    public readonly field: string,
    public readonly issue: string,
    cause?: unknown
  ) {
    super(`Config validation failed for field "${field}": ${issue}`, cause);
  }
}
