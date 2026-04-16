# Code Review Findings Report

**Generated:** 2026-04-15  
**Review Target:** Todas as mudanças não commitadas (backend + frontend)  
**Mode:** no-spec

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Crítico | 2 |
| 🟡 Médio | 6 |
| 🟢 Baixo | 0 |

---

## Action Items

### 🔴 CRÍTICO

| ID | Title | Location | Effort |
|----|-------|----------|--------|
| 1 | Audit Log Fora de Transação | accountService.ts:74-91 | 30min |
| 2 | Atomicidade MarkAsPaid | accountService.ts:403-446 | 30min |

**Fix:** Envolver operações de escrita + audit log em transação SQLite:
```typescript
const db = getDatabase();
db.transaction(() => {
  // operação de escrita
  // log de auditoria
})();
```

---

### 🟡 MÉDIO

| ID | Title | Location | Effort |
|----|-------|----------|--------|
| 3 | Middleware Chain Defense-in-Depth | app.ts:71-80 | 15min |
| 4 | Rate Limiting nas Novas Rotas | app.ts | 20min |
| 5 | Descrição Sem Limite de Tamanho | accountService.ts:7 | 10min |
| 6 | Saldo Acumulado Inclui Pendentes | cashFlowService.ts:60 | 1h |
| 7 | Filtros Não Conectados na Rota | accounts-payable.ts:75-87 | 20min |
| 8 | Categoria Race Condition | accountService.ts:57-66 | 15min |

---

## Detailed Findings

### 1. Audit Log Fora de Transação (CRÍTICO)

**Local:** `backend/src/services/accountService.ts:74-91`

```typescript
const result = insertStmt.run(tenantId, description, amount, dueDate, categoryId || null, userId);
const newAccountId = result.lastInsertRowid as number;

// Registrar no log de auditoria
await logAuditEntry(...);  // ← Se isso falhar, conta já foi criada!
```

**Problema:** A criação da conta e o log de auditoria não estão em uma transação atômica.

**Recomendação:**
```typescript
const db = getDatabase();
db.transaction(() => {
  const result = insertStmt.run(...);
  logAuditEntry(...);
})();
```

---

### 2. Atomicidade MarkAsPaid (CRÍTICO)

**Local:** `backend/src/services/accountService.ts:403-446`

**Story Reference:** `3-3-marcar-como-paga.md`  
**Critério de Aceitação:** "a operação é atômica via transação SQLite"

**Problema:** O código faz SELECT + UPDATE separadamente, sem transação.

---

### 3. Middleware Chain Defense-in-Depth (MÉDIO)

**Local:** `backend/src/app.ts:71-80`

```typescript
app.use('/api/v1/accounts-payable', accountsPayableRoutes);
```

**Problema:** Middleware aplicado apenas dentro do router. Aplicar também no app.ts para defense-in-depth.

**Recomendação:**
```typescript
app.use('/api/v1/accounts-payable', authenticate, attachTenant, accountsPayableRoutes);
```

---

### 4. Rate Limiting nas Novas Rotas (MÉDIO)

**Local:** `backend/src/app.ts`

As novas rotas não têm rate limiting específico.

---

### 5. Descrição Sem Limite de Tamanho (MÉDIO)

**Local:** `backend/src/services/accountService.ts:7`

```typescript
description: z.string().min(1, 'Descrição é obrigatória')
```

**Problema:** Usuário pode enviar descrição de tamanho arbitrário.

**Recomendação:** Adicionar `z.string().min(1).max(500)`

---

### 6. Saldo Acumulado Inclui Pendentes (MÉDIO)

**Local:** `backend/src/services/cashFlowService.ts:60`

**Problema:** O fluxo de caixa mostra todas as transações (incluindo pendentes) no saldo acumulado. O comportamento esperado é considerar apenas contas pagas/recebidas.

---

### 7. Filtros Não Conectados (MÉDIO)

**Local:** `backend/src/routes/accounts-payable.ts:75-87`

A rota suporta filtros mas não os extrai do request.

---

### 8. Categoria Race Condition (MÉDIO)

**Local:** `backend/src/services/accountService.ts:57-66`

Check-then-act sem transação pode falhar se categoria for deletada entre o check e o act.

---

## Status

- [x] ID 1: Audit Log Transação (Patched)
- [x] ID 2: Atomicidade MarkAsPaid (Patched)
- [x] ID 3: Middleware Defense-in-Depth (Patched)
- [x] ID 4: Rate Limiting (Pré-existente - rateLimiter global)
- [x] ID 5: Limite Descrição (Patched)
- [x] ID 6: Saldo Acumulado (Patched - agora considera apenas confirmadas)
- [x] ID 7: Filtros Rota (Patched)
- [x] ID 8: Categoria Race Condition (Patched - transação aplicada)
