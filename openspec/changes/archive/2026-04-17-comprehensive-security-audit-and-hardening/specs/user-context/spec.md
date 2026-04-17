## ADDED Requirements

### Requirement: Authorization verification for user operations
The system SHALL verify user authorization before displaying or modifying operator information.

#### Scenario: User attempts to access another operator's data
- **WHEN** a user attempts to view or modify another operator's information
- **THEN** the system denies the request with 403 Forbidden
- **AND** logs the unauthorized access attempt

#### Scenario: Valid user accessing own context
- **WHEN** a user accesses their own operator information in the footer
- **THEN** the system displays the information normally

### Requirement: Input validation for user data
The system SHALL validate all user input fields displayed in the footer (operator name, caixa number).

#### Scenario: Valid operator name
- **WHEN** displaying or updating an operator name
- **THEN** the system validates the name contains only allowed characters
- **AND** enforces maximum length of 100 characters

#### Scenario: Invalid characters in operator name
- **WHEN** an operator name contains potentially dangerous characters (HTML tags, scripts)
- **THEN** the system sanitizes the input before display
- **AND** logs a warning about the sanitization

### Requirement: Secure logout operation
The system SHALL implement secure logout that invalidates the session.

#### Scenario: User clicks logout
- **WHEN** a user clicks the logout button in the footer
- **THEN** the system invalidates the session token (clears httpOnly cookie)
- **AND** redirects to the login page
- **AND** prevents back-button access to protected pages

#### Scenario: Session termination
- **WHEN** a logout is initiated
- **THEN** any stored client-side state is cleared
- **AND** sensitive data is removed from memory
