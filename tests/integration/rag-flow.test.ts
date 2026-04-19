import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { EnvConfig } from '../../src/infrastructure/config/EnvConfig.js';
import { ConsoleLogger } from '../../src/infrastructure/logging/ConsoleLogger.js';
import { FileScanner } from '../../src/infrastructure/file-system/FileScanner.js';
import { Vectorizer } from '../../src/infrastructure/ml/Vectorizer.js';
import { MarkdownWriter } from '../../src/infrastructure/output/MarkdownWriter.js';
import { ResultMatcher, RAGOrchestrator } from '../../src/application/index.js';

describe('RAG Flow Integration', () => {
  let tempDir: string;
  let skillsDir: string;
  let outputFile: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'rag-integration-'));
    skillsDir = join(tempDir, 'skills');
    outputFile = join(tempDir, 'output', 'skills.md');

    mkdirSync(skillsDir, { recursive: true });
    mkdirSync(join(tempDir, 'output'), { recursive: true });

    // Cria arquivos de skills para teste
    writeFileSync(
      join(skillsDir, 'react.md'),
      '# React Skills\n\n- Use componentes funcionais\n- Hooks para estado'
    );
    writeFileSync(
      join(skillsDir, 'typescript.md'),
      '# TypeScript Skills\n\n- Tipagem estrita\n- Interfaces para contratos'
    );
    writeFileSync(
      join(skillsDir, 'css.md'),
      '# CSS Skills\n\n- Flexbox para layout\n- Grid para grids complexos'
    );

    // Cria subdiretório com mais skills
    const subDir = join(skillsDir, 'backend');
    mkdirSync(subDir);
    writeFileSync(join(subDir, 'api.md'), '# API Design\n\n- RESTful endpoints\n- JSON responses');
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('deve executar fluxo completo com diretório temporário real', async () => {
    process.env.SKILLS_DIR = skillsDir;
    process.env.OUTPUT_FILE = outputFile;
    process.env.SIMILARITY_THRESHOLD = '0.1'; // Threshold baixo para garantir matches
    process.env.TOP_K_RESULTS = '3';
    process.env.LOG_LEVEL = 'error';
    process.env.MODEL_NAME = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

    const config = new EnvConfig();
    const logger = new ConsoleLogger(config);
    const fileScanner = new FileScanner();
    const vectorizer = new Vectorizer(config);
    const resultMatcher = new ResultMatcher();
    const outputWriter = new MarkdownWriter(config.outputFile);

    const orchestrator = new RAGOrchestrator(
      fileScanner,
      vectorizer,
      resultMatcher,
      outputWriter,
      logger,
      config
    );

    await orchestrator.execute('criar componente React com TypeScript');

    // Verifica que o arquivo de saída foi criado
    const output = readFileSync(outputFile, 'utf-8');
    expect(output).toContain('CONTEXTO DE SKILLS INJETADAS PELO RAG');
    expect(output).toContain('RAG detectou');
  });

  it('deve gerar saída com formato compatível com versão original', async () => {
    process.env.SKILLS_DIR = skillsDir;
    process.env.OUTPUT_FILE = outputFile;
    process.env.SIMILARITY_THRESHOLD = '0.3';
    process.env.TOP_K_RESULTS = '2';
    process.env.LOG_LEVEL = 'error';

    const config = new EnvConfig();
    const logger = new ConsoleLogger(config);
    const fileScanner = new FileScanner();
    const vectorizer = new Vectorizer(config);
    const resultMatcher = new ResultMatcher();
    const outputWriter = new MarkdownWriter(config.outputFile);

    const orchestrator = new RAGOrchestrator(
      fileScanner,
      vectorizer,
      resultMatcher,
      outputWriter,
      logger,
      config
    );

    await orchestrator.execute('estilizar com CSS');

    const output = readFileSync(outputFile, 'utf-8');

    // Valida formato da saída
    expect(output.startsWith('# CONTEXTO DE SKILLS INJETADAS PELO RAG')).toBe(true);
    expect(output).toMatch(/## ORIGEM: .+\.md/);
    expect(output).toContain('---');
  });
});
