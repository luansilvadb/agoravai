# Agoravai - RAG Skills System

Sistema de Retrieval-Augmented Generation (RAG) para recuperação contextual de skills, implementado com Clean Architecture, TypeScript e testes unitários.

## 📋 Funcionalidades

- **Busca semântica**: Encontra skills relevantes baseado em similaridade de embeddings
- **Arquitetura Limpa**: Separação clara entre domain, application e infrastructure
- **TypeScript**: Tipagem completa com strict mode
- **Operações assíncronas**: Uso de `fs/promises` para I/O não-bloqueante
- **Tratamento robusto de erros**: Classes customizadas com mensagens amigáveis
- **Logging estruturado**: Níveis debug/info/warn/error
- **Testes unitários**: Cobertura abrangente com Vitest

## 🚀 Comandos

```bash
# Executar RAG com um prompt
npm run rag "criar tela de login"

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test
npm run test:watch
npm run test:coverage

# Lint e Formatação
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## 📁 Estrutura de Diretórios

```
src/
├── domain/              # Regras de negócio puras
│   ├── entities/        # Skill, Vector
│   ├── errors/          # DomainError, ModelLoadError, etc.
│   └── interfaces/      # IConfig, ILogger, IFileScanner, etc.
├── application/         # Casos de uso
│   └── services/        # RAGOrchestrator, ResultMatcher
└── infrastructure/      # Implementações concretas
    ├── config/          # EnvConfig
    ├── file-system/     # FileScanner
    ├── logging/         # ConsoleLogger
    ├── ml/              # Vectorizer (Xenova)
    └── output/          # MarkdownWriter

tests/
├── domain/              # Testes de domínio
├── infrastructure/      # Testes de infraestrutura
├── application/         # Testes de aplicação
└── integration/         # Testes de integração
```

## 🏗️ Arquitetura (Clean Architecture)

```
┌─────────────────────────────────────┐
│         Infrastructure              │
│  (FileSystem, ML, Console, FS)      │
├─────────────────────────────────────┤
│          Application                │
│  (RAGOrchestrator, ResultMatcher)   │
├─────────────────────────────────────┤
│            Domain                   │
│  (Entities, Interfaces, Errors)     │
└─────────────────────────────────────┘
```

**Princípios:**
- **Domain** não conhece Application ou Infrastructure
- **Application** conhece Domain mas não Infrastructure
- **Infrastructure** implementa interfaces do Domain
- **Injeção de Dependências**: Todas as dependências passadas via construtor

## 🖥️ CLI Architecture (Specskill)

Spec-driven change management CLI with layered architecture:

```
┌─────────────────────────────────────────┐
│           CLI Commands                  │
│  (new, status, apply, archive...)     │
├─────────────────────────────────────────┤
│         Validation Layer              │
│  (Zod schemas, Cycle detection)       │
├─────────────────────────────────────────┤
│      Repository Pattern                 │
│  (ChangeRepository, FileSystemPort)     │
├─────────────────────────────────────────┤
│      Infrastructure (DI Container)      │
│  (FsChangeRepository, ZodValidator)     │
└─────────────────────────────────────────┘
```

### CLI Commands

```bash
# Create a new change
npm run specskill:new my-change

# Check status
npm run specskill:status -- --change my-change

# Apply pending tasks
npm run specskill:apply -- --change my-change

# Archive completed change
npm run specskill:archive -- --change my-change

# List all changes
npm run specskill:list

# All commands support --dry-run for preview
npm run specskill:archive -- --change my-change --dry-run
```

### Key Components

- **Repository Pattern**: `ChangeRepository` and `GlobalConfigRepository` interfaces with file-system implementations
- **DI Container**: Simple singleton container with dependency injection and test overrides
- **Zod Validation**: Schema validation for all YAML configs with typed error messages
- **Parallel I/O**: Batch file operations with concurrency control
- **Cycle Detection**: DFS-based algorithm for dependency validation

## ⚙️ Configuração (Environment Variables)

Copie `.env.example` para `.env` e ajuste:

```bash
cp .env.example .env
```

| Variável | Descrição | Default |
|----------|-----------|---------|
| `SKILLS_DIR` | Diretório com arquivos `.md` | `.rag/context` |
| `OUTPUT_FILE` | Arquivo de saída gerado | `.rag/research/skills.md` |
| `SIMILARITY_THRESHOLD` | Threshold de similaridade (0-1) | `0.3` |
| `TOP_K_RESULTS` | Quantidade de resultados top | `3` |
| `LOG_LEVEL` | Nível de log: debug/info/warn/error | `info` |
| `MODEL_NAME` | Modelo Xenova para embeddings | `Xenova/paraphrase-multilingual-MiniLM-L12-v2` |

### Adicionar novas env vars

1. Adicione em `.env.example`
2. Adicione interface `IConfig` em `src/domain/interfaces/IConfig.ts`
3. Implemente parse em `src/infrastructure/config/EnvConfig.ts`
4. Adicione validação se necessário
5. Adicione teste em `tests/infrastructure/config/EnvConfig.test.ts`

## 🧪 Testes e Coverage

```bash
# Rodar todos os testes
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Cobertura atual:** 88.6% statements, 90.9% functions, 88.6% lines

O relatório HTML é gerado em `coverage/index.html`.

**Estrutura de testes:**
- **Unitários**: Cada serviço testado isoladamente com mocks
- **Integração**: Fluxo completo com diretório temporário real
- **Threshold**: Mínimo 80% de cobertura

## 🔧 Tecnologias

- **TypeScript 5.x** com strict mode
- **Vitest** para testes
- **ESLint 9.x** com flat config
- **Prettier** para formatação
- **Xenova Transformers** para embeddings
- **tsx** para execução TypeScript

## 📝 Licença

ISC
