export class ValidationError extends Error {
  public readonly field: string;
  public readonly code: string;
  public readonly received?: unknown;
  public readonly expected?: unknown;

  constructor(field: string, code: string, message: string, received?: unknown, expected?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
    this.received = received;
    this.expected = expected;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      field: this.field,
      code: this.code,
      message: this.message,
      received: this.received,
      expected: this.expected,
    };
  }
}

export interface ValidationWarning {
  field: string;
  message: string;
  correction?: unknown;
}

export interface ValidationResult<T> {
  valid: boolean;
  value: T;
  warnings: ValidationWarning[];
  errors: ValidationError[];
}

export type Validator<T> = (value: unknown, field: string) => ValidationResult<T>;

export interface FieldSchema<T> {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required?: boolean;
  defaultValue?: T;
  coerce?: boolean;
  validate?: (value: T) => boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  domain?: readonly T[];
}

export type Schema<T> = {
  [K in keyof T]: FieldSchema<T[K]>;
};
