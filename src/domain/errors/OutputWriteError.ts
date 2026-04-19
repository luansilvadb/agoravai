import { DomainError } from './DomainError.js';

export class OutputWriteError extends DomainError {
  constructor(path: string, cause?: Error) {
    super(`Falha ao salvar resultado em: ${path}. Verifique permissões de escrita.`, cause, {
      path,
    });
    Object.setPrototypeOf(this, OutputWriteError.prototype);
  }
}
