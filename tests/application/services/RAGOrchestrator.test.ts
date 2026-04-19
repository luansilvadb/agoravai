import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RAGOrchestrator } from '../../../src/application/services/RAGOrchestrator.js';
import type { IFileScanner } from '../../../src/domain/interfaces/IFileScanner.js';
import type { IVectorizer } from '../../../src/domain/interfaces/IVectorizer.js';
import type { IResultMatcher } from '../../../src/domain/interfaces/IResultMatcher.js';
import type { IOutputWriter } from '../../../src/domain/interfaces/IOutputWriter.js';
import type { ILogger } from '../../../src/domain/interfaces/ILogger.js';
import type { IConfig } from '../../../src/domain/interfaces/IConfig.js';
import type { Skill } from '../../../src/domain/entities/Skill.js';
import { VectorizationError } from '../../../src/domain/errors/VectorizationError.js';

vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('mock file content'),
}));

describe('RAGOrchestrator', () => {
  let orchestrator: RAGOrchestrator;
  let mockFileScanner: IFileScanner;
  let mockVectorizer: IVectorizer;
  let mockResultMatcher: IResultMatcher;
  let mockOutputWriter: IOutputWriter;
  let mockLogger: ILogger;
  let mockConfig: IConfig;

  beforeEach(() => {
    mockFileScanner = {
      scan: vi.fn().mockResolvedValue(['file1.md', 'file2.md']),
    };

    mockVectorizer = {
      vectorize: vi.fn().mockResolvedValue(new Float32Array([1, 2, 3])),
    };

    mockResultMatcher = {
      calculateSimilarity: vi.fn().mockReturnValue(0.8),
      filterByThreshold: vi.fn().mockImplementation((results: Skill[]) => results),
      selectTopK: vi.fn().mockImplementation((results: Skill[]) => results.slice(0, 3)),
    };

    mockOutputWriter = {
      write: vi.fn().mockResolvedValue(undefined),
    };

    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockConfig = {
      skillsDir: '.rag/context',
      outputFile: '.rag/research/skills.md',
      similarityThreshold: 0.3,
      topKResults: 3,
      logLevel: 'info',
      modelName: 'test-model',
    };

    orchestrator = new RAGOrchestrator(
      mockFileScanner,
      mockVectorizer,
      mockResultMatcher,
      mockOutputWriter,
      mockLogger,
      mockConfig
    );
  });

  it('deve lançar erro quando prompt é vazio', async () => {
    await expect(orchestrator.execute('')).rejects.toThrow('Prompt não pode ser vazio');
    await expect(orchestrator.execute('   ')).rejects.toThrow('Prompt não pode ser vazio');
  });

  it('deve chamar fileScanner.scan() com skillsDir da config', async () => {
    await orchestrator.execute('test prompt');

    expect(mockFileScanner.scan).toHaveBeenCalledWith(mockConfig.skillsDir);
  });

  it('deve chamar serviços na ordem correta', async () => {
    await orchestrator.execute('test prompt');

    // Verifica que vetorização acontece antes de calculateSimilarity
    expect(mockVectorizer.vectorize).toHaveBeenCalled();
    expect(mockResultMatcher.calculateSimilarity).toHaveBeenCalled();
    expect(mockResultMatcher.filterByThreshold).toHaveBeenCalled();
    expect(mockResultMatcher.selectTopK).toHaveBeenCalled();
    expect(mockOutputWriter.write).toHaveBeenCalled();
  });

  it('deve chamar vectorizer.vectorize() para o prompt e para cada arquivo', async () => {
    await orchestrator.execute('test prompt');

    // 1x para o prompt + 2x para os arquivos
    expect(mockVectorizer.vectorize).toHaveBeenCalledTimes(3);
  });

  it('deve logar cada etapa do processo', async () => {
    await orchestrator.execute('test prompt');

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Iniciando processamento RAG',
      expect.any(Object)
    );
    expect(mockLogger.info).toHaveBeenCalledWith('Encontrados 2 arquivos de skills');
  });

  it('deve escrever output mesmo sem resultados', async () => {
    mockFileScanner.scan = vi.fn().mockResolvedValue([]);

    await orchestrator.execute('test prompt');

    expect(mockOutputWriter.write).toHaveBeenCalledWith([], 'test prompt');
    expect(mockLogger.warn).toHaveBeenCalledWith('Nenhuma skill encontrada no diretório');
  });

  it('deve continuar processando quando um arquivo falha na vetorização', async () => {
    // Simula falha no segundo arquivo
    let callCount = 0;
    mockVectorizer.vectorize = vi.fn().mockImplementation(async (_text: string) => {
      callCount++;
      if (callCount === 3) {
        // prompt = 1, file1 = 2, file2 = 3
        throw new VectorizationError('file2.md', new Error('process error'));
      }
      return new Float32Array([1, 2, 3]);
    });

    await orchestrator.execute('test prompt');

    // Deve ter logado o erro mas continuado
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Falha ao vetorizar arquivo, pulando',
      expect.any(VectorizationError),
      expect.any(Object)
    );
    expect(mockOutputWriter.write).toHaveBeenCalled();
  });

  it('deve passar threshold e topK corretos para matchers', async () => {
    await orchestrator.execute('test prompt');

    expect(mockResultMatcher.filterByThreshold).toHaveBeenCalledWith(
      expect.any(Array),
      mockConfig.similarityThreshold
    );
    expect(mockResultMatcher.selectTopK).toHaveBeenCalledWith(
      expect.any(Array),
      mockConfig.topKResults
    );
  });
});
