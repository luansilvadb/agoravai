import { DomainError } from './DomainError.js';

export class FileScanError extends DomainError {
  constructor(path: string, cause?: Error) {
    super(`Não foi possível ler o diretório de skills: ${path}`, cause, { path });
    Object.setPrototypeOf(this, FileScanError.prototype);
  }
}
