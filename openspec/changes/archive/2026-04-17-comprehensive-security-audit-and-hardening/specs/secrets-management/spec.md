## ADDED Requirements

### Requirement: No hardcoded secrets
The system SHALL NOT contain any hardcoded secrets, API keys, passwords, or tokens in source code.

#### Scenario: Code review finds hardcoded secret
- **WHEN** a code review or scan detects a hardcoded secret
- **THEN** the build fails or the commit is rejected
- **AND** the secret is removed and rotated immediately

#### Scenario: Environment variable used
- **WHEN** the application needs a secret value
- **THEN** it reads from environment variables
- **AND** throws an error if the required variable is not set

### Requirement: Secrets in environment variables
The system SHALL read all secrets from environment variables.

#### Scenario: Application startup
- **WHEN** the application starts
- **THEN** it validates that all required environment variables are present
- **AND** fails fast with a clear error message if any are missing

#### Scenario: Missing critical secret
- **WHEN** a required secret (e.g., API_KEY, DATABASE_URL) is not configured
- **THEN** the application logs a clear error and exits
- **AND** does not attempt to run with default/empty values

### Requirement: .env file exclusion from version control
The system SHALL NOT commit actual .env files to version control.

#### Scenario: Git commit attempt
- **WHEN** a developer attempts to commit a .env file
- **THEN** git ignores the file due to .gitignore configuration

### Requirement: .env.example documentation
The system SHALL provide a .env.example file documenting all required environment variables.

#### Scenario: New developer onboarding
- **WHEN** a new developer clones the repository
- **THEN** the .env.example file lists all required and optional environment variables
- **AND** provides descriptions and example values (without real secrets)

### Requirement: Secret verification at runtime
The system SHALL verify secrets are properly loaded before using them.

#### Scenario: Using an API key
- **WHEN** the application attempts to use an API key
- **THEN** it first verifies the key is defined and non-empty
- **AND** fails gracefully with a clear error if not configured
