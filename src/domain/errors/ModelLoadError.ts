import { DomainError } from './DomainError.js';

export class ModelLoadError extends DomainError {
  constructor(cause?: Error, context?: Record<string, unknown>) {
    super(
      'Falha ao carregar modelo de embeddings. Verifique sua conexão e espaço em disco.',
      cause,
      context
    );
    Object.setPrototypeOf(this, ModelLoadError.prototype);
  }
}
