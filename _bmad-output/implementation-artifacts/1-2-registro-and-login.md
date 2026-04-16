# Story 1.2: Registro & Login

Status: review

## Story

As a business owner,
I want to register my company and log in with email and password,
So that I can start managing my finances securely.

## Acceptance Criteria

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

## Tasks / Subtasks

- [x] Task 1: Validação de CNPJ com algoritmo módulo 11 (AC: 1)
  - [x] Criar `src/utils/cnpj.ts` com funções de validação
  - [x] Implementar algoritmo módulo 11 completo
  - [x] Testar CPF inválido retorna false, válido retorna true
- [x] Task 2: Schemas Zod para registro e login (AC: 1, 4)
  - [x] Criar `src/utils/validation.ts` com schemas Zod
  - [x] Schema de registro: nome empresa, CNPJ, email, senha (min 8, 1 número, 1 maiúscula)
  - [x] Schema de login: email, senha
  - [x] Middleware de validação genérico que retorna formato de erro padrão
- [x] Task 3: Endpoint de Registro `/auth/register` (AC: 1)
  - [x] Criar `src/routes/auth.ts`
  - [x] POST /auth/register: valida CNPJ → cria tenant + user admin em transação
  - [x] Gera JWT access token (15min) + refresh token (7d)
  - [x] Refresh token em cookie httpOnly SameSite=Strict
  - [x] Retorna HTTP 201 com dados do user + tenant
- [x] Task 4: Endpoint de Login `/auth/login` (AC: 2, 3)
  - [x] POST /auth/login: valida credenciais → retorna JWT
  - [x] Bcrypt compare para validar senha
  - [x] Retorna 401 genérico para credenciais inválidas
  - [x] Rate limiter específico para login (5/15min por IP)
- [x] Task 5: Testes de Auth Flow (AC: 1, 2, 3, 4)
  - [x] Criar `tests/authFlow.test.ts`
  - [x] Teste de registro bem-sucedido com CNPJ válido
  - [x] Teste de registro com CNPJ inválido → HTTP 400
  - [x] Teste de login bem-sucedido → HTTP 201 + tokens
  - [x] Teste de login com senha errada → HTTP 401
  - [x] Teste de rate limiting no login → HTTP 429 após 5 tentativas

## Dev Notes

### Architecture Compliance

**CNPJ Validation:**
- Algoritmo módulo 11 com pesos específicos para cada dígito
- CNPJ formatado: `XX.XXX.XXX/XXXX-XX`
- CNPJ sem formatação: 14 dígitos numéricos
- Validar dígitos verificadores (posição 13 e 14)

**JWT Tokens:**
- Access token: `{ user_id, tenant_id, role, email }` com expiração 15min
- Refresh token: UUID único, armazenado em cookie httpOnly
- Secret: `process.env.JWT_SECRET` (fallback para dev secret)

**Password Requirements:**
- Mínimo 8 caracteres
- Pelo menos 1 número
- Pelo menos 1 letra maiúscula
- Bcrypt cost factor 12

**Response Formats:**
- Sucesso registro: `{ data: { user: { id, name, email, role }, tenant: { id, name, plan } } }`
- Sucesso login: `{ data: { user: { id, name, email, role } } }`
- Erro: `{ error: { code: "INVALID_INPUT", message: "...", details: { field } } }`

**Security:**
- CNPJ validado ANTES de criar tenant
- Transação atômica: tenant + user admin (rollback se falhar)
- Refresh token em cookie httpOnly + SameSite=Strict
- Nunca distinguir se email ou senha está errado no login

### References

- [Source: architecture.md#Authentication & Security] — JWT, bcrypt, cookies
- [Source: architecture.md#Implementation Patterns] — snake_case SQL, camelCase JSON
- [Source: epics.md#Story 1.2] — User story and acceptance criteria
- [Source: Story 1.1] — Database schema already exists with tenants and users tables

## Dev Agent Record

### Agent Model Used

Qwen Code (Qwen-2.5-Coder)

### Debug Log References

- CNPJ validation: algoritmo módulo 11 implementado corretamente
- Teste de duplicate email falhou inicialmente porque CNPJ de teste era inválido
- Criado helper `generateValidCnpj()` para gerar CNPJs válidos únicos por timestamp
- Rate limiting funciona corretamente: 5 tentativas/15min → HTTP 429

### Completion Notes List

✅ **Task 1: Validação de CNPJ**
- `src/utils/cnpj.ts`: validateCnpj(), formatCnpj(), cleanCnpj()
- Algoritmo módulo 11 completo com pesos corretos
- Elimina CNPJs com todos dígitos iguais

✅ **Task 2: Schemas Zod**
- `src/utils/validation.ts`: registerSchema, loginSchema, validateWithZod middleware
- Validação de senha: min 8 chars, 1 número, 1 maiúscula
- Formato de erro padrão: `{ error: { code, message, details } }`

✅ **Task 3: Endpoint de Registro**
- `src/routes/auth.ts`: POST /api/v1/auth/register
- Transação atômica: tenant + user admin
- JWT access token (15min) + refresh token (7d em cookie httpOnly)
- Verificação de CNPJ/email duplicados

✅ **Task 4: Endpoint de Login**
- POST /api/v1/auth/login com rate limiter (5/15min)
- Bcrypt compare para validar senha
- Retorna 401 genérico (não distingue email/senha errado)

✅ **Task 5: Testes**
- `tests/authFlow.test.ts`: 9 testes (registro, login, rate limiting)
- 19/19 testes passando no total (incluindo testes anteriores)

### File List

- backend/src/utils/cnpj.ts
- backend/src/utils/validation.ts
- backend/src/services/authService.ts
- backend/src/routes/auth.ts
- backend/src/app.ts (atualizado com cookie-parser e auth routes)
- backend/tests/authFlow.test.ts
- backend/package.json (adicionado cookie-parser, supertest)
