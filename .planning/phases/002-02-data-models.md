---
phase: 002-core-data
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - js/models/Transaction.js
  - js/models/Category.js
autonomous: true
requirements:
  - REQ-002
---

## Objective
Criar modelos de dados Transaction e Category com validação completa.

## Context
- Decisão: Inline validation (borda vermelha + mensagem abaixo do campo)
- Modelos devem retornar erros claros para serem exibidos inline
- IDs via crypto.randomUUID() com fallback

## Tasks

### Task 1: Transaction Model
**Files:** `js/models/Transaction.js`

**Action:**
1. Criar classe `Transaction`:
   ```javascript
   class Transaction {
     constructor({ id, type, amount, description, categoryId, date, createdAt, updatedAt }) {
       this.id = id || this.generateId();
       this.type = type; // 'income' | 'expense'
       this.amount = Math.abs(parseFloat(amount) || 0);
       this.description = description?.trim() || '';
       this.categoryId = categoryId;
       this.date = date || new Date().toISOString().split('T')[0];
       this.createdAt = createdAt || new Date().toISOString();
       this.updatedAt = updatedAt || new Date().toISOString();
     }
   ```

2. Método `generateId()` com fallback:
   ```javascript
   generateId() {
     if (crypto.randomUUID) return crypto.randomUUID();
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
       const r = Math.random() * 16 | 0;
       return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
     });
   }
   ```

3. Método `validate()` retornando array de erros com campo específico:
   ```javascript
   validate() {
     const errors = [];
     
     if (!['income', 'expense'].includes(this.type)) {
       errors.push({ field: 'type', message: 'Tipo deve ser receita ou despesa' });
     }
     
     if (isNaN(this.amount) || this.amount <= 0) {
       errors.push({ field: 'amount', message: 'Valor deve ser maior que zero' });
     }
     if (this.amount > 999999999.99) {
       errors.push({ field: 'amount', message: 'Valor muito alto' });
     }
     
     if (!this.description || this.description.length < 3) {
       errors.push({ field: 'description', message: 'Descrição deve ter pelo menos 3 caracteres' });
     }
     if (this.description.length > 100) {
       errors.push({ field: 'description', message: 'Descrição muito longa (máx 100)' });
     }
     
     if (!this.categoryId) {
       errors.push({ field: 'categoryId', message: 'Selecione uma categoria' });
     }
     
     const dateObj = new Date(this.date);
     const maxDate = new Date();
     maxDate.setFullYear(maxDate.getFullYear() + 1);
     if (isNaN(dateObj.getTime()) || dateObj > maxDate) {
       errors.push({ field: 'date', message: 'Data inválida' });
     }
     
     return errors; // Array de { field, message } para inline display
   }
   ```

4. Método `toJSON()` para serialização

5. Exportar: `export default Transaction`

**Verify:** Console → `new Transaction({type:'expense', amount:100}).validate()` retorna erros de description/category

**Done:** Transaction model com validação retornando erros por campo

---

### Task 2: Category Model
**Files:** `js/models/Category.js`

**Action:**
1. Criar classe `Category`:
   ```javascript
   class Category {
     constructor({ id, name, type, color, icon, isDefault }) {
       this.id = id || this.generateId();
       this.name = name?.trim() || '';
       this.type = type; // 'income' | 'expense' | 'both'
       this.color = color || '#6b7280';
       this.icon = icon || 'circle';
       this.isDefault = isDefault || false;
     }
   ```

2. Método `validate()`:
   ```javascript
   validate() {
     const errors = [];
     
     if (!this.name || this.name.length < 2) {
       errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' });
     }
     if (this.name.length > 30) {
       errors.push({ field: 'name', message: 'Nome muito longo (máx 30)' });
     }
     
     if (!/^#[0-9A-Fa-f]{6}$/.test(this.color)) {
       errors.push({ field: 'color', message: 'Cor inválida (use formato #RRGGBB)' });
     }
     
     return errors;
   }
   ```

3. Métodos `generateId()` e `toJSON()`

4. Exportar: `export default Category`

**Verify:** `new Category({name:'A', color:'invalid'}).validate()` retorna 2 erros

**Done:** Category model com validação

## Verification
- [ ] Transaction.validate() retorna array de erros com campo específico
- [ ] Category.validate() valida nome e cor
- [ ] IDs geram corretamente (com e sem crypto.randomUUID)
- [ ] toJSON() serializa todos os campos

## Success Criteria
- Validação clara por campo (para inline display)
- UUID funciona em todos os navegadores
- Modelos exportáveis como ES modules
