# Story 2.2: Gestão de Empresa

Status: done

## Story

As an Admin,
I want to edit my company's information and view all transactions,
So that my business data is accurate and I have full visibility.

## Acceptance Criteria

### AC 2.2.1: Edit Company Information

**Given** an Admin accesses `/settings`
**When** they navigate to the company information section
**Then** they can view current company details (name, CNPJ, email)
**And** they can edit these details
**And** upon saving, the changes persist
**And** toast appears: "Company data updated"
**And** the CNPJ validation (módulo 11) is applied on update
**And** validation errors are shown if data is invalid

### AC 2.2.2: View Company Transactions

**Given** an Admin accesses `/settings`
**When** they navigate to the transactions section
**Then** they see a list of all transactions for their company
**And** the list includes all accounts payable and receivable
**And** the list includes all users, categories and company data
**And** all data is filtered by tenant_id for security isolation

### AC 2.2.3: API Endpoints for Company Management

**Given** an authenticated request to company management endpoints
**When** the system processes the request
**Then** it validates RBAC permissions (admin only)
**And** it applies tenant isolation
**And** it validates CNPJ using módulo 11 algorithm on updates
**And** it handles errors gracefully with proper error codes

### AC 2.2.4: Validation and Security

**Given** an Admin tries to update company information
**When** they submit invalid data (invalid CNPJ, invalid email format)
**Then** appropriate validation errors are returned
**And** the data is not persisted
**And** user-friendly error messages are displayed

## Tasks / Subtasks

- [x] Implement backend company management endpoints (AC: 2.2.1, 2.2.2, 2.2.3, 2.2.4)
  - [x] Create companyService.ts with functions for company information management
  - [x] Create company routes with proper middleware chain (authenticate → attachTenant → requireRole)
  - [x] Implement CNPJ validation using módulo 11 algorithm
  - [x] Create validation schemas for company data with Zod
  - [x] Implement proper error handling and security measures
- [x] Implement frontend company management interface (AC: 2.2.1, 2.2.2)
  - [x] Update SettingsView.vue to include company information section
  - [x] Create CompanyInfo.vue component for viewing and editing company details
  - [x] Create TransactionOverview.vue component for showing all tenant transactions
  - [x] Create company store with Pinia for state management
- [x] Create comprehensive tests (AC: All)
  - [x] Unit test for company management service functions
  - [x] Integration test for company management endpoints
  - [x] Test CNPJ validation with valid and invalid numbers
  - [x] Test tenant isolation (admins from other tenants can't access each other's data)
  - [x] Test role-based access control (non-admins can't update company info)
  - [x] Test proper error handling

## Dev Notes

- All company operations must respect tenant isolation
- CNPJ validation must use the módulo 11 algorithm
- Implement proper error handling and validation with Zod
- Apply role-based access control (admin only)
- All views must be filtered by tenant_id
- Use the same middleware chain as other authenticated endpoints
- This story builds on the RBAC and tenant isolation implemented in Story 2.1
- The focus is on allowing Admins to manage their company's information and get an overview of all their transactions within their tenant

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Validation schemas in `backend/src/validation/`
- Middleware in `backend/src/middleware/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2: Gestão de Empresa]
- [Source: _bmad-output/planning-artifacts/architecture.md#Users & RBAC]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design que perdoa]

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

All tests pass successfully including:
- Company management service tests
- Tenant isolation tests
- CNPJ validation tests
- Authentication tests
- RBAC enforcement tests

### Completion Notes List

- Successfully implemented company management functionality allowing admins to edit company information and view all transactions
- Backend changes: Created companyService.ts with functions for company information management, implemented CNPJ validation using módulo 11 algorithm, created proper validation schemas with Zod, implemented security measures and proper error handling
- Frontend changes: Updated SettingsView.vue to include company information section, created CompanyInfo.vue component for viewing and editing, created TransactionOverview.vue component for showing all tenant transactions, implemented company store with Pinia
- Testing: Created comprehensive tests for all company management functions, validated CNPJ validation with various inputs, confirmed tenant isolation, verified RBAC enforcement

### File List

Backend:
- backend/src/services/companyService.ts
- backend/src/routes/company.ts
- backend/src/validation/companySchema.ts
- backend/tests/companyService.test.ts

Frontend:
- frontend/src/views/SettingsView.vue
- frontend/src/components/CompanyManagement/CompanyInfo.vue
- frontend/src/components/CompanyManagement/TransactionOverview.vue
- frontend/src/stores/company.ts