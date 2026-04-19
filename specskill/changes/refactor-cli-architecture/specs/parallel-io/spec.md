# Spec: Parallel I/O

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

A leitura de specs granulares em `apply.ts` é sequencial, aumentando linearmente com o número de specs.

## Objetivo

Paralelizar operações I/O usando `Promise.all()` para melhorar performance.

## Before (Sequencial)

```typescript
// src/cli/commands/apply.ts (ANTES)

async function loadGranularSpecs(changePath: string): Promise<SpecInfo[]> {
  const specsDir = join(changePath, 'specs');
  if (!pathExists(specsDir)) {
    return [];
  }

  const specs: SpecInfo[] = [];
  const dirs = await listDirs(specsDir);

  for (const dir of dirs) {  // ← Sequencial
    if (dir === 'spec.md') continue;

    const specPath = join(specsDir, dir, 'spec.md');
    if (pathExists(specPath)) {
      const content = await readFile(specPath);  // ← Espera cada leitura
      const nameMatch = content?.match(/^# (.+)$/m);
      specs.push({
        id: dir,
        name: nameMatch?.[1] ?? dir,
        path: specPath,
        content: content || ''
      });
    }
  }

  return specs;
}
```

## After (Paralelo)

```typescript
// src/cli/utils/parallel-io.ts

export interface SpecInfo {
  id: string;
  name: string;
  path: string;
  content: string;
}

/**
 * Load specs in parallel
 * Time complexity: O(max_read_time) instead of O(sum_read_times)
 */
export async function loadSpecsParallel(
  specsDir: string,
  fs: FileSystemPort
): Promise<SpecInfo[]> {
  if (!fs.pathExists(specsDir)) {
    return [];
  }

  const dirs = await fs.listDirs(specsDir);
  
  const specPromises = dirs
    .filter(dir => dir !== 'spec.md')
    .map(async dir => {
      const specPath = join(specsDir, dir, 'spec.md');
      
      if (!fs.pathExists(specPath)) {
        return null;
      }

      const content = await fs.readFile(specPath);
      if (!content) {
        return null;
      }

      const nameMatch = content.match(/^# (.+)$/m);
      return {
        id: dir,
        name: nameMatch?.[1] ?? dir,
        path: specPath,
        content
      };
    });

  const specs = await Promise.all(specPromises);
  return specs.filter((s): s is SpecInfo => s !== null);
}

/**
 * Batch file reading with concurrency limit
 * Prevents EMFILE (too many open files) errors
 */
export async function batchReadFiles(
  paths: string[],
  fs: FileSystemPort,
  concurrency = 10
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  // Process in batches
  for (let i = 0; i < paths.length; i += concurrency) {
    const batch = paths.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async path => {
      const content = await fs.readFile(path);
      return { path, content };
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const { path, content } of batchResults) {
      results.set(path, content);
    }
  }
  
  return results;
}

/**
 * Parallel artifact loading for status command
 */
export async function loadArtifactsParallel(
  changePath: string,
  artifacts: string[],
  fs: FileSystemPort
): Promise<Map<string, { exists: boolean; content?: string }>> {
  const results = new Map<string, { exists: boolean; content?: string }>();
  
  const promises = artifacts.map(async artifact => {
    const artifactPath = artifact === 'specs'
      ? join(changePath, 'specs', 'spec.md')
      : join(changePath, `${artifact}.md`);
    
    const exists = fs.pathExists(artifactPath);
    
    if (exists) {
      const content = await fs.readFile(artifactPath);
      results.set(artifact, { exists: true, content: content || undefined });
    } else {
      results.set(artifact, { exists: false });
    }
  });
  
  await Promise.all(promises);
  return results;
}
```

## Usage in Commands

```typescript
// src/cli/commands/apply.ts (DEPOIS)

import { loadSpecsParallel } from '../utils/parallel-io.js';

export async function applyCommand(options: ApplyOptions): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  const fs = container.resolve<FileSystemPort>(TOKENS.FILE_SYSTEM);
  
  const change = await repo.getChange(options.change);
  if (!change) {
    throw new Error(MESSAGES.ERROR_CHANGE_NOT_FOUND(options.change));
  }

  // Load specs in parallel
  const specsDir = join(change.path, PATHS.GRANULAR_SPECS_DIR);
  const granularSpecs = await loadSpecsParallel(specsDir, fs);

  // Filter if specific spec requested
  const targetSpecs = options.spec
    ? granularSpecs.filter(s => 
        s.id === options.spec || 
        s.name.toLowerCase().includes(options.spec.toLowerCase())
      )
    : granularSpecs;

  // Rest of command...
}
```

```typescript
// src/cli/commands/status.ts (DEPOIS)

import { loadArtifactsParallel } from '../utils/parallel-io.js';
import { SCHEMA_DEFINITIONS } from '../constants.js';

export async function statusCommand(options: StatusOptions): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  const fs = container.resolve<FileSystemPort>(TOKENS.FILE_SYSTEM);
  
  const change = await repo.getChange(options.change);
  if (!change) {
    throw new Error(MESSAGES.ERROR_CHANGE_NOT_FOUND(options.change));
  }

  const schema = SCHEMA_DEFINITIONS[change.schema as keyof typeof SCHEMA_DEFINITIONS];
  
  // Load all artifacts in parallel
  const artifactStatus = await loadArtifactsParallel(
    change.path,
    schema.artifacts as string[],
    fs
  );

  // Build status output...
  const artifacts: ArtifactStatus[] = [];
  for (const artifact of schema.artifacts) {
    const status = artifactStatus.get(artifact)!;
    artifacts.push({
      name: artifact,
      status: status.exists ? 'done' : 'pending',
      path: status.exists ? join(change.path, `${artifact}.md`) : undefined
    });
  }
}
```

## Performance Comparison

```typescript
// tests/cli/utils/parallel-io.perf.test.ts

import { describe, it } from 'vitest';
import { loadSpecsParallel } from '../../../src/cli/utils/parallel-io.js';
import { MockFileSystem } from '../../../src/cli/infrastructure/mock-repository.js';

describe('Parallel I/O Performance', () => {
  it('should load 50 specs faster in parallel', async () => {
    const fs = new MockFileSystem();
    
    // Create 50 mock specs
    for (let i = 0; i < 50; i++) {
      await fs.writeFile(`specs/spec-${i}/spec.md`, `# Spec ${i}`);
    }

    // Simulate slow reads
    const slowFs = {
      ...fs,
      readFile: async (path: string) => {
        await new Promise(r => setTimeout(r, 10)); // 10ms delay
        return fs.readFile(path);
      },
      pathExists: (path: string) => fs.pathExists(path)
    };

    const start = Date.now();
    const specs = await loadSpecsParallel('specs', slowFs);
    const duration = Date.now() - start;

    // Sequential would take ~500ms (50 * 10ms)
    // Parallel should take ~10-20ms (depends on concurrency)
    expect(duration).toBeLessThan(100);
    expect(specs).toHaveLength(50);
  });
});
```

## Checklist de Implementação

- [ ] Criar `src/cli/utils/parallel-io.ts` com funções paralelas
- [ ] Implementar `loadSpecsParallel()` para specs granulares
- [ ] Implementar `batchReadFiles()` com limite de concorrência
- [ ] Implementar `loadArtifactsParallel()` para artefatos
- [ ] Atualizar `apply.ts` para usar `loadSpecsParallel()`
- [ ] Atualizar `status.ts` para usar `loadArtifactsParallel()`
[ ] Criar testes de performance comparando sequencial vs paralelo
- [ ] Documentar melhorias de performance esperadas
