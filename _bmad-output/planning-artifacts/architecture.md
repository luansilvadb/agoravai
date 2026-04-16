---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
inputDocuments:
  - D:\agora-vai\_bmad-output\planning-artifacts\prd.md
  - D:\agora-vai\_bmad-output\planning-artifacts\ux-design-specification.md
workflowType: 'architecture'
project_name: 'agora-vai'
user_name: 'Luan'
date: '2026-04-14'
lastStep: 8
status: 'complete'
completedAt: '2026-04-14'
---

# Architecture Decision Document - agora-vai

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
43 FRs organizados em 11 domínios:
1. **Onboarding & Auth (FR1-FR6):** Cadastro self-service, login JWT, magic link, convites de usuários
2. **RBAC (FR7-FR10):** 4 papéis com permissões granulares por recurso
3. **Gestão Tenant (FR11-FR13):** CRUD de empresa e categorias
4. **Contas a Pagar (FR14-FR18):** CRUD completo, marcação como paga, filtros
5. **Contas a Receber (FR19-FR23):** CRUD completo, marcação como recebida, filtros
6. **Fluxo de Caixa (FR24-FR26):** Listagem cronológica com saldo acumulado, filtros por período
7. **Dashboard (FR27-FR30):** Resumo financeiro com saldo, alertas de vencimento, top categorias
8. **Relatórios (FR31-FR33):** Extrato por período, export CSV/PDF server-side
9. **Auditoria (FR34-FR36):** Audit log imutável, access log, visualização admin
10. **Super Admin (FR37-FR40):** Gestão de tenants, métricas de saúde, intervenção proativa
11. **Isolamento (FR41-FR43):** Tenant isolation total, soft delete obrigatório

**Non-Functional Requirements:**
24 NFRs cobrindo:
- **Performance:** Dashboard < 2s, transações < 500ms, CSV < 5s, PDF < 10s, 50 usuários simultâneos
- **Security:** HTTPS/TLS, bcrypt ≥ 12, JWT 15min/7d, httpOnly cookies, parameterized queries, rate limiting, CORS restrito, headers de segurança
- **Scalability:** 500 tenants, 100k transações/tenant, crescimento 10x sem refatoração
- **Reliability:** 99.5% uptime, backup diário 30 dias, restore < 4h, ACID mandatory
- **Accessibility:** WCAG 2.1 AA, responsivo desde 320px

### Scale & Complexity

- Primary domain: Full-stack SaaS B2B (Vue.js SPA + Node.js REST API + SQLite)
- Complexity level: **MEDIUM**
- Estimated architectural components: **10 módulos** (Auth, Tenant, Users/RBAC, Accounts Payable, Accounts Receivable, Cash Flow, Dashboard, Reports, Audit, Super Admin)

### Technical Constraints & Dependencies

- **Sem integrações externas no MVP** — sistema auto-contido
- **SQLite com WAL mode** para concorrência de leitura
- **VPS único** (~$5-10/mês) — restrição severa de custo de infraestrutura
- **pdfkit** para geração de PDF (sem browser headless)
- **Moeda em centavos** (INTEGER) — zero floating point
- **Timezone único** America/Sao_Paulo
- **CNPJ validado** com algoritmo módulo 11 (frontend + backend)
- **API versionada** `/api/v1/` desde o início

### Cross-Cutting Concerns Identified

1. **Tenant Isolation** — Middleware obrigatório em TODAS as queries. Testes automatizados de isolamento por rota. Foreign keys com `tenant_id` em todas as tabelas de negócio.
2. **Audit & Access Logging** — Toda operação de escrita registra audit log. Todo login/export registra access log. Logs imutáveis.
3. **RBAC Enforcement** — Verificação em backend (middleware) e frontend (ocultação de UI). 4 papéis com matriz de permissões.
4. **Financial Integrity** — Transações ACID para operações compostas. Soma de entradas/saídas sempre confere com saldo. Validação de valores negativos.
5. **Performance under Cost Constraint** — NFRs rígidos com infraestrutura mínima (VPS $5-10/mês). SQLite WAL, índices compostos, paginação obrigatória.
6. **LGPD Compliance** — Soft delete em todas entidades, direito à exclusão, consentimento no cadastro, dados criptografados em repouso.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (Vue.js 3 SPA + Node.js/Express REST API + SQLite) based on PRD requirements analysis.

### Starter Options Considered

**Option 1: create-vue (Vue.js official) + Manual Express setup**
- `create-vue` é o starter oficial do Vue.js core team
- Interativo, inclui TypeScript, Vue Router, Pinia, Vitest, ESLint, Prettier
- Backend Express: setup manual com decisões documentadas neste arquivo
- **Prós:** Frontend com base sólida e oficial; backend customizado exatamente para nossas necessidades
- **Contras:** Requer setup manual do backend (decisões documentadas na arquitetura)

**Option 2: Monorepo template (vue-nest-monorepo-template ou vue-express-template)**
- Templates comunitários que juntam frontend + backend num só repo
- **Prós:** Estrutura unificada, deploy simplificado
- **Contras:** Manutenção incerta pela comunidade, decisões de stack podem não bater com o PRD, complexidade adicional para iniciantes

**Opção selecionada: Option 1** — create-vue para frontend + setup guiado para backend. É a escolha de menor risco: frontend tem base oficial sólida; backend é simples o suficiente para ser documentado nas decisões arquiteturais.

### Selected Starter: create-vue (frontend) + Express TypeScript setup (backend)

**Rationale for Selection:**
- `create-vue` é oficialmente mantido pelo Vue.js core team — máxima confiança e atualização
- Para um iniciante, ter um frontend com boas práticas já configuradas reduz drasticamente a curva de aprendizado
- O backend Express é simples o suficiente para ser criado com base nas decisões documentadas neste arquivo
- Separação clara de responsabilidades: frontend e backend como projetos independentes no mesmo repositório (estrutura de pastas: `/frontend` e `/backend`)

**Initialization Commands:**

```bash
# Frontend (Vue.js 3 + TypeScript + Vite + Vue Router + Pinia)
npm create vue@latest frontend -- --typescript --router --pinia --eslint --prettier

# Backend será criado manualmente conforme decisões arquiteturais documentadas
# Estrutura: /backend com Express + TypeScript + Zod + bcrypt + jsonwebtoken
```

**Architectural Decisions Provided by Starter (Frontend):**

**Language & Runtime:**
- TypeScript 5.x configurado com `strict: true`
- Vue 3 com Composition API e `<script setup>`
- Vite como build tool (HMR, build otimizado)

**Styling Solution:**
- CSS puro inicial (PrimeVue free tier será adicionado conforme UX spec mobile-first)

**Build Tooling:**
- Vite com otimizações de tree-shaking e code splitting
- Alias `@` apontando para `src/`

**Testing Framework:**
- Vitest configurado (será expandido com testes de isolamento de tenant)

**Code Organization:**
- Estrutura padrão: `src/`, `src/components/`, `src/views/`, `src/stores/` (Pinia), `src/router/`
- Convenção de arquivos: `.vue` single-file components com TypeScript

**Development Experience:**
- Hot reloading com Vite HMR
- ESLint + Prettier para consistência de código
- Dev server com proxy configurável para API backend

**Backend Decisions (to be implemented per architecture):**
- Express com TypeScript
- Zod para validação de input
- bcrypt para hashing de senhas
- jsonwebtoken para autenticação JWT
- better-sqlite3 como driver SQLite
- Estrutura: `src/routes/`, `src/middleware/`, `src/services/`, `src/db/`, `src/utils/`

**Note:** Project initialization usando `npm create vue@latest` deve ser a primeira story de implementação.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

| Decisão | Escolha | Versão | Justificativa |
|---------|---------|--------|---------------|
| Banco de Dados | `better-sqlite3` sem ORM | v12.x | API síncrona simples, transações nativas, performance superior. Queries SQL puras com parameterized queries. Sem ORM — controle total, debug fácil. |
| Migrações | Scripts SQL manuais numerados | — | Custo zero de complexidade. Arquivos em `backend/src/db/migrations/`. Rollback manual quando necessário (raro no MVP). |
| Autenticação | `jsonwebtoken` + cookies httpOnly | v9.x | Access token JWT 15min, refresh token 7d em cookie httpOnly SameSite=Strict. Padrão da indústria, simples. |
| Autorização (RBAC) | Middleware `requireRole()` por rota | — | 4 papéis estáticos (Admin, Operacional, Visualizador, Super Admin). Middleware verifica role do JWT → 403 se não autorizado. Sem biblioteca extra. |
| Validação de Input | `Zod` | v3.24+ | TypeScript-first, schemas reutilizáveis como documentação viva. Erros mapeados para formato padrão `{ error: { code, message, details } }`. |
| Isolamento de Tenant | Middleware obrigatório em TODAS as rotas | — | `tenant_id` extraído do JWT, injetado em toda query. `WHERE tenant_id = ?` em todas as tabelas de negócio. Testes automatizados de isolamento por rota. |

**Important Decisions (Shape Architecture):**

| Decisão | Escolha | Versão | Justificativa |
|---------|---------|--------|---------------|
| Logging | `pino` + `pino-http` | v9.x | Logs estruturados JSON, mais rápido que winston. requestId por request para rastreabilidade. |
| Error Handling | Global error handler middleware | — | Middleware único captura todos os erros, loga, retorna formato padrão. Stack traces nunca vazam para o cliente. |
| Componentes UI | PrimeVue (free tier) + Tailwind CSS | PrimeVue v4.x | 80+ componentes, acessibilidade ARIA, tema Aura clean. Tailwind para customizações pontuais. |
| Estado Frontend | Pinia (só sessão) + estado local | — | Pinia armazena apenas user/auth/tenant. Dados de negócio são fetchados direto da API em cada componente. Evita dados stale. |
| Process Manager | PM2 | — | `ecosystem.config.js` simples. Reload e monitoramento built-in. Mais fácil que systemd para iniciantes. |
| Reverse Proxy | Caddy | — | TLS automático Let's Encrypt. 4 linhas de configuração. Sem certbot, sem cron de renovação. |
| PDF Generation | `pdfkit` | — | Leve (~2MB), sem browser headless. Adequado para VPS de $5-10/mês. |
| Backup | Script cron + Backblaze B2 | — | `sqlite3 .backup` diário → compacta → envia remoto. ~$0.005/GB/mês. Teste de restore mensal manual. |
| CI/CD | Deploy manual (MVP) | — | `git pull` → `npm install` → `pm2 restart`. GitHub Actions só quando >1 dev ou deploys frequentes. |

**Deferred Decisions (Post-MVP):**

| Decisão | Quando revisar | Rationale |
|---------|---------------|-----------|
| MFA (autenticação multi-fator) | Growth (Phase 2) | Custo de complexidade não justifica para MVP com 50 tenants target |
| Cursor-based pagination | Quando >100k registros por query | Offset-based é suficiente para MVP com paginação de 20 itens |
| CI/CD automatizado (GitHub Actions) | Quando >1 dev ou deploys >2x/semana | Deploy manual funciona para equipe enxuta |
| Migration tool formal (dbmate) | Quando migrations >20 arquivos | Scripts manuais funcionam bem para volume baixo |
| ORM (Prisma/Drizzle) | Se complexidade de queries crescer muito | SQL direto dá controle e performance; ORM só se custo de manutenção superar benefício |

### Data Architecture

**Database:** SQLite via `better-sqlite3` v12.x
- WAL mode habilitado para concorrência de leitura
- Transações ACID para todas as operações compostas (ex: marcar conta como paga + atualizar saldo)
- Índices compostos: `(tenant_id, created_at)`, `(tenant_id, due_date)`, `(tenant_id, deleted_at)`
- Moeda: INTEGER em centavos (ex: R$ 1.234,56 → `123456`)
- Timezone: America/Sao_Paulo, datas ISO 8601 com offset
- Soft delete: `deleted_at` TIMESTAMP NULL em todas entidades financeiras
- Sem ORM: queries SQL diretas com `?` parameterized

**Migrations:** Scripts SQL manuais numerados em `backend/src/db/migrations/`
- Convenção: `001_create_tenants.sql`, `002_create_users.sql`, etc.
- Cada arquivo contém o SQL completo de criação/alteração
- Rollback manual quando necessário

### Authentication & Security

**Auth Method:** JWT via `jsonwebtoken` v9.x
- Access token: 15 minutos de expiração
- Refresh token: 7 dias, armazenado em cookie httpOnly + SameSite=Strict
- Senhas: bcrypt cost factor 12
- Recuperação de senha: magic link por email (expira em 15 min, uso único)

**Authorization:** Middleware `requireRole(...roles)` por rota
- Roles: `admin`, `operational`, `viewer`, `super_admin`
- Role extraído do JWT payload — nunca confiar em input do cliente
- Frontend: ocultar botões/ações baseado no role (Pinia userStore)
- Backend: middleware retorna HTTP 403 se role não autorizado

**Security Middleware Chain (ordem de execução):**
1. `helmet()` — headers de segurança (HSTS, X-Frame-Options, CSP, X-Content-Type-Options)
2. `cors()` — origem restrita ao domínio do frontend
3. `rateLimit()` — 100 req/min baseline por usuário; login: 5 tentativas/15min por IP
4. `authenticate()` — valida JWT, extrai user info
5. `attachTenant()` — injeta `tenant_id` do JWT no request context
6. `requireRole(...roles)` — verifica permissão
7. Handler da rota

**Tenant Isolation:**
- Middleware `attachTenant()` obrigatório em TODAS as rotas protegidas
- `tenant_id` do JWT — nunca confiar em input do cliente
- Foreign key `tenant_id` NOT NULL em todas tabelas de negócio
- Teste automatizado de isolamento para cada nova rota

### API & Communication Patterns

**API Design:** RESTful com versionamento `/api/v1/`
- Recursos: `/auth`, `/users`, `/tenants`, `/accounts-payable`, `/accounts-receivable`, `/transactions`, `/categories`, `/reports`, `/audit`
- Paginação: offset-based (`?page=1&limit=20`)
- Formato sucesso: `{ data: [...], pagination: { page, limit, total } }`
- Formato erro: `{ error: { code: "CODE", message: "...", details: {} } }`

**Validation:** Zod v3.24+ para todos os inputs de rota
- Schemas TypeScript reutilizáveis como documentação viva
- Erros do Zod mapeados para formato de erro padrão

**Logging:** `pino` + `pino-http` v9.x
- Logs estruturados JSON
- `requestId` injetado em cada request para rastreabilidade
- Níveis: `info` (produção), `debug` (desenvolvimento)

**Error Handling:** Global error handler middleware
- Captura todos os erros não tratados
- Loga com pino (stack trace apenas em desenvolvimento)
- Retorna `{ error: { code, message } }` sem detalhes internos para o cliente

### Frontend Architecture

**Framework:** Vue.js 3 com Composition API + `<script setup>` + TypeScript strict
- Build: Vite com tree-shaking e code splitting
- Alias `@` → `src/`

**UI Library:** PrimeVue v4.x (free tier) com tema Aura
- Componentes: DataTable, Dialog, Form inputs, Toast, ConfirmDialog
- Acessibilidade ARIA built-in
- Tailwind CSS para customizações pontuais de layout

**State Management:** Pinia (escopo limitado)
- `authStore`: isAuthenticated, login/logout status
- `userStore`: nome, email, role do usuário
- `tenantStore`: nome, plano, tenant_id
- Dados de negócio (contas, transações): estado local (`ref`/`reactive`) — fetch direto da API

**Routing:** Vue Router com guards de autenticação e permissão
- Guard `requireAuth`: redireciona para `/login` se não autenticado
- Guard `requireRole(role)`: redireciona para `/dashboard` se sem permissão

**Testing:** Vitest (configurado pelo create-vue)
- Expandido com testes de isolamento de tenant

### Infrastructure & Deployment

**Server:** VPS único (~$5-10/mês)
- Reverse proxy: Caddy (TLS automático Let's Encrypt)
- Process manager: PM2 com `ecosystem.config.js`
- Backend: Node.js + Express + TypeScript (compilado para JS em produção)
- Frontend: Vue.js buildado via Vite → arquivos estáticos servidos pelo Caddy

**Backup:** Script cron diário
- `sqlite3 .backup` → gzip → upload para Backblaze B2
- Retenção: 30 dias mínimo
- Teste de restore: mensal, manual

**CI/CD:** Deploy manual (MVP)
- `git pull` → `npm install` → `npm run build` → `pm2 restart`
- GitHub Actions considerado quando >1 dev ou deploys frequentes

### Decision Impact Analysis

**Implementation Sequence:**

1. Setup do repositório (`create-vue` frontend + Express backend manual)
2. Banco de dados (SQLite + migrations iniciais)
3. Auth (JWT + bcrypt + middleware chain)
4. Tenant isolation middleware
5. RBAC middleware
6. CRUDs de domínio (categorias, contas a pagar/receber)
7. Fluxo de caixa com saldo acumulado
8. Dashboard
9. Relatórios + exportação CSV/PDF
10. Audit log + access log
11. Super Admin panel
12. Deploy + backup script

**Cross-Component Dependencies:**

- **Tenant isolation** afeta TODOS os módulos — middleware é a base de tudo
- **Auth + RBAC** precedem todos os CRUDs — sem auth, sem roteamento seguro
- **Database schema** deve ser definido antes de qualquer CRUD — migrations primeiro
- **Audit logging** é cross-cutting — toda operação de escrita registra log
- **PrimeVue** afeta todas as telas — componentes compartilhados desde o início
- **pdfkit** depende do backend Node — módulo de reports isolado

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

12 áreas de conflito potencial identificadas onde agentes de IA poderiam fazer escolhas diferentes. Todas resolvidas abaixo.

### Naming Patterns

**Database Naming Conventions:**

| Elemento | Convenção | Exemplo | Anti-padrão |
|----------|-----------|---------|-------------|
| Tabelas | `snake_case` plural | `users`, `accounts_payable`, `audit_log` | `Users`, `user`, `AccountsPayable` |
| Colunas | `snake_case` | `user_id`, `created_at`, `due_date` | `userId`, `createdAt` |
| Chaves estrangeiras | Mesmo nome da coluna | `tenant_id` | `fk_tenant`, `tenantId` |
| Índices | `idx_` + tabela + coluna | `idx_accounts_payable_tenant_id` | `accountsPayableTenantIdx` |
| Enums/flags | `snake_case` com valores string | `status: 'pending'`, `'paid'`, `'overdue'` | `status: 0, 1, 2` |

**API Naming Conventions:**

| Elemento | Convenção | Exemplo | Anti-padrão |
|----------|-----------|---------|-------------|
| Endpoints REST | kebab-case plural | `/accounts-payable`, `/accounts-receivable` | `/accountsPayable`, `/accounts_payable`, `/account` |
| Parâmetros de rota | `:id` | `GET /accounts-payable/:id` | `GET /accounts-payable/{id}` |
| Query parameters | `snake_case` | `?page=1&limit=20&due_date_from=2026-01-01` | `?dueDateFrom=...` |
| JSON response fields | `camelCase` | `{"id": 1, "tenantId": 5, "createdAt": "..."}` | `{"tenant_id": 5, "created_at": "..."}` |
| JSON request body | `camelCase` | `{"description": "Aluguel", "amount": 350000}` | `{"descricao": "..."}` |

**Code Naming Conventions:**

| Elemento | Convenção | Exemplo | Anti-padrão |
|----------|-----------|---------|-------------|
| Backend arquivos util | `camelCase.ts` | `userAuth.ts`, `dbConnection.ts` | `user-auth.ts`, `UserAuth.ts` |
| Backend classes/types | `PascalCase` | `UserPayload`, `AccountDTO` | `userPayload`, `user_payload` |
| Backend funções | `camelCase` | `getUserById`, `validateTenant` | `get_user_by_id`, `GetUserById` |
| Backend constantes | `UPPER_SNAKE_CASE` | `MAX_LOGIN_ATTEMPTS`, `JWT_EXPIRY` | `maxLoginAttempts`, `jwtExpiry` |
| Frontend componentes | `PascalCase.vue` | `AccountCard.vue`, `DashboardView.vue` | `account-card.vue`, `accountCard.vue` |
| Frontend stores Pinia | `camelCase` + `use` prefix | `useAuthStore`, `useTenantStore` | `authStore`, `AuthStore` |
| Frontend composables | `camelCase` + `use` prefix | `useAccounts`, `useCashFlow` | `accountsComposable`, `UseAccounts` |

### Structure Patterns

**Project Organization:**

```
agora-vai/
  frontend/                    # Vue.js 3 SPA (create-vue)
    src/
      components/              # Componentes reutilizáveis (PascalCase.vue)
      views/                   # Páginas/rotas (PascalCaseView.vue)
      stores/                  # Pinia stores (camelCaseStore.ts)
      router/                  # Vue Router config
      api/                     # API client modules (camelCase.ts)
      types/                   # TypeScript types
      App.vue
      main.ts
    tests/                     # Vitest tests (separados do src)
      auth.test.ts
      accounts.test.ts

  backend/                     # Express + TypeScript
    src/
      db/
        migrations/            # SQL numerados: 001_create_tenants.sql
        index.ts               # DB init + WAL mode
      middleware/              # auth.ts, tenant.ts, rbac.ts, errorHandler.ts
      routes/                  # auth.ts, users.ts, accounts-payable.ts
      services/                # Business logic: authService.ts
      utils/                   # Helpers: cnpj.ts, currency.ts, pdf.ts
      types/                   # TypeScript type definitions
      app.ts                   # Express app setup + middleware chain
      server.ts                # Entry point (PM2 target)
    tests/                     # Testes separados do src
      auth.test.ts
      isolation.test.ts

  docs/                        # Documentação do projeto
```

**Regras de estrutura:**
- **Tests SEMPRE em `/tests`** separado — não co-locados com código fonte
- **Backend: separação por tipo** (middleware, routes, services) — não por feature
- **Frontend: separação por tipo** (components, views, stores) — não por feature
- **Migrations SEMPRE em `backend/src/db/migrations/`** — numerados com 3 dígitos
- **API client modules no frontend em `src/api/`** — um arquivo por recurso (`accounts.ts`, `auth.ts`)

### Format Patterns

**API Response Formats:**

Sucesso — Lista:
```json
{
  "data": [
    { "id": 1, "description": "Aluguel", "amount": 350000, "dueDate": "2026-04-15T00:00:00-03:00" }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45 }
}
```

Sucesso — Item único:
```json
{
  "data": { "id": 1, "description": "Aluguel", "amount": 350000 }
}
```

Sucesso — Lista vazia:
```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 0 }
}
```

Erro:
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "O valor deve ser um número positivo",
    "details": { "field": "amount", "value": -100 }
  }
}
```

**HTTP Status Code Usage:**

| Código | Quando |
|--------|--------|
| 200 | Sucesso GET/PUT |
| 201 | Criado com sucesso (POST) |
| 204 | Deletado (soft delete) — sem body |
| 400 | Bad request (validação, input inválido) |
| 401 | Não autenticado (token ausente/inválido) |
| 403 | Sem permissão (role não autorizado) |
| 404 | Recurso não encontrado |
| 429 | Rate limit exceeded |
| 500 | Erro interno do servidor |

**Data Exchange Formats:**

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Datas | ISO 8601 com offset | `"2026-04-14T10:30:00-03:00"` |
| Moeda | INTEGER centavos | `350000` = R$ 3.500,00 |
| Boolean | JSON nativo | `true` / `false` |
| Null | `null` JSON | nunca `"null"` string |
| Arrays vazios | `[]` | nunca `null` para listas |
| CNPJ | String formatada | `"12.345.678/0001-90"` |

### Communication Patterns

**Event Naming (frontend events, if applicable):**
- `camelCase` com verbo no infinitivo: `accountCreated`, `paymentProcessed`
- Payload: objeto com `camelCase` fields

**State Management (Pinia):**
- Stores com `defineStore`: `export const useAuthStore = defineStore('auth', { ... })`
- State: objetos planos com `camelCase`
- Actions: `camelCase` com verbo: `async login(email, password) { ... }`
- Getters: `camelCase` sem prefixo `get`: `isAuthenticated`, `currentUser`

**API Client (frontend `src/api/`):**
- Um arquivo por recurso: `accounts.ts`, `auth.ts`, `reports.ts`
- Funções exportadas: `camelCase`: `export async function getAccounts(params) { ... }`
- Base URL centralizada: `const api = axios.create({ baseURL: '/api/v1' })`
- Interceptor de erro global: captura 401 → redirect `/login`, 403 → toast sem permissão

### Process Patterns

**Error Handling:**

- **Backend:** Global error handler middleware captura todos os erros não tratados
  - Desenvolvimento: loga stack trace com pino
  - Produção: loga apenas mensagem e código — nunca vaza stack trace para o cliente
  - Sempre retorna `{ error: { code, message } }`

- **Frontend:** Toast notifications via PrimeVue para erros de usuário
  - Erros de validação: inline nos formulários (Zod → mensagem no campo)
  - Erros de API: Toast no topo da tela
  - Erros 401: redirect automático para `/login`
  - Erros 403: Toast "Você não tem permissão para esta ação"

**Loading States:**

- **Global:** Spinner no topo da tela para navegação entre rotas (Vue Router guard)
- **Local:** Cada componente com loading próprio via `const loading = ref(false)`
  - Padrão de nome: `isLoading` ou `loading` + contexto (`isSaving`, `isLoadingAccounts`)
  - Botões com `:loading` prop do PrimeVue durante operações

### Enforcement Guidelines

**All AI Agents MUST:**

1. Usar `snake_case` para tabelas e colunas SQL — NUNCA camelCase no banco
2. Usar `camelCase` para JSON fields nas APIs — NUNCA snake_case no JSON
3. Usar kebab-case plural para endpoints REST — NUNCA singular ou camelCase
4. Colocar tests em `/tests` separado — NUNCA co-locado com código fonte
5. Usar formato de resposta padrão `{ data: ..., pagination: ... }` ou `{ error: { code, message, details } }`
6. Usar INTEGER centavos para moeda — NUNCA float/decimal
7. Usar ISO 8601 com offset para datas — NUNCA timestamps unix ou strings sem timezone
8. Incluir `WHERE tenant_id = ?` em TODAS as queries de dados — sem exceção
9. Registrar no audit_log toda operação de criação/edição/exclusão
10. Usar transações SQLite para operações compostas — NUNCA queries separadas sem transação

### Pattern Examples

**Good — Criar conta a pagar:**
```typescript
// POST /api/v1/accounts-payable
// Request body: { "description": "Aluguel", "amount": 350000, "dueDate": "2026-04-15", "categoryId": 3 }

// Service (dentro de transação):
const stmt = db.prepare(`
  INSERT INTO accounts_payable (tenant_id, description, amount, due_date, category_id, created_by, created_at)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
`);
const result = stmt.run(tenantId, description, amount, dueDate, categoryId, userId);

// Audit log:
auditLog.run(tenantId, userId, 'create', 'accounts_payable', result.lastInsertRowid, null, JSON.stringify({ description, amount }));

// Response: 201 { "data": { "id": result.lastInsertRowid, "description": "...", "amount": 350000, ... } }
```

**Anti-Pattern — O que NUNCA fazer:**
```typescript
// ❌ NUNCA: query sem tenant_id
const accounts = db.prepare('SELECT * FROM accounts_payable').all();

// ❌ NUNCA: moeda como float
const amount = 3500.00; // Deveria ser 350000 (centavos)

// ❌ NUNCA: endpoint no singular
app.post('/account-payable', ...) // Deveria ser /accounts-payable

// ❌ NUNCA: delete físico
db.prepare('DELETE FROM accounts_payable WHERE id = ?').run(id); // Deveria ser soft delete: SET deleted_at = datetime('now')

// ❌ NUNCA: operação financeira sem transação
db.prepare('UPDATE accounts_payable SET paid_at = ? WHERE id = ?').run(now, id);
db.prepare('UPDATE cash_flow SET balance = balance - ? WHERE tenant_id = ?').run(amount, tenantId);
// Deveria estar dentro de db.transaction(() => { ... })
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
agora-vai/
├── README.md
├── .gitignore
├── .env.example
│
├── frontend/                           # Vue.js 3 SPA
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── env.d.ts
│   ├── index.html
│   ├── .env                          # VITE_API_URL=/api/v1
│   │
│   ├── src/
│   │   ├── main.ts                   # App entry: mounts Vue, registers plugins
│   │   ├── App.vue                   # Root component: router-view + global layout
│   │   │
│   │   ├── router/
│   │   │   └── index.ts              # Vue Router: routes + auth/role guards
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts          # isAuthenticated, login/logout
│   │   │   ├── userStore.ts          # user info, role
│   │   │   └── tenantStore.ts        # tenant info, plan
│   │   │
│   │   ├── api/
│   │   │   ├── index.ts              # Axios base: baseURL, interceptors (401→/login, 403→toast)
│   │   │   ├── auth.ts               # login, logout, refresh, register, invite
│   │   │   ├── users.ts              # CRUD users do tenant
│   │   │   ├── tenants.ts            # CRUD tenant (admin only)
│   │   │   ├── categories.ts         # CRUD categorias
│   │   │   ├── accountsPayable.ts    # CRUD contas a pagar
│   │   │   ├── accountsReceivable.ts # CRUD contas a receber
│   │   │   ├── cashflow.ts           # Fluxo de caixa queries
│   │   │   ├── dashboard.ts          # Dashboard data queries
│   │   │   ├── reports.ts            # Extrato, export CSV/PDF triggers
│   │   │   ├── audit.ts              # Audit log queries (admin)
│   │   │   └── admin.ts              # Super Admin: tenants list, metrics
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue     # Top bar: tenant name, user menu, logout
│   │   │   │   ├── AppSidebar.vue    # Nav menu: role-based items
│   │   │   │   └── AppFooter.vue     # Footer: version, copyright
│   │   │   ├── accounts/
│   │   │   │   ├── AccountForm.vue   # Form criar/editar conta
│   │   │   │   ├── AccountList.vue   # Tabela com paginação + filtros
│   │   │   │   └── AccountCard.vue   # Card individual para mobile
│   │   │   ├── dashboard/
│   │   │   │   ├── BalanceCard.vue   # Saldo atual destacado
│   │   │   │   ├── DueSoonList.vue   # Contas a vencer (7 dias)
│   │   │   │   └── TopCategories.vue # Top 5 categorias
│   │   │   ├── reports/
│   │   │   │   ├── ReportFilters.vue # Seletor de período
│   │   │   │   └── CashFlowTable.vue # Tabela fluxo de caixa
│   │   │   └── common/
│   │   │       ├── ConfirmDialog.vue # Diálogo de confirmação genérico
│   │   │       └── LoadingSpinner.vue
│   │   │
│   │   ├── views/
│   │   │   ├── LoginView.vue         # /login
│   │   │   ├── RegisterView.vue      # /register — cadastro empresa
│   │   │   ├── ForgotPasswordView.vue # /forgot-password
│   │   │   ├── DashboardView.vue     # /dashboard
│   │   │   ├── AccountsPayableView.vue # /accounts-payable
│   │   │   ├── AccountsReceivableView.vue # /accounts-receivable
│   │   │   ├── CashFlowView.vue      # /cashflow
│   │   │   ├── ReportsView.vue       # /reports
│   │   │   ├── CategoriesView.vue    # /categories (admin)
│   │   │   ├── UsersView.vue         # /users (admin)
│   │   │   ├── AuditView.vue         # /audit (admin)
│   │   │   ├── SettingsView.vue      # /settings (admin)
│   │   │   └── AdminView.vue         # /admin (super_admin)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   │
│   │   └── assets/
│   │       └── main.css              # Global styles + PrimeVue theme overrides
│   │
│   └── tests/
│       ├── setup.ts
│       ├── auth.test.ts
│       ├── accountsPayable.test.ts
│       ├── dashboard.test.ts
│       └── rbac.test.ts
│
├── backend/                          # Express + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                          # DATABASE_PATH, JWT_SECRET, FRONTEND_URL
│   ├── ecosystem.config.js           # PM2 config
│   │
│   ├── src/
│   │   ├── server.ts                 # Entry point
│   │   ├── app.ts                    # Express app: middleware chain + routes
│   │   │
│   │   ├── db/
│   │   │   ├── index.ts              # better-sqlite3 init, WAL mode
│   │   │   └── migrations/
│   │   │       ├── 001_create_tenants.sql
│   │   │       ├── 002_create_users.sql
│   │   │       ├── 003_create_categories.sql
│   │   │       ├── 004_create_accounts_payable.sql
│   │   │       ├── 005_create_accounts_receivable.sql
│   │   │       ├── 006_create_audit_log.sql
│   │   │       └── 007_create_access_log.sql
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT validation
│   │   │   ├── tenant.ts             # attachTenant
│   │   │   ├── rbac.ts               # requireRole
│   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   └── rateLimiter.ts        # Rate limiting
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.ts               # /auth/*
│   │   │   ├── users.ts              # /users
│   │   │   ├── tenants.ts            # /tenants
│   │   │   ├── categories.ts         # /categories
│   │   │   ├── accounts-payable.ts   # /accounts-payable
│   │   │   ├── accounts-receivable.ts # /accounts-receivable
│   │   │   ├── cashflow.ts           # /cashflow
│   │   │   ├── dashboard.ts          # /dashboard
│   │   │   ├── reports.ts            # /reports/*
│   │   │   ├── audit.ts              # /audit
│   │   │   └── admin.ts              # /admin/*
│   │   │
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── tenantService.ts
│   │   │   ├── userService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── accountService.ts
│   │   │   ├── cashflowService.ts
│   │   │   ├── dashboardService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── auditService.ts
│   │   │   └── adminService.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cnpj.ts
│   │   │   ├── currency.ts
│   │   │   ├── pdf.ts
│   │   │   ├── csv.ts
│   │   │   └── email.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   └── tests/
│       ├── setup.ts
│       ├── auth.test.ts
│       ├── tenantIsolation.test.ts
│       ├── rbac.test.ts
│       ├── accountsPayable.test.ts
│       ├── accountsReceivable.test.ts
│       ├── cashflow.test.ts
│       ├── dashboard.test.ts
│       ├── reports.test.ts
│       └── auditLog.test.ts
│
└── docs/
    └── architecture.md
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Responsável | Arquivo(s) | Descrição |
|----------|------------|-----------|-----------|
| Auth | `authService.ts` + `routes/auth.ts` | Login, register, refresh, forgot-password | Gera JWT, valida credenciais, magic links |
| Tenant | `middleware/tenant.ts` | Todas as rotas protegidas | Injeta `tenant_id` do JWT |
| RBAC | `middleware/rbac.ts` | Todas as rotas protegidas | Verifica role → 403 |
| Data access | `services/*.ts` + `db/index.ts` | Todos os services | Únicos pontos que executam SQL |
| Error | `middleware/errorHandler.ts` | Global | Captura todos os erros |
| Rate limit | `middleware/rateLimiter.ts` | Global + login | 100 req/min, 5/15min login |

**Component Boundaries (Frontend):**

| Boundary | Pattern | Exemplo |
|----------|---------|---------|
| Component → API | `src/api/*.ts` | `AccountList.vue` → `api/accountsPayable.ts` → GET `/api/v1/accounts-payable` |
| Component → Store | Pinia `use*Store()` | `AppHeader.vue` → `useUserStore()` |
| Component → Component | Props + emits | `AccountForm` emits `saved` → `AccountList` recarrega |
| Router → Auth | Vue Router guards | `requireAuth` → `/login` |
| Router → RBAC | Vue Router guards | `requireRole('admin')` → `/dashboard` |

**Service Boundaries (Backend):**

| Boundary | Pattern | Exemplo |
|----------|---------|---------|
| Route → Service | Route chama service | `routes/accounts-payable.ts` → `accountService.create()` |
| Service → DB | `db.prepare()` | `accountService.create()` → INSERT |
| Service → Audit | `auditService.log()` | Toda escrita registra log |
| Service → Transaction | `db.transaction()` | Pagar + atualizar saldo = atômico |

**Data Boundaries:**

| Boundary | Mecanismo | Descrição |
|----------|-----------|-----------|
| Tenant isolation | `WHERE tenant_id = ?` | Nenhuma query cruza tenant |
| Soft delete | `WHERE deleted_at IS NULL` | Deletados invisíveis por padrão |
| Audit immutability | INSERT only no `audit_log` | Append-only |
| ACID | `db.transaction()` | Operações compostas atômicas |

### Requirements to Structure Mapping

**FR Mapping to Files:**

| FRs | Rota | Service | Views/Components |
|-----|------|---------|-----------------|
| FR1-FR6 | `routes/auth.ts` | `authService.ts` | `LoginView`, `RegisterView`, `ForgotPasswordView` |
| FR7-FR10 | `routes/users.ts` + `rbac.ts` | `userService.ts` | `UsersView` |
| FR11-FR13 | `routes/tenants.ts` | `tenantService.ts` | `SettingsView` |
| FR14-FR18 | `routes/accounts-payable.ts` | `accountService.ts` | `AccountsPayableView`, `AccountForm`, `AccountList` |
| FR19-FR23 | `routes/accounts-receivable.ts` | `accountService.ts` | `AccountsReceivableView`, `AccountForm`, `AccountList` |
| FR24-FR26 | `routes/cashflow.ts` | `cashflowService.ts` | `CashFlowView`, `CashFlowTable` |
| FR27-FR30 | `routes/dashboard.ts` | `dashboardService.ts` | `DashboardView`, `BalanceCard`, `DueSoonList`, `TopCategories` |
| FR31-FR33 | `routes/reports.ts` | `reportService.ts` + `utils/pdf.ts` + `utils/csv.ts` | `ReportsView`, `ReportFilters` |
| FR34-FR36 | `routes/audit.ts` | `auditService.ts` | `AuditView` |
| FR37-FR40 | `routes/admin.ts` | `adminService.ts` | `AdminView` |
| FR41-FR43 | `middleware/tenant.ts` | Todas as services | — |

**NFR Mapping to Files:**

| NFRs | Implementação | Arquivo(s) |
|------|--------------|-----------|
| NFR1-NFR5 (Performance) | WAL mode, índices compostos | `db/index.ts`, migrations |
| NFR6-NFR14 (Security) | Helmet, CORS, rate limiter, bcrypt, JWT | `middleware/auth.ts`, `rateLimiter.ts`, `authService.ts` |
| NFR15-NFR17 (Scalability) | `tenant_id` indexing, WAL | Migrations, `db/index.ts` |
| NFR18-NFR22 (Reliability) | ACID, backup script | `services/*.ts`, cron |
| NFR23-NFR24 (Accessibility) | PrimeVue ARIA, responsive | Componentes Vue, `main.css` |

### Integration Points

**Internal Communication:**
- Frontend → Backend: HTTP REST via Axios (`/api/v1/...`)
- Backend services → DB: `better-sqlite3` prepared statements
- Backend routes → services: função exportada por service
- Backend services → audit: `auditService.log()` dentro de transação

**External Integrations (MVP):**
- **Email:** Resend ou SendGrid (free tier) para magic links e convites → `utils/email.ts`
- Sem outras integrações externas no MVP

**Data Flow:**
1. Usuário interage com componente Vue → dispara ação
2. Componente chama `src/api/*.ts` → HTTP request
3. Backend route → middleware chain (auth → tenant → rbac)
4. Route → service → SQL via `db.prepare()`
5. Service → audit log → retorna dados
6. Route → `{ data: ..., pagination: ... }`
7. Frontend → atualiza estado → re-renderiza

### Development Workflow Integration

**Development Mode:**
- Frontend: `npm run dev` → Vite (localhost:5173) com HMR
- Backend: `npm run dev` → `tsx watch src/server.ts` (localhost:3000)
- Vite proxy: `/api/v1/*` → forwarded para localhost:3000

**Build Process:**
- Frontend: `npm run build` → Vite → `dist/`
- Backend: `tsc` → `dist/` (JS compilado)
- Caddy serve estáticos + proxy `/api`

**Deployment:**
- PM2 gerencia backend (`ecosystem.config.js`)
- Caddy reverse proxy → estáticos + API
- Backup: cron diário → `sqlite3 .backup` → gzip → Backblaze B2

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Todas as tecnologias são compatíveis entre si e production-ready:
- Vue.js 3 + Vite + TypeScript + Pinia + Vue Router + PrimeVue — stack oficial do ecossistema Vue
- Express + TypeScript + better-sqlite3 + Zod + jsonwebtoken + bcrypt + pino — stack madura de Node.js
- Sem conflitos de versão ou dependência circular
- better-sqlite3 (síncrono) é compatível com Express (não requer async/await para DB)

**Pattern Consistency:**
Padrões são consistentes em todas as camadas:
- snake_case no banco → camelCase no JSON → kebab-case nas URLs — conversão clara e documentada
- Middleware chain ordenado: helmet → cors → rateLimit → auth → tenant → rbac → handler
- Formato de resposta padronizado: `{ data, pagination }` e `{ error: { code, message, details } }`
- Tests separados em `/tests` — consistente frontend e backend

**Structure Alignment:**
A estrutura suporta todas as decisões arquiteturais:
- Separação middleware/routes/services permite evolução independente
- Frontend api/ modules mapeiam 1:1 para backend routes
- Migrations numerados em diretório dedicado — evolui sem conflitos
- Utils isolados (cnpj, currency, pdf, csv, email) — reutilizáveis

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
Todos os 43 FRs possuem suporte arquitetural definido:

| Categoria FR | Rota | Service | View | Status |
|-------------|------|---------|------|--------|
| Auth (FR1-FR6) | auth.ts | authService.ts | LoginView, RegisterView | ✅ |
| RBAC (FR7-FR10) | users.ts + rbac.ts | userService.ts | UsersView | ✅ |
| Tenant (FR11-FR13) | tenants.ts | tenantService.ts | SettingsView | ✅ |
| Payable (FR14-FR18) | accounts-payable.ts | accountService.ts | AccountsPayableView | ✅ |
| Receivable (FR19-FR23) | accounts-receivable.ts | accountService.ts | AccountsReceivableView | ✅ |
| Cashflow (FR24-FR26) | cashflow.ts | cashflowService.ts | CashFlowView | ✅ |
| Dashboard (FR27-FR30) | dashboard.ts | dashboardService.ts | DashboardView | ✅ |
| Reports (FR31-FR33) | reports.ts | reportService.ts | ReportsView | ✅ |
| Audit (FR34-FR36) | audit.ts | auditService.ts | AuditView | ✅ |
| Super Admin (FR37-FR40) | admin.ts | adminService.ts | AdminView | ✅ |
| Isolation (FR41-FR43) | middleware/tenant.ts | Todas | — | ✅ |

**Non-Functional Requirements Coverage:**

| NFR | Suporte Arquitetural | Status |
|-----|---------------------|--------|
| Performance (NFR1-NFR5) | WAL mode, índices compostos, queries otimizadas | ✅ |
| Security (NFR6-NFR14) | Helmet, CORS, rate limiter, bcrypt, JWT, parameterized queries | ✅ |
| Scalability (NFR15-NFR17) | tenant_id indexing, WAL, índices compostos | ✅ |
| Reliability (NFR18-NFR22) | ACID transactions, backup script, soft delete | ✅ |
| Accessibility (NFR23-NFR24) | PrimeVue ARIA, responsive 320px+ | ✅ |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ Todas as 15 decisões críticas documentadas com versão e justificativa
- ✅ 5 decisões adiadas com rationale e gatilho de revisão
- ✅ Stack completo com versões verificadas via web search

**Structure Completeness:**
- ✅ Árvore de diretórios completa com todos os arquivos nomeados
- ✅ 13 backend routes mapeadas
- ✅ 10 backend services definidos
- ✅ 13 frontend views criadas
- ✅ 12 frontend components especificados
- ✅ 10 test files listados

**Pattern Completeness:**
- ✅ 12 áreas de conflito potencial identificadas e resolvidas
- ✅ Convenções de nomenclatura para: DB, API, código (backend + frontend)
- ✅ Formato de resposta de API documentado com exemplos
- ✅ HTTP status code usage definido
- ✅ Data exchange formats especificados (datas, moeda, boolean, null, arrays, CNPJ)
- ✅ Error handling patterns (backend + frontend)
- ✅ Loading state patterns definidos
- ✅ 10 regras obrigatórias para agentes de IA
- ✅ Exemplos de código correto e anti-padrões

### Gap Analysis Results

**Important Gaps (não bloqueantes):**

1. **Schema detalhado das tabelas:** As migrations (001-007) definirão colunas exatas, tipos e constraints. Gap aceitável — será resolvido na primeira story de implementação (setup do banco).
2. **Layout do PDF de relatório:** Formato visual do PDF gerado pelo pdfkit (posições, fontes, tabelas). Será definido na story de relatórios.
3. **Template de emails:** Formato dos emails de magic link e convites de usuários. Será definido na story de autenticação.

**Nice-to-Have Gaps:**

1. Diagrama Mermaid do data flow entre componentes (visual auxiliar)
2. Seed script para dados de desenvolvimento (categorias padrão, tenant de teste)

### Validation Issues Addressed

Nenhum issue crítico encontrado. Todos os gaps identificados são de detalhe de implementação e serão resolvidos nas stories correspondentes sem risco de conflito entre agentes.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: HIGH**

**Key Strengths:**
- Stack simples e madura — custo mínimo de manutenção
- Tenant isolation como preocupação cross-cutting com middleware obrigatório
- Padrões de nomenclatura e formato documentados com exemplos e anti-padrões
- Mapeamento completo de FRs/NFRs para arquivos específicos
- Regras obrigatórias claras para consistência de implementação por agentes de IA

**Areas for Future Enhancement:**
- Migrar de scripts SQL manuais para dbmate quando >20 migrations
- Adicionar CI/CD (GitHub Actions) quando >1 dev ou deploys frequentes
- Avaliar ORM (Prisma/Drizzle) se complexidade de queries crescer significativamente
- Adicionar MFA na fase Growth (Phase 2)

### Implementation Handoff

**AI Agent Guidelines:**
- Seguir TODAS as decisões arquiteturais exatamente como documentadas
- Usar padrões de implementação consistentemente em todos os componentes
- Respeitar a estrutura de projeto e limites definidos
- Consultar este documento para TODAS as questões arquiteturais
- NUNCA violar as 10 regras obrigatórias listadas em "Enforcement Guidelines"

**First Implementation Priority:**
1. Inicializar frontend: `npm create vue@latest frontend -- --typescript --router --pinia --eslint --prettier`
2. Criar estrutura backend manual conforme árvore de diretórios
3. Criar migrations iniciais (001_create_tenants.sql, 002_create_users.sql)
4. Implementar auth + tenant isolation middleware (base de tudo)
