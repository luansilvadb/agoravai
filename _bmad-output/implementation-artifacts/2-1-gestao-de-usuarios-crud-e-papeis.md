# Story 2.1: Gestão de Usuários — CRUD e Papéis

Status: done

## Story

As an Admin,
I want to manage users in my company (assign roles, remove, change roles),
So that I control who has access and what they can do.

## Acceptance Criteria

### AC 2.1.1: View Users List Page

**Given** an Admin accesses `/users`
**When** the page loads
**Then** they see a list of all users in the tenant with: name, email, role, registration date
**And** pagination of 20 items per page
**And** the list is filtered by tenant_id

### AC 2.1.2: Change User Role

**Given** an Admin wants to change a user's role
**When** they select a user and choose a new role (Admin, Operational, Viewer)
**Then** the permission is applied immediately
**And** an audit log entry is recorded
**And** a toast appears: "Role of {name} changed to {role}"
**And** the change is persisted in the database

### AC 2.1.3: Remove User

**Given** an Admin wants to remove a user
**When** they click "Remove" and confirm
**Then** the user is marked with `deleted_at` (soft delete)
**And** the user loses access on their next request
**And** the data created by the user remains (not deleted)
**And** a toast appears: "{name} removed from company"
**And** an audit log entry is recorded

### AC 2.1.4: Permission Enforcement

**Given** a user with role changed from Operational to Viewer
**When** they try to create/edit an account
**Then** they receive HTTP 403 with toast "You don't have permission for this action"
**And** the frontend hides create/edit buttons that they don't have permission for

### AC 2.1.5: API Endpoints

**Given** an authenticated request to user management endpoints
**When** the system processes the request
**Then** it validates RBAC permissions using requireRole middleware
**And** it applies tenant isolation using attachTenant middleware
**And** it handles errors gracefully with proper error codes

## Tasks / Subtasks

- [x] Implement backend user management API endpoints (AC: 2.1.1, 2.1.2, 2.1.3, 2.1.5)
  - [x] Create userService.ts with functions for user management (list, get by id, update role, remove)
  - [x] Create user routes with proper middleware chain (authenticate → attachTenant → requireRole)
  - [x] Implement soft delete functionality for users
  - [x] Implement audit logging for all user operations
- [x] Implement frontend user management interface (AC: 2.1.1, 2.1.2, 2.1.3, 2.1.4)
  - [x] Create UsersView.vue with user list and management controls
  - [x] Create UserList.vue component to display users with pagination
  - [x] Create UserActions.vue component for role changes and removal
  - [x] Implement Pinia store for user management state
  - [x] Create useUserPermissions composable for permission checks
- [x] Implement role-based access control (AC: 2.1.4)
  - [x] Update rbac middleware to properly handle role changes
  - [x] Implement frontend permission checks to hide/disable unauthorized actions
- [x] Create comprehensive tests (AC: All)
  - [x] Unit test for user management service functions
  - [x] Integration test for user management endpoints with different roles
  - [x] Test tenant isolation (users from tenant A cannot access users from tenant B)
  - [x] Test role-based access control enforcement
  - [x] Test soft delete functionality
  - [x] Test audit logging for user management operations

## Dev Notes

- All user operations must respect tenant isolation (users from other tenants should not be accessible)
- Use soft deletes (set deleted_at instead of physical deletion)
- Implement proper audit logging for all user management operations
- Apply role-based access control with middleware chain (authenticate → attachTenant → requireRole)
- Frontend should reflect role changes immediately in UI elements and available actions
- This story builds on the authentication and authorization foundation established in Epic 1
- The key focus is on RBAC implementation and ensuring proper tenant isolation throughout all user management operations

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Composables in `frontend/src/composables/`
- Database migrations in `backend/src/db/migrations/`
- Middleware in `backend/src/middleware/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1: Gestão de Usuários — CRUD e Papéis]
- [Source: _bmad-output/planning-artifacts/architecture.md#Users & RBAC]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback de erro/permissão]

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

All tests pass successfully including:
- User management service tests
- Tenant isolation tests
- Authentication tests
- RBAC enforcement tests
- Audit logging tests

### Completion Notes List

- Successfully implemented user management functionality with CRUD operations and role management
- Backend changes: Created userService.ts with functions for user management (list, get by id, update role, remove), implemented proper tenant isolation and soft delete, added audit logging for all user operations
- Frontend changes: Created UsersView.vue with user list and management controls, implemented proper pagination, added role change and removal functionality
- Testing: Created comprehensive tests for all user management functions, verified tenant isolation, confirmed RBAC enforcement
- Security: Implemented proper tenant isolation throughout all user operations, enforced RBAC with middleware, used soft deletes to maintain data integrity

### File List

Backend:
- backend/src/services/userService.ts
- backend/src/routes/users.ts
- backend/src/middleware/rbac.ts
- backend/src/services/auditLogService.ts
- backend/tests/userService.test.ts

Frontend:
- frontend/src/views/UsersView.vue
- frontend/src/components/UserManagement/UserList.vue
- frontend/src/components/UserManagement/UserActions.vue
- frontend/src/stores/users.ts
- frontend/src/composables/useUserPermissions.ts