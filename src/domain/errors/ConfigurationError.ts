import { DomainError } from './DomainError.js';

export class ConfigurationError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, undefined, context);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
