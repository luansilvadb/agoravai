## ADDED Requirements

### Requirement: File size limits enforced
The system SHALL enforce maximum file size limits for all uploads.

#### Scenario: File within size limit
- **WHEN** a user uploads a file smaller than the maximum allowed size (e.g., 5MB)
- **THEN** the system accepts and processes the file normally

#### Scenario: File exceeds size limit
- **WHEN** a user attempts to upload a file larger than the maximum allowed
- **THEN** the system rejects the upload before processing
- **AND** returns a clear error indicating the maximum allowed size

#### Scenario: Size check before processing
- **WHEN** any file upload is initiated
- **THEN** the system checks the size before reading the entire file into memory
- **AND** rejects oversized files efficiently

### Requirement: File type validation
The system SHALL validate file types against an allowed whitelist.

#### Scenario: Allowed file type
- **WHEN** a user uploads a file with an allowed MIME type and extension
- **THEN** the system accepts the upload

#### Scenario: Disallowed file type
- **WHEN** a user uploads a file with a disallowed type (e.g., .exe, .php)
- **THEN** the system rejects the upload
- **AND** does not rely solely on file extension for validation

#### Scenario: MIME type spoofing attempt
- **WHEN** a user attempts to upload a malicious file with a spoofed MIME type
- **THEN** the system validates the actual file content
- **AND** rejects files whose content doesn't match the claimed type

### Requirement: File extension validation
The system SHALL validate file extensions against an allowed whitelist.

#### Scenario: Valid extension
- **WHEN** a user uploads a file with a permitted extension
- **THEN** the system proceeds with additional validation

#### Scenario: Executable extension blocked
- **WHEN** a user attempts to upload a file with an executable extension (.exe, .sh, .bat, etc)
- **THEN** the system immediately rejects the upload

### Requirement: Filename sanitization
The system SHALL sanitize filenames to prevent path traversal and injection attacks.

#### Scenario: Path traversal attempt
- **WHEN** a user uploads a file with name "../../../etc/passwd"
- **THEN** the system sanitizes the filename to remove path components
- **AND** stores the file with a safe, normalized name

#### Scenario: Special characters in filename
- **WHEN** a filename contains special characters
- **THEN** the system sanitizes or normalizes the name
- **AND** prevents execution of embedded scripts

### Requirement: Secure file storage
The system SHALL store uploaded files in a secure location with restricted access.

#### Scenario: File storage
- **WHEN** a file is successfully uploaded and validated
- **THEN** it is stored outside the web root or with restricted permissions
- **AND** cannot be directly executed via web access
