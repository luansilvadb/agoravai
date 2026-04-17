# REQ-002: Core Data & Storage

## Phase Goal
Implementar persistência de dados com LocalStorage e funcionalidades CRUD completas para transações.

## User Story
> Como usuário, quero registrar minhas receitas e despesas e ter certeza que os dados estarão lá quando eu voltar, para que eu possa acompanhar meu histórico financeiro.

## Functional Requirements

### FR1: Storage Module
- [ ] Wrapper LocalStorage com métodos: get, set, update, delete
- [ ] Namespacing de chaves (finance_app_*)
- [ ] Fallback para sessionStorage se LS indisponível
- [ ] Método de clearAll para reset

### FR2: Data Models

**Transaction:**
```javascript
{
  id: string,           // UUID
  type: 'income' | 'expense',
  amount: number,       // positivo, 2 decimais
  description: string,  // max 100 chars
  categoryId: string,   // referência
  date: string,         // ISO date (YYYY-MM-DD)
  createdAt: string,    // ISO datetime
  updatedAt: string     // ISO datetime
}
```

**Category:**
```javascript
{
  id: string,
  name: string,         // max 30 chars
  type: 'income' | 'expense' | 'both',
  color: string,        // hex color
  icon: string,         // lucide icon name
  isDefault: boolean    // protegida de delete
}
```

**Settings:**
```javascript
{
  currency: string,     // 'BRL', 'USD', etc
  locale: string,      // 'pt-BR', 'en-US'
  theme: 'light' | 'dark',
  monthlyGoal: number  // opcional
}
```

### FR3: CRUD Transações
- [ ] Create: Formulário com validação
- [ ] Read: Lista paginada ou scroll infinito
- [ ] Update: Edição inline ou modal
- [ ] Delete: Confirmação antes de excluir
- [ ] Ordenação por data (mais recente primeiro)

### FR4: Categorias
- [ ] Seed de categorias padrão (10+ categorias)
- [ ] Cores distintas por categoria
- [ ] Ícones Lucide por categoria
- [ ] Filtro de transações por categoria

### FR5: Validação
- [ ] Valor: número positivo, max 999999999.99
- [ ] Descrição: obrigatório, min 3 chars
- [ ] Data: válida, não futura além de 1 ano
- [ ] Categoria: obrigatório
- [ ] Mensagens de erro claras

### FR6: Formatação
- [ ] Formatar moeda conforme locale
- [ ] Formatar datas (DD/MM/YYYY para pt-BR)
- [ ] Truncar descrições longas com ellipsis

## Non-Functional Requirements

### NFR1: Performance
- [ ] Operações < 50ms
- [ ] Lazy loading de transações grandes
- [ ] Debounce em buscas

### NFR2: Segurança
- [ ] Sanitização de inputs (XSS prevention)
- [ ] Limite de tamanho de dados (~4MB)

### NFR3: Confiabilidade
- [ ] Try/catch em todas as operações de storage
- [ ] Graceful degradation se LS cheio
- [ ] Validação client-side rigorosa

## Technical Decisions

| Decisão | Escolha | Rationale |
|---------|---------|-----------|
| IDs | crypto.randomUUID() | Nativo, único |
| Datas | ISO 8601 strings | Sortable, parseable |
| Storage | LocalStorage | Requisito do projeto |
| Validação | Schema + manual | Dupla proteção |

## Edge Cases
- LocalStorage cheio: alertar usuário
- Dados corrompidos: reset com backup
- Transação com categoria deletada: mostrar "Sem categoria"

## Definition of Done
- [ ] Dados persistem após F5
- [ ] Pode adicionar 1000+ transações sem crash
- [ ] Validação prev dados inválidos
- [ ] Testado em modo anônimo

## Estimates
- **Complexity:** Medium-High
- **Effort:** 3-4 dias
