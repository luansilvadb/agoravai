# DI Container

Simple, lightweight Dependency Injection container for managing CLI dependencies.

## Overview

The `Container` class provides singleton-based dependency injection with support for test overrides.

```
┌─────────────────────────────────────────┐
│           Container                     │
│  ┌───────────────────────────────────┐  │
│  │  Registry: Map<token, impl>       │  │
│  ├───────────────────────────────────┤  │
│  │  Overrides: Map<token, impl>      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Tokens

```typescript
export const TOKENS = {
  CHANGE_REPOSITORY: 'ChangeRepository',
  GLOBAL_CONFIG_REPOSITORY: 'GlobalConfigRepository',
  FILE_SYSTEM: 'FileSystemPort',
  VALIDATOR: 'Validator',
  LOGGER: 'Logger',
} as const;
```

## Basic Usage

### Registration

```typescript
import { Container, TOKENS } from './infrastructure/container.js';
import { FsChangeRepository } from './infrastructure/fs-change-repository.js';
import { RealFileSystem } from './infrastructure/fs.js';

const container = Container.getInstance();
const fs = new RealFileSystem();

// Register dependencies
container.register(
  TOKENS.FILE_SYSTEM,
  fs
);

container.register(
  TOKENS.CHANGE_REPOSITORY,
  new FsChangeRepository(fs)
);
```

### Resolution

```typescript
// In command files
const container = Container.getInstance();
const repository = container.resolve<ChangeRepository>(
  TOKENS.CHANGE_REPOSITORY
);
```

## Test Overrides

The container supports dependency overrides for testing:

```typescript
import { MockChangeRepository } from './infrastructure/mock-change-repository.js';

// Setup test
beforeEach(() => {
  Container.reset();
  const mockRepo = new MockChangeRepository();
  
  Container.getInstance().register(
    TOKENS.CHANGE_REPOSITORY,
    mockRepo
  );
});

// Or use override for specific tests
it('should handle error', async () => {
  const failingRepo = {
    getChange: () => Promise.reject(new Error('DB Error'))
  };
  
  Container.getInstance().override(
    TOKENS.CHANGE_REPOSITORY,
    failingRepo
  );
  
  // Test with failing repository
  
  // Clean up
  Container.getInstance().clearOverride(TOKENS.CHANGE_REPOSITORY);
});
```

## API Reference

### Container.getInstance()
Returns the singleton container instance.

### register<T>(token: string, implementation: T)
Registers an implementation for a token.

### resolve<T>(token: string): T
Resolves an implementation by token. Returns override if set, otherwise registered implementation.

### override<T>(token: string, implementation: T)
Temporarily overrides a registered dependency (useful for testing).

### clearOverride(token: string)
Removes an override for a specific token.

### clearAllOverrides()
Removes all overrides.

### reset()
Clears all registrations and overrides. Use between test suites.

## Best Practices

1. **Register in index.ts**: Register all default implementations in CLI entry point
2. **Resolve in commands**: Only resolve, never register in command files
3. **Reset between tests**: Always call `Container.reset()` in test setup
4. **Type safety**: Use generic `resolve<T>` for proper typing

## Example: Command Implementation

```typescript
export async function statusCommand(options: Record<string, unknown>): Promise<void> {
  const container = Container.getInstance();
  
  // Resolve dependencies
  const repository = container.resolve<ChangeRepository>(
    TOKENS.CHANGE_REPOSITORY
  );
  const fs = container.resolve<FileSystemPort>(TOKENS.FILE_SYSTEM);
  
  // Use dependencies
  const change = await repository.getChange(options.change as string);
  
  // ... rest of command
}
```

## Comparison with Inversify

| Feature | Our Container | Inversify |
|---------|--------------|-----------|
| Bundle Size | ~50 lines | + dependencies |
| Decorators | No | Required |
| Test Overrides | Built-in | Complex |
| Learning Curve | Minimal | Moderate |
| Type Safety | Full | Full |

Our container is designed for simplicity when DI needs are straightforward.
