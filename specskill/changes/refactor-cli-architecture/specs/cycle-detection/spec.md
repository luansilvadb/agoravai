# Spec: Cycle Detection

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

O schema atual permite definir dependências circulares (ex: specs depende de tasks e tasks depende de specs). Isso pode causar loops infinitos ou comportamento indefinido.

## Objetivo

Implementar detecção de ciclos em dependências de artefatos usando DFS (Depth-First Search).

## Algoritmo

```typescript
// src/cli/utils/graph.ts

/**
 * Detects cycles in a directed graph using DFS
 * Returns the cycle path if found, null otherwise
 */
export function detectCycle(graph: Record<string, string[]>): string[] | null {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): string[] | null {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    // Visit all neighbors
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        const cycle = dfs(neighbor);
        if (cycle) return cycle;
      } else if (recursionStack.has(neighbor)) {
        // Found a back edge - cycle detected!
        const cycleStart = path.indexOf(neighbor);
        return [...path.slice(cycleStart), neighbor];
      }
    }

    // Backtrack
    path.pop();
    recursionStack.delete(node);
    return null;
  }

  // Check all nodes (graph may be disconnected)
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      const cycle = dfs(node);
      if (cycle) return cycle;
    }
  }

  return null;
}

/**
 * Gets the topological sort order of dependencies
 * Throws if cycle is detected
 */
export function topologicalSort(graph: Record<string, string[]>): string[] {
  const cycle = detectCycle(graph);
  if (cycle) {
    throw new Error(`Cannot sort: cycle detected - ${cycle.join(' -> ')}`);
  }

  const visited = new Set<string>();
  const result: string[] = [];

  function visit(node: string): void {
    if (visited.has(node)) return;
    
    visited.add(node);
    
    for (const neighbor of graph[node] || []) {
      visit(neighbor);
    }
    
    result.push(node);
  }

  for (const node of Object.keys(graph)) {
    visit(node);
  }

  return result.reverse();
}

/**
 * Gets artifacts that are ready to be generated
 * (all dependencies are satisfied)
 */
export function getReadyArtifacts(
  allArtifacts: string[],
  dependencies: Record<string, string[]>,
  completed: Set<string>
): string[] {
  return allArtifacts.filter(artifact => {
    // Already completed
    if (completed.has(artifact)) return false;
    
    // Check if all dependencies are completed
    const deps = dependencies[artifact] || [];
    return deps.every(dep => completed.has(dep));
  });
}
```

## Integration with Schema Validation

```typescript
// src/cli/validation/schemas.ts

import { z } from 'zod';
import { detectCycle } from '../utils/graph.js';

export const DependenciesSchema = z.record(z.array(z.string()))
  .superRefine((deps, ctx) => {
    const cycle = detectCycle(deps);
    if (cycle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Circular dependency: ${cycle.join(' -> ')}`,
      });
    }
  });
```

## Usage in Status Command

```typescript
// src/cli/commands/status.ts

import { detectCycle, getReadyArtifacts } from '../utils/graph.js';
import { SCHEMA_DEFINITIONS, SCHEMAS } from '../constants.js';

export async function statusCommand(options: StatusOptions): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  
  const change = await repo.getChange(options.change);
  if (!change) {
    throw new Error(MESSAGES.ERROR_CHANGE_NOT_FOUND(options.change));
  }

  const schema = SCHEMA_DEFINITIONS[change.schema as keyof typeof SCHEMA_DEFINITIONS];
  
  // Validate no cycles exist
  const cycle = detectCycle(schema.dependencies as Record<string, string[]>);
  if (cycle) {
    throw new Error(MESSAGES.ERROR_CIRCULAR_DEPENDENCY(cycle));
  }

  // Get current artifact statuses
  const completedArtifacts = new Set<string>();
  for (const artifact of schema.artifacts) {
    const exists = await repo.artifactExists(change.name, artifact);
    if (exists) completedArtifacts.add(artifact);
  }

  // Determine which artifacts are ready
  const readyArtifacts = getReadyArtifacts(
    schema.artifacts as string[],
    schema.dependencies as Record<string, string[]>,
    completedArtifacts
  );

  // Output status...
}
```

## Unit Tests

```typescript
// tests/cli/utils/graph.test.ts

import { describe, it, expect } from 'vitest';
import { detectCycle, topologicalSort, getReadyArtifacts } from '../../../src/cli/utils/graph.js';

describe('detectCycle', () => {
  it('should return null for acyclic graph', () => {
    const graph = {
      A: ['B', 'C'],
      B: ['D'],
      C: ['D'],
      D: []
    };
    expect(detectCycle(graph)).toBeNull();
  });

  it('should detect simple cycle', () => {
    const graph = {
      A: ['B'],
      B: ['A']
    };
    const cycle = detectCycle(graph);
    expect(cycle).toEqual(['A', 'B', 'A']);
  });

  it('should detect complex cycle', () => {
    const graph = {
      proposal: [],
      design: ['proposal'],
      specs: ['tasks'], // cycle!
      tasks: ['design', 'specs']
    };
    const cycle = detectCycle(graph);
    expect(cycle).toContain('specs');
    expect(cycle).toContain('tasks');
  });

  it('should handle empty graph', () => {
    expect(detectCycle({})).toBeNull();
  });

  it('should handle disconnected components', () => {
    const graph = {
      A: ['B'],
      B: [],
      C: ['D'],
      D: ['C'] // cycle in second component
    };
    const cycle = detectCycle(graph);
    expect(cycle).toEqual(['C', 'D', 'C']);
  });
});

describe('topologicalSort', () => {
  it('should sort dependencies correctly', () => {
    const graph = {
      tasks: ['design', 'specs'],
      design: ['proposal'],
      specs: ['proposal'],
      proposal: []
    };
    const sorted = topologicalSort(graph);
    
    // proposal must come before design and specs
    expect(sorted.indexOf('proposal')).toBeLessThan(sorted.indexOf('design'));
    expect(sorted.indexOf('proposal')).toBeLessThan(sorted.indexOf('specs'));
    
    // design and specs must come before tasks
    expect(sorted.indexOf('design')).toBeLessThan(sorted.indexOf('tasks'));
    expect(sorted.indexOf('specs')).toBeLessThan(sorted.indexOf('tasks'));
  });

  it('should throw on cycle', () => {
    const graph = {
      A: ['B'],
      B: ['A']
    };
    expect(() => topologicalSort(graph)).toThrow('cycle detected');
  });
});

describe('getReadyArtifacts', () => {
  it('should return artifacts with all deps satisfied', () => {
    const artifacts = ['proposal', 'design', 'specs', 'tasks'];
    const dependencies = {
      proposal: [],
      design: ['proposal'],
      specs: ['proposal'],
      tasks: ['design', 'specs']
    };
    const completed = new Set(['proposal']);
    
    const ready = getReadyArtifacts(artifacts, dependencies, completed);
    expect(ready).toEqual(['design', 'specs']);
  });

  it('should return empty when all completed', () => {
    const artifacts = ['proposal', 'design'];
    const dependencies = {
      proposal: [],
      design: ['proposal']
    };
    const completed = new Set(['proposal', 'design']);
    
    const ready = getReadyArtifacts(artifacts, dependencies, completed);
    expect(ready).toEqual([]);
  });
});
```

## Schema Definition Update

```typescript
// src/cli/constants.ts

export const SCHEMA_DEFINITIONS = {
  [SCHEMAS.SPEC_DRIVEN]: {
    artifacts: [ARTIFACTS.PROPOSAL, ARTIFACTS.DESIGN, ARTIFACTS.SPECS, ARTIFACTS.TASKS],
    dependencies: {
      [ARTIFACTS.PROPOSAL]: [],
      [ARTIFACTS.DESIGN]: [ARTIFACTS.PROPOSAL],
      [ARTIFACTS.SPECS]: [ARTIFACTS.PROPOSAL],
      [ARTIFACTS.TASKS]: [ARTIFACTS.DESIGN, ARTIFACTS.SPECS]
    }
  },
  [SCHEMAS.MINIMAL]: {
    artifacts: [ARTIFACTS.PROPOSAL, ARTIFACTS.TASKS],
    dependencies: {
      [ARTIFACTS.PROPOSAL]: [],
      [ARTIFACTS.TASKS]: [ARTIFACTS.PROPOSAL]
    }
  }
} as const;

// Type-safe getter that validates no cycles
export function getSchemaDefinition(schema: SchemaType) {
  const def = SCHEMA_DEFINITIONS[schema];
  const cycle = detectCycle(def.dependencies as Record<string, string[]>);
  if (cycle) {
    throw new Error(`Invalid schema definition: circular dependency ${cycle.join(' -> ')}`);
  }
  return def;
}
```

## Checklist de Implementação

- [ ] Criar `src/cli/utils/graph.ts` com `detectCycle()`
- [ ] Criar `topologicalSort()` para ordenação de dependências
- [ ] Criar `getReadyArtifacts()` para determinar artefatos prontos
- [ ] Integrar com schema validation no Zod
- [ ] Atualizar `status.ts` para validar ciclos antes de processar
- [ ] Criar testes unitários para todos os algoritmos
- [ ] Adicionar `getSchemaDefinition()` helper type-safe
