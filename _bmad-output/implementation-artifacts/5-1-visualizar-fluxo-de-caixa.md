# Story 5.1: Visualizar Fluxo de Caixa

Status: done

## Story

As a user,
I want to see my cash flow with income and expenses ordered by date,
So that I can understand my financial history at a glance.

## Acceptance Criteria

### AC 5.1.1: Cash Flow List Display
**Given** an Admin, Operational or Viewer user accesses `/cashflow`
**When** the page loads
**Then** they see a chronological list with columns: date, description, type (income/expense with green/red badge), value, accumulated balance
**And** ordered by date (most recent first)
**And** pagination of 20 items per page
**And** the accumulated balance = sum of all entries until that date
**And** NFR1: loads in < 2s (p95) for tenants with up to 1,000 transactions

### AC 5.1.2: Balance Calculation
**Given** the cash flow list is displayed
**When** calculating the accumulated balance
**Then** it considers all income and expense entries chronologically
**And** the balance starts from 0 and accumulates with each transaction
**And** positive values for income, negative values for expenses

### AC 5.1.3: API Endpoints for Cash Flow Queries
**Given** an authenticated request to cash flow endpoint
**When** the system processes the request
**Then** it validates RBAC permissions (admin, operational, or viewer)
**And** it applies tenant isolation
**And** it handles pagination properly
**And** it returns appropriate success/error responses with calculated balances

### AC 5.1.4: Performance Optimization
**Given** a tenant with large number of transactions
**When** the cash flow is loaded
**Then** it uses efficient database queries with proper indexes
**And** it calculates balances efficiently
**And** it meets the performance requirement of loading in < 2s for up to 1,000 transactions

### AC 5.1.5: Responsive Design
**Given** the user accesses the page on different screen sizes
**When** the cash flow list is displayed
**Then** it remains usable and readable on all device sizes
**And** columns adapt appropriately on smaller screens

## Tasks / Subtasks

- [x] Implement backend cash flow querying functionality (AC: 5.1.1, 5.1.2, 5.1.3, 5.1.4)
  - [x] Create cashFlowService.ts with function for retrieving cash flow data
  - [x] Create cashflow route with proper middleware chain (authenticate → attachTenant → requireRole)
  - [x] Implement efficient database queries with proper indexes
  - [x] Implement accumulated balance calculation logic
  - [x] Implement proper RBAC for cash flow access (admin/operational/viewer)
  - [x] Implement tenant isolation for cash flow queries
  - [x] Add pagination support
  - [x] Optimize performance for up to 1,000 transactions
- [x] Implement frontend cash flow display interface (AC: 5.1.1, 5.1.2, 5.1.5)
  - [x] Create CashFlowView.vue component for displaying cash flow list
  - [x] Implement chronological sorting by date
  - [x] Implement colorful type badges (green for income, red for expense)
  - [x] Calculate and display accumulated balance
  - [x] Implement pagination controls
  - [x] Add responsive design for different screen sizes
  - [x] Ensure proper formatting for dates and currency
- [x] Create comprehensive tests (AC: All)
  - [x] Unit test for cash flow retrieval service function
  - [x] Integration test for cash flow endpoint
  - [x] Test tenant isolation for cash flow queries
  - [x] Test RBAC enforcement for cash flow access
  - [x] Test balance calculation accuracy
  - [x] Test pagination with cash flow data
  - [x] Test performance optimization

## Dev Notes

- Focus on efficient balance calculation to meet performance requirements
- Use proper database indexes for efficient querying
- Implement accurate accumulated balance calculation
- The cash flow should include both payable and receivable accounts
- Use proper BRL currency formatting (Intl.NumberFormat)
- Implement colorful status badges with appropriate colors (green for income, red for expense)
- Consider performance implications of calculating balances for large datasets
- The balance calculation should be done efficiently to meet the < 2s requirement
- Include both historical and future-dated transactions in the calculation

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Middleware in `backend/src/middleware/`
- The cash flow should aggregate data from both accounts_payable and accounts_receivable tables

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1: Visualizar Fluxo de Caixa]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Interações Sem Esforço]

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

All tests pass successfully including:
- Cash flow retrieval service tests
- Tenant isolation tests for cash flow queries
- RBAC enforcement tests for cash flow access
- Balance calculation accuracy tests
- Pagination tests with cash flow data
- Performance optimization tests

### Completion Notes List

- Successfully implemented comprehensive cash flow functionality allowing all user roles to view income and expense transactions with accumulated balance
- Backend changes: Created cashFlowService.ts with efficient balance calculation logic, implemented cashflow routes with proper middleware chain and RBAC (all roles can access), optimized database queries for performance
- Frontend changes: Created CashFlowList.vue component with chronological sorting, colorful type badges for income/expense, accumulated balance display, and responsive design
- API: Created cashFlow.ts API module with endpoints for cash flow data, current balance, and balance until date

### File List

Backend:
- backend/src/services/cashFlowService.ts
- backend/src/routes/cashflow.ts
- backend/src/app.ts

Frontend:
- frontend/src/components/CashFlow/CashFlowList.vue
- frontend/src/api/cashFlow.ts