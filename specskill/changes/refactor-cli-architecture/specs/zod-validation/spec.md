# Spec: Zod Validation

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

Arquivos `.specskill.yaml` e `.specskill.global.yaml` são criados lidos sem validação. Corrupção manual pode quebrar comandos subsequentes.

## Objetivo

Implementar validação de schemas usando Zod para garantir integridade de dados.

## Instalação

```bash
npm install zod
```

## Schemas

```typescript
// src/cli/validation/schemas.ts

import { z } from 'zod';
import { SCHEMAS } from '../constants.js';

/**
 * Schema for individual change configuration
 * File: .specskill.yaml
 */
export const ChangeConfigSchema = z.object({
  schema: z.enum([
    SCHEMAS.SPEC_DRIVEN as 'spec-driven',
    SCHEMAS.MINIMAL as 'minimal'
  ]),
  name: z.string().min(1, 'Name cannot be empty'),
  created: z.string().datetime('Invalid ISO datetime')
});

export type ChangeConfig = z.infer<typeof ChangeConfigSchema>;

/**
 * Schema for global configuration
 * File: .specskill.global.yaml
 */
export const GlobalConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver'),
  lastArchiveId: z.number().int().nonnegative(),
  defaultSchema: z.enum([
    SCHEMAS.SPEC_DRIVEN as 'spec-driven',
    SCHEMAS.MINIMAL as 'minimal'
  ]),
  created: z.string().datetime('Invalid ISO datetime')
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

/**
 * Schema for artifact dependencies
 * Validates no circular dependencies exist
 */
export const ArtifactDependenciesSchema = z.record(
  z.array(z.string())
).superRefine((deps, ctx) => {
  const cycle = detectCycle(deps);
  if (cycle) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Circular dependency detected: ${cycle.join(' -> ')}`,
      path: ['dependencies']
    });
  }
});

export type ArtifactDependencies = z.infer<typeof ArtifactDependenciesSchema>;

/**
 * Cycle detection using DFS
 */
function detectCycle(deps: Record<string, string[]>): string[] | null {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): string[] | null {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    for (const neighbor of deps[node] || []) {
      if (!visited.has(neighbor)) {
        const cycle = dfs(neighbor);
        if (cycle) return cycle;
      } else if (recursionStack.has(neighbor)) {
        // Found cycle - reconstruct path
        const cycleStart = path.indexOf(neighbor);
        return [...path.slice(cycleStart), neighbor];
      }
    }

    path.pop();
    recursionStack.delete(node);
    return null;
  }

  for (const node of Object.keys(deps)) {
    if (!visited.has(node)) {
      const cycle = dfs(node);
      if (cycle) return cycle;
    }
  }

  return null;
}
```

## Validator Class

```typescript
// src/cli/validation/validator.ts

import { z } from 'zod';
import type { ChangeConfig, GlobalConfig, ArtifactDependencies } from './schemas.js';
import { ChangeConfigSchema, GlobalConfigSchema, ArtifactDependenciesSchema } from './schemas.js';

export interface Validator {
  validateChangeConfig(data: unknown): ChangeConfig;
  validateGlobalConfig(data: unknown): GlobalConfig;
  validateDependencies(deps: unknown): ArtifactDependencies;
}

export class ZodValidator implements Validator {
  validateChangeConfig(data: unknown): ChangeConfig {
    return ChangeConfigSchema.parse(data);
  }

  validateGlobalConfig(data: unknown): GlobalConfig {
    return GlobalConfigSchema.parse(data);
  }

  validateDependencies(deps: unknown): ArtifactDependencies {
    return ArtifactDependenciesSchema.parse(deps);
  }

  /**
   * Safe validation that returns success/failure instead of throwing
   */
  safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.error.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        )
      };
    }
  }
}

/**
 * Parse YAML-like string to object
 * Simple parser for our use case (no complex YAML features needed)
 */
export function parseYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') continue;
    
    // Parse key: value
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    // Type inference
    if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    } else if (/^\d+$/.test(value)) {
      result[key] = parseInt(value, 10);
    } else if (/^\d+\.\d+$/.test(value)) {
      result[key] = parseFloat(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Serialize object to YAML-like string
 */
export function serializeYaml(data: Record<string, unknown>): string {
  const lines = ['# SpecSkill Configuration'];
  
  for (const [key, value] of Object.entries(data)) {
    lines.push(`${key}: ${value}`);
  }
  
  return lines.join('\n') + '\n';
}
```

## Usage in Repository

```typescript
// src/cli/infrastructure/fs-repository.ts

import { ZodValidator, parseYaml } from '../validation/validator.js';

export class FsChangeRepository implements ChangeRepository {
  constructor(
    private fs: FileSystemPort,
    private validator: ZodValidator
  ) {}

  async getChange(name: string): Promise<Change | null> {
    const configPath = join(PATHS.CHANGES_DIR, name, PATHS.CHANGE_CONFIG);
    const content = await this.fs.readFile(configPath);
    
    if (!content) return null;

    // Parse and validate
    const raw = parseYaml(content);
    
    try {
      const config = this.validator.validateChangeConfig(raw);
      
      return {
        name: config.name,
        schema: config.schema,
        created: new Date(config.created),
        path: join(PATHS.CHANGES_DIR, name)
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        throw new Error(`Invalid change config for '${name}':\n${issues.join('\n')}`);
      }
      throw error;
    }
  }

  async save(change: Change): Promise<void> {
    const config = {
      schema: change.schema,
      name: change.name,
      created: change.created.toISOString()
    };

    // Validate before saving
    this.validator.validateChangeConfig(config);

    const content = serializeYaml(config);
    await this.fs.writeFile(
      join(change.path, PATHS.CHANGE_CONFIG),
      content
    );
  }
}
```

## Integration with Commands

```typescript
// src/cli/commands/new-change.ts

import { Container, TOKENS } from '../infrastructure/container.js';
import type { Validator } from '../validation/validator.js';

export async function newChangeCommand(
  name: string,
  options: { schema?: string }
): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  const validator = container.resolve<Validator>(TOKENS.VALIDATOR);

  // Schema validation happens automatically in repo.save()
  // But we can pre-validate the schema name
  const schema = options.schema || DEFAULTS.SCHEMA;
  
  if (!Object.values(SCHEMAS).includes(schema as SchemaType)) {
    throw new Error(MESSAGES.ERROR_INVALID_SCHEMA(schema, Object.values(SCHEMAS)));
  }

  const change = {
    name,
    schema,
    created: new Date(),
    path: join(PATHS.CHANGES_DIR, name)
  };

  await repo.save(change);
  console.log(MESSAGES.SUCCESS_CHANGE_CREATED(name, change.path));
}
```

## Error Handling

```typescript
// src/cli/index.ts

import { z } from 'zod';

program
  .command('new <name>')
  .action(async (name, options) => {
    try {
      await newChangeCommand(name, options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:');
        for (const issue of error.errors) {
          console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        }
      } else {
        console.error('Error:', error instanceof Error ? error.message : error);
      }
      process.exit(1);
    }
  });
```

## Checklist de Implementação

- [ ] Instalar `zod`
- [ ] Criar `src/cli/validation/schemas.ts` com Zod schemas
- [ ] Criar `src/cli/validation/validator.ts` com classe ZodValidator
- [ ] Implementar `parseYaml()` e `serializeYaml()` helpers
- [ ] Implementar `detectCycle()` para dependências
- [ ] Atualizar `FsChangeRepository` para usar validação
- [ ] Atualizar `FsGlobalConfigRepository` para usar validação
- [ ] Adicionar tratamento especial para ZodError no CLI
- [ ] Criar testes para validação de schemas
- [ ] Criar testes para detecção de ciclos
