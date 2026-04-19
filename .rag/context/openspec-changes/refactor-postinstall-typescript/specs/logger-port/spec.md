## ADDED Requirements

### Requirement: Logger interface definition
The system SHALL define an `ILogger` interface with methods for all log levels.

#### Scenario: Interface contract
- **WHEN** a component implements `ILogger`
- **THEN** it MUST provide methods: `debug`, `info`, `warn`, `error`
- **AND** each method MUST accept `message: string` and optional `meta: Record<string, unknown>`

### Requirement: Log level filtering
The system SHALL support minimum log level filtering at runtime.

#### Scenario: Level filtering active
- **WHEN** logger is configured with minLevel = "info"
- **AND** a debug message is logged
- **THEN** the message MUST NOT be output

#### Scenario: All levels pass
- **WHEN** logger is configured with minLevel = "debug"
- **AND** messages of any level are logged
- **THEN** all messages MUST be output

### Requirement: Structured metadata
The system SHALL support structured metadata in log entries.

#### Scenario: Metadata inclusion
- **WHEN** logging with meta = { source: "/path", target: "/dest" }
- **THEN** output MUST include the metadata as serialized JSON

### Requirement: Error context capture
The system SHALL capture error details when logging errors.

#### Scenario: Error with cause
- **WHEN** logging an error with an Error instance
- **THEN** output MUST include error name and message
- **AND** the original meta MUST be preserved
