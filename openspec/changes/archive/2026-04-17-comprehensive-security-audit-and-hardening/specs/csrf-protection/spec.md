## ADDED Requirements

### Requirement: CSRF tokens for state-changing operations
The system SHALL require and validate CSRF tokens for all state-changing HTTP operations (POST, PUT, DELETE, PATCH).

#### Scenario: Valid CSRF token provided
- **WHEN** a user submits a state-changing request with a valid CSRF token in the X-CSRF-Token header
- **THEN** the system processes the request normally

#### Scenario: Missing CSRF token
- **WHEN** a state-changing request is made without a CSRF token
- **THEN** the system rejects the request with 403 Forbidden
- **AND** logs the potential CSRF attempt

#### Scenario: Invalid CSRF token
- **WHEN** a request includes an invalid or expired CSRF token
- **THEN** the system rejects the request with 403 Forbidden
- **AND** requires the user to obtain a fresh token

### Requirement: SameSite cookie attribute
The system SHALL set SameSite=Strict on all session cookies.

#### Scenario: Cross-origin POST request
- **WHEN** a cross-origin request attempts to include the session cookie
- **THEN** the browser does not include the cookie due to SameSite=Strict
- **AND** the request fails authentication

### Requirement: Double-submit cookie pattern
The system MAY implement double-submit cookie pattern as additional CSRF protection layer.

#### Scenario: Token mismatch
- **WHEN** the CSRF token in the header does not match the token in the cookie
- **THEN** the system rejects the request
