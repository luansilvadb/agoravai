# Story 1.4: Convites de Usuário

Status: done

## Story

As an Admin,
I want to invite team members with specific roles,
So that they can collaborate on managing the company's finances.

## Acceptance Criteria

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

## Tasks / Subtasks

- [x] Task 1: Tabela de Convites (`invitations`)
  - [x] Criar migration `004_create_invitations.sql`
  - [x] Colunas: `id`, `tenant_id`, `email`, `role`, `token`, `expires_at`, `accepted_at`, `created_at`
- [x] Task 2: Endpoint de Enviar Convite `/auth/invite`
  - [x] Somente Admin pode convidar (usar `authenticate` + `requireRole('admin')`)
  - [x] Validar email e role via Zod
  - [x] Gerar token UUID e salvar em `invitations` (expira em 7 dias)
  - [x] Simular envio de email via logger
- [x] Task 3: Endpoint de Aceitar Convite `/auth/accept-invite`
  - [x] Validar token, nome e senha via Zod
  - [x] Verificar se token é válido, não expirado e não usado
  - [x] Criar usuário em transação (mesmo tenant do convite)
  - [x] Marcar convite como aceito (`accepted_at`)
  - [x] Retornar tokens de login (auto-login)
- [x] Task 4: Testes de Convites
  - [x] Criar testes no `tests/authFlow.test.ts`
  - [x] Testar fluxo completo de convite
  - [x] Testar expiração e uso único
  - [x] Testar restrição de role (apenas Admin pode convidar)

## Dev Notes

### Architecture Compliance
- Invitation link expira em 7 dias (`datetime('now', '+7 days')` no SQLite)
- Senha com bcrypt cost factor 12
- `tenant_id` herdado do convite no momento da criação do usuário
- Auto-login após aceite para melhorar UX

### References
- [Source: architecture.md#Authentication & Security]
- [Source: epics.md#Story 1.4]
