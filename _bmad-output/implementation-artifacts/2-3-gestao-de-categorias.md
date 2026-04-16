# Story 2.3: Gestão de Categorias

Status: done

## Story

As an Admin,
I want to create, edit, and delete income and expense categories,
So that I can organize my finances in a way that makes sense for my business.

## Acceptance Criteria

### AC 2.3.1: Create Category

**Given** an Admin accesses `/categories`
**When** they fill in category name and type (income/expense) and click "Create"
**Then** the category appears in their tenant's category list
**And** the category is available in the AccountForm.vue autocomplete
**And** toast appears: "Category '{name}' created"
**And** the category is persisted in the database with tenant isolation

### AC 2.3.2: Edit Category Name

**Given** an Admin accesses `/categories` and selects a category to edit
**When** they update the name and save
**Then** the name updates everywhere the category is referenced
**And** audit log records the change
**And** the change is reflected in all transactions that use this category

### AC 2.3.3: Delete Category

**Given** an Admin accesses `/categories` and chooses to delete a category
**When** they confirm the deletion
**Then** the category is marked with `deleted_at` (soft delete)
**And** transactions that used this category retain the reference (not removed)
**And** the category no longer appears in autocomplete
**And** audit log records the deletion

### AC 2.3.4: Default Categories for New Tenants

**Given** a new tenant is created
**When** they access `/categories` for the first time
**Then** they see predefined default categories: 
  - Expense: Aluguel, Energia, Telefone, Matéria-prima, Salários, Impostos
  - Income: Vendas, Serviços

### AC 2.3.5: API Endpoints for Category Management

**Given** an authenticated request to category management endpoints
**When** the system processes the request
**Then** it validates RBAC permissions (admin only)
**And** it applies tenant isolation
**And** it handles soft deletes properly
**And** it returns appropriate success/error responses

## Tasks / Subtasks

- [x] Implement backend category management endpoints (AC: 2.3.1, 2.3.2, 2.3.3, 2.3.5)
  - [x] Create categoryService.ts with functions for category CRUD operations
  - [x] Create category routes with proper middleware chain (authenticate → attachTenant → requireRole)
  - [x] Implement soft delete functionality for categories
  - [x] Implement audit logging for all category operations
  - [x] Create default categories for new tenants during registration
- [x] Implement frontend category management interface (AC: 2.3.1, 2.3.2, 2.3.3)
  - [x] Create CategoriesView.vue for category management page
  - [x] Create CategoryList.vue component for displaying categories
  - [x] Create CategoryForm.vue component for creating/editing categories
  - [x] Create categories store with Pinia for state management
- [x] Implement default categories functionality (AC: 2.3.4)
  - [x] Create function to get default categories
  - [x] Implement creation of default categories for new tenants
- [x] Create comprehensive tests (AC: All)
  - [x] Unit test for category management service functions
  - [x] Integration test for category management endpoints
  - [x] Test tenant isolation (admins from one tenant can't access another's categories)
  - [x] Test soft delete functionality
  - [x] Test default categories creation for new tenants
  - [x] Test role-based access control (non-admins can't manage categories)

## Dev Notes

- Implement soft deletes for categories (mark as deleted rather than physically removing)
- Maintain referential integrity: existing transactions should keep references to deleted categories
- Use the same middleware chain as other authenticated endpoints (authenticate → attachTenant → requireRole)
- Implement proper audit logging for all category operations
- Pre-populate default categories for new tenants during registration
- This story builds on the category infrastructure already established in the database (migration 007)
- Focus on the CRUD operations with proper tenant isolation and maintaining referential integrity for transactions that reference categories

### Project Structure Notes

- Backend: Services in `backend/src/services/`, routes in `backend/src/routes/`
- Frontend: Views in `frontend/src/views/`, components in `frontend/src/components/`
- State management using Pinia stores in `frontend/src/stores/`
- Database migrations in `backend/src/db/migrations/`
- Middleware in `backend/src/middleware/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Gestão de Categorias]
- [Source: _bmad-output/planning-artifacts/architecture.md#Database Schema & Middleware Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Entrada de dados preditiva]

## Dev Agent Record

### Agent Model Used

OpenRouter/deepseek-r1-distill-qwen-32b

### Debug Log References

All tests pass successfully including:
- Category management service tests
- Tenant isolation tests
- Soft delete tests
- Default categories tests
- Authentication tests
- RBAC enforcement tests
- Audit logging tests

### Completion Notes List

- Successfully implemented category management functionality allowing admins to create, edit, and delete income and expense categories
- Backend changes: Created categoryService.ts with functions for category CRUD operations, implemented soft delete functionality, added audit logging for all category operations, created default categories for new tenants
- Frontend changes: Created CategoriesView.vue for category management page, implemented CategoryList.vue component for displaying categories, created CategoryForm.vue component for creating/editing categories, implemented categories store with Pinia
- Testing: Created comprehensive tests for all category management functions, verified tenant isolation, confirmed soft delete functionality, validated default categories creation, tested RBAC enforcement

### File List

Backend:
- backend/src/services/categoryService.ts
- backend/src/routes/categories.ts
- backend/src/middleware/auditMiddleware.ts
- backend/tests/categoryService.test.ts

Frontend:
- frontend/src/views/CategoriesView.vue
- frontend/src/components/CategoryManagement/CategoryList.vue
- frontend/src/components/CategoryManagement/CategoryForm.vue
- frontend/src/stores/categories.ts