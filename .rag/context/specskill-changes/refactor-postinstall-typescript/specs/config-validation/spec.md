## ADDED Requirements

### Requirement: Configuration schema
The system SHALL validate configuration using Zod schema.

#### Scenario: Valid configuration
- **WHEN** environment has `LOG_LEVEL=info` and `INIT_CWD=/project`
- **AND** schema is parsed
- **THEN** result MUST be a valid `AppConfig` object

#### Scenario: Invalid log level
- **WHEN** environment has `LOG_LEVEL=invalid`
- **AND** schema is parsed
- **THEN** it MUST throw `ConfigValidationError`
- **AND** error code MUST be "CONFIG_VALIDATION_ERROR"

### Requirement: Default values
The system SHALL provide sensible defaults for optional config.

#### Scenario: Missing optional values
- **WHEN** `LOG_LEVEL` is not set
- **THEN** default MUST be "info"

### Requirement: Required fields
The system SHALL enforce required configuration fields.

#### Scenario: Missing project root
- **WHEN** neither `INIT_CWD` nor fallback is available
- **THEN** it MUST throw `ConfigValidationError`
