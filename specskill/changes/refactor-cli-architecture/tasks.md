# Tasks: Refactor CLI Architecture

## Phase 1: Foundation (High Priority)

### T1.1: Repository Pattern
- [ ] Create `src/cli/domain/repositories.ts` with interfaces
- [ ] Create `FsChangeRepository` implementation
- [ ] Create `FsGlobalConfigRepository` implementation
- [ ] Create `MockChangeRepository` for testing
- [ ] Refactor `exists.ts` to use Repository
- [ ] Refactor `new-change.ts` to use Repository
- [ ] Add unit tests for repositories

### T1.2: DI Container
- [ ] Create `src/cli/infrastructure/container.ts` with Container class
- [ ] Create dependency tokens in `TOKENS` constant
- [ ] Create `registerDefaults()` function
- [ ] Update all commands to use `Container.resolve()`
- [ ] Add `Container.override()` for testing
- [ ] Create tests with mocked dependencies

### T1.3: Constants Module
- [ ] Create `src/cli/constants.ts` with PATHS constants
- [ ] Add SCHEMAS and ARTIFACTS constants
- [ ] Add MESSAGES constant with message functions
- [ ] Add EXIT_CODES constants
- [ ] Add DEFAULTS constants
- [ ] Replace all magic strings in commands
- [ ] Verify TypeScript strict mode passes

### T1.4: Commander.js Migration
- [ ] Install `commander` dependency
- [ ] Rewrite `src/cli/index.ts` using Commander
- [ ] Update `newChangeCommand` signature
- [ ] Update `statusCommand` signature
- [ ] Update `archiveCommand` signature
- [ ] Update `applyCommand` signature
- [ ] Update remaining commands
- [ ] Add global error handling
- [ ] Test all commands manually

## Phase 2: Quality (Medium Priority)

### T2.1: Zod Validation
- [ ] Install `zod` dependency
- [ ] Create `src/cli/validation/schemas.ts`
- [ ] Create `ChangeConfigSchema` with Zod
- [ ] Create `GlobalConfigSchema` with Zod
- [ ] Create `ZodValidator` class
- [ ] Implement `parseYaml()` helper
- [ ] Implement `serializeYaml()` helper
- [ ] Add validation to `FsChangeRepository`
- [ ] Add validation to `FsGlobalConfigRepository`
- [ ] Add ZodError handling in CLI

### T2.2: Cycle Detection
- [ ] Create `src/cli/utils/graph.ts`
- [ ] Implement `detectCycle()` with DFS
- [ ] Implement `topologicalSort()`
- [ ] Implement `getReadyArtifacts()`
- [ ] Add cycle detection to schema validation
- [ ] Update `status.ts` to use cycle detection
- [ ] Create unit tests for graph algorithms

### T2.3: Parallel I/O
- [ ] Create `src/cli/utils/parallel-io.ts`
- [ ] Implement `loadSpecsParallel()`
- [ ] Implement `batchReadFiles()` with concurrency limit
- [ ] Implement `loadArtifactsParallel()`
- [ ] Update `apply.ts` to use parallel loading
- [ ] Update `status.ts` to use parallel loading
- [ ] Create performance tests

### T2.4: i18n Standardization
- [ ] Audit all commands for PT messages
- [ ] Replace PT messages with MESSAGES constants
- [ ] Update `new-change.ts` messages
- [ ] Update `status.ts` messages
- [ ] Update `continue.ts` messages
- [ ] Update remaining commands
- [ ] Verify all messages are in English

### T2.5: Dry-Run Mode
- [ ] Add `--dry-run` option to `archive` command
- [ ] Add `--dry-run` option to `new` command
- [ ] Add `--dry-run` option to `generate` command
- [ ] Create preview formatting helper
- [ ] Implement dry-run logic in each command
- [ ] Add dry-run tests

## Phase 3: Testing & Documentation

### T3.1: Unit Tests
- [ ] Create tests for Repository Pattern
- [ ] Create tests for DI Container
- [ ] Create tests for Validation
- [ ] Create tests for Cycle Detection
- [ ] Create tests for Parallel I/O
- [ ] Achieve >80% coverage

### T3.2: Integration Tests
- [ ] Test full workflow: new → status → archive
- [ ] Test dry-run modes
- [ ] Test error scenarios
- [ ] Test with multiple changes

### T3.3: Documentation
- [ ] Update README with new architecture
- [ ] Document Repository Pattern usage
- [ ] Document DI Container usage
- [ ] Add migration guide for contributors
