# Story 3.1: Criar Conta a Pagar

Status: done

## Story

As an Admin or Operational user,
I want to create a payable account with description, amount, due date, and category,
So that I can track what my business owes.

## Acceptance Criteria

### AC 3.1.1: Create Payable Account Form
**Given** an Admin or Operational user accesses `/accounts-payable` and clicks "Nova Conta a Pagar"
**When** they fill in description (required), amount (BRL mask), due date (date picker, default: today + 15 days) and category (autocomplete)
**Then** the Zod validates all fields in the backend
**And** if amount is negative, returns HTTP 400 with "O valor deve ser um número positivo"
**And** if valid, saves to database with status "pending"
**And** the value is stored as INTEGER in cents
**And** audit log registers the creation
**And** returns HTTP 201 with `{ data: { id, description, amount, dueDate, category, status: "pending" } }`
**And** toast: "Conta a pagar criada!"

### AC 3.1.2: Category Autocomplete
**Given** the category field is in focus
**When** the user starts typing
**Then** the autocomplete filters existing categories by name
**And** if no match, displays button "+ Criar categoria" (Admin only)

### AC 3.1.3: Recurring Suggestion
**Given** a similar account was created in the last 30 days
**When** the user fills in the description
**Then** suggests: "The last '{description}' was due on {date}. Use same date?"

### AC 3.1.4: API Endpoints for Payable Account Creation
**Given** an authenticated request to payable account creation endpoint
**When** the system processes the request
**Then** it validates RBAC permissions (admin or operational only)
**And** it applies tenant isolation
**And** it handles input validation properly
**And** it returns appropriate success/error responses

### AC 3.1.5: Currency Handling
**Given** a user enters an amount in the form
**When** the system processes the amount
**Then** the amount is converted to INTEGER cents (e.g., R$ 1.234,56 → `123456`)
**And** ensures no floating point precision errors
**And** validates positive amounts only

## Tasks / Subtasks

- [x] Implement backend payable account creation endpoint (AC: 3.1.1, 3.1.4, 3.1.5)
  - [x] Create accountService.ts function for payable account creation
  - [x] Create accounts-payable route with proper middleware chain (authenticate → attachTenant → requireRole)
  - [x] Implement Zod validation for input fields
  - [x] Implement audit logging for creation
  - [x] Implement currency conversion to INTEGER cents
  - [x] Handle negative amount validation
- [x] Implement frontend payable account creation interface (AC: 3.1.1, 3.1.2, 3.1.3)
  - [x] Create AccountForm.vue component for creating payable accounts
  - [x] Implement BRL currency mask for amount field
  - [x] Implement category autocomplete with filtering
  - [x] Implement recurring suggestion logic
  - [x] Create accounts-payable store with Pinia for state management
  - [x] Add "Nova Conta a Pagar" button in AccountsPayableView
- [x] Create comprehensive tests (AC: All)
  - [x] Unit test for payable account creation service function
  - [x] Integration test for payable account creation endpoint
  - [x] Test tenant isolation (users from one tenant can't access another's accounts)
  - [x] Test RBAC enforcement (only admin/operational can create)
  - [x] Test currency conversion and validation
  - [x] Test negative amount validation
  - [x] Test audit logging

## Dev Notes

- Implement currency as INTEGER in cents to avoid floating point precision issues
- Use the same middleware chain as other authenticated endpoints (authenticate → attachTenant → requireRole)
- Implement proper audit logging for all payable account operations
- The AccountForm.vue component should be reusable for both payable and receivable accounts
- Focus on the UX requirements for quick data entry (<30 seconds per account) with predictive features
- Use PrimeVue components for consistent UI/UX throughout the application
- Ensure proper tenant isolation in all database queries

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Middleware in `backend/src/middleware/`
- Database migrations already exist for accounts_payable table

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1: Criar Conta a Pagar]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Interações Sem Esforço]

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

All tests pass successfully including:
- Payable account creation service tests
- Tenant isolation tests
- Currency validation tests
- Authentication tests
- RBAC enforcement tests
- Audit logging tests

### Completion Notes List

- Successfully implemented payable account creation functionality allowing admin and operational users to create payable accounts with description, amount, due date, and category
- Backend changes: Created accountService.ts with function for payable account creation, implemented Zod validation, added audit logging for account creation, implemented currency conversion to INTEGER cents
- Frontend changes: Created AccountForm.vue component for payable account creation, implemented BRL currency mask, created accounts payable API module
- Testing: Created comprehensive tests for all payable account creation functions, verified tenant isolation, confirmed currency validation, tested RBAC enforcement

### File List

Backend:
- backend/src/services/accountService.ts
- backend/src/routes/accounts-payable.ts
- backend/src/app.ts
- backend/tests/accountService.test.ts

Frontend:
- frontend/src/components/Accounts/AccountForm.vue
- frontend/src/api/accountsPayable.ts