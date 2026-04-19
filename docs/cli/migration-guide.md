# Migration Guide for Contributors

This guide helps contributors understand the new CLI architecture and how to migrate from the old patterns.

## What's Changed

### Before (Direct FS Access)
```typescript
// Old: Direct file system operations
import { existsSync, readFileSync } from 'fs';

export function oldCommand(name: string): void {
  const path = `specskills/changes/${name}/.specskills.yaml`;
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8');
    // ...
  }
}
```

### After (Repository Pattern)
```typescript
// New: Repository pattern with DI
import { Container, TOKENS } from './infrastructure/container.js';
import type { ChangeRepository } from './domain/repositories.js';

export async function newCommand(name: string): Promise<void> {
  const repository = Container.getInstance()
    .resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  
  const exists = await repository.exists(name);
  const change = await repository.getChange(name);
  // ...
}
```

## Key Changes

### 1. Async Operations

All file operations are now async:

```typescript
// ❌ Old
if (existsSync(path)) { }

// ✅ New
if (await fs.pathExists(path)) { }
```

### 2. Dependency Injection

Use the container to resolve dependencies:

```typescript
// ❌ Old: Create dependencies inline
const repo = new FsChangeRepository(new RealFileSystem());

// ✅ New: Resolve from container
const repo = Container.getInstance()
  .resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
```

### 3. Validation

Zod validation is automatic in repositories:

```typescript
// ❌ Old: Manual validation
if (!name || name.length === 0) {
  throw new Error('Invalid name');
}

// ✅ New: Schema validation (automatic in save/get)
// Validation happens in FsChangeRepository
```

### 4. Testing

Use mock implementations for tests:

```typescript
// ❌ Old: Mock fs module
vi.mock('fs', () => ({ ... }));

// ✅ New: Use MockChangeRepository
import { MockChangeRepository } from './infrastructure/mock-change-repository.js';

beforeEach(() => {
  Container.reset();
  Container.getInstance().register(
    TOKENS.CHANGE_REPOSITORY,
    new MockChangeRepository()
  );
});
```

### 5. Error Handling

Zod errors are formatted automatically:

```typescript
// In src/cli/index.ts
try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof ZodError) {
    console.error('Validation error:\n' + formatZodError(error));
  } else {
    console.error('Error:', error.message);
  }
}
```

## Adding New Commands

1. **Create command file** in `src/cli/commands/`:
```typescript
import { Container, TOKENS } from '../infrastructure/index.js';
import { MESSAGES, EXIT_CODES } from '../constants.js';

export async function myCommand(options: Record<string, unknown>): Promise<void> {
  // Resolve dependencies
  const repository = Container.getInstance()
    .resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
  
  // Implement logic
  // ...
  
  console.log(MESSAGES.SUCCESS_MY_COMMAND());
}
```

2. **Register in index.ts**:
```typescript
program
  .command('my-command')
  .description('My new command')
  .option('--dry-run', 'Preview only')
  .action(async (options) => {
    await myCommand(options);
  });
```

3. **Add to constants.ts**:
```typescript
export const MESSAGES = {
  // ... existing messages
  SUCCESS_MY_COMMAND: () => 'My command completed!',
};
```

4. **Write tests** in `tests/cli/commands/my-command.test.ts`:
```typescript
describe('myCommand', () => {
  beforeEach(() => {
    Container.reset();
    Container.getInstance().register(
      TOKENS.CHANGE_REPOSITORY,
      new MockChangeRepository()
    );
  });
  
  it('should work correctly', async () => {
    // Test implementation
  });
});
```

## Adding New Repositories

1. **Define interface** in `src/cli/domain/repositories.ts`:
```typescript
export interface MyRepository {
  getData(id: string): Promise<MyData | null>;
  saveData(data: MyData): Promise<void>;
}
```

2. **Add token** in `src/cli/infrastructure/container.ts`:
```typescript
export const TOKENS = {
  // ... existing tokens
  MY_REPOSITORY: 'MyRepository',
};
```

3. **Create implementation** in `src/cli/infrastructure/fs-my-repository.ts`:
```typescript
export class FsMyRepository implements MyRepository {
  constructor(private fs: FileSystemPort) {}
  // Implement methods
}
```

4. **Register in index.ts**:
```typescript
import { FsMyRepository } from './infrastructure/fs-my-repository.js';

export function registerDefaults(): void {
  // ... existing registrations
  container.register(
    TOKENS.MY_REPOSITORY,
    new FsMyRepository(fs)
  );
}
```

## Testing Patterns

### Unit Tests
```typescript
import { describe, it, expect, vi } from 'vitest';
import { Container, TOKENS } from '../../src/cli/infrastructure/container.js';

describe('My Feature', () => {
  beforeEach(() => {
    Container.reset();
  });
  
  it('should use mock repository', async () => {
    const mockRepo = {
      getChange: vi.fn().mockResolvedValue({ name: 'test' }),
    };
    
    Container.getInstance().register(
      TOKENS.CHANGE_REPOSITORY,
      mockRepo
    );
    
    // Test your code
  });
});
```

### Integration Tests
```typescript
describe('Integration: My Workflow', () => {
  beforeEach(() => {
    Container.reset();
    Container.getInstance().register(
      TOKENS.CHANGE_REPOSITORY,
      new MockChangeRepository()
    );
  });
  
  it('full workflow', async () => {
    // Test multiple commands together
  });
});
```

## Common Pitfalls

1. **Don't import concrete implementations in commands** - always use `Container.resolve()`
2. **Always reset Container in tests** - prevents state leakage between tests
3. **Use `async/await`** - all repository methods are async
4. **Handle Zod validation errors** - they're thrown as `ZodError` instances
5. **Register defaults at startup** - in `src/cli/index.ts` before parsing commands

## Resources

- [Repository Pattern](./repository-pattern.md)
- [DI Container](./di-container.md)
- [Zod Documentation](https://zod.dev)
- [Commander.js Documentation](https://github.com/tj/commander.js)
