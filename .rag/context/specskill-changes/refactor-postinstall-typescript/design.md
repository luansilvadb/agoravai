## Context

O script `postinstall.js` atual é um script JavaScript procedural com alguma organização em classes, mas sem tipagem forte, dependências acopladas e sem clara separação de responsabilidades. Ele precisa evoluir para um módulo TypeScript maduro seguindo DDD e Arquitetura Hexagonal.

**Estado Atual:**
- Código JavaScript com private fields (#)
- Classes internas: ConsoleLogger, DomainError, FileSystemService, PostInstallService
- Lógica de cópia recursiva, logging básico, tratamento de erros simples
- Configuração via variáveis de ambiente

**Stack:** TypeScript, Node.js, Zod (validação), tsx (execução)

## Goals / Non-Goals

**Goals:**
- Arquitetura Hexagonal com Ports e Adapters claramente definidos
- Domain layer pura sem dependências externas
- Application layer orquestrando casos de uso
- Infrastructure layer com adapters concretos
- Tipagem completa (strict TypeScript)
- Injeção de dependências para testabilidade
- Configuração validada via schema

**Non-Goals:**
- Mudança de comportamento funcional (ainda copia os mesmos arquivos)
- Adicionar novas features ao postinstall
- Banco de dados ou persistência
- APIs HTTP
- UI/UX changes

## Decisions

### 1. Arquitetura Hexagonal (Ports & Adapters)
**Decisão:** Separar em 3 camadas claras
- **Domain:** Entities, Value Objects, Domain Errors, Repository Ports
- **Application:** Use Cases, Services, DTOs
- **Infrastructure:** Adapters concretos (FileSystem, Logger, Config)

**Rationale:** Permite testar a lógica de negócio sem depender de filesystem real, possibilita mocks fáceis.

### 2. Schema-Driven Configuration com Zod
**Decisão:** Validar toda configuração via Zod schemas
- `LogLevel` como enum zod
- `AppConfig` como schema validado
- Throw em caso de config inválida

**Rationale:** Fail-fast em startup, configuração tipada garantida.

### 3. Logger como Port (ILogger)
**Decisão:** Abstrair logging via interface `ILogger`
- Métodos: debug, info, warn, error
- Suporte a metadados tipados
- Adapter: ConsoleLogger

**Alternativas:** Pino/Winston (descartado - overkill para postinstall)

### 4. FileSystem como Port (IFileSystem)
**Decisão:** Abstrair operações de arquivo
- `exists(path): boolean`
- `mkdir(path, options): void`
- `readdir(path): string[]`
- `stat(path): Stats`
- `copyFile(src, dest): void`

**Rationale:** Permite mock completo para testes unitários.

### 5. Domain Errors Hierárquicos
**Decisão:** Estrutura de erros com código único
- `DomainError` (base)
- `FileCopyError` (extends DomainError, code: FILE_COPY_ERROR)
- `DirectoryCreationError` (extends DomainError, code: DIR_CREATE_ERROR)
- `ConfigValidationError` (novo, code: CONFIG_VALIDATION_ERROR)

### 6. Estrutura de Diretórios
```
scripts/postinstall/
├── domain/
│   ├── errors/
│   │   ├── DomainError.ts
│   │   ├── FileCopyError.ts
│   │   ├── DirectoryCreationError.ts
│   │   └── ConfigValidationError.ts
│   └── ports/
│       ├── ILogger.ts
│       └── IFileSystem.ts
├── application/
│   ├── dto/
│   │   ├── CopyTask.ts
│   │   └── CopyResult.ts
│   ├── services/
│   │   └── CopyService.ts
│   └── usecases/
│       └── ExecutePostInstall.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── ConsoleLogger.ts
│   │   └── NodeFileSystem.ts
│   └── config/
│       └── AppConfig.ts
├── index.ts
└── types.ts
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Complexidade excessiva para script simples | Mantter apenas abstrações necessárias; não adicionar ORM, DI container pesado |
| Break em instalação de pacote | Testes unitários completos; execução local antes de publicar |
| Overhead de TypeScript em CI | Usar tsx para execução direta sem compilação prévia |
| Quebra de compatibilidade com ESM/CJS | Manter module: NodeNext no tsconfig; usar .js extensions em imports |
| Logger acoplado ao console | Port permite trocar por FileLogger ou SilentLogger futuramente |
| FileSystem operações síncronas | Aceitável para postinstall; usar async seria over-engineering |

## Migration Plan

1. **Preparação:**
   - Criar estrutura de pastas `scripts/postinstall/`
   - Configurar `tsconfig.scripts.json` específico

2. **Implementação por camadas:**
   - Portas (ILogger, IFileSystem)
   - Domain Errors
   - DTOs
   - Adapters concretos
   - CopyService
   - ExecutePostInstall use case
   - Entry point (index.ts)

3. **Substituição:**
   - Atualizar `package.json` postinstall script
   - Remover `postinstall.js` antigo

4. **Rollback:**
   - Git revert para `postinstall.js` original
   - Reverter package.json

## Open Questions

- Usar tsx ou compilar para dist/ antes do publish?
- Adicionar logging silencioso (--silent flag)?

