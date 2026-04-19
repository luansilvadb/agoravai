# Design: Refactor CLI Architecture

## Arquitetura

### Camadas

```
┌─────────────────────────────────────────┐
│           CLI Commands                │
│    (new, status, apply, archive...)   │
├─────────────────────────────────────────┤
│         Service Layer                 │
│    (ChangeService, Validation)        │
├─────────────────────────────────────────┤
│      Repository Interface             │
│  (ChangeRepository, FileSystemPort)   │
├─────────────────────────────────────────┤
│      Infrastructure (DI)              │
│  (FsChangeRepository, ZodValidator)     │
└─────────────────────────────────────────┘
```

### Repository Pattern

```typescript
// src/cli/domain/repositories.ts
interface ChangeRepository {
  exists(name: string): Promise<boolean>;
  getChange(name: string): Promise<Change | null>;
  save(change: Change): Promise<void>;
  list(): Promise<string[]>;
  archive(name: string, archiveId: string): Promise<void>;
}

interface FileSystemPort {
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, content: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  pathExists(path: string): boolean;
  listDirs(path: string): Promise<string[]>;
  moveDir(src: string, dest: string): Promise<void>;
}
```

### DI Container

```typescript
// src/cli/infrastructure/container.ts
class Container {
  private static instance: Container;
  private registry: Map<string, unknown> = new Map();
  
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
  
  register<T>(token: string, implementation: T): void {
    this.registry.set(token, implementation);
  }
  
  resolve<T>(token: string): T {
    const impl = this.registry.get(token);
    if (!impl) throw new Error(`No implementation for ${token}`);
    return impl as T;
  }
}

// Tokens
export const TOKENS = {
  CHANGE_REPOSITORY: 'ChangeRepository',
  FILE_SYSTEM: 'FileSystemPort',
  VALIDATOR: 'Validator',
  LOGGER: 'Logger'
} as const;
```

## Componentes

### 1. Constants Module

```typescript
// src/cli/constants.ts
export const PATHS = {
  CHANGES_DIR: 'specskill/changes',
  ARCHIVE_DIR: 'specskill/changes/archive',
  SPECS_DIR: 'specskill/specs',
  GLOBAL_CONFIG: 'specskill/.specskill.global.yaml',
  CHANGE_CONFIG: '.specskill.yaml',
  SPEC_FILENAME: 'spec.md'
} as const;

export const SCHEMAS = {
  SPEC_DRIVEN: 'spec-driven',
  MINIMAL: 'minimal'
} as const;

export const MESSAGES = {
  ERROR_CHANGE_NOT_FOUND: (name: string) => `Change '${name}' not found`,
  ERROR_CHANGE_EXISTS: (name: string) => `Change '${name}' already exists`,
  SUCCESS_CHANGE_CREATED: (name: string) => `Created change '${name}'`,
  SUCCESS_CHANGE_ARCHIVED: (name: string, id: string) => 
    `Archived change '${name}' to archive/${id}-${name}`
} as const;
```

### 2. Commander.js Setup

```typescript
// src/cli/index.ts
import { Command } from 'commander';

const program = new Command();

program
  .name('specskill')
  .description('Spec-driven change management CLI')
  .version('1.0.0');

program
  .command('new')
  .description('Create a new change')
  .argument('<name>', 'Change name')
  .option('-s, --schema <schema>', 'Schema type', 'spec-driven')
  .action(async (name, options) => {
    await newChangeCommand(name, options);
  });

program
  .command('status')
  .description('Show change status')
  .requiredOption('-c, --change <name>', 'Change name')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    await statusCommand(options);
  });
```

### 3. Zod Validation

```typescript
// src/cli/validation/schemas.ts
import { z } from 'zod';

export const ChangeConfigSchema = z.object({
  schema: z.enum(['spec-driven', 'minimal']),
  name: z.string().min(1),
  created: z.string().datetime()
});

export const GlobalConfigSchema = z.object({
  version: z.string(),
  lastArchiveId: z.number().int().nonnegative(),
  defaultSchema: z.enum(['spec-driven', 'minimal']),
  created: z.string().datetime()
});

export const ArtifactDependenciesSchema = z.record(
  z.array(z.string())
).refine(
  (deps) => !hasCycle(deps),
  { message: 'Circular dependency detected' }
);

function hasCycle(deps: Record<string, string[]>): boolean {
  // DFS cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);
    
    for (const neighbor of deps[node] || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }
    
    recursionStack.delete(node);
    return false;
  }
  
  for (const node of Object.keys(deps)) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  
  return false;
}
```

### 4. Parallel I/O

```typescript
// src/cli/utils/parallel-io.ts
export async function loadSpecsParallel(
  specsDir: string,
  fs: FileSystemPort
): Promise<SpecInfo[]> {
  const dirs = await fs.listDirs(specsDir);
  
  const specs = await Promise.all(
    dirs
      .filter(dir => dir !== 'spec.md')
      .map(async dir => {
        const specPath = join(specsDir, dir, 'spec.md');
        if (!fs.pathExists(specPath)) return null;
        
        const content = await fs.readFile(specPath);
        if (!content) return null;
        
        const nameMatch = content.match(/^# (.+)$/m);
        return {
          id: dir,
          name: nameMatch?.[1] ?? dir,
          path: specPath,
          content
        };
      })
  );
  
  return specs.filter((s): s is SpecInfo => s !== null);
}
```

## Fluxos

### 1. New Change (com DI)

```
Usuário: specskill new my-change
↓
Commander parse args
↓
newChangeCommand(name, options)
↓
Container.resolve(TOKENS.CHANGE_REPOSITORY)
↓
repository.exists(name)
↓
[Não existe] repository.save(newChange)
↓
Console.log(SUCCESS_CHANGE_CREATED)
```

### 2. Archive (com Dry-Run)

```
Usuário: specskill archive --change my-change --dry-run
↓
Commander parse args (dryRun = true)
↓
archiveCommand(options)
↓
repository.getChange(changeName)
↓
Se dryRun: mostrar preview, retornar
↓
Se !dryRun: repository.archive(name, id)
↓
Console.log(SUCCESS_CHANGE_ARCHIVED)
```

### 3. Status (com Parallel I/O)

```
Usuário: specskill status --change my-change
↓
statusCommand(options)
↓
repository.getChange(changeName)
↓
Parallel: Carregar todos os artefatos
↓
Verificar dependências (com cycle detection)
↓
Retornar status completo
```

## Decisões Técnicas

### 1. Commander.js vs Yargs
**Decisão**: Commander.js
**Motivo**: API mais limpa, tipagem TypeScript melhor, menor bundle size

### 2. Zod vs Joi/Yup
**Decisão**: Zod
**Motivo**: Zero dependencies, primeira classe TypeScript, tree-shakeable

### 3. Singleton Container vs Inversify
**Decisão**: Container próprio simples
**Motivo**: Evitar dependency externa para DI simples, controle total

### 4. Async vs Sync I/O
**Decisão**: Manter async, adicionar paralelização
**Motivo**: Node.js I/O bound, paralelização traz ganhos significativos

### 5. Constants vs Config Files
**Decisão**: Constants em código + config dinâmica
**Motivo**: Type safety, autocomplete, tree-shaking

### 6. Inglês vs Português
**Decisão**: Inglês para toda a CLI
**Motivo**: Padrão da indústria, consistência com nomes de arquivos/flags
