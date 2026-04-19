import { describe, it, expect } from 'vitest';
import {
  ChangeConfigSchema,
  GlobalConfigSchema,
  ChangeNameSchema,
  validateChangeName,
  parseYaml,
  getValidationErrors,
  validateNoCycles,
} from '../../../src/cli/validation/schemas.js';

describe('Validation Schemas', () => {
  describe('ChangeConfigSchema', () => {
    it('should validate valid change config', () => {
      const valid = {
        name: 'test-change',
        schema: 'spec-driven' as const,
        created: '2024-01-15T10:30:00Z',
        artifacts: ['proposal', 'design'],
      };

      const result = ChangeConfigSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid schema type', () => {
      const invalid = {
        name: 'test-change',
        schema: 'invalid-schema',
        created: '2024-01-15T10:30:00Z',
      };

      const result = ChangeConfigSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalid = {
        name: '',
        schema: 'spec-driven' as const,
        created: '2024-01-15T10:30:00Z',
      };

      const result = ChangeConfigSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept optional artifacts', () => {
      const valid = {
        name: 'test-change',
        schema: 'spec-driven' as const,
        created: '2024-01-15T10:30:00Z',
      };

      const result = ChangeConfigSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('GlobalConfigSchema', () => {
    it('should validate valid global config', () => {
      const valid = {
        version: '1.0.0',
        lastArchiveId: 5,
        defaultSchema: 'spec-driven' as const,
        created: '2024-01-15T10:30:00Z',
      };

      const result = GlobalConfigSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject negative lastArchiveId', () => {
      const invalid = {
        version: '1.0.0',
        lastArchiveId: -1,
        defaultSchema: 'spec-driven' as const,
        created: '2024-01-15T10:30:00Z',
      };

      const result = GlobalConfigSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('ChangeNameSchema', () => {
    it('should validate valid change names', () => {
      expect(validateChangeName('my-change')).toBe(true);
      expect(validateChangeName('change123')).toBe(true);
      expect(validateChangeName('a')).toBe(true);
    });

    it('should reject invalid change names', () => {
      expect(validateChangeName('')).toBe(false);
      expect(validateChangeName('MyChange')).toBe(false); // uppercase
      expect(validateChangeName('my_change')).toBe(false); // underscore
      expect(validateChangeName('my change')).toBe(false); // space
    });

    it('should reject names exceeding max length', () => {
      expect(validateChangeName('a'.repeat(101))).toBe(false);
    });
  });

  describe('parseYaml', () => {
    it('should parse valid YAML', () => {
      // Note: js-yaml may parse ISO dates as Date objects, so we coerce to string
      const yamlContent = 'name: test-change\nschema: spec-driven\ncreated: "2024-01-15T10:30:00Z"';

      const result = parseYaml(yamlContent, ChangeConfigSchema);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('test-change');
    });

    it('should return null for invalid YAML', () => {
      const yaml = `invalid: yaml: content: ::`;

      const result = parseYaml(yaml, ChangeConfigSchema);
      expect(result).toBeNull();
    });

    it('should return null for schema validation failure', () => {
      const yaml = `name: ""
schema: spec-driven
created: 2024-01-15T10:30:00Z`;

      const result = parseYaml(yaml, ChangeConfigSchema);
      expect(result).toBeNull();
    });
  });

  describe('getValidationErrors', () => {
    it('should return empty array for valid data', () => {
      const valid = {
        name: 'test-change',
        schema: 'spec-driven' as const,
        created: '2024-01-15T10:30:00Z',
      };

      const errors = getValidationErrors(valid, ChangeConfigSchema);
      expect(errors).toEqual([]);
    });

    it('should return error messages for invalid data', () => {
      const invalid = {
        name: '',
        schema: 'invalid',
        created: 'not-a-date',
      };

      const errors = getValidationErrors(invalid, ChangeConfigSchema);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('name'))).toBe(true);
    });
  });

  describe('validateNoCycles', () => {
    it('should return valid for acyclic dependencies', () => {
      const deps = {
        a: ['b', 'c'],
        b: ['c'],
        c: [],
      };

      const result = validateNoCycles(deps);
      expect(result.valid).toBe(true);
    });

    it('should detect simple cycle', () => {
      const deps = {
        a: ['b'],
        b: ['a'],
      };

      const result = validateNoCycles(deps);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Circular');
    });

    it('should detect complex cycle', () => {
      const deps = {
        a: ['b'],
        b: ['c'],
        c: ['a'],
      };

      const result = validateNoCycles(deps);
      expect(result.valid).toBe(false);
    });

    it('should return error for invalid format', () => {
      const deps = { a: 'not-an-array' };

      const result = validateNoCycles(deps);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });
});
