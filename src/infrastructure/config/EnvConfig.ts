import type { IConfig } from '../../domain/interfaces/IConfig.js';
import { ConfigurationError } from '../../domain/errors/ConfigurationError.js';

export class EnvConfig implements IConfig {
  readonly skillsDir: string;
  readonly outputFile: string;
  readonly similarityThreshold: number;
  readonly topKResults: number;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly modelName: string;

  constructor() {
    this.skillsDir = this.getString('SKILLS_DIR', '.rag/context');
    this.outputFile = this.getString('OUTPUT_FILE', '.rag/research/skills.md');
    this.similarityThreshold = this.getFloat('SIMILARITY_THRESHOLD', 0.3);
    this.topKResults = this.getInt('TOP_K_RESULTS', 3);
    this.logLevel = this.getLogLevel('LOG_LEVEL', 'info');
    this.modelName = this.getString('MODEL_NAME', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

    this.validate();
  }

  private getString(key: string, defaultValue: string): string {
    const value = process.env[key];
    return value !== undefined && value !== '' ? value : defaultValue;
  }

  private getFloat(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) {
      throw new ConfigurationError(`Variável ${key} deve ser um número válido`);
    }
    return parsed;
  }

  private getInt(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new ConfigurationError(`Variável ${key} deve ser um número inteiro válido`);
    }
    return parsed;
  }

  private getLogLevel(
    key: string,
    defaultValue: 'debug' | 'info' | 'warn' | 'error'
  ): 'debug' | 'info' | 'warn' | 'error' {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(value.toLowerCase())) {
      throw new ConfigurationError(
        `Variável ${key} deve ser um dos valores: ${validLevels.join(', ')}`
      );
    }
    return value.toLowerCase() as 'debug' | 'info' | 'warn' | 'error';
  }

  private validate(): void {
    if (this.similarityThreshold < 0 || this.similarityThreshold > 1) {
      throw new ConfigurationError('Threshold deve estar entre 0 e 1', {
        threshold: this.similarityThreshold,
      });
    }

    if (this.topKResults <= 0) {
      throw new ConfigurationError('TOP_K deve ser positivo', {
        topK: this.topKResults,
      });
    }
  }
}
