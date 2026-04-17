---
phase: 002-core-data
plan: 03
type: execute
wave: 2
depends_on:
  - 002-01-storage-module
  - 002-02-data-models
files_modified:
  - js/transactions.js
  - index.html
  - css/components.css
autonomous: true
requirements:
  - REQ-002
---

## Objective
Implementar CRUD completo de transações com formulário, lista e inline validation.

## Context
- Decisão: Inline validation — borda vermelha + mensagem abaixo do campo
- Decisão: EventBus para comunicação (subscribe/publish)
- Depende de: Storage module e Transaction model

## Tasks

### Task 1: Transactions Manager Core
**Files:** `js/transactions.js`

**Action:**
1. Criar classe `TransactionsManager`:
   ```javascript
   import Storage from './storage.js';
   import Transaction from './models/Transaction.js';
   
   class TransactionsManager {
     constructor() {
       this.form = document.getElementById('transaction-form');
       this.list = document.getElementById('transactions-list');
       this.categorySelect = this.form?.querySelector('[name="categoryId"]');
       this.errorsContainer = this.form?.querySelector('.form-errors') || null;
       this.init();
     }
   ```

2. Método `init()`:
   - Chamar `populateCategories()`
   - Chamar `bindEvents()`
   - Chamar `render()`
   - Subscribe ao EventBus: `EventBus.subscribe('transactions:changed', () => this.render())`

3. Método `populateCategories()`:
   - Filtrar por tipo (expense/income)
   - Popular `<select name="categoryId">`
   - Atualizar quando tipo muda

4. Método `bindEvents()`:
   - Form submit: `handleSubmit(e)`
   - Type change: atualiza categorias
   - List click delegation: delete buttons

5. Método `handleSubmit(e)`:
   - `e.preventDefault()`
   - Criar Transaction de FormData
   - Chamar `validate()`
   - Se erros: `showValidationErrors(errors)`
   - Se OK: `Storage.saveTransaction()`, `EventBus.publish()`, `form.reset()`, `clearErrors()`

6. Método `deleteTransaction(id)`:
   - Confirm: "Tem certeza que deseja excluir esta transação?"
   - Se sim: `Storage.deleteTransaction(id)`, `EventBus.publish('transactions:changed')`

7. Método `render()`:
   - Buscar transações, ordenar por data (mais recente)
   - Renderizar lista HTML com ícones de categoria
   - Empty state: "Nenhuma transação cadastrada"

8. Exportar e inicializar: `export default TransactionsManager`

**Verify:** Adicionar transação → aparece na lista → F5 → persiste

**Done:** CRUD funcional com lista renderizada

---

### Task 2: Inline Validation UI
**Files:** `js/transactions.js`, `css/components.css`

**Action:**
1. Método `showValidationErrors(errors)`:
   ```javascript
   showValidationErrors(errors) {
     // Limpar erros anteriores
     this.clearErrors();
     
     // Agrupar por campo
     const byField = {};
     errors.forEach(e => {
       if (!byField[e.field]) byField[e.field] = [];
       byField[e.field].push(e.message);
     });
     
     // Aplicar a cada campo
     Object.entries(byField).forEach(([field, messages]) => {
       const input = this.form.querySelector(`[name="${field}"]`);
       if (input) {
         input.classList.add('input--error');
         input.setAttribute('aria-invalid', 'true');
         
         // Criar mensagem abaixo do campo
         const errorEl = document.createElement('span');
         errorEl.className = 'input-error-message';
         errorEl.textContent = messages.join(', ');
         input.parentNode.appendChild(errorEl);
       }
     });
   }
   ```

2. Método `clearErrors()`:
   - Remover classe `.input--error` de todos os inputs
   - Remover `aria-invalid`
   - Remover elementos `.input-error-message`

3. CSS em `components.css`:
   ```css
   .input--error {
     border-color: var(--color-danger) !important;
     box-shadow: 0 0 0 3px var(--color-danger-light);
   }
   
   .input-error-message {
     color: var(--color-danger);
     font-size: 0.75rem;
     margin-top: var(--space-1);
     display: block;
   }
   ```

4. Limpar erros no input focus:
   - Adicionar listener `focus` em cada input para limpar erro específico

**Verify:** Submit com campos vazios → bordas vermelhas + mensagens aparecem → corrigir → erros somem

**Done:** Inline validation funcional

---

### Task 3: Transaction Item UI
**Files:** `js/transactions.js`, `css/components.css`

**Action:**
1. Método `renderTransaction(t)`:
   ```javascript
   renderTransaction(t) {
     const category = Storage.getCategories().find(c => c.id === t.categoryId);
     const isIncome = t.type === 'income';
     
     return `
       <div class="transaction-item" data-id="${t.id}">
         <div class="transaction-icon" style="background: ${category?.color || '#ccc'}">
           <i data-lucide="${category?.icon || 'help-circle'}"></i>
         </div>
         <div class="transaction-info">
           <div class="transaction-description">${this.escapeHtml(t.description)}</div>
           <div class="transaction-meta">
             ${category?.name || 'Sem categoria'} • ${this.formatDate(t.date)}
           </div>
         </div>
         <div class="transaction-amount ${isIncome ? 'positive' : 'negative'}">
           ${isIncome ? '+' : '-'} ${this.formatCurrency(t.amount)}
         </div>
         <button class="btn btn--ghost btn--sm delete-btn" data-id="${t.id}" aria-label="Excluir">
           <i data-lucide="trash-2"></i>
         </button>
       </div>
     `;
   }
   ```

2. Helpers: `escapeHtml()`, `formatDate()`, `formatCurrency()`

3. CSS para `.transaction-item`:
   - Flex layout, align center
   - Hover effect sutil
   - Padding, border-bottom

4. Após renderizar: chamar `lucide.createIcons()` para ícones

**Verify:** Lista renderiza com ícones coloridos, valores formatados, botão delete

**Done:** Transaction items com UI polida

## Verification
- [ ] Pode adicionar transação (todos os campos)
- [ ] Validação inline mostra erros por campo
- [ ] Pode excluir transação (com confirmação)
- [ ] Lista ordenada por data (mais recente)
- [ ] Dashboard atualiza via EventBus

## Success Criteria
- CRUD completo funcional
- Validação inline clara
- UI consistente com Fase 1
- EventBus conecta componentes
