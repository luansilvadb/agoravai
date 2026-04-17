## ADDED Requirements

### Requirement: Rate limiting on cart operations
The system SHALL enforce rate limiting on shopping cart operations to prevent abuse.

#### Scenario: Rapid add/remove operations
- **WHEN** a user performs more than 30 cart operations per minute
- **THEN** subsequent operations are rate limited
- **AND** the system returns 429 Too Many Requests

#### Scenario: Cart manipulation attempts
- **WHEN** suspicious patterns of cart operations are detected
- **THEN** the system may require re-authentication or CAPTCHA
- **AND** logs the activity for security review

### Requirement: Input validation for cart quantities
The system SHALL strictly validate all quantity inputs with bounds checking.

#### Scenario: Valid quantity
- **WHEN** a user adds a product with quantity between 1 and available stock
- **THEN** the system accepts the quantity

#### Scenario: Negative or zero quantity
- **WHEN** a quantity less than 1 is submitted
- **THEN** the system rejects the operation
- **AND** returns a validation error

#### Scenario: Quantity exceeding stock
- **WHEN** a quantity exceeding available stock is requested
- **THEN** the system limits to available stock
- **AND** notifies the user of the adjustment

#### Scenario: Unrealistic quantity
- **WHEN** a quantity exceeding reasonable limits (e.g., > 999) is submitted
- **THEN** the system rejects the operation
- **AND** flags as potential abuse

### Requirement: Price validation and tampering protection
The system SHALL validate product prices server-side and detect tampering attempts.

#### Scenario: Price manipulation attempt
- **WHEN** a client attempts to modify product prices in the cart
- **THEN** the system recalculates totals using server-verified prices
- **AND** ignores any client-provided price values

#### Scenario: Discount validation
- **WHEN** a discount is applied to the cart
- **THEN** the system validates the discount code/amount against allowed values
- **AND** rejects invalid or expired discounts

### Requirement: Discount bounds checking
The system SHALL enforce limits on discount values to prevent abuse.

#### Scenario: Percentage discount limit
- **WHEN** a percentage discount is applied
- **THEN** the system enforces a maximum discount percentage (e.g., 50%)
- **AND** rejects discounts that would result in negative totals

#### Scenario: Fixed amount discount limit
- **WHEN** a fixed amount discount is applied
- **THEN** the system validates the discount does not exceed the cart total
- **AND** prevents discounts that would result in zero or negative payment

### Requirement: Cart data sanitization
The system SHALL sanitize all cart data inputs to prevent injection attacks.

#### Scenario: Product ID validation
- **WHEN** a product is added to cart
- **THEN** the system validates the product ID is a valid format
- **AND** prevents SQL injection or NoSQL injection attempts

#### Scenario: Custom cart notes
- **WHEN** custom notes are added to cart items
- **THEN** the system sanitizes the input to prevent XSS
- **AND** validates maximum length of 200 characters
