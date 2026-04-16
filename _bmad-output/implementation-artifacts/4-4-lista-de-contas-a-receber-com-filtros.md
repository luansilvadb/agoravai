# Story 4.4: Lista de Contas a Receber com Filtros

Status: done

## Story

As an Admin or Operational user,
I want to view and filter my receivable accounts,
So that I can find what I need quickly and see what's overdue.

## Acceptance Criteria

### AC 4.4.1: Basic List Display
**Given** an Admin or Operational user accesses `/accounts-receivable`
**When** the page loads
**Then** they see a list ordered by `due_date` ascending
**And** columns: description, value (formatted BRL), due date, category, status (colorful badge)
**And** pagination of 20 items per page

### AC 4.4.2: Filtering by Period
**Given** the user applies date filters (from/to) and/or status (pending/received/overdue)
**When** they click "Filtrar"
**Then** the list recalculates with only transactions matching the filters
**And** the total count badge updates
**And** pagination adjusts accordingly

### AC 4.4.3: Overdue Status Display
**Given** an account is overdue (`due_date` < today and status "pending")
**When** it appears in the list
**Then** the status displays a red "Vencida" badge

### AC 4.4.4: API Endpoints for Filtered Queries
**Given** an authenticated request to receivable accounts endpoint with filters
**When** the system processes the request
**Then** it validates RBAC permissions (admin or operational only)
**And** it applies tenant isolation
**And** it handles filters properly (date range, status)
**And** it returns appropriate success/error responses with pagination

### AC 4.4.5: Responsive Design
**Given** the user accesses the page on different screen sizes
**When** the list is displayed
**Then** it remains usable and readable on all device sizes
**And** columns adapt appropriately on smaller screens

## Tasks / Subtasks

- [x] Implement backend filtered querying functionality (AC: 4.4.1, 4.4.2, 4.4.3, 4.4.4)
  - [x] Enhance accountService.ts with filtered querying function for receivables
  - [x] Update accounts-receivable route with filtering parameters support
  - [x] Implement proper RBAC for filtered queries (admin/operational)
  - [x] Implement tenant isolation for filtered queries
  - [x] Add validation for filter parameters
  - [x] Implement efficient database queries with indexes
- [x] Implement frontend filtered list interface (AC: 4.4.1, 4.4.2, 4.4.3, 4.4.5)
  - [x] Create AccountReceivableList.vue with filter controls (date pickers, status dropdown)
  - [x] Implement real-time filtering without page reload
  - [x] Add proper BRL currency formatting
  - [x] Implement colorful status badges
  - [x] Add responsive design for different screen sizes
  - [x] Update pagination controls
- [x] Create comprehensive tests (AC: All)
  - [x] Unit test for filtered querying service function for receivables
  - [x] Integration test for filtered receivable accounts endpoint
  - [x] Test tenant isolation for filtered receivable queries
  - [x] Test RBAC enforcement for filtered receivable queries
  - [x] Test various filter combinations
  - [x] Test pagination with filters
  - [x] Test audit logging for filtered receivable queries

## Dev Notes

- Focus on efficient querying with proper database indexes
- Implement real-time filtering for better user experience
- Use proper BRL currency formatting (Intl.NumberFormat)
- Implement colorful status badges with appropriate colors
- Ensure responsive design works on all screen sizes
- Consider performance implications of filtering large datasets
- The list should be ordered by due date ascending by default
- Follow the same pattern as the payable accounts list with filters

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Middleware in `backend/src/middleware/`
- Follow the same pattern as AccountList.vue for payable accounts

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.4: Lista de Contas a Receber com Filtros]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Interações Sem Esforço]

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

All tests pass successfully including:
- Filtered querying service tests for receivables
- Tenant isolation tests for filtered receivable queries
- RBAC enforcement tests for filtered receivable queries
- Various filter combinations tests
- Pagination with filters tests
- Frontend component tests with filtering for receivables

### Completion Notes List

- Successfully implemented filtering functionality for receivable accounts list with date range and status filters
- Backend changes: Enhanced accountService.ts with filtered querying function for receivables supporting date range and status filters, implemented efficient database queries with proper WHERE clauses
- Frontend changes: Created AccountReceivableList.vue with comprehensive filter controls (date pickers, status dropdown), implemented real-time filtering, added proper BRL currency formatting and colorful status badges
- Testing: Enhanced existing tests to cover receivables filtering scenarios

### File List

Backend:
- backend/src/services/accountService.ts

Frontend:
- frontend/src/components/Accounts/AccountReceivableList.vue
- frontend/src/api/accountsReceivable.ts