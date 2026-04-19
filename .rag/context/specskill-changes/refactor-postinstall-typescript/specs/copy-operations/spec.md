## ADDED Requirements

### Requirement: Copy task definition
The system SHALL define a `CopyTask` structure with source, target, and label.

#### Scenario: Task creation
- **WHEN** creating a CopyTask
- **THEN** it MUST have `source`, `target`, and `label` properties
- **AND** all MUST be strings

### Requirement: Copy result tracking
The system SHALL track copy operation results.

#### Scenario: Successful copy
- **WHEN** files are copied successfully
- **THEN** result MUST include `copiedFiles: string[]`
- **AND** result MUST include `skippedFiles: string[]`
- **AND** `success` MUST be `true`

#### Scenario: Failed copy
- **WHEN** a copy operation fails
- **THEN** `success` MUST be `false`
- **AND** result MUST include `error: DomainError`

### Requirement: Recursive copy
The system SHALL copy directories recursively.

#### Scenario: Deep directory structure
- **WHEN** copying a directory with nested subdirectories
- **THEN** all files MUST be copied maintaining structure
- **AND** existing files MUST be skipped (not overwritten)

### Requirement: Skip existing files
The system SHALL not overwrite existing destination files.

#### Scenario: File exists
- **WHEN** destination file already exists
- **THEN** file MUST be added to `skippedFiles`
- **AND** no copy operation MUST occur for that file
