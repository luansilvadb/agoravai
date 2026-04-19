import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvConfig } from '../../../src/infrastructure/config/EnvConfig.js';
import { ConfigurationError } from '../../../src/domain/errors/ConfigurationError.js';

describe('EnvConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SKILLS_DIR;
    delete process.env.OUTPUT_FILE;
    delete process.env.SIMILARITY_THRESHOLD;
    delete process.env.TOP_K_RESULTS;
    delete process.env.LOG_LEVEL;
    delete process.env.MODEL_NAME;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('deve usar valores default quando env vars não definidas', () => {
    const config = new EnvConfig();

    expect(config.skillsDir).toBe('.rag/context');
    expect(config.outputFile).toBe('.rag/research/skills.md');
    expect(config.similarityThreshold).toBe(0.3);
    expect(config.topKResults).toBe(3);
    expect(config.logLevel).toBe('info');
    expect(config.modelName).toBe('Xenova/paraphrase-multilingual-MiniLM-L12-v2');
  });

  it('deve parsear valores de env vars', () => {
    process.env.SKILLS_DIR = '/custom/skills';
    process.env.OUTPUT_FILE = '/custom/output.md';
    process.env.SIMILARITY_THRESHOLD = '0.5';
    process.env.TOP_K_RESULTS = '5';
    process.env.LOG_LEVEL = 'debug';
    process.env.MODEL_NAME = 'custom-model';

    const config = new EnvConfig();

    expect(config.skillsDir).toBe('/custom/skills');
    expect(config.outputFile).toBe('/custom/output.md');
    expect(config.similarityThreshold).toBe(0.5);
    expect(config.topKResults).toBe(5);
    expect(config.logLevel).toBe('debug');
    expect(config.modelName).toBe('custom-model');
  });

  it('deve lançar ConfigurationError quando threshold fora de 0-1', () => {
    process.env.SIMILARITY_THRESHOLD = '1.5';

    expect(() => new EnvConfig()).toThrow(ConfigurationError);
    expect(() => new EnvConfig()).toThrow('Threshold deve estar entre 0 e 1');
  });

  it('deve lançar ConfigurationError quando TOP_K negativo', () => {
    process.env.TOP_K_RESULTS = '-1';

    expect(() => new EnvConfig()).toThrow(ConfigurationError);
    expect(() => new EnvConfig()).toThrow('TOP_K deve ser positivo');
  });

  it('deve lançar ConfigurationError quando TOP_K é zero', () => {
    process.env.TOP_K_RESULTS = '0';

    expect(() => new EnvConfig()).toThrow(ConfigurationError);
  });

  it('deve lançar ConfigurationError quando LOG_LEVEL inválido', () => {
    process.env.LOG_LEVEL = 'invalid';

    expect(() => new EnvConfig()).toThrow(ConfigurationError);
    expect(() => new EnvConfig()).toThrow('LOG_LEVEL deve ser um dos valores');
  });

  it('deve aceitar LOG_LEVEL em maiúsculas', () => {
    process.env.LOG_LEVEL = 'ERROR';

    const config = new EnvConfig();
    expect(config.logLevel).toBe('error');
  });
});
