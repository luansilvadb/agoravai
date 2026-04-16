# Story 7.2: Exportar Extrato em CSV

Status: review

## Story

As a user,
I want to export my statement as CSV,
So that I can analyze it in spreadsheets or share with my accountant.

## Acceptance Criteria

### AC 7.2.1: CSV Export Button
**Given** a user generated a report
**When** they click "Exportar CSV"
**Then** download starts in < 5s for periods up to 12 months

### AC 7.2.2: CSV File Format
**Given** the user exports to CSV
**Then** the file has BOM UTF-8 (Excel compatible)
**And** columns are separated by `;` (Brazilian standard)
**And** the file includes: Date, Description, Category, Type, Amount, Accumulated Balance

### AC 7.2.3: Access Log
**Given** a user exports to CSV
**Then** access log records export with `user_id`, `action: "export_csv"`, `ip_address`

### AC 7.2.4: Performance
**Given** a tenant with up to 1,000 transactions
**When** exporting CSV for a 12-month period
**Then** download starts in < 5s (p95) as per NFR3

### AC 7.2.5: API Integration
**Given** an authenticated request to CSV export endpoint
**When** the system processes the request
**Then** it validates RBAC permissions (admin, operational, or viewer)
**And** it applies tenant isolation
**And** it generates CSV with proper formatting
**And** it returns file as attachment

## Tasks / Subtasks

- [x] Backend: Add CSV export endpoint (AC: 7.2.1, 7.2.2, 7.2.4, 7.2.5)
  - [ ] Add GET /reports/export/csv endpoint in reports.ts
  - [ ] Implement CSV generation with BOM UTF-8
  - [ ] Use semicolon (;) as separator
  - [ ] Include all required columns
  - [ ] Optimize for performance (< 5s)
- [x] Backend: Add access log for export (AC: 7.2.3)
  - [ ] Import and use accessLogService
  - [ ] Log user_id, action: "export_csv", ip_address
- [x] Frontend: Add export button to ReportsView (AC: 7.2.1)
  - [ ] Add "Exportar CSV" button
  - [ ] Call API endpoint on click
  - [ ] Handle file download response
  - [ ] Show loading state during export
- [ ] Tests: Verify implementation (AC: All)
  - [ ] Test CSV format with BOM UTF-8
  - [ ] Test semicolon separator
  - [ ] Test access log recording
  - [ ] Test performance requirements

## Dev Notes

- Reuse existing reportService.getFinancialStatement() to get data
- Add BOM (Byte Order Mark) at the beginning: `\uFEFF`
- Use semicolon as separator (Brazilian standard for Excel compatibility)
- Access log should use the existing accessLogService patterns
- The export should work for the same date range as the generated report

### Project Structure Notes

- Backend: Extend existing backend/src/routes/reports.ts
- Frontend: Update existing frontend/src/views/ReportsView.vue

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.2: Exportar Extrato em CSV]
- [Source: _bmad-output/implementation-artifacts/7-1-gerar-extrato-por-periodo.md] (Previous story for patterns)

## Dev Agent Record

### Agent Model Used

(to be filled by implementing agent)

### Debug Log References

(to be filled during implementation)

### Completion Notes List

- Implementado endpoint GET /reports/export/csv no backend
- Adicionado geração de CSV com BOM UTF-8 e separador ponto-e-vírgula
- Implementado acesso via auditLogService para registrar exports
- Adicionado botão "Exportar CSV" na interface ReportsView.vue
- Implementado download de arquivo no frontend com Blob API

### File List

Backend:
- backend/src/routes/reports.ts (extend)
- backend/src/services/reportService.ts (add getFinancialStatementForExport)

Frontend:
- frontend/src/views/ReportsView.vue (update)