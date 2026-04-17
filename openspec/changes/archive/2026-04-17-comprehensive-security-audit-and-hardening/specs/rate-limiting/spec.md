## ADDED Requirements

### Requirement: Rate limiting on API endpoints
The system SHALL enforce rate limiting on all API endpoints to prevent abuse.

#### Scenario: Request within rate limit
- **WHEN** a client makes requests within the configured rate limit (e.g., 100 requests per 15 minutes)
- **THEN** the system processes all requests normally

#### Scenario: Request exceeding rate limit
- **WHEN** a client exceeds the rate limit
- **THEN** the system returns 429 Too Many Requests
- **AND** includes a Retry-After header indicating when to retry

#### Scenario: Rate limit reset
- **WHEN** the rate limit window resets
- **THEN** the client's request count resets to zero

### Requirement: Stricter limits for expensive operations
The system SHALL apply stricter rate limits for computationally expensive or sensitive operations.

#### Scenario: Search request rate limit
- **WHEN** a client makes search requests
- **THEN** the system enforces a lower limit (e.g., 10 requests per minute)
- **AND** returns 429 if exceeded

#### Scenario: Payment operation rate limit
- **WHEN** a client attempts payment operations
- **THEN** the system enforces aggressive rate limiting (e.g., 5 attempts per minute)
- **AND** may require additional verification after repeated failures

### Requirement: IP-based and user-based rate limiting
The system SHALL support both IP-based (anonymous) and user-based (authenticated) rate limiting.

#### Scenario: Authenticated user rate limit
- **WHEN** an authenticated user exceeds their per-user rate limit
- **THEN** only that user is rate limited, not other users from the same IP

#### Scenario: Anonymous user rate limit
- **WHEN** anonymous requests from an IP exceed the limit
- **THEN** requests from that IP are rate limited regardless of user

### Requirement: Rate limit communication
The system SHALL communicate rate limit status to clients via headers.

#### Scenario: Rate limit headers present
- **WHEN** any API request is made
- **THEN** the response includes X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers
