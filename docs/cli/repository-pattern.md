# Repository Pattern

The Repository Pattern provides an abstraction layer between the domain logic and data persistence, enabling testability and flexibility.

## Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Commands      │ ───► │  Repository      │ ───► │  FileSystem     │
│                 │      │  (Interface)     │      │  (Implementation)│
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

## Interfaces

### ChangeRepository

```typescript
interface ChangeRepository {
  exists(name: string): Promise<boolean>;
  getChange(name: string): Promise<Change | null>;
  save(change: Change): Promise<void>;
  list(): Promise<string[]>;
  archive(name: string, archiveId: string): Promise<void>;
}
```

### GlobalConfigRepository

```typescript
interface GlobalConfigRepository {
  getConfig(): Promise<GlobalConfig | null>;
  saveConfig(config: GlobalConfig): Promise<void>;
  getNextArchiveId(): Promise<number>;
}
```

### FileSystemPort

```typescript
interface FileSystemPort {
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, content: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  pathExists(path: string): boolean;
  listDirs(path: string): Promise<string[]>;
  moveDir(src: string, dest: string): Promise<void>;
}
```

## Implementations

### FsChangeRepository

File-system based implementation of `ChangeRepository`:

```typescript
import { FsChangeRepository } from './infrastructure/fs-change-repository.js';

const repository = new FsChangeRepository(fileSystemPort);

// Check if change exists
const exists = await repository.exists('my-change');

// Get change details
const change = await repository.getChange('my-change');

// Save new change
await repository.save({
  name: 'new-change',
  schema: 'spec-driven',
  created: new Date().toISOString(),
  path: 'specskills/changes/new-change',
  artifacts: ['proposal', 'design'],
});

// List all changes
const changes = await repository.list();

// Archive change
await repository.archive('my-change', '001');
```

### MockChangeRepository

In-memory implementation for testing:

```typescript
import { MockChangeRepository } from './infrastructure/mock-change-repository.js';

const mockRepo = new MockChangeRepository();

// Use in tests without file system
await mockRepo.save({ name: 'test', ... });
const change = await mockRepo.getChange('test');
```

## Usage with DI Container

```typescript
import { Container, TOKENS } from './infrastructure/container.js';

// Register implementation
Container.getInstance().register(
  TOKENS.CHANGE_REPOSITORY,
  new FsChangeRepository(fs)
);

// Resolve in commands
const repository = Container.getInstance()
  .resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);
```

## Benefits

1. **Testability**: Mock implementations for unit tests
2. **Flexibility**: Swap storage backend without changing commands
3. **Type Safety**: Full TypeScript interface compliance
4. **Validation**: Automatic Zod validation on save/load

## Testing

```typescript
describe('FsChangeRepository', () => {
  it('should save and retrieve changes', async () => {
    const mockFs = createMockFs();
    const repo = new FsChangeRepository(mockFs);
    
    await repo.save({ name: 'test', schema: 'spec-driven', ... });
    const result = await repo.getChange('test');
    
    expect(result?.name).toBe('test');
  });
});
```
