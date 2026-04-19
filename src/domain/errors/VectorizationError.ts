import { DomainError } from './DomainError.js';

export class VectorizationError extends DomainError {
  constructor(filePath: string, cause?: Error) {
    super(`Falha ao vetorizar arquivo: ${filePath}`, cause, { filePath });
    Object.setPrototypeOf(this, VectorizationError.prototype);
  }
}
