import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vectorizer } from '../../../src/infrastructure/ml/Vectorizer.js';
import { ModelLoadError } from '../../../src/domain/errors/ModelLoadError.js';
import { VectorizationError } from '../../../src/domain/errors/VectorizationError.js';
import type { IConfig } from '../../../src/domain/interfaces/IConfig.js';

const mockPipeline = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    mockExtractor: true,
  })
);

const mockCosSim = vi.hoisted(() => vi.fn());

vi.mock('@xenova/transformers', () => ({
  pipeline: mockPipeline,
  cos_sim: mockCosSim,
}));

describe('Vectorizer', () => {
  const mockConfig: IConfig = {
    modelName: 'test-model',
    skillsDir: '.rag/context',
    outputFile: '.rag/research/skills.md',
    similarityThreshold: 0.3,
    topKResults: 3,
    logLevel: 'info',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar pipeline na primeira chamada', async () => {
    const mockExtractor = vi.fn().mockResolvedValue({
      data: new Float32Array([1, 2, 3]),
    });
    mockPipeline.mockResolvedValueOnce(mockExtractor);

    const vectorizer = new Vectorizer(mockConfig);
    await vectorizer.vectorize('test text');

    expect(mockPipeline).toHaveBeenCalledWith('feature-extraction', 'test-model', {
      quantized: true,
    });
  });

  it('deve retornar Float32Array da vetorização', async () => {
    const expectedVector = new Float32Array([0.1, 0.2, 0.3]);
    const mockExtractor = vi.fn().mockResolvedValue({
      data: expectedVector,
    });
    mockPipeline.mockResolvedValueOnce(mockExtractor);

    const vectorizer = new Vectorizer(mockConfig);
    const result = await vectorizer.vectorize('test text');

    expect(result).toBeInstanceOf(Float32Array);
    expect(result).toEqual(expectedVector);
  });

  it('deve lançar ModelLoadError quando pipeline falha', async () => {
    mockPipeline.mockRejectedValueOnce(new Error('network error'));

    const vectorizer = new Vectorizer(mockConfig);

    await expect(vectorizer.vectorize('test')).rejects.toThrow(ModelLoadError);
  });

  it('deve lançar VectorizationError quando vetorização falha', async () => {
    const mockExtractor = vi.fn().mockRejectedValue(new Error('processing error'));
    mockPipeline.mockResolvedValueOnce(mockExtractor);

    const vectorizer = new Vectorizer(mockConfig);

    await expect(vectorizer.vectorize('test')).rejects.toThrow(VectorizationError);
  });

  it('deve reutilizar extractor após inicialização', async () => {
    const mockExtractor = vi.fn().mockResolvedValue({
      data: new Float32Array([1, 2, 3]),
    });
    mockPipeline.mockResolvedValueOnce(mockExtractor);

    const vectorizer = new Vectorizer(mockConfig);
    await vectorizer.vectorize('first');
    await vectorizer.vectorize('second');

    expect(mockPipeline).toHaveBeenCalledTimes(1);
    expect(mockExtractor).toHaveBeenCalledTimes(2);
  });
});
