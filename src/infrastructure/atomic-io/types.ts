export interface OutputValidation {
  minSize?: number;
  magicBytes?: Buffer;
  validator?: (path: string) => { valid: boolean; errors?: string[] };
}

export interface OutputValidationResult {
  valid: boolean;
  checks: {
    sizeBytes?: number;
    magicBytesValid?: boolean;
    structureValid?: boolean;
  };
  errors: string[];
}

export class OutputInvalid extends Error {
  public readonly reason: string;
  public readonly details?: string[];

  constructor(reason: string, details?: string[]) {
    super(`Output validation failed: ${reason}`);
    this.name = 'OutputInvalid';
    this.reason = reason;
    this.details = details;
  }
}

export interface AtomicWriteResult {
  tempPath: string;
  finalPath: string;
  versioned: boolean;
  originalName?: string;
}
