import { DomainError } from './DomainError.js';

export class DirectoryCreationError extends DomainError {
  public readonly code = 'DIR_CREATE_ERROR';

  constructor(
    public readonly path: string,
    cause?: unknown
  ) {
    super(`Failed to create directory at "${path}"`, cause);
  }
}
