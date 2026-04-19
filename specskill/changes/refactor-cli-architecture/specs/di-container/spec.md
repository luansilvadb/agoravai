# Spec: DI Container

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

Com o Repository Pattern implementado, precisamos de um mecanismo para injetar as dependências nos comandos sem criar acoplamento direto às implementações concretas.

## Objetivo

Implementar um container de injeção de dependências simples que permita:
- Registro de implementações
- Resolução de dependências por token
- Singleton por padrão
- Testes fáceis com mocks

## Container Implementation

```typescript
// src/cli/infrastructure/container.ts

export class Container {
  private static instance: Container;
  private registry: Map<string, unknown> = new Map();
  private singletons: Map<string, unknown> = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  static reset(): void {
    Container.instance = new Container();
  }

  register<T>(token: string, factory: () => T, singleton = true): void {
    this.registry.set(token, { factory, singleton });
  }

  resolve<T>(token: string): T {
    // Check singleton cache first
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const registration = this.registry.get(token) as 
      | { factory: () => T; singleton: boolean }
      | undefined;
    
    if (!registration) {
      throw new Error(`No implementation registered for token: ${token}`);
    }

    const instance = registration.factory();

    if (registration.singleton) {
      this.singletons.set(token, instance);
    }

    return instance;
  }

  // For testing: override a registration
  override<T>(token: string, instance: T): void {
    this.singletons.set(token, instance);
  }
}

// Tokens for dependency injection
export const TOKENS = {
  FILE_SYSTEM: 'FileSystem',
  CHANGE_REPOSITORY: 'ChangeRepository',
  GLOBAL_CONFIG_REPOSITORY: 'GlobalConfigRepository',
  VALIDATOR: 'Validator',
  LOGGER: 'Logger'
} as const;
```

## Module Registration

```typescript
// src/cli/infrastructure/module.ts

import { Container, TOKENS } from './container.js';
import { NodeFileSystemAdapter } from './fs-adapter.js';
import { FsChangeRepository, FsGlobalConfigRepository } from './fs-repository.js';
import { ZodValidator } from './zod-validator.js';
import { ConsoleLogger } from './logger.js';

export function registerDefaults(): void {
  const container = Container.getInstance();

  // FileSystem - singleton
  container.register(TOKENS.FILE_SYSTEM, () => {
    return new NodeFileSystemAdapter();
  }, true);

  // Repositories - singleton with dependency injection
  container.register(TOKENS.CHANGE_REPOSITORY, () => {
    const fs = container.resolve(TOKENS.FILE_SYSTEM);
    return new FsChangeRepository(fs);
  }, true);

  container.register(TOKENS.GLOBAL_CONFIG_REPOSITORY, () => {
    const fs = container.resolve(TOKENS.FILE_SYSTEM);
    return new FsGlobalConfigRepository(fs);
  }, true);

  // Validator
  container.register(TOKENS.VALIDATOR, () => {
    return new ZodValidator();
  }, true);

  // Logger
  container.register(TOKENS.LOGGER, () => {
    return new ConsoleLogger();
  }, true);
}
```

## Usage in Commands

```typescript
// src/cli/commands/new-change.ts

import { Container, TOKENS } from '../infrastructure/container.js';
import type { ChangeRepository } from '../domain/repositories.js';

export async function newChangeCommand(
  name: string, 
  options: { schema?: string }
): Promise<void> {
  const container = Container.getInstance();
  const repo = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  // Check if exists
  if (await repo.exists(name)) {
    throw new Error(`Change '${name}' already exists`);
  }

  // Create change
  const change = {
    name,
    schema: options.schema || 'spec-driven',
    created: new Date(),
    path: `specskill/changes/${name}`
  };

  await repo.save(change);
  console.log(`Created change '${name}'`);
}
```

## Testing with Mocks

```typescript
// tests/cli/commands/new-change.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { Container, TOKENS } from '../../../src/cli/infrastructure/container.js';
import { MockChangeRepository } from '../../../src/cli/infrastructure/mock-repository.js';
import { newChangeCommand } from '../../../src/cli/commands/new-change.js';

describe('newChangeCommand', () => {
  let mockRepo: MockChangeRepository;

  beforeEach(() => {
    // Reset container and register mock
    Container.reset();
    mockRepo = new MockChangeRepository();
    Container.getInstance().override(TOKENS.CHANGE_REPOSITORY, mockRepo);
  });

  it('should create a new change', async () => {
    await newChangeCommand('test-change', { schema: 'spec-driven' });
    
    const change = await mockRepo.getChange('test-change');
    expect(change).not.toBeNull();
    expect(change?.name).toBe('test-change');
    expect(change?.schema).toBe('spec-driven');
  });

  it('should throw if change already exists', async () => {
    await mockRepo.save({
      name: 'existing',
      schema: 'spec-driven',
      created: new Date(),
      path: 'specskill/changes/existing'
    });

    await expect(
      newChangeCommand('existing', {})
    ).rejects.toThrow("Change 'existing' already exists");
  });
});
```

## Checklist de Implementação

- [ ] Criar `src/cli/infrastructure/container.ts` com classe Container
- [ ] Criar `src/cli/infrastructure/module.ts` com função `registerDefaults()`
- [ ] Atualizar `src/cli/index.ts` para chamar `registerDefaults()` na inicialização
- [ ] Refatorar comandos para usar `Container.resolve()`
- [ ] Criar testes com mocks usando `Container.override()`
