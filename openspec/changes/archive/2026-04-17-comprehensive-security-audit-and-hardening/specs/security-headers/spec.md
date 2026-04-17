## ADDED Requirements

### Requirement: Security headers configured
The system SHALL include all essential security headers in HTTP responses.

#### Scenario: Response includes security headers
- **WHEN** any HTTP response is sent
- **THEN** the response includes the following headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY or SAMEORIGIN
  - X-XSS-Protection: 1; mode=block (legacy browsers)
  - Strict-Transport-Security: max-age=31536000; includeSubDomains
  - Referrer-Policy: strict-origin-when-cross-origin

### Requirement: HTTPS enforcement
The system SHALL enforce HTTPS in production environments.

#### Scenario: HTTP request in production
- **WHEN** a request is made over HTTP in production
- **THEN** the system redirects to HTTPS with 301 status
- **AND** sets HSTS header to prevent future HTTP access

### Requirement: Clickjacking protection
The system SHALL prevent the application from being embedded in iframes (clickjacking protection).

#### Scenario: Site embedded in iframe
- **WHEN** an attacker attempts to embed the site in an iframe on their domain
- **THEN** the browser blocks the rendering due to X-Frame-Options: DENY

### Requirement: Content-Type sniffing protection
The system SHALL prevent MIME type sniffing attacks.

#### Scenario: Malicious file upload
- **WHEN** a user uploads a file with misleading extension
- **THEN** the browser does not sniff content type due to X-Content-Type-Options: nosniff
- **AND** respects the Content-Type header set by the server

### Requirement: Referrer policy
The system SHALL control referrer information leakage.

#### Scenario: Cross-origin navigation
- **WHEN** a user navigates to an external link
- **THEN** the browser only sends origin (not full URL) as referrer due to Referrer-Policy
