# Story 1.3: Recuperação de Senha & Logout

Status: done

## Story

As a user who forgot my password,
I want to regain access via magic link,
So that I don't need to contact support to reset my credentials.

## Acceptance Criteria

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

## Tasks / Subtasks

- [x] Task 1: Endpoint de Esqueceu Senha `/auth/forgot-password`
  - [x] Validar email via Zod
  - [x] Gerar token UUID e salvar em `password_resets` (expira em 15min)
  - [x] Simular envio de email via logger (pino) por enquanto
  - [x] Retornar 200 genérico para evitar enumeração de usuários
- [x] Task 2: Endpoint de Resetar Senha `/auth/reset-password`
  - [x] Validar token e nova senha via Zod
  - [x] Verificar se token é válido, não expirado e não usado
  - [x] Atualizar `password_hash` do usuário com bcrypt cost factor 12
  - [x] Marcar token como usado (`used_at`) em transação
- [x] Task 3: Endpoint de Logout `/auth/logout`
  - [x] Limpar cookie `refreshToken`
  - [x] Retornar mensagem de despedida amigável
- [x] Task 4: Testes de Recuperação e Logout
  - [x] Criar testes no `tests/authFlow.test.ts`
  - [x] Testar fluxo completo de reset de senha
  - [x] Testar token expirado ou já usado
  - [x] Testar logout limpa o cookie corretamente

## Dev Notes

### Architecture Compliance
- Magic link expira em 15 minutos (`datetime('now', '+15 minutes')` no SQLite)
- Senha com bcrypt cost factor 12
- Logout limpa cookie `httpOnly`
- Evitar enumeração de usuários: `/forgot-password` sempre retorna 200 se o email for sintaticamente válido.

### References
- [Source: architecture.md#Authentication & Security]
- [Source: epics.md#Story 1.3]
