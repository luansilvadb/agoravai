# Spec: Constants Module

## Status
- [x] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Contexto

Magic strings como `'specskill/changes'`, `'spec.md'`, `'archive'` estão espalhadas em múltiplos arquivos. Qualquer mudança na estrutura de pastas requer editar 5+ arquivos.

## Objetivo

Centralizar todas as constantes em um único módulo tipado, permitindo:
- Autocomplete IDE
- Type safety
- Mudanças em um único lugar
- Tree-shaking

## Constantes Module

```typescript
// src/cli/constants.ts

/**
 * Path constants for Specskill CLI
 * All paths are relative to project root
 */
export const PATHS = {
  /** Root directory for all changes */
  CHANGES_DIR: 'specskill/changes',
  /** Archive subdirectory */
  ARCHIVE_DIR: 'specskill/changes/archive',
  /** Directory for main specs */
  SPECS_DIR: 'specskill/specs',
  /** Global config file path */
  GLOBAL_CONFIG: 'specskill/.specskill.global.yaml',
  /** Change config filename */
  CHANGE_CONFIG: '.specskill.yaml',
  /** Spec filename */
  SPEC_FILENAME: 'spec.md',
  /** Tasks filename */
  TASKS_FILENAME: 'tasks.md',
  /** Proposal filename */
  PROPOSAL_FILENAME: 'proposal.md',
  /** Design filename */
  DESIGN_FILENAME: 'design.md',
  /** Granular specs subdirectory */
  GRANULAR_SPECS_DIR: 'specs'
} as const;

/**
 * Schema identifiers
 */
export const SCHEMAS = {
  /** Full spec-driven schema with all artifacts */
  SPEC_DRIVEN: 'spec-driven',
  /** Minimal schema with only proposal and tasks */
  MINIMAL: 'minimal'
} as const;

/**
 * Artifact identifiers
 */
export const ARTIFACTS = {
  PROPOSAL: 'proposal',
  DESIGN: 'design',
  SPECS: 'specs',
  TASKS: 'tasks'
} as const;

/**
 * Status values for artifacts and tasks
 */
export const STATUS = {
  READY: 'ready',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  PENDING: 'pending',
  BLOCKED: 'blocked'
} as const;

/**
 * Message templates for CLI output
 * Functions allow dynamic content while keeping messages consistent
 */
export const MESSAGES = {
  // Errors
  ERROR_CHANGE_NOT_FOUND: (name: string): string => 
    `Change '${name}' not found`,
  
  ERROR_CHANGE_EXISTS: (name: string): string => 
    `Change '${name}' already exists`,
  
  ERROR_INVALID_SCHEMA: (schema: string, valid: string[]): string => 
    `Invalid schema '${schema}'. Valid schemas: ${valid.join(', ')}`,
  
  ERROR_REQUIRED_OPTION: (option: string): string => 
    `Required option '${option}' not provided`,
  
  ERROR_ARTIFACT_BLOCKED: (artifact: string, deps: string[]): string => 
    `Artifact '${artifact}' is blocked by: ${deps.join(', ')}`,
  
  ERROR_CIRCULAR_DEPENDENCY: (cycle: string[]): string => 
    `Circular dependency detected: ${cycle.join(' -> ')}`,
  
  // Success
  SUCCESS_CHANGE_CREATED: (name: string, path: string): string => 
    `Created change '${name}' at ${path}`,
  
  SUCCESS_CHANGE_ARCHIVED: (name: string, dest: string): string => 
    `Archived change '${name}' to ${dest}`,
  
  SUCCESS_ARTIFACT_GENERATED: (id: string, path: string): string => 
    `Generated artifact '${id}' at ${path}`,
  
  // Warnings
  WARNING_DRY_RUN_MODE: (): string => 
    'DRY RUN: No changes will be made',
  
  WARNING_INCOMPLETE_ARTIFACTS: (count: number): string => 
    `${count} artifact(s) incomplete`,
  
  WARNING_INCOMPLETE_TASKS: (incomplete: number, total: number): string => 
    `${incomplete}/${total} task(s) incomplete`,
  
  // Info
  INFO_ALL_TASKS_COMPLETE: (): string => 
    'All tasks complete! Ready to archive.',
  
  INFO_PROGRESS: (done: number, total: number): string => 
    `Progress: ${done}/${total}`
} as const;

/**
 * Exit codes for CLI
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR_GENERIC: 1,
  ERROR_INVALID_ARGS: 2,
  ERROR_CHANGE_NOT_FOUND: 3,
  ERROR_CHANGE_EXISTS: 4,
  ERROR_FILESYSTEM: 5
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  SCHEMA: SCHEMAS.SPEC_DRIVEN,
  ARCHIVE_ID_PADDING: 3,
  DATE_FORMAT: 'YYYY-MM-DD'
} as const;

/**
 * Schema definitions with dependencies
 * Using const assertion for type inference
 */
export const SCHEMA_DEFINITIONS = {
  [SCHEMAS.SPEC_DRIVEN]: {
    artifacts: [
      ARTIFACTS.PROPOSAL,
      ARTIFACTS.DESIGN,
      ARTIFACTS.SPECS,
      ARTIFACTS.TASKS
    ] as const,
    dependencies: {
      [ARTIFACTS.PROPOSAL]: [],
      [ARTIFACTS.DESIGN]: [ARTIFACTS.PROPOSAL],
      [ARTIFACTS.SPECS]: [ARTIFACTS.PROPOSAL],
      [ARTIFACTS.TASKS]: [ARTIFACTS.DESIGN, ARTIFACTS.SPECS]
    } as const
  },
  [SCHEMAS.MINIMAL]: {
    artifacts: [
      ARTIFACTS.PROPOSAL,
      ARTIFACTS.TASKS
    ] as const,
    dependencies: {
      [ARTIFACTS.PROPOSAL]: [],
      [ARTIFACTS.TASKS]: [ARTIFACTS.PROPOSAL]
    } as const
  }
} as const;

// Type exports for type-safe usage
export type SchemaType = typeof SCHEMAS[keyof typeof SCHEMAS];
export type ArtifactType = typeof ARTIFACTS[keyof typeof ARTIFACTS];
export type StatusType = typeof STATUS[keyof typeof STATUS];
```

## Usage Examples

### Before (Magic Strings)

```typescript
// src/cli/commands/archive.ts (ANTES)
if (!pathExists('specskill/changes')) {
  console.log('No changes found.');
}

const archivePath = `specskill/changes/archive/${id}-${name}`;

if (!pathExists(`${changePath}/.specskill.yaml`)) {
  console.error('Config not found');
}
```

### After (Constants)

```typescript
// src/cli/commands/archive.ts (DEPOIS)
import { PATHS, MESSAGES, DEFAULTS } from '../constants.js';

if (!pathExists(PATHS.CHANGES_DIR)) {
  console.log(MESSAGES.ERROR_CHANGE_NOT_FOUND(name));
}

const archivePath = join(
  PATHS.ARCHIVE_DIR, 
  `${id.padStart(DEFAULTS.ARCHIVE_ID_PADDING, '0')}-${name}`
);

if (!pathExists(join(changePath, PATHS.CHANGE_CONFIG))) {
  console.error(MESSAGES.ERROR_CHANGE_NOT_FOUND(name));
}
```

## Type Safety Benefits

```typescript
// Autocomplete works for all constants
PATHS.CHANGES_DIR        // ✓ Valid
PATHS.INVALID_PATH       // ✗ Compile error

SCHEMAS.SPEC_DRIVEN      // ✓ Valid
SCHEMAS.INVALID          // ✗ Compile error

// Type-safe schema access
const schema = SCHEMA_DEFINITIONS[SCHEMAS.SPEC_DRIVEN];
// schema.artifacts is typed as readonly ['proposal', 'design', 'specs', 'tasks']
```

## Refactoring Plan

### Phase 1: Create Module
- [ ] Create `src/cli/constants.ts` with all constants
- [ ] Update `src/cli/utils/config.ts` to use constants
- [ ] Verify no TypeScript errors

### Phase 2: Update Commands
- [ ] Update `src/cli/commands/archive.ts`
- [ ] Update `src/cli/commands/new-change.ts`
- [ ] Update `src/cli/commands/status.ts`
- [ ] Update `src/cli/commands/continue.ts`
- [ ] Update `src/cli/commands/apply.ts`
- [ ] Update `src/cli/commands/list.ts`
- [ ] Update `src/cli/commands/generate.ts`
- [ ] Update `src/cli/commands/exists.ts`

### Phase 3: Update Utils
- [ ] Update `src/cli/utils/fs-utils.ts` if needed
- [ ] Update `src/cli/utils/config.ts`
- [ ] Update `src/cli/utils/global-config.ts`

### Phase 4: Verify
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Run tests: `npm test`
- [ ] Test CLI manually

## Checklist de Implementação

- [ ] Criar `src/cli/constants.ts` com todas as constantes
- [ ] Exportar tipos auxiliares (SchemaType, ArtifactType, etc.)
- [ ] Substituir todas as magic strings nos comandos
- [ ] Substituir magic strings nos utilitários
- [ ] Verificar TypeScript strict mode
- [ ] Rodar testes para garantir funcionalidade
- [ ] Atualinar imports onde necessário
