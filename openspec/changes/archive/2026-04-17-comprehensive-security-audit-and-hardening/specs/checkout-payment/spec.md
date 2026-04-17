## ADDED Requirements

### Requirement: Payment data validation
The system SHALL validate all payment data with strict schemas before processing transactions.

#### Scenario: Valid payment amount
- **WHEN** a payment amount is submitted
- **THEN** the system validates it is a positive number
- **AND** enforces minimum (greater than zero) and maximum limits

#### Scenario: Invalid payment amount
- **WHEN** a negative, zero, or excessively large payment amount is submitted
- **THEN** the system rejects the transaction
- **AND** returns a validation error

#### Scenario: Payment method validation
- **WHEN** a payment method is selected
- **THEN** the system validates it against allowed methods (dinheiro, cartao, pix)
- **AND** rejects unknown or disabled payment methods

### Requirement: Sanitization of payment inputs
The system SHALL sanitize all user inputs related to payment before processing or logging.

#### Scenario: Cash payment input
- **WHEN** a user enters cash received amount
- **THEN** the system validates the format (numeric only)
- **AND** sanitizes any non-numeric characters

#### Scenario: Payment notes or references
- **WHEN** a user provides payment notes or reference numbers
- **THEN** the system sanitizes the input to prevent XSS
- **AND** validates maximum length of 500 characters

### Requirement: Rate limiting on payment operations
The system SHALL enforce strict rate limiting on payment and checkout operations.

#### Scenario: Multiple payment attempts
- **WHEN** a user attempts more than 5 payment operations per minute
- **THEN** subsequent attempts are rate limited with 429 Too Many Requests
- **AND** the user must wait before retrying

#### Scenario: Rapid sequential checkouts
- **WHEN** a user attempts checkouts in rapid succession
- **THEN** the system enforces a minimum delay between transactions
- **AND** flags suspicious activity for review

### Requirement: Secure sale data storage
The system SHALL securely store sale history without sensitive payment details.

#### Scenario: Sale record creation
- **WHEN** a sale is recorded in history
- **THEN** the system stores transaction reference, amount, and method
- **AND** does NOT store full card numbers, CVV, or sensitive payment credentials

#### Scenario: Sale data access
- **WHEN** accessing sale history
- **THEN** the system verifies the user has authorization to view those records
- **AND** redacts sensitive data in the response
