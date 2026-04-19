import { DomainError } from './DomainError.js';

export class FileCopyError extends DomainError {
  public readonly code = 'FILE_COPY_ERROR';

  constructor(
    public readonly source: string,
    public readonly target: string,
    cause?: unknown
  ) {
    super(`Failed to copy file from "${source}" to "${target}"`, cause);
  }
}
