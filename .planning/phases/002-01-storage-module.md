---
phase: 002-core-data
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - js/storage.js
  - js/app.js
autonomous: true
requirements:
  - REQ-002
---

## Objective
Criar módulo de armazenamento LocalStorage com tratamento de erro e categorias padrão.

## Context
- Decisão: Toast notification para erro de storage cheio (QuotaExceededError)
- Decisão: Observer/Pub-Sub pattern (EventBus) para comunicação
- Código existente: Base HTML/CSS pronto da Fase 1

## Tasks

### Task 1: Storage Module Core
**Files:** `js/storage.js`

**Action:**
1. Criar objeto `Storage` com:
   - `KEYS` constantes para transactions, categories, settings
   - `get(key)`, `set(key, value)`, `update(key, updaterFn)`, `delete(key)`
   - Tratamento de erro: try/catch em todas as operações

2. Implementar tratamento de `QuotaExceededError`:
   - Detectar erro específico por `e.name === 'QuotaExceededError'`
   - Mostrar **toast notification**: "Armazenamento quase cheio. Exporte seus dados."
   - Usar função `showToast()` global (já existe no app.js)
   - Retornar `false` em caso de erro para caller lidar

3. Criar helpers específicos:
   - `getTransactions()`, `saveTransaction(transaction)`, `deleteTransaction(id)`
   - `getCategories()` — retorna defaults se vazio
   - `getSettings()`, `saveSettings(settings)`

4. Implementar `getDefaultCategories()` com 10 categorias (5 expense, 5 income) com cores e ícones Lucide

5. Exportar módulo: `export default Storage`

**Verify:** Abrir console → `Storage.getTransactions()` retorna array vazio → `Storage.saveTransaction({...})` persiste → Refresh → dados persistem

**Done:** Módulo Storage funcional com tratamento de erro

---

### Task 2: EventBus for Observer Pattern
**Files:** `js/app.js` (ou novo `js/eventbus.js`)

**Action:**
1. Criar `EventBus` simples:
   ```javascript
   const EventBus = {
     events: {},
     subscribe(event, callback) {
       if (!this.events[event]) this.events[event] = [];
       this.events[event].push(callback);
       return () => this.unsubscribe(event, callback);
     },
     publish(event, data) {
       if (!this.events[event]) return;
       this.events[event].forEach(cb => cb(data));
     },
     unsubscribe(event, callback) {
       if (!this.events[event]) return;
       this.events[event] = this.events[event].filter(cb => cb !== callback);
     }
   };
   ```

2. Exportar global: `window.EventBus = EventBus`

3. Integrar no Storage: após `saveTransaction` e `deleteTransaction`, chamar:
   - `EventBus.publish('transactions:changed', { type: 'save|delete', id })`

**Verify:** Console → `EventBus.subscribe('transactions:changed', console.log)` → adicionar transação → log aparece

**Done:** EventBus funcional, integrado ao Storage

## Verification
- [ ] Storage persiste dados no LocalStorage
- [ ] Toast aparece quando storage cheio (simular com grandes dados)
- [ ] EventBus dispara eventos em save/delete
- [ ] Categorias default carregam se vazio

## Success Criteria
- Dados persistem após refresh
- Erro de quota mostra toast
- Múltiplos componentes podem ouvir eventos
