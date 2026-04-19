## ADDED Requirements

### Requirement: FileSystem interface definition
The system SHALL define an `IFileSystem` port interface for all file operations.

#### Scenario: Interface methods
- **WHEN** checking the IFileSystem interface
- **THEN** it MUST declare: `exists`, `mkdir`, `readdir`, `stat`, `copyFile`
- **AND** all methods MUST be synchronous

### Requirement: Path existence check
The system SHALL verify if a path exists.

#### Scenario: Existing path
- **WHEN** calling `exists("/valid/path")`
- **THEN** it MUST return `true`

#### Scenario: Non-existing path
- **WHEN** calling `exists("/invalid/path")`
- **THEN** it MUST return `false`

### Requirement: Directory creation
The system SHALL create directories recursively.

#### Scenario: Create nested directory
- **WHEN** calling `mkdir("/a/b/c", { recursive: true })`
- **AND** parent directories don't exist
- **THEN** all directories MUST be created

### Requirement: Directory listing
The system SHALL list directory entries.

#### Scenario: List files
- **WHEN** calling `readdir("/dir")`
- **THEN** it MUST return an array of entry names

### Requirement: File statistics
The system SHALL retrieve file/directory statistics.

#### Scenario: Check if directory
- **WHEN** calling `stat("/path")`
- **THEN** result MUST have `isDirectory(): boolean` method

### Requirement: File copy
The system SHALL copy files from source to destination.

#### Scenario: Successful copy
- **WHEN** calling `copyFile("/src", "/dest")`
- **AND** source exists
- **AND** destination doesn't exist or is writable
- **THEN** file MUST be copied successfully
