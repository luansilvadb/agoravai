import { readFile } from 'fs/promises';
import type { IFileScanner } from '../../domain/interfaces/IFileScanner.js';
import type { IVectorizer } from '../../domain/interfaces/IVectorizer.js';
import type { IResultMatcher } from '../../domain/interfaces/IResultMatcher.js';
import type { IOutputWriter } from '../../domain/interfaces/IOutputWriter.js';
import type { ILogger } from '../../domain/interfaces/ILogger.js';
import type { IConfig } from '../../domain/interfaces/IConfig.js';
import type { Skill } from '../../domain/entities/Skill.js';
import { VectorizationError } from '../../domain/errors/VectorizationError.js';

export class RAGOrchestrator {
  constructor(
    private readonly fileScanner: IFileScanner,
    private readonly vectorizer: IVectorizer,
    private readonly resultMatcher: IResultMatcher,
    private readonly outputWriter: IOutputWriter,
    private readonly logger: ILogger,
    private readonly config: IConfig
  ) {}

  async execute(prompt: string): Promise<void> {
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt não pode ser vazio');
    }

    const trimmedPrompt = prompt.trim();
    this.logger.info('Iniciando processamento RAG', { prompt: trimmedPrompt });

    this.logger.debug('Escanear diretório de skills', {
      skillsDir: this.config.skillsDir,
    });
    const skillFiles = await this.fileScanner.scan(this.config.skillsDir);
    this.logger.info(`Encontrados ${skillFiles.length} arquivos de skills`);

    if (skillFiles.length === 0) {
      this.logger.warn('Nenhuma skill encontrada no diretório');
      await this.outputWriter.write([], trimmedPrompt);
      return;
    }

    this.logger.debug('Vetorizando prompt');
    const promptVector = await this.vectorizer.vectorize(trimmedPrompt);
    this.logger.debug('Prompt vetorizado');

    const results: Skill[] = [];

    for (const filePath of skillFiles) {
      try {
        this.logger.debug('Processando arquivo', { filePath });
        const content = await readFile(filePath, 'utf-8');
        const snippet = content.substring(0, 500);

        const fileVector = await this.vectorizer.vectorize(snippet);
        const similarity = this.resultMatcher.calculateSimilarity(promptVector, fileVector);

        this.logger.debug('Similaridade calculada', { filePath, similarity });

        results.push({
          filePath,
          content,
          similarity,
        });
      } catch (error) {
        if (error instanceof VectorizationError) {
          this.logger.error('Falha ao vetorizar arquivo, pulando', error, { filePath });
          continue;
        }
        throw error;
      }
    }

    this.logger.info(`Processados ${results.length} arquivos`);

    this.logger.debug('Filtrando por threshold', {
      threshold: this.config.similarityThreshold,
    });
    const filtered = this.resultMatcher.filterByThreshold(results, this.config.similarityThreshold);
    this.logger.info(`${filtered.length} resultados acima do threshold`);

    this.logger.debug('Selecionando top K', { k: this.config.topKResults });
    const topResults = this.resultMatcher.selectTopK(filtered, this.config.topKResults);
    this.logger.info(`${topResults.length} skills selecionadas`);

    for (const result of topResults) {
      this.logger.info('Skill conectada', {
        filePath: result.filePath,
        score: result.similarity?.toFixed(2),
      });
    }

    await this.outputWriter.write(topResults, trimmedPrompt);
    this.logger.info('Arquivo de saída gerado', {
      outputFile: this.config.outputFile,
    });
  }
}
