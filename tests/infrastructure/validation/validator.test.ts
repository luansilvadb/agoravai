import { describe, it, expect } from 'vitest';
import { validate, assertValid, ValidationError } from '../../../src/infrastructure/validation/index.js';

describe('Input Validation', () => {
  const schema = {
    name: { type: 'string', required: true },
    age: { type: 'number', coerce: true, min: 0, max: 150 },
    email: { type: 'string', pattern: /^[^@]+@[^@]+$/ },
    role: { type: 'string', domain: ['user', 'admin', 'guest'] as const },
    active: { type: 'boolean', defaultValue: true },
  } as const;

  describe('Task 2.3: Campo obrigatório', () => {
    it('deve rejeitar campo obrigatório ausente', () => {
      const result = validate({}, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.field).toBe('name');
      expect(result.errors[0]!.code).toBe('required.missing');
    });

    it('deve aceitar campo opcional com default', () => {
      const result = validate({ name: 'John' }, schema);

      expect(result.valid).toBe(true);
      expect(result.value.active).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.field).toBe('active');
    });
  });

  describe('Task 2.4: Validação de tipo com coerce', () => {
    it('deve coercer string para número', () => {
      const result = validate({ name: 'John', age: '25' }, schema);

      expect(result.valid).toBe(true);
      expect(result.value.age).toBe(25);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ field: 'age', message: expect.stringContaining('coerced') })
      );
    });

    it('deve rejeitar número inválido sem coerce possível', () => {
      const noCoerceSchema = { value: { type: 'number', coerce: false } } as const;
      const result = validate({ value: 'not-a-number' }, noCoerceSchema);

      expect(result.valid).toBe(false);
      expect(result.errors[0]!.code).toBe('type.invalid');
    });

    it('deve coercer número para boolean', () => {
      const boolSchema = { flag: { type: 'boolean', coerce: true } } as const;
      const result = validate({ flag: 1 }, boolSchema);

      expect(result.valid).toBe(true);
      expect(result.value.flag).toBe(true);
    });
  });

  describe('Task 2.5: Validação de domínio', () => {
    it('deve validar range numérico', () => {
      const result = validate({ name: 'John', age: 200 }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors[0]!.code).toBe('domain.outOfRange');
      expect(result.errors[0]!.message).toContain('200');
    });

    it('deve validar pattern', () => {
      const result = validate({ name: 'John', email: 'invalid-email' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors[0]!.code).toBe('domain.patternMismatch');
    });

    it('deve validar domain enum', () => {
      const result = validate({ name: 'John', role: 'superuser' }, schema);

      expect(result.valid).toBe(false);
      expect(result.errors[0]!.code).toBe('domain.invalid');
    });
  });

  describe('assertValid', () => {
    it('deve retornar valor se válido', () => {
      const result = validate({ name: 'John' }, schema);
      const value = assertValid(result);

      expect(value.name).toBe('John');
    });

    it('deve lançar se inválido', () => {
      const result = validate({}, schema);

      expect(() => assertValid(result)).toThrow(ValidationError);
    });
  });
});
