## ADDED Requirements

### Requirement: Base domain error
The system SHALL define a `DomainError` base class.

#### Scenario: Error properties
- **WHEN** a DomainError is thrown
- **THEN** it MUST have `name` set to class name
- **AND** it MUST have `message` with description
- **AND** it MUST capture stack trace

### Requirement: Error cause chaining
The system SHALL support error cause chaining.

#### Scenario: Wrapped error
- **WHEN** a FileCopyError wraps a native Error
- **THEN** the cause MUST be preserved
- **AND** it MUST be accessible via `error.cause`

### Requirement: File copy error
The system SHALL define specific error for file operations.

#### Scenario: Copy failure
- **WHEN** a file copy fails
- **THEN** `FileCopyError` MUST be thrown
- **AND** `code` MUST be "FILE_COPY_ERROR"
- **AND** source and target paths MUST be in message

### Requirement: Directory creation error
The system SHALL define specific error for directory operations.

#### Scenario: Mkdir failure
- **WHEN** directory creation fails
- **THEN** `DirectoryCreationError` MUST be thrown
- **AND** `code` MUST be "DIR_CREATE_ERROR"
- **AND** path MUST be in message

### Requirement: Config validation error
The system SHALL define specific error for config failures.

#### Scenario: Invalid config
- **WHEN** configuration validation fails
- **THEN** `ConfigValidationError` MUST be thrown
- **AND** `code` MUST be "CONFIG_VALIDATION_ERROR"
- **AND** field path MUST be in message
