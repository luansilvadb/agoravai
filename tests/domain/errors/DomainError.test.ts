import { describe, it, expect } from 'vitest';
import { DomainError } from '../../../src/domain/errors/DomainError.js';
import { ModelLoadError } from '../../../src/domain/errors/ModelLoadError.js';
import { FileScanError } from '../../../src/domain/errors/FileScanError.js';
import { VectorizationError } from '../../../src/domain/errors/VectorizationError.js';
import { ConfigurationError } from '../../../src/domain/errors/ConfigurationError.js';
import { OutputWriteError } from '../../../src/domain/errors/OutputWriteError.js';

describe('DomainError', () => {
  it('deve criar erro com message e cause', () => {
    const cause = new Error('cause original');
    const error = new (class TestError extends DomainError {})('mensagem', cause);

    expect(error.message).toBe('mensagem');
    expect(error.cause).toBe(cause);
    expect(error.name).toBe('TestError');
  });

  it('deve criar erro com context', () => {
    const context = { key: 'value' };
    const error = new (class TestError extends DomainError {})('mensagem', undefined, context);

    expect(error.context).toEqual(context);
  });
});

describe('ModelLoadError', () => {
  it('deve ter mensagem específica para usuário', () => {
    const error = new ModelLoadError();

    expect(error.message).toContain('Falha ao carregar modelo de embeddings');
    expect(error.name).toBe('ModelLoadError');
  });

  it('deve incluir cause e context quando fornecidos', () => {
    const cause = new Error('network error');
    const context = { modelName: 'test-model' };
    const error = new ModelLoadError(cause, context);

    expect(error.cause).toBe(cause);
    expect(error.context).toEqual(context);
  });
});

describe('FileScanError', () => {
  it('deve ter mensagem com path', () => {
    const error = new FileScanError('/test/path');

    expect(error.message).toContain('/test/path');
    expect(error.name).toBe('FileScanError');
  });

  it('deve incluir context com path', () => {
    const error = new FileScanError('/test/path');

    expect(error.context).toEqual({ path: '/test/path' });
  });
});

describe('VectorizationError', () => {
  it('deve ter mensagem com filePath', () => {
    const error = new VectorizationError('/test/file.md');

    expect(error.message).toContain('/test/file.md');
    expect(error.name).toBe('VectorizationError');
  });
});

describe('ConfigurationError', () => {
  it('deve ter mensagem fornecida', () => {
    const error = new ConfigurationError('config inválida');

    expect(error.message).toBe('config inválida');
    expect(error.name).toBe('ConfigurationError');
  });
});

describe('OutputWriteError', () => {
  it('deve ter mensagem com path', () => {
    const error = new OutputWriteError('/test/output.md');

    expect(error.message).toContain('/test/output.md');
    expect(error.name).toBe('OutputWriteError');
  });
});
