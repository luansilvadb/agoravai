# Story 6.2: Dashboard - Top Categorias

Status: review

## Story

As a user,
I want to see my top income and expense categories,
So that I understand where my money is going.

## Acceptance Criteria

### AC 6.2.1: Top Expense Categories Display
**Given** a user accesses the dashboard
**When** the page loads
**Then** they see Top 5 expense categories by accumulated value in the current month
**And** displayed as a simple list (name + total value)
**And** no charts in MVP (deferred for Growth)

### AC 6.2.2: Top Income Categories Display
**Given** a user accesses the dashboard
**When** the page loads
**Then** they see Top 5 income categories by accumulated value in the current month
**And** displayed as a simple list (name + total value)
**And** no charts in MVP (deferred for Growth)

### AC 6.2.3: Empty State
**Given** the tenant has no transactions in the month
**When** the dashboard loads
**Then** they see the message "Nenhuma transação este mês"

### AC 6.2.4: API Integration
**Given** an authenticated request to dashboard endpoint for categories
**When** the system processes the request
**Then** it calculates top categories from accounts_payable and accounts_receivable tables
**And** it applies tenant isolation
**And** it aggregates by category within the current month
**And** it returns the top 5 for each type (expense/income)

### AC 6.2.5: Performance
**Given** a tenant with up to 1,000 transactions
**When** the dashboard loads top categories
**Then** the calculation completes in < 2s (p95) as per NFR1

## Tasks / Subtasks

- [x] Backend: Implement top categories calculation (AC: 6.2.1, 6.2.2, 6.2.4, 6.2.5)
  - [x] Add function in dashboardService.ts to calculate top expense categories
  - [x] Add function in dashboardService.ts to calculate top income categories
  - [x] Ensure tenant isolation is applied
  - [x] Add proper indexes for category aggregation queries
  - [x] Optimize query for performance (< 2s for 1,000 transactions)
- [x] Frontend: Add top categories display to DashboardView (AC: 6.2.1, 6.2.2, 6.2.3)
  - [x] Add TopCategories component or section to dashboard
  - [x] Display top 5 expense categories with values
  - [x] Display top 5 income categories with values
  - [x] Handle empty state with appropriate message
  - [x] Ensure responsive design
- [x] Integration: Connect frontend to backend API (AC: All)
  - [x] Update dashboard API to return top categories data
  - [x] Update frontend store to fetch top categories
  - [x] Ensure proper loading states
- [x] Tests: Verify implementation (AC: All)
  - [x] Unit test for top categories calculation
  - [x] Test tenant isolation for category queries
  - [x] Test performance requirements

## Dev Notes

- Follow the same architecture patterns established in Story 6-1 (Dashboard Saldo e Contas a Vencer)
- The top categories feature should integrate seamlessly with the existing dashboard
- Use the same API endpoint that returns balance and upcoming bills, or extend it to include categories
- Remember: no charts in MVP - just simple lists with name + value
- The aggregation should be for the current month only
- Consider reusing existing category data structures from accounts_payable and accounts_receivable

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Existing dashboardService.ts already handles balance and upcoming bills - extend it for top categories
- Categories are already stored in the categories table with type (income/expense)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2: Dashboard — Top Categorias]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Hierarquia Visual do Dashboard]
- [Source: _bmad-output/implementation-artifacts/6-1-dashboard-saldo-e-contas-a-vencer.md] (Previous story for patterns)

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

- Successfully implemented getTopExpenseCategories and getTopIncomeCategories functions in dashboardService.ts
- Extended dashboard API response to include topCategories object
- Updated DashboardOverview.vue to display top categories with proper empty state handling

### Completion Notes List

- Backend: Extended dashboardService.ts with getTopExpenseCategories and getTopIncomeCategories functions that aggregate transactions by category for current month with tenant isolation
- Backend: Updated getDashboardData to include top categories in the response
- Frontend: Updated DashboardOverview.vue to display Top Categorias section with two columns (expenses/income) and proper empty state handling
- Frontend: Integrated API response to show top 5 categories for each type with ranking numbers

### File List

Backend:
- backend/src/services/dashboardService.ts (extended)

Frontend:
- frontend/src/components/Dashboard/DashboardOverview.vue (extended)