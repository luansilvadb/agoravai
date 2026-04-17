---
phase: 002-core-data
plan: 04
type: execute
wave: 2
depends_on:
  - 002-01-storage-module
files_modified:
  - js/utils.js
  - js/app.js
autonomous: true
requirements:
  - REQ-002
---

## Objective
Implementar formatadores de moeda, data e funções utilitárias.

## Context
- Depende de: Storage module (para acessar settings de locale/moeda)
- Usado por: TransactionsManager, Dashboard, outros módulos
- Precisa ser global para templates HTML inline

## Tasks

### Task 1: Formatters Module
**Files:** `js/utils.js`

**Action:**
1. Criar/importar Storage:
   ```javascript
   import Storage from './storage.js';
   ```

2. Implementar `formatCurrency(value)`:
   ```javascript
   export const formatCurrency = (value) => {
     const settings = Storage.getSettings();
     const num = typeof value === 'number' ? value : parseFloat(value) || 0;
     
     return new Intl.NumberFormat(settings.locale || 'pt-BR', {
       style: 'currency',
       currency: settings.currency || 'BRL'
     }).format(num);
   };
   ```

3. Implementar `formatDate(dateString)`:
   ```javascript
   export const formatDate = (dateString) => {
     const settings = Storage.getSettings();
     const date = new Date(dateString);
     
     if (isNaN(date.getTime())) return 'Data inválida';
     
     return new Intl.DateTimeFormat(settings.locale || 'pt-BR', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric'
     }).format(date);
   };
   ```

4. Implementar `formatDateShort(dateString)`:
   ```javascript
   export const formatDateShort = (dateString) => {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return '--';
     
     return new Intl.DateTimeFormat('pt-BR', {
       day: '2-digit',
       month: 'short'
     }).format(date);
   };
   ```

5. Implementar `parseCurrency(value)`:
   ```javascript
   export const parseCurrency = (value) => {
     if (typeof value === 'number') return value;
     if (!value) return 0;
     // Remove tudo exceto números, vírgula e ponto
     const cleaned = value.replace(/[^0-9.,-]/g, '');
     // Substitui vírgula por ponto e converte
     return parseFloat(cleaned.replace(',', '.')) || 0;
   };
   ```

6. Implementar `escapeHtml(str)`:
   ```javascript
   export const escapeHtml = (str) => {
     if (!str) return '';
     const div = document.createElement('div');
     div.textContent = str;
     return div.innerHTML;
   };
   ```

7. Exportar globais para templates HTML:
   ```javascript
   // Make available globally for inline HTML templates
   if (typeof window !== 'undefined') {
     window.formatCurrency = formatCurrency;
     window.formatDate = formatDate;
     window.formatDateShort = formatDateShort;
     window.parseCurrency = parseCurrency;
     window.escapeHtml = escapeHtml;
   }
   ```

8. Exportar ES modules:
   ```javascript
   export {
     formatCurrency,
     formatDate,
     formatDateShort,
     parseCurrency,
     escapeHtml
   };
   ```

**Verify:** Console → `formatCurrency(1234.56)` → "R$ 1.234,56"

**Done:** Formatters funcionais com locale

---

### Task 2: Import in App
**Files:** `js/app.js`

**Action:**
1. Adicionar import no topo:
   ```javascript
   import './utils.js';
   ```

2. Garantir que utils.js carrega antes de outros módulos que usam formatters

3. Testar que `window.formatCurrency` está disponível globalmente

**Verify:** `window.formatCurrency` definido após carregar app

**Done:** Formatters disponíveis globalmente

---

### Task 3: Update TransactionsManager to Use Formatters
**Files:** `js/transactions.js`

**Action:**
1. Usar `window.formatCurrency()`, `window.formatDate()`, `window.escapeHtml()` em `renderTransaction()`

2. Remover métodos locais se existirem (delegar para utils)

**Verify:** Lista de transações mostra valores formatados corretamente

**Done:** TransactionsManager usa formatters globais

## Verification
- [ ] `formatCurrency(1234.5)` → "R$ 1.234,50"
- [ ] `formatDate('2024-01-15')` → "15/01/2024"
- [ ] `escapeHtml('<script>')` → "&lt;script&gt;"
- [ ] Funciona com diferentes settings de locale

## Success Criteria
- Formatação de moeda correta (pt-BR)
- Formatação de data localizada
- Escape HTML funcional (segurança XSS)
- Globais disponíveis para templates
