#!/usr/bin/env node

import { EnvConfig } from './infrastructure/config/EnvConfig.js';
import { ConsoleLogger } from './infrastructure/logging/ConsoleLogger.js';
import { FileScanner } from './infrastructure/file-system/FileScanner.js';
import { Vectorizer } from './infrastructure/ml/Vectorizer.js';
import { MarkdownWriter } from './infrastructure/output/MarkdownWriter.js';
import { ResultMatcher, RAGOrchestrator } from './application/index.js';
import { DomainError } from './domain/errors/DomainError.js';
import { ConfigurationError } from './domain/errors/ConfigurationError.js';
import { ModelLoadError } from './domain/errors/ModelLoadError.js';
import { FileScanError } from './domain/errors/FileScanError.js';
import { VectorizationError } from './domain/errors/VectorizationError.js';
import { OutputWriteError } from './domain/errors/OutputWriteError.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

function resolveSkillsDir(): string {
  // Se SKILLS_DIR está definido, usa ele
  if (process.env.SKILLS_DIR) {
    return process.env.SKILLS_DIR;
  }

  // Tenta encontrar .rag/context no diretório do pacote (quando instalado globalmente)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageSkillsDir = join(__dirname, '..', '.rag', 'context');

  if (existsSync(packageSkillsDir)) {
    return packageSkillsDir;
  }

  // Fallback: diretório atual
  return '.rag/context';
}

async function main(): Promise<void> {
  const prompt = process.argv.slice(2).join(' ');

  if (!prompt || prompt.trim() === '') {
    console.error('Erro: Forneça a intenção. Ex: npm run rag "criar tela de login"');
    process.exit(1);
  }

  let config: EnvConfig | undefined;
  let logger: ConsoleLogger | undefined;

  try {
    config = new EnvConfig();
    logger = new ConsoleLogger(config);

    // Override skillsDir para usar pacote instalado globalmente se necessário
    const skillsDir = resolveSkillsDir();
    if (skillsDir !== config.skillsDir) {
      logger.info('Usando diretório de skills do pacote', { skillsDir });
    }

    // Cria config com skillsDir resolvido
    const resolvedConfig = { ...config, skillsDir };

    // Substitui config pelo resolvedConfig nas chamadas abaixo
    const fileScanner = new FileScanner();
    const vectorizer = new Vectorizer(resolvedConfig);
    const resultMatcher = new ResultMatcher();
    const outputWriter = new MarkdownWriter(resolvedConfig.outputFile);

    const orchestrator = new RAGOrchestrator(
      fileScanner,
      vectorizer,
      resultMatcher,
      outputWriter,
      logger,
      resolvedConfig
    );

    await orchestrator.execute(prompt);

    console.log(`Arquivo ${resolvedConfig.outputFile} gerado com sucesso!`);
    process.exit(0);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(`Erro de configuração: ${error.message}`);
      process.exit(2);
    }

    if (error instanceof DomainError) {
      logger?.error('Erro no processamento', error);

      if (error instanceof ModelLoadError) {
        console.error(error.message);
      } else if (error instanceof FileScanError) {
        console.error(error.message);
      } else if (error instanceof VectorizationError) {
        console.error(error.message);
      } else if (error instanceof OutputWriteError) {
        console.error(error.message);
      } else {
        console.error(`Erro: ${error.message}`);
      }
    } else if (error instanceof Error) {
      logger?.error('Erro inesperado', error);
      console.error(`Erro inesperado: ${error.message}`);
    } else {
      console.error('Erro desconhecido:', error);
    }

    process.exit(2);
  }
}

void main();
