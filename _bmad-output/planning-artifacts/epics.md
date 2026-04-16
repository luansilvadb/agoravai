---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - D:\agora-vai\_bmad-output\planning-artifacts\prd.md
  - D:\agora-vai\_bmad-output\planning-artifacts\architecture.md
  - D:\agora-vai\_bmad-output\planning-artifacts\ux-design-specification.md
---

# agora-vai - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for agora-vai, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Um visitante pode se cadastrar como uma nova empresa (tenant) com email, CNPJ e senha
FR2: Um usuário pode fazer login com email e senha
FR3: Um usuário pode recuperar acesso via magic link enviado por email
FR4: Um usuário autenticado pode fazer logout
FR5: Um Admin pode convidar novos usuários para sua empresa via email
FR6: Um usuário convidado pode aceitar o convite e definir sua senha
FR7: Um Admin pode atribuir um papel (Admin, Operacional, Visualizador) a cada usuário da empresa
FR8: Um Admin pode remover um usuário da empresa
FR9: Um Admin pode alterar o papel de um usuário existente
FR10: O sistema restringe acesso a cada recurso conforme o papel do usuário autenticado
FR11: Um Admin pode editar as informações da empresa (nome, CNPJ, email)
FR12: Um Admin pode criar, editar e excluir categorias de receita e despesa
FR13: Um Admin pode visualizar todas as transações e configurações da empresa
FR14: Um Admin ou Operacional pode criar uma conta a pagar com descrição, valor, data de vencimento e categoria
FR15: Um Admin ou Operacional pode editar uma conta a pagar existente
FR16: Um Admin ou Operacional pode marcar uma conta a pagar como paga
FR17: Um Admin pode excluir (soft delete) uma conta a pagar
FR18: Um Admin ou Operacional pode visualizar a lista de contas a pagar com filtro por período e status
FR19: Um Admin ou Operacional pode criar uma conta a receber com descrição, valor, data de vencimento e categoria
FR20: Um Admin ou Operacional pode editar uma conta a receber existente
FR21: Um Admin ou Operacional pode marcar uma conta a receber como recebida
FR22: Um Admin pode excluir (soft delete) uma conta a receber
FR23: Um Admin ou Operacional pode visualizar a lista de contas a receber com filtro por período e status
FR24: Um Admin, Operacional ou Visualizador pode visualizar o fluxo de caixa com entradas e saídas ordenadas por data
FR25: Um Admin, Operacional ou Visualizador pode filtrar o fluxo de caixa por período
FR26: Um Admin, Operacional ou Visualizador pode visualizar o saldo acumulado em cada ponto do fluxo de caixa
FR27: Um Admin, Operacional ou Visualizador pode visualizar o dashboard com resumo financeiro ao fazer login
FR28: O dashboard exibe o saldo atual consolidado
FR29: O dashboard exibe as contas a vencer nos próximos 7 dias
FR30: O dashboard exibe as top categorias de despesas e receitas
FR31: Um Admin, Operacional ou Visualizador pode gerar um extrato financeiro por período
FR32: Um Admin, Operacional ou Visualizador pode exportar o extrato em formato CSV
FR33: Um Admin, Operacional ou Visualizador pode exportar o extrato em formato PDF
FR34: O sistema registra no audit log toda criação, edição e exclusão de contas a pagar/receber
FR35: O sistema registra no access log todo login e exportação de relatório
FR36: Um Admin pode visualizar o audit log das transações da empresa
FR37: Um Super Admin pode visualizar a lista de todas as empresas (tenants) cadastradas
FR38: Um Super Admin pode visualizar métricas de uso de cada tenant
FR39: Um Super Admin pode visualizar o status de pagamento de cada tenant
FR40: Um Super Admin pode identificar tenants inativos para intervenção proativa
FR41: O sistema garante que um usuário só pode acessar dados da sua própria empresa (tenant)
FR42: O sistema impede que qualquer usuário acesse dados de outra empresa, independente do papel
FR43: O sistema aplica soft delete (nunca delete físico) em todas as entidades financeiras

### NonFunctional Requirements

NFR1: Dashboard carrega em menos de 2 segundos (p95) para tenants com até 1.000 transações
NFR2: Criação/edição de conta concluída em menos de 500ms (p95)
NFR3: Geração de extrato CSV para 12 meses em menos de 5 segundos
NFR4: Geração de extrato PDF para 12 meses em menos de 10 segundos
NFR5: Suporta até 50 usuários simultâneos ativos sem degradação
NFR5b: Rate limiting: 100 req/min por usuário autenticado; login: 5 tentativas/15min por IP
NFR6: HTTPS/TLS 1.2+ obrigatório em toda comunicação
NFR7: Senhas com hash bcrypt (cost factor ≥ 12) ou argon2
NFR8: JWT access token expira em 15min, refresh token em 7 dias
NFR9: Refresh tokens em cookies httpOnly com SameSite=Strict
NFR10: Queries parameterizadas — zero SQL injection
NFR11: Dados sensíveis criptografados em repouso
NFR12: Headers de segurança (HSTS, X-Frame-Options, CSP, X-Content-Type-Options) em todas as respostas
NFR13: Rate limiting no login: máx 5 tentativas por IP em 15 minutos
NFR14: CORS restrito ao domínio do frontend
NFR15: Suporta até 500 tenants ativos simultâneos
NFR16: Banco suporta até 100.000 transações por tenant
NFR17: Crescimento 10x de tenants sem refatoração
NFR18: 99.5% uptime mensal (SLA MVP)
NFR19: Backup diário do banco com retenção de 30 dias
NFR20: Recovery testado mensalmente, concluído em menos de 4 horas
NFR21: Operações financeiras com transações ACID
NFR22: Restore a partir de backup sem perda de dados financeiros
NFR23: WCAG 2.1 Level AA mínimo
NFR24: Responsivo e funcional em telas a partir de 320px

### Additional Requirements

- **Starter Template:** Frontend via `npm create vue@latest frontend -- --typescript --router --pinia --eslint --prettier`. Backend criado manualmente com Express + TypeScript.
- **Database:** SQLite via better-sqlite3 v12.x, WAL mode habilitado. Sem ORM — queries SQL diretas com parameterized queries.
- **Migrations:** Scripts SQL manuais numerados em `backend/src/db/migrations/` (001-007).
- **Multi-tenancy:** `tenant_id` em todas as tabelas de negócio. Middleware obrigatório em TODAS as rotas protegidas.
- **Auth:** JWT via jsonwebtoken v9.x. Access token 15min, refresh token 7d em cookie httpOnly. Bcrypt cost factor 12.
- **RBAC:** Middleware `requireRole(...roles)` por rota. 4 papéis: admin, operational, viewer, super_admin.
- **Validation:** Zod v3.24+ para todos os inputs de rota.
- **Logging:** pino + pino-http v9.x com requestId por request.
- **Error Handling:** Global error handler middleware — nunca vaza stack trace para cliente.
- **Security Middleware Chain:** helmet → cors → rateLimit → authenticate → attachTenant → requireRole → handler.
- **Audit Logging:** Toda operação de escrita registra audit_log (imutável, append-only).
- **Access Logging:** Todo login e exportação registra access_log (retenção 90 dias).
- **Moeda:** INTEGER em centavos — NUNCA float/decimal.
- **Timezone:** America/Sao_Paulo, datas ISO 8601 com offset.
- **PDF Generation:** pdfkit (leve, ~2MB) — sem browser headless.
- **CSV Export:** BOM UTF-8, colunas separadas por `;` (padrão brasileiro).
- **Deploy:** VPS único, Caddy (TLS automático), PM2, deploy manual (MVP).
- **Backup:** Script cron diário → sqlite3 .backup → gzip → Backblaze B2.

### UX Design Requirements

UX-DR1: **Dashboard hierarquia visual (mobile-first):** 1º Saldo (grande, destaque, 48px+), 2º Contas a vencer (badge de alerta), 3º Top categorias. Leitura em 5 segundos.
UX-DR2: **Micro-interação de "dar baixa":** Ao marcar conta como paga, toast "Conta paga! ✅", saldo atualiza com transição de cor (2s), item fade-out na lista.
UX-DR3: **Onboarding "Aha!":** Após cadastro, dashboard com estado "primeiro uso" — mensagem de boas-vindas + CTA "Adicionar primeira conta". Não redirecionar para dashboard vazio seco.
UX-DR4: **Entrada de dados preditiva:** AccountForm com autocomplete de categorias (busca + sugestão), sugestão de data baseada em recorrência, máscara de moeda BRL.
UX-DR5: **Loading states:** Spinner global para navegação entre rotas. Loading local por componente (`isLoading`, `isSaving`). Botões com `:loading` prop do PrimeVue.
UX-DR6: **Feedback de erro:** Toast PrimeVue para erros de API. Erros de validação inline nos formulários (Zod → mensagem no campo). 401 → redirect `/login`, 403 → toast "Você não tem permissão".
UX-DR7: **Responsividade mobile-first:** Componentes funcionais desde 320px. AccountCard.vue para visualização mobile (alternativa à tabela).
UX-DR8: **Acessibilidade WCAG 2.1 AA:** PrimeVue com ARIA built-in. Contraste mínimo verificado. Navegação por teclado funcional.
UX-DR9: **Tom de voz amigável:** Mensagens em linguagem natural — NUNCA jargões técnicos. Ex: "Conta paga!" ao invés de "Registro atualizado com sucesso".
UX-DR10: **Design que perdoa:** Soft delete visível como "excluído" mas recuperável pelo Admin. Facilidade em desfazer ações e editar dados.
UX-DR11: **Espaço em branco / respiro:** Padding generoso em tabelas e formulários. Evitar densidade visual. Tema Aura clean do PrimeVue.
UX-DR12: **Confirmação de pagamento com reação visual:** Saldo recalcula com transição visual (número muda de cor por 2s). Badge de contas a vencer atualiza com micro-bounce.

### FR Coverage Map

| Epic | FRs Cobertos | NFRs Cobertos | UX-DRs Cobertos |
|------|-------------|---------------|-----------------|
| 1 — Auth & Onboarding | FR1-FR6 | NFR6-NFR9, NFR13, NFR14 | UX-DR3, UX-DR9 |
| 2 — Users & RBAC | FR7-FR13 | NFR12 | UX-DR6, UX-DR10 |
| 3 — Contas a Pagar | FR14-FR18 | NFR2, NFR21 | UX-DR2, UX-DR4, UX-DR5, UX-DR12 |
| 4 — Contas a Receber | FR19-FR23 | NFR2, NFR21 | UX-DR2, UX-DR4, UX-DR5, UX-DR12 |
| 5 — Fluxo de Caixa | FR24-FR26 | NFR1, NFR21 | UX-DR5 |
| 6 — Dashboard | FR27-FR30 | NFR1 | UX-DR1, UX-DR5, UX-DR11 |
| 7 — Reports & Export | FR31-FR33 | NFR3, NFR4 | UX-DR5, UX-DR6 |
| 8 — Audit & Compliance | FR34-FR36, FR43 | NFR11, NFR21, NFR22 | UX-DR10 |
| 9 — Super Admin | FR37-FR40 | NFR15 | UX-DR5 |
| 10 — Acessibilidade & Responsividade | (cross-cutting) | NFR23, NFR24 | UX-DR7, UX-DR8, UX-DR11 |

### Epic 1: Auth & Onboarding
Usuário se cadastra como nova empresa, faz login, recupera senha via magic link, e vê seu primeiro valor no sistema (fluxo "Aha!" pós-cadastro).
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6
**NFRs:** NFR6, NFR7, NFR8, NFR9, NFR13, NFR14
**UX-DRs:** UX-DR3 (onboarding "Aha!"), UX-DR9 (tom de voz amigável)
**Implementation Notes:** Story 1.1 inclui setup do banco (migrations 001-002), middleware chain base (auth, tenant, rbac, error handler). JWT + bcrypt + cookies httpOnly. Fluxo pós-cadastro: dashboard com estado "primeiro uso" + CTA.

### Story 1.1: Database Schema & Middleware Foundation

As a developer,
I want the database schema and middleware chain in place,
So that all subsequent stories have a secure, tenant-isolated foundation to build upon.

**Acceptance Criteria:**

**Given** o projeto backend está configurado com Express + TypeScript
**When** o banco de dados é inicializado
**Then** as tabelas `tenants` e `users` existem com as colunas definidas nas migrations 001 e 002
**And** o SQLite está em WAL mode
**And** todas as tabelas possuem `created_at` e `deleted_at` (soft delete)
**And** índices compostos `(tenant_id, created_at)` existem na tabela `users`

**Given** uma requisição HTTP chega a uma rota protegida
**When** o middleware chain é executado
**Then** `auth.ts` valida o JWT e extrai `user_id`, `tenant_id`, `role`
**And** `tenant.ts` injeta `tenant_id` no request context
**And** `rbac.ts` verifica permissão se `requireRole()` foi declarado na rota
**And** `errorHandler.ts` captura erros não tratados e retorna `{ error: { code, message } }`
**And** `rateLimiter.ts` aplica limite de 100 req/min por usuário e 5 tentativas/15min para login

**Given** um teste de isolamento de tenant é executado
**When** um usuário do tenant A tenta acessar dados do tenant B
**Then** a resposta é HTTP 403 ou 404
**And** nenhuma query retorna dados cruzados entre tenants

**Given** o servidor é iniciado
**When** o CORS é configurado
**Then** apenas o domínio do frontend oficial é permitido
**And** headers de segurança (helmet) estão ativos (HSTS, X-Frame-Options, CSP, X-Content-Type-Options)

### Story 1.2: Registro & Login

As a business owner,
I want to register my company and log in with email and password,
So that I can start managing my finances securely.

**Acceptance Criteria:**

**Given** um visitante acessa `/register`
**When** preenche nome da empresa, CNPJ, email e senha (min 8 chars, 1 número, 1 maiúscula)
**Then** o backend valida CNPJ com algoritmo módulo 11
**And** se CNPJ inválido, retorna HTTP 400 com mensagem "CNPJ inválido"
**And** se válido, cria tenant + usuário admin no banco (dentro de transação)
**And** retorna HTTP 201 com JWT access token (15min) + refresh token (7d em cookie httpOnly SameSite=Strict)
**And** a senha é armazenada com hash bcrypt (cost factor ≥ 12)

**Given** um usuário cadastrado acessa `/login`
**When** insere email e senha corretos
**Then** o backend valida credenciais e retorna JWT access + refresh token
**And** é redirecionado ao `/dashboard`
**And** se credenciais inválidas, retorna HTTP 401 sem distinguir se email ou senha está errado

**Given** o endpoint de login recebe muitas tentativas
**When** um IP excede 5 tentativas em 15 minutos
**Then** retorna HTTP 429 com header `Retry-After`
**And** o bloqueio é temporário (15 minutos)

**Given** o visitante envia dados no formato errado
**When** o Zod valida o body
**Then** retorna HTTP 400 com `{ error: { code: "INVALID_INPUT", message: "...", details: { field } } }`

### Story 1.3: Recuperação de Senha & Logout

As a user who forgot my password,
I want to regain access via magic link,
So that I don't need to contact support to reset my credentials.

**Acceptance Criteria:**

**Given** um usuário acessa `/forgot-password`
**When** insere seu email cadastrado
**Then** o sistema gera um magic link único (expira em 15 min, uso único)
**And** envia email via serviço externo (Resend/SendGrid)
**And** retorna HTTP 200 com mensagem "Se o email existir, você receberá um link de recuperação" (sem confirmar se email existe)

**Given** o usuário clica no magic link
**When** o link é válido e não expirado
**Then** permite definir uma nova senha
**And** a senha é armazenada com bcrypt (cost factor ≥ 12)
**And** o link é invalidado após uso único
**And** se link expirado ou usado, retorna HTTP 400 com "Link expirado ou inválido"

**Given** um usuário autenticado faz logout
**When** chama `POST /auth/logout`
**Then** o refresh token é revogado no servidor
**And** o cookie httpOnly é limpo
**And** é redirecionado para `/login`
**And** retorna HTTP 200 com mensagem "Até logo! 👋"

### Story 1.4: Convites de Usuário

As an Admin,
I want to invite team members with specific roles,
So that they can collaborate on managing the company's finances.

**Acceptance Criteria:**

**Given** um Admin está na página de usuários
**When** insere email do convidado + papel (Admin, Operacional, Visualizador)
**Then** o sistema gera token de convite (expira em 7 dias, uso único)
**And** envia email com link de aceite via serviço externo
**And** retorna HTTP 201 com mensagem "Convite enviado para {email}"

**Given** um convidado clica no link de convite
**When** o token é válido e não expirado
**Then** apresenta formulário para definir senha
**And** ao definir senha, a conta é criada no tenant com o papel especificado
**And** login automático → redirect para `/dashboard`
**And** se token expirado ou usado, retorna HTTP 400 com "Link expirado ou inválido"

**Given** um Admin tenta atribuir um papel inexistente
**When** o Zod valida o body
**Then** retorna HTTP 400 com `{ error: { code: "INVALID_INPUT", message: "Papel deve ser admin, operational ou viewer" } }`

### Story 1.5: Fluxo "Aha!" Pós-Cadastro

As a first-time user,
I want to see immediate value after registering,
So that I understand why this product is useful and add my first account.

**Acceptance Criteria:**

**Given** um Admin acabou de se cadastrar e fez login pela primeira vez
**When** é redirecionado ao `/dashboard`
**Then** vê mensagem de boas-vindas: "🎉 Bem-vindo ao agora-vai!"
**And** vê texto: "Seu caixa está vazio. Vamos começar?"
**And** vê CTA primário: "➕ Adicionar primeira conta"
**And** o CTA abre `AccountForm.vue` em modo diálogo

**Given** o usuário adiciona sua primeira conta
**When** salva com sucesso
**Then** toast aparece: "Sua primeira conta foi adicionada! Seu fluxo de caixa já começou 🚀"
**And** é redirecionado ao DashboardView normal (sem mensagem de boas-vindas)
**And** o saldo e dados são exibidos

**Given** o usuário faz login novamente (não é primeiro uso)
**When** o dashboard carrega
**Then** NÃO vê mensagem de boas-vindas
**And** se o tenant não tem contas há 7 dias, vê banner discreto: "Parece que está tranquilo por aqui. Que tal adicionar uma conta?"

### Epic 2: Users & RBAC
Admin gerencia usuários da empresa (convidar, remover, alterar papéis), configura dados da empresa e gerencia categorias de receita/despesa.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13
**NFRs:** NFR12
**UX-DRs:** UX-DR6 (feedback de erro/permissão), UX-DR10 (design que perdoa)
**Implementation Notes:** Middleware requireRole por rota. Frontend oculta ações não permitidas. Categorias pré-definidas para novos tenants.

### Story 2.1: Gestão de Usuários — CRUD e Papéis

As an Admin,
I want to manage users in my company (assign roles, remove, change roles),
So that I control who has access and what they can do.

**Acceptance Criteria:**

**Given** um Admin acessa `/users`
**When** a página carrega
**Then** vê lista de todos os usuários do tenant com: nome, email, papel, data de cadastro
**And** paginação de 20 itens por página

**Given** um Admin quer alterar o papel de um usuário
**When** seleciona usuário e escolhe novo papel (Admin, Operacional, Visualizador)
**Then** a permissão é aplicada imediatamente
**And** audit log registra a alteração
**And** toast: "Papel de {nome} alterado para {papel}"

**Given** um Admin quer remover um usuário
**When** clica em "Remover" e confirma
**Then** o usuário é marcado com `deleted_at` (soft delete)
**And** perde acesso na próxima requisição
**And** os dados criados pelo usuário permanecem (não são deletados)
**And** toast: "{nome} removido da empresa"

**Given** um usuário com papel alterado de Operacional para Visualizador
**When** tenta criar/editar uma conta
**Then** recebe HTTP 403 com toast "Você não tem permissão para esta ação"
**And** o frontend oculta botões de criar/editar

### Story 2.2: Gestão de Empresa

As an Admin,
I want to edit my company's information and view all transactions,
So that my business data is accurate and I have full visibility.

**Acceptance Criteria:**

**Given** um Admin acessa `/settings`
**When** edita nome da empresa, CNPJ ou email
**Then** salva → alterações persistem e refletem imediatamente
**And** CNPJ alterado passa por validação módulo 11
**And** toast: "Dados da empresa atualizados"

**Given** um Admin acessa `/settings`
**When** visualiza a seção de transações
**Then** vê lista completa de todas as contas a pagar e receber
**And** vê lista de usuários, categorias e dados da empresa
**And** todas as listas são filtradas por `tenant_id`

### Story 2.3: Gestão de Categorias

As an Admin,
I want to create, edit, and delete income and expense categories,
So that I can organize my finances in a way that makes sense for my business.

**Acceptance Criteria:**

**Given** um Admin acessa `/categories`
**When** cria uma categoria com nome e tipo (receita/despesa)
**Then** a categoria aparece na lista do tenant
**And** está disponível no autocomplete do AccountForm.vue
**And** toast: "Categoria '{nome}' criada"

**Given** um Admin edita o nome de uma categoria
**When** salva
**Then** o nome atualiza em todas as transações existentes que usam essa categoria
**And** audit log registra a alteração

**Given** um Admin exclui uma categoria
**When** confirma a exclusão
**Then** a categoria é marcada com `deleted_at` (soft delete)
**And** transações existentes mantêm a referência (a categoria não é removida das transações)
**And** a categoria não aparece mais no autocomplete

**Given** um novo tenant é criado
**When** acessa `/categories` pela primeira vez
**Then** vê categorias pré-definidas: Aluguel, Energia, Telefone, Matéria-prima, Salários, Impostos (despesa) e Vendas, Serviços (receita)

### Epic 3: Contas a Pagar
Admin e Operacional lançam, editam, dão baixa e excluem contas a pagar com filtros por período e status.
**FRs covered:** FR14, FR15, FR16, FR17, FR18
**NFRs:** NFR2, NFR21
**UX-DRs:** UX-DR2 (micro-interação de "dar baixa"), UX-DR4 (entrada preditiva), UX-DR5 (loading states), UX-DR12 (reação visual do saldo)
**Implementation Notes:** AccountForm.vue com autocomplete de categorias, máscara BRL, sugestão de data. Transação ACID ao marcar como paga. Audit log em toda operação.

### Story 3.1: Criar Conta a Pagar

As an Admin or Operational user,
I want to create a payable account with description, amount, due date, and category,
So that I can track what my business owes.

**Acceptance Criteria:**

**Given** um Admin ou Operacional acessa `/accounts-payable` e clica "Nova Conta a Pagar"
**When** preenche descrição (obrigatório), valor (máscara BRL), vencimento (date picker, default: hoje + 15 dias) e categoria (autocomplete)
**Then** o Zod valida todos os campos no backend
**And** se valor negativo, retorna HTTP 400 com "O valor deve ser um número positivo"
**And** se válido, salva no banco com status "pendente"
**And** o valor é armazenado como INTEGER em centavos
**And** audit log registra a criação
**And** retorna HTTP 201 com `{ data: { id, description, amount, dueDate, category, status: "pending" } }`
**And** toast: "Conta a pagar criada!"

**Given** o campo de categoria está em foco
**When** o usuário começa a digitar
**Then** o autocomplete filtra categorias existentes por nome
**And** se não existe, exibe botão "+ Criar categoria" (Admin apenas)

**Given** uma conta similar foi criada nos últimos 30 dias
**When** o usuário preenche a descrição
**Then** sugere: "O último '{descrição}' venceu dia {data}. Usar mesma data?"

### Story 3.2: Editar e Excluir Conta a Pagar

As an Admin,
I want to edit or delete a payable account,
So that I can correct mistakes or remove entries that shouldn't exist.

**Acceptance Criteria:**

**Given** um Admin ou Operacional visualiza uma conta a pagar
**When** edita qualquer campo e salva
**Then** as alterações refletem na lista e no fluxo de caixa
**And** audit log registra quem alterou e quais campos mudaram (old_value → new_value)
**And** toast: "Conta atualizada!"

**Given** um Admin visualiza uma conta a pagar
**When** clica "Excluir" e confirma no ConfirmDialog
**Then** `deleted_at` = now (soft delete)
**And** o item é ocultado das listas
**And** não afeta o fluxo de caixa (transação removida retroativamente)
**And** audit log registra a exclusão
**And** toast: "Conta excluída"

**Given** um Operacional tenta excluir uma conta
**When** clica em "Excluir"
**Then** o botão não é visível (frontend oculta)
**And** se tenta via API, retorna HTTP 403

### Story 3.3: Marcar como Paga

As an Admin or Operational user,
I want to mark a payable account as paid,
So that my cash flow reflects the payment and I know what's still outstanding.

**Acceptance Criteria:**

**Given** um Admin ou Operacional visualiza uma conta com status "pendente"
**When** clica "Marcar como paga" e confirma
**Then** `paid_at` = now e status muda para "paga"
**And** a operação é atômica via transação SQLite (marca paga + atualiza saldo do fluxo de caixa)
**And** audit log registra a ação
**And** toast verde: "Conta paga! ✅"
**And** na lista: item muda status com fade (0.3s)
**And** saldo no Dashboard atualiza com transição de cor (2 segundos)

**Given** o usuário tenta marcar como paga uma conta já paga
**When** clica no botão
**Then** o botão está desabilitado com label "Paga"

### Story 3.4: Lista de Contas a Pagar com Filtros

As an Admin or Operational user,
I want to view and filter my payable accounts,
So that I can find what I need quickly and see what's overdue.

**Acceptance Criteria:**

**Given** um Admin ou Operacional acessa `/accounts-payable`
**When** a página carrega
**Then** vê lista ordenada por `due_date` ascendente
**And** colunas: descrição, valor (formatado BRL), vencimento, categoria, status (badge colorido)
**And** paginação de 20 itens por página

**Given** o usuário aplica filtros de período (de/até) e/ou status (pendente/paga/vencida)
**When** clica "Filtrar"
**Then** a lista recalcula com apenas transações matching os filtros
**And** o badge de contagem total atualiza

**Given** uma conta está vencida (`due_date` < hoje e status "pendente")
**When** aparece na lista
**Then** o status exibe badge vermelho "Vencida"

### Epic 4: Contas a Receber
Admin e Operacional lançam, editam, registram recebimentos e excluem contas a receber com filtros por período e status.
**FRs covered:** FR19, FR20, FR21, FR22, FR23
**NFRs:** NFR2, NFR21
**UX-DRs:** UX-DR2, UX-DR4, UX-DR5, UX-DR12
**Implementation Notes:** Mesmas patterns do Epic 3 (compartilha AccountForm.vue e AccountList.vue). Toast "Recebimento registrado! 💰".

### Story 4.1: Criar Conta a Receber

As an Admin or Operational user,
I want to create a receivable account with description, amount, due date, and category,
So that I can track what my business is owed.

**Acceptance Criteria:**

**Given** um Admin ou Operacional acessa `/accounts-receivable` e clica "Nova Conta a Receber"
**When** preenche descrição, valor (máscara BRL), vencimento (default: hoje + 15 dias) e categoria (autocomplete)
**Then** o Zod valida todos os campos no backend
**And** se valor negativo, retorna HTTP 400 com "O valor deve ser um número positivo"
**And** se válido, salva no banco com status "pendente"
**And** valor armazenado como INTEGER em centavos
**And** audit log registra a criação
**And** retorna HTTP 201 com `{ data: { id, description, amount, dueDate, category, status: "pending" } }`
**And** toast: "Conta a receber criada!"

### Story 4.2: Editar e Excluir Conta a Receber

As an Admin,
I want to edit or delete a receivable account,
So that I can correct mistakes or remove entries that shouldn't exist.

**Acceptance Criteria:**

**Given** um Admin ou Operacional visualiza uma conta a receber
**When** edita qualquer campo e salva
**Then** as alterações refletem na lista e fluxo de caixa
**And** audit log registra quem alterou e o quê
**And** toast: "Conta atualizada!"

**Given** um Admin clica "Excluir" e confirma
**Then** `deleted_at` = now (soft delete)
**And** item oculto das listas
**And** audit log registra exclusão
**And** toast: "Conta excluída"

**Given** um Operacional tenta excluir
**When** tenta via API
**Then** retorna HTTP 403

### Story 4.3: Marcar como Recebida

As an Admin or Operational user,
I want to mark a receivable account as received,
So that my cash flow reflects the income.

**Acceptance Criteria:**

**Given** um Admin ou Operacional visualiza conta com status "pendente"
**When** clica "Marcar como recebida" e confirma
**Then** `received_at` = now, status "recebida"
**And** operação atômica via transação SQLite
**And** audit log registra a ação
**And** toast: "Recebimento registrado! 💰"
**And** item muda status com fade (0.3s)
**And** saldo no Dashboard atualiza com transição de cor (2s)

### Story 4.4: Lista de Contas a Receber com Filtros

As an Admin or Operational user,
I want to view and filter my receivable accounts,
So that I can find what I need quickly and see what's overdue.

**Acceptance Criteria:**

**Given** um Admin ou Operacional acessa `/accounts-receivable`
**When** a página carrega
**Then** vê lista ordenada por `due_date` ascendente
**And** colunas: descrição, valor (BRL), vencimento, categoria, status (badge)
**And** paginação de 20 itens
**And** filtros: período (de/até) e status (pendente/recebida/vencida)

### Epic 5: Fluxo de Caixa
Usuários visualizam entradas e saídas cronológicas com saldo acumulado e filtros por período.
**FRs covered:** FR24, FR25, FR26
**NFRs:** NFR1, NFR21
**UX-DRs:** UX-DR5 (loading states)
**Implementation Notes:** Saldo carry-over para períodos filtrados. Paginação 20 itens. Query otimizada com índices compostos.

### Story 5.1: Visualizar Fluxo de Caixa

As a user,
I want to see my cash flow with income and expenses ordered by date,
So that I can understand my financial history at a glance.

**Acceptance Criteria:**

**Given** um Admin, Operacional ou Visualizador acessa `/cashflow`
**When** a página carrega
**Then** vê lista cronológica com colunas: data, descrição, tipo (entrada/saída com badge verde/vermelho), valor, saldo acumulado
**And** ordenada por data (mais recente primeiro)
**And** paginação de 20 itens
**And** o saldo acumulado = soma de todas as entradas - saídas até aquela data
**And** NFR1: carrega em < 2s (p95) para tenants com até 1.000 transações

### Story 5.2: Filtrar Fluxo de Caixa por Período

As a user,
I want to filter my cash flow by date range,
So that I can analyze specific periods.

**Acceptance Criteria:**

**Given** um usuário acessa `/cashflow` e aplica filtro de/até
**When** clica "Filtrar"
**Then** a lista recalcula com apenas transações no período
**And** o saldo inicial do período considera transações anteriores (carry-over)
**And** a primeira linha exibe "Saldo anterior: R$ X.XXX,XX"
**And** o saldo acumulado recalcula corretamente a partir do carry-over

**Given** o usuário limpa os filtros
**When** clica "Limpar"
**Then** volta a exibir todas as transações

### Epic 6: Dashboard
Usuário vê resumo financeiro em 5 segundos ao fazer login: saldo, contas a vencer (7 dias), top categorias.
**FRs covered:** FR27, FR28, FR29, FR30
**NFRs:** NFR1
**UX-DRs:** UX-DR1 (hierarquia visual), UX-DR5 (loading states), UX-DR11 (espaço em branco)
**Implementation Notes:** Hierarquia: 1º Saldo (48px+), 2º DueSoonList (badge alerta), 3º TopCategories. Dados carregados em < 2s p95.

### Story 6.1: Dashboard — Saldo e Contas a Vencer

As a user,
I want to see my current balance and upcoming bills when I log in,
So that I know my financial situation in 5 seconds.

**Acceptance Criteria:**

**Given** um usuário faz login
**When** é redirecionado ao `/dashboard`
**Then** vê saldo atual consolidado em destaque no topo (48px+)
**And** saldo = total recebido - total pago
**And** valor negativo exibido em vermelho
**And** NFR1: dados carregados em < 2s (p95)
**And** layout responsivo mobile-first

**Given** existem contas a vencer nos próximos 7 dias
**When** o dashboard carrega
**Then** vê lista de contas com `due_date` entre hoje e hoje+7d, status "pendente"
**And** ordenadas por vencimento
**And** badge com contador: "X contas vencendo" (vermelho se > 3, amarelo se ≤ 3)
**And** se zero contas: mensagem "Nenhuma conta vencendo esta semana ✅"

### Story 6.2: Dashboard — Top Categorias

As a user,
I want to see my top income and expense categories,
So that I understand where my money is going.

**Acceptance Criteria:**

**Given** um usuário acessa o dashboard
**When** a página carrega
**Then** vê Top 5 categorias de despesa por valor acumulado no mês atual
**And** vê Top 5 categorias de receita por valor acumulado no mês atual
**And** exibido como lista simples (nome + valor total)
**And** sem gráficos no MVP (deferido para Growth)

**Given** o tenant não tem transações no mês
**When** o dashboard carrega
**Then** vê mensagem "Nenhuma transação este mês"

### Epic 7: Relatórios & Exportação
Usuários geram extrato por período e exportam em CSV (BOM UTF-8) e PDF (pdfkit).
**FRs covered:** FR31, FR32, FR33
**NFRs:** NFR3, NFR4
**UX-DRs:** UX-DR5 (loading states), UX-DR6 (feedback de erro)
**Implementation Notes:** CSV: colunas separadas por `;`, BOM UTF-8. PDF: pdfkit server-side (sem browser headless). Access log registra exportações.

### Story 7.1: Gerar Extrato por Período

As a user,
I want to generate a financial statement for a specific period,
So that I can review my transactions and share with my accountant.

**Acceptance Criteria:**

**Given** um Admin, Operacional ou Visualizador acessa `/reports`
**When** seleciona período (de/até) e clica "Gerar"
**Then** vê lista de todas as transações no período com: data, descrição, tipo, valor, categoria, saldo acumulado
**And** ordenada por data
**And** paginação de 20 itens
**And** saldo final confere com o saldo do dashboard

### Story 7.2: Exportar Extrato em CSV

As a user,
I want to export my statement as CSV,
So that I can analyze it in spreadsheets or share with my accountant.

**Acceptance Criteria:**

**Given** um usuário gerou um extrato
**When** clica "Exportar CSV"
**Then** download inicia em < 5s para período de até 12 meses
**And** arquivo `.csv` com BOM UTF-8 (compatível Excel)
**And** colunas separadas por `;` (padrão brasileiro)
**And** access log registra exportação com `user_id`, `action: "export_csv"`, `ip_address`

### Story 7.3: Exportar Extrato em PDF

As a user,
I want to export my statement as PDF,
So that I can share a formatted, professional-looking report with my accountant.

**Acceptance Criteria:**

**Given** um usuário gerou um extrato
**When** clica "Exportar PDF"
**Then** download inicia em < 10s para período de até 12 meses
**And** arquivo `.pdf` formatado com: cabeçalho (nome da empresa, período), tabela de transações, saldo final
**And** geração server-side via pdfkit (sem browser headless)
**And** access log registra exportação com `user_id`, `action: "export_pdf"`, `ip_address`

### Epic 8: Auditoria & Conformidade
Admin visualiza audit log de todas as operações. Soft delete aplicado em todas entidades financeiras.
**FRs covered:** FR34, FR35, FR36, FR43
**NFRs:** NFR11, NFR21, NFR22
**UX-DRs:** UX-DR10 (design que perdoa)
**Implementation Notes:** Audit log append-only (nunca deletado/editado). Access log com retenção 90 dias. Soft delete em todas entidades.

### Story 8.1: Visualizar Audit Log

As an Admin,
I want to see a log of all changes made to my company's data,
So that I can track who did what and when.

**Acceptance Criteria:**

**Given** um Admin acessa `/audit`
**When** a página carrega
**Then** vê tabela com colunas: data/hora, usuário, ação (create/update/delete), entidade, detalhes expansíveis
**And** detalhes mostram JSON do old_value/new_value
**And** ordenada por data decrescente
**And** paginação de 20 itens
**And** sem filtros avançados no MVP

**Given** uma operação de criação/edição/exclusão foi realizada
**When** o audit log é consultado
**Then** a entrada contém: `user_id`, `action`, `entity_type`, `entity_id`, `old_value` (null se create), `new_value` (null se delete), `created_at`

### Story 8.2: Soft Delete e Access Log

As a system,
I want to never physically delete financial data and log all access,
So that data is always recoverable and access is auditable.

**Acceptance Criteria:**

**Given** qualquer entidade financeira (accounts_payable, accounts_receivable, categories, users, tenants)
**When** é "excluída"
**Then** `deleted_at` = now (soft delete) — nunca DELETE físico
**And** todas as queries filtram `WHERE deleted_at IS NULL` por padrão

**Given** um usuário faz login ou exporta relatório
**When** a ação é executada
**Then** entrada no `access_log` com: `user_id`, `action`, `ip_address`, `created_at`
**And** access_log com retenção de 90 dias (soft delete após)

**Given** o audit_log é consultado
**When** qualquer tentativa de alteração
**Then** o audit_log é imutável — nunca deletado ou editado

### Epic 9: Super Admin
Gestor da plataforma visualiza todos os tenants, métricas de uso, status de pagamento e identifica tenants inativos para intervenção.
**FRs covered:** FR37, FR38, FR39, FR40
**NFRs:** NFR15
**UX-DRs:** UX-DR5 (loading states)
**Implementation Notes:** Tenant ativo = login ou transação nos últimos 30 dias. Alerta após 5 dias sem atividade. Mailto: com template pré-preenchido.

### Story 9.1: Lista de Tenants

As a Super Admin,
I want to see all registered companies and their status,
So that I can monitor the health of my platform.

**Acceptance Criteria:**

**Given** um Super Admin acessa `/admin`
**When** a página carrega
**Then** vê tabela com: nome da empresa, CNPJ, data de cadastro, status (trial/pagante/inativo), último login
**And** ordenada por data de cadastro
**And** paginação de 20 itens
**And** badge colorido por status: trial (amarelo), pagante (verde), inativo (cinza)
**And** filtro por status

### Story 9.2: Métricas e Intervenção de Tenant

As a Super Admin,
I want to see usage metrics for each tenant and identify inactive ones,
So that I can proactively reach out and prevent churn.

**Acceptance Criteria:**

**Given** um Super Admin clica em um tenant
**When** o painel de métricas abre
**Then** vê: último login (data/hora), total de transações criadas, dias desde cadastro, número de usuários ativos
**And** "tenant ativo" = fez login ou criou transação nos últimos 30 dias

**Given** um tenant sem login ou transação em 5 dias após cadastro
**When** aparece na lista
**Then** badge de alerta "precisa de atenção"
**And** botão "Contatar" abre `mailto:` com template de email pré-preenchido

### Epic 10: Acessibilidade & Responsividade
Sistema acessível WCAG 2.1 AA e funcional em telas desde 320px.
**FRs covered:** (cross-cutting — aplica-se a todos os epics)
**NFRs:** NFR23, NFR24
**UX-DRs:** UX-DR7 (responsividade mobile-first), UX-DR8 (WCAG 2.1 AA), UX-DR11 (espaço em branco)
**Implementation Notes:** PrimeVue ARIA built-in. AccountCard.vue para mobile. Contraste verificado. Navegação por teclado. Refinamento de espaçamento em todos os componentes.

### Story 10.1: Responsividade Mobile-First

As a mobile user,
I want the system to work well on small screens (320px+),
So that I can manage my finances on the go.

**Acceptance Criteria:**

**Given** o sistema é acessado em tela de 320px de largura
**When** todas as views são renderizadas
**Then** todos os componentes são funcionais e legíveis
**And** AccountCard.vue é usado como alternativa à tabela em telas pequenas
**And** sem scroll horizontal
**And** botões e inputs com área de toque mínima de 44x44px

**Given** o sistema é acessado em desktop
**When** as views são renderizadas
**Then** layout se expande aproveitando o espaço
**And** entrada de dados em lote otimizada (navegação por teclado, atalhos)

### Story 10.2: Acessibilidade WCAG 2.1 AA

As a user with accessibility needs,
I want the system to follow WCAG 2.1 AA guidelines,
So that I can use it effectively regardless of my abilities.

**Acceptance Criteria:**

**Given** qualquer componente do sistema
**When** renderizado
**Then** contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande
**And** todos os elementos interativos acessíveis via teclado (Tab, Enter, Escape)
**And** componentes PrimeVue com atributos ARIA corretos

**Given** um usuário usa leitor de tela
**When** navega pelas views
**Then** todos os campos de formulário possuem labels associados
**And** badges de status possuem texto alternativo (não apenas cor)
**And** loading states anunciados ao leitor de tela

### Story 10.3: Espaçamento e Design Visual

As a user,
I want a clean, spacious interface that doesn't overwhelm me,
So that I feel calm and in control when managing my finances.

**Acceptance Criteria:**

**Given** qualquer view do sistema
**When** renderizada
**Then** padding generoso em tabelas e formulários (mínimo 16px entre seções)
**And** tabelas sem densidade visual excessiva (máximo 6 colunas visíveis em mobile)
**And** tema Aura clean do PrimeVue aplicado consistentemente
**And** espaço em branco usado intencionalmente para criar "respiro"
