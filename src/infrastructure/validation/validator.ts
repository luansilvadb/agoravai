import { ValidationError, ValidationWarning, type ValidationResult, type FieldSchema, type Schema } from './types.js';

function coerceValue(value: unknown, type: FieldSchema<unknown>['type'], coerce: boolean): unknown {
  if (!coerce || value === undefined || value === null) {
    return value;
  }

  switch (type) {
    case 'string':
      if (typeof value === 'number') return String(value);
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      return value;

    case 'number':
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (!isNaN(parsed)) return parsed;
      }
      if (typeof value === 'boolean') return value ? 1 : 0;
      return value;

    case 'boolean':
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
      }
      if (typeof value === 'number') return value !== 0;
      return value;

    case 'date':
      if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      return value;

    default:
      return value;
  }
}

function validateType(value: unknown, type: FieldSchema<unknown>['type'], field: string, coerce: boolean): ValidationResult<unknown> {
  const coerced = coerceValue(value, type, coerce);
  const warnings: ValidationWarning[] = [];

  if (coerced !== value && coerce) {
    warnings.push({
      field,
      message: `Value coerced from ${typeof value} to ${type}`,
      correction: coerced,
    });
  }

  const valueToCheck = coerced ?? value;

  switch (type) {
    case 'string':
      if (typeof valueToCheck !== 'string') {
        return {
          valid: false,
          value: valueToCheck,
          warnings,
          errors: [new ValidationError(field, 'type.invalid', `Expected string, received ${typeof valueToCheck}`, value, 'string')],
        };
      }
      break;

    case 'number':
      if (typeof valueToCheck !== 'number' || isNaN(valueToCheck)) {
        return {
          valid: false,
          value: valueToCheck,
          warnings,
          errors: [new ValidationError(field, 'type.invalid', `Expected number, received ${typeof valueToCheck}`, value, 'number')],
        };
      }
      break;

    case 'boolean':
      if (typeof valueToCheck !== 'boolean') {
        return {
          valid: false,
          value: valueToCheck,
          warnings,
          errors: [new ValidationError(field, 'type.invalid', `Expected boolean, received ${typeof valueToCheck}`, value, 'boolean')],
        };
      }
      break;

    case 'date':
      if (!(valueToCheck instanceof Date) || isNaN(valueToCheck.getTime())) {
        return {
          valid: false,
          value: valueToCheck,
          warnings,
          errors: [new ValidationError(field, 'type.invalid', `Expected valid Date, received ${typeof valueToCheck}`, value, 'Date')],
        };
      }
      break;

    case 'array':
      if (!Array.isArray(valueToCheck)) {
        return {
          valid: false,
          value: valueToCheck,
          warnings,
          errors: [new ValidationError(field, 'type.invalid', `Expected array, received ${typeof valueToCheck}`, value, 'Array')],
        };
      }
      break;

    case 'object':
      if (typeof valueToCheck !== 'object' || valueToCheck === null || Array.isArray(valueToCheck)) {
        return {
          valid: false,
          value: valueToCheck,
          warnings,
          errors: [new ValidationError(field, 'type.invalid', `Expected object, received ${typeof valueToCheck}`, value, 'Object')],
        };
      }
      break;
  }

  return { valid: true, value: valueToCheck, warnings, errors: [] };
}

function validateDomain<T>(value: T, field: string, schema: FieldSchema<T>): ValidationResult<T> {
  const warnings: ValidationWarning[] = [];

  if (schema.min !== undefined && typeof value === 'number' && value < schema.min) {
    return {
      valid: false,
      value,
      warnings,
      errors: [new ValidationError(field, 'domain.outOfRange', `Value ${value} is below minimum ${schema.min}`, value, `>= ${schema.min}`)],
    };
  }

  if (schema.max !== undefined && typeof value === 'number' && value > schema.max) {
    return {
      valid: false,
      value,
      warnings,
      errors: [new ValidationError(field, 'domain.outOfRange', `Value ${value} is above maximum ${schema.max}`, value, `<= ${schema.max}`)],
    };
  }

  if (schema.pattern !== undefined && typeof value === 'string' && !schema.pattern.test(value)) {
    return {
      valid: false,
      value,
      warnings,
      errors: [new ValidationError(field, 'domain.patternMismatch', `Value does not match pattern ${schema.pattern.source}`, value, schema.pattern.source)],
    };
  }

  if (schema.domain !== undefined && !schema.domain.includes(value)) {
    const domainStr = schema.domain.map(String).join(', ');
    return {
      valid: false,
      value,
      warnings,
      errors: [new ValidationError(field, 'domain.invalid', `Value must be one of: ${domainStr}`, value, domainStr)],
    };
  }

  if (schema.validate && !schema.validate(value)) {
    return {
      valid: false,
      value,
      warnings,
      errors: [new ValidationError(field, 'domain.custom', `Custom validation failed for ${field}`, value, 'custom constraint')],
    };
  }

  return { valid: true, value, warnings, errors: [] };
}

export function validate<T extends Record<string, unknown>>(
  input: unknown,
  schema: Schema<T>
): ValidationResult<Partial<T>> {
  if (typeof input !== 'object' || input === null) {
    return {
      valid: false,
      value: {},
      warnings: [],
      errors: [new ValidationError('input', 'input.invalid', 'Input must be an object', input, 'object')],
    };
  }

  const obj = input as Record<string, unknown>;
  const result: Partial<T> = {};
  const allWarnings: ValidationWarning[] = [];
  const allErrors: ValidationError[] = [];

  for (const [key, fieldSchema] of Object.entries(schema)) {
    const value = obj[key];
    const isUndefined = value === undefined;
    const isRequired = fieldSchema.required ?? true;

    if (isUndefined && isRequired && fieldSchema.defaultValue === undefined) {
      allErrors.push(new ValidationError(key, 'required.missing', `Required field "${key}" is missing`, undefined, 'defined value'));
      continue;
    }

    if (isUndefined && !isRequired) {
      if (fieldSchema.defaultValue !== undefined) {
        (result as Record<string, unknown>)[key] = fieldSchema.defaultValue;
        allWarnings.push({
          field: key,
          message: `Using default value for ${key}`,
          correction: fieldSchema.defaultValue,
        });
      }
      continue;
    }

    const typeResult = validateType(value, fieldSchema.type, key, fieldSchema.coerce ?? false);
    allWarnings.push(...typeResult.warnings);

    if (!typeResult.valid) {
      allErrors.push(...typeResult.errors);
      continue;
    }

    const domainResult = validateDomain(typeResult.value, key, fieldSchema as FieldSchema<unknown>);
    allWarnings.push(...domainResult.warnings);

    if (!domainResult.valid) {
      allErrors.push(...domainResult.errors);
      continue;
    }

    (result as Record<string, unknown>)[key] = domainResult.value;
  }

  return {
    valid: allErrors.length === 0,
    value: result,
    warnings: allWarnings,
    errors: allErrors,
  };
}

export function assertValid<T>(result: ValidationResult<T>): T {
  if (!result.valid) {
    const error = result.errors[0];
    throw error ?? new ValidationError('unknown', 'validation.failed', 'Validation failed');
  }
  return result.value as T;
}
