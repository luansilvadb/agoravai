## ADDED Requirements

### Requirement: Tokens stored securely
The system SHALL store authentication tokens in httpOnly cookies, never in localStorage or sessionStorage.

#### Scenario: User authenticates
- **WHEN** a user successfully authenticates
- **THEN** the system sets an httpOnly, Secure, SameSite=Strict cookie with the authentication token

#### Scenario: Token retrieval attempt from JavaScript
- **WHEN** JavaScript attempts to access the authentication token
- **THEN** the token MUST NOT be accessible via document.cookie or any client-side API

### Requirement: Session expiration
The system SHALL enforce session expiration with automatic logout after inactivity.

#### Scenario: User inactive for extended period
- **WHEN** a user is inactive for more than the configured session timeout (e.g., 30 minutes)
- **THEN** the system invalidates the session and requires re-authentication

### Requirement: Wallet signature verification
The system SHALL verify wallet signatures cryptographically when blockchain authentication is used.

#### Scenario: Wallet authentication attempt
- **WHEN** a user attempts to authenticate with a blockchain wallet
- **THEN** the system verifies the wallet signature against the claimed public key
- **AND** rejects authentication if signature verification fails

### Requirement: Authorization checks
The system SHALL verify user authorization before executing sensitive operations.

#### Scenario: Non-admin attempts admin operation
- **WHEN** a non-admin user attempts to perform an admin-only operation
- **THEN** the system denies the request with a 403 Forbidden response
- **AND** logs the unauthorized access attempt

#### Scenario: User accesses another user's data
- **WHEN** a user attempts to access or modify another user's data
- **THEN** the system denies the request unless the user has explicit authorization
