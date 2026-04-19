export const PATHS = {
  CHANGES_DIR: 'specskill/changes',
  ARCHIVE_DIR: 'specskill/archive',
  SPECS_DIR: 'specskill/specs',
  GLOBAL_CONFIG: 'specskill/.specskill.global.yaml',
  CHANGE_CONFIG: '.specskill.yaml',
  SPEC_FILENAME: 'spec.md',
  TASKS_FILENAME: 'tasks.md',
} as const;

export const SCHEMAS = {
  SPEC_DRIVEN: 'spec-driven',
  MINIMAL: 'minimal',
} as const;

export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
  NOT_FOUND: 2,
  ALREADY_EXISTS: 3,
  VALIDATION_ERROR: 4,
} as const;

export const DEFAULTS = {
  SCHEMA: 'spec-driven',
  VERSION: '1.0.0',
} as const;

export const MESSAGES = {
  ERROR_CHANGE_NOT_FOUND: (name: string) => `Change '${name}' not found`,
  ERROR_CHANGE_EXISTS: (name: string) => `Change '${name}' already exists`,
  ERROR_INVALID_SCHEMA: (schema: string) => `Invalid schema: '${schema}'`,
  ERROR_INVALID_NAME: () => 'Invalid change name',
  ERROR_CYCLE_DETECTED: () => 'Circular dependency detected',
  ERROR_VALIDATION_FAILED: (details: string) => `Validation failed: ${details}`,

  SUCCESS_CHANGE_CREATED: (name: string) => `Created change '${name}'`,
  SUCCESS_CHANGE_ARCHIVED: (name: string, id: string) =>
    `Archived change '${name}' to archive/${id}-${name}`,
  SUCCESS_CHANGE_UPDATED: (name: string) => `Updated change '${name}'`,
  SUCCESS_TASKS_COMPLETED: (count: number) => `${count} tasks completed`,

  INFO_NO_CHANGES: () => 'No changes found',
  INFO_ALL_DONE: () => 'All tasks completed',
  INFO_CHANGE_BLOCKED: (name: string) => `Change '${name}' is blocked`,
  INFO_DRY_RUN: () => '[DRY RUN] No changes were made',

  PROMPT_CONTINUE: () => 'Continue with this operation?',
  PROMPT_OVERRIDE: (name: string) => `Override existing change '${name}'?`,
} as const;

export const ARTIFACTS = {
  PROPOSAL: 'proposal',
  DESIGN: 'design',
  SPECS: 'specs',
  TASKS: 'tasks',
} as const;
