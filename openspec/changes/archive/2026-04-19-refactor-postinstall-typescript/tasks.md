## 1. Setup TypeScript Environment

- [x] 1.1 Create `scripts/postinstall/` directory structure with domain/, application/, infrastructure/ subdirs
- [x] 1.2 Create `tsconfig.scripts.json` with strict TypeScript settings for NodeNext modules
- [x] 1.3 Add `tsx` (or `ts-node`) as devDependency for script execution
- [x] 1.4 Add `zod` as dependency for schema validation

## 2. Domain Layer - Ports and Errors

- [x] 2.1 Create `domain/ports/ILogger.ts` interface with debug, info, warn, error methods and LogLevel enum
- [x] 2.2 Create `domain/ports/IFileSystem.ts` interface with exists, mkdir, readdir, stat, copyFile methods
- [x] 2.3 Create `domain/errors/DomainError.ts` base class with name, message, cause, and stack capture
- [x] 2.4 Create `domain/errors/FileCopyError.ts` with code "FILE_COPY_ERROR" and source/target in message
- [x] 2.5 Create `domain/errors/DirectoryCreationError.ts` with code "DIR_CREATE_ERROR"
- [x] 2.6 Create `domain/errors/ConfigValidationError.ts` with code "CONFIG_VALIDATION_ERROR"

## 3. Application Layer - DTOs and Services

- [x] 3.1 Create `application/dto/CopyTask.ts` with source, target, label properties
- [x] 3.2 Create `application/dto/CopyResult.ts` with task, success, copiedFiles, skippedFiles, error properties
- [x] 3.3 Create `application/services/CopyService.ts` implementing recursive copy with skip-existing logic
- [x] 3.4 Ensure CopyService uses IFileSystem port (injected via constructor)
- [x] 3.5 Ensure CopyService uses ILogger port (injected via constructor)

## 4. Infrastructure Layer - Adapters

- [x] 4.1 Create `infrastructure/adapters/ConsoleLogger.ts` implementing ILogger with log level filtering
- [x] 4.2 Implement ConsoleLogger structured metadata output as JSON
- [x] 4.3 Create `infrastructure/adapters/NodeFileSystem.ts` implementing IFileSystem using Node.js fs module
- [x] 4.4 Ensure all NodeFileSystem methods throw appropriate DomainErrors on failure
- [x] 4.5 Create `infrastructure/config/AppConfig.ts` with Zod schema for logLevel and paths
- [x] 4.6 Implement config validation with defaults (LOG_LEVEL defaults to "info")

## 5. Application Layer - Use Case

- [x] 5.1 Create `application/usecases/ExecutePostInstall.ts` orchestrating the copy operations
- [x] 5.2 Define copy tasks for: .windsurf/workflows, openspec/changes, .rag/context
- [x] 5.3 Implement results aggregation and summary logging
- [x] 5.4 Implement exit code logic (0 for success, 1 for errors)

## 6. Entry Point and Integration

- [x] 6.1 Create `scripts/postinstall/index.ts` as entry point
- [x] 6.2 Wire dependencies: instantiate ConsoleLogger, NodeFileSystem, build config
- [x] 6.3 Instantiate CopyService and ExecutePostInstall use case
- [x] 6.4 Update `package.json` postinstall script to use `tsx scripts/postinstall/index.ts`

## 7. Testing and Cleanup

- [x] 7.1 Remove old `scripts/postinstall.js` file
- [x] 7.2 Test postinstall execution locally with `npm run postinstall`
- [x] 7.3 Verify all 3 copy tasks execute (windsurf workflows, openspec changes, rag context)
- [x] 7.4 Verify error handling produces correct exit codes
