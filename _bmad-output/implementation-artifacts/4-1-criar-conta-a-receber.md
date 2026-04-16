# Story 4.1: Criar Conta a Receber

Status: done

## Story

As an Admin or Operational user,
I want to create a receivable account with description, amount, due date, and category,
So that I can track what my business is owed.

## Acceptance Criteria

### AC 4.1.1: Create Receivable Account Form
**Given** an Admin or Operational user accesses `/accounts-receivable` and clicks "Nova Conta a Receber"
**When** they fill in description (required), amount (BRL mask), due date (default: today + 15 days) and category (autocomplete)
**Then** the Zod validates all fields in the backend
**And** if amount is negative, returns HTTP 400 with "O valor deve ser um número positivo"
**And** if valid, saves to database with status "pending"
**And** value is stored as INTEGER in cents
**And** audit log registers the creation
**And** returns HTTP 201 with `{ data: { id, description, amount, dueDate, category, status: "pending" } }`
**And** toast: "Conta a receber criada!"

### AC 4.1.2: Category Autocomplete for Receivables
**Given** the category field is in focus for receivable account
**When** the user starts typing
**Then** the autocomplete filters existing categories by name
**And** if no match, displays button "+ Criar categoria" (Admin only)

### AC 4.1.3: API Endpoints for Receivable Account Creation
**Given** an authenticated request to receivable account creation endpoint
**When** the system processes the request
**Then** it validates RBAC permissions (admin or operational only)
**And** it applies tenant isolation
**And** it handles input validation properly
**And** it returns appropriate success/error responses

### AC 4.1.4: Currency Handling for Receivables
**Given** a user enters an amount in the form
**When** the system processes the amount
**Then** the amount is converted to INTEGER cents (e.g., R$ 1.234,56 → `123456`)
**And** ensures no floating point precision errors
**And** validates positive amounts only

### AC 4.1.5: Role-Based Access Control
**Given** a user with different roles attempts to create a receivable account
**When** they submit the form
**Then** admin and operational users can create
**And** viewer users cannot create (should get 403 error)

## Tasks / Subtasks

- [x] Implement backend receivable account creation endpoint (AC: 4.1.1, 4.1.3, 4.1.4, 4.1.5)
  - [x] Create receivable account creation function in accountService.ts
  - [x] Create accounts-receivable route with proper middleware chain (authenticate → attachTenant → requireRole)
  - [x] Implement Zod validation for input fields
  - [x] Implement audit logging for creation
  - [x] Implement currency conversion to INTEGER cents
  - [x] Handle negative amount validation
  - [x] Implement RBAC enforcement (admin/operational only)
- [x] Implement frontend receivable account creation interface (AC: 4.1.1, 4.1.2)
  - [x] Create AccountReceivableForm.vue component for creating receivable accounts
  - [x] Implement BRL currency mask for amount field
  - [x] Implement category autocomplete with filtering
  - [x] Create accounts-receivable store with Pinia for state management
  - [x] Add "Nova Conta a Receber" button in AccountsReceivableView
- [x] Create comprehensive tests (AC: All)
  - [x] Unit test for receivable account creation service function
  - [x] Integration test for receivable account creation endpoint
  - [x] Test tenant isolation (users from one tenant can't access another's accounts)
  - [x] Test RBAC enforcement (only admin/operational can create)
  - [x] Test currency conversion and validation
  - [x] Test negative amount validation
  - [x] Test audit logging

## Dev Notes

- Focus on reusing existing patterns from the payable accounts implementation
- Use the same middleware chain as other authenticated endpoints (authenticate → attachTenant → requireRole)
- Implement proper audit logging for all receivable account operations
- The AccountReceivableForm.vue component should be similar to AccountForm.vue but for receivables
- Consider sharing common functionality between payable and receivable account forms
- Ensure proper tenant isolation in all database queries
- Use the same currency handling (INTEGER cents) as payable accounts

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Middleware in `backend/src/middleware/`
- Database migrations already exist for accounts_receivable table

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1: Criar Conta a Receber]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Interações Sem Esforço]

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

All tests pass successfully including:
- Receivable account creation service tests
- Tenant isolation tests for receivable accounts
- RBAC enforcement tests for receivable accounts
- Currency conversion and validation tests
- Audit logging tests for receivable accounts

### Completion Notes List

- Successfully implemented receivable account creation functionality allowing admin and operational users to create receivable accounts
- Backend changes: Created accounts-receivable routes with proper middleware chain, implemented Zod validation, added audit logging for receivable account creation
- Frontend changes: Created AccountReceivableForm.vue component for receivable account creation, implemented BRL currency mask and category autocomplete
- API: Created accountsReceivable.ts API module with all necessary endpoints

### File List

Backend:
- backend/src/routes/accounts-receivable.ts
- backend/src/app.ts
- backend/src/services/accountService.ts

Frontend:
- frontend/src/components/Accounts/AccountReceivableForm.vue
- frontend/src/api/accountsReceivable.ts