# Phase 2: Core Data & Storage - Context

## Domain
Implementar persistência de dados com LocalStorage e CRUD completo de transações.

## Decisions

### Error Handling (Storage Full)
- **Toast notification** para avisar quando LocalStorage atingir limite (~5MB)
- Mensagem: "Armazenamento quase cheio. Exporte seus dados."
- Não bloqueia fluxo do usuário, mas é visível o suficiente para alertar

### Validation UX (Form Errors)
- **Inline por campo** — Borda vermelha no input + mensagem de erro abaixo do campo
- Validação em tempo real (on blur) ou apenas no submit? → **No submit** (evita feedback prematuro)
- Mensagens claras e específicas por campo

### Event Communication (Dashboard Updates)
- **Observer/Pub-Sub pattern** — `EventBus.subscribe('transactions', callback)`
- Mais estruturado que CustomEvent simples
- Permite múltiplos subscribers (dashboard, relatórios, etc.)
- Desacoplado entre módulos

### Data Models (Claude's Discretion)
- IDs via `crypto.randomUUID()` com fallback manual para compatibilidade
- Validação com métodos `validate()` retornando array de erros
- `toJSON()` para serialização

### Storage Module (Claude's Discretion)
- Wrapper LocalStorage com tratamento de `QuotaExceededError`
- Helpers específicos: `getTransactions()`, `saveTransaction()`, etc.
- Categorias default via `getDefaultCategories()` se storage vazio

## Deferred Ideas
- Edição de transações inline — requer UI mais complexa, pode ser fase futura
- Paginação de transações — backlog para quando lista crescer
- Undo/Redo — capacidade nova para backlog

## Canonical Refs
- `.planning/phases/phase-002-core-data.md` — Planos detalhados da fase
- `js/storage.js` — Módulo de storage (a criar)
- `js/models/Transaction.js` — Modelo de transação (a criar)
- `js/models/Category.js` — Modelo de categoria (a criar)

## Assumptions
- Navegador moderno com LocalStorage suportado
- `crypto.randomUUID()` disponível (com fallback implementado)
- Limite de 5MB do LocalStorage é suficiente para uso pessoal

## Notes
- Foco em funcionalidade, não UI perfeita (isso foi Fase 1)
- Lista simples sem paginação nesta fase
- Não implementar edição — delete + re-add é suficiente por agora

## Plans Created
- `002-01-storage-module.md` — Storage + EventBus + toast error
- `002-02-data-models.md` — Transaction + Category models com validation
- `002-03-crud-transactions.md` — CRUD com inline validation
- `002-04-formatters.md` — Utils de formatação (moeda, data)
