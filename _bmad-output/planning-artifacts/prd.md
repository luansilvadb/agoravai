---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments: []
workflowType: 'prd'
documentCounts:
  brief: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: web-app
  domain: fintech
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - agora-vai

**Author:** Luan
**Date:** 2026-04-14

## Executive Summary

O **agora-vai** é um sistema financeiro SaaS multitenant projetado para pequenas empresas que precisam de gestão financeira básica sem a complexidade e o custo de ERPs tradicionais. O produto resolve o problema de visibilidade financeira: pequenos empreendedores perdem dinheiro por falta de controle de contas a pagar, receber e fluxo de caixa. O sistema entrega o essencial — contas a pagar, contas a receber, fluxo de caixa, categorização e dashboard — em uma interface que qualquer pessoa usa sem treinamento.

### What Makes This Special

Simplicidade radical como vantagem competitiva. Enquanto soluções como ContaAzul, Bling e Omie entregam centenas de funcionalidades que pequenas empresas não usam, o agora-vai foca no mínimo viável com excelência. O momento "aha!" ocorre quando o dono do negócio abre o dashboard e em 5 segundos entende o estado do caixa. Isolamento total de dados por tenant com RBAC garante segurança e conformidade sem adicionar complexidade percebida pelo usuário.

### Project Classification

| Atributo | Valor |
|----------|-------|
| Tipo | Web App SaaS (Vue.js frontend + API backend) |
| Domínio | Fintech / Gestão Empresarial |
| Complexidade | Média |
| Contexto | Greenfield (novo produto) |
| Stack Principal | Vue.js, SQLite, Multitenant, RBAC |

## Success Criteria

### User Success

- O dono da pequena empresa visualiza o estado do caixa (saldo, contas pendentes, vencimentos próximos) em menos de 10 segundos após o login
- Usuário sem conhecimento contábil consegue lançar uma conta a pagar ou receber em menos de 30 segundos
- 80% dos usuários ativos realizam pelo menos uma ação por sessão (lançar, visualizar, categorizar)
- O usuário consegue gerar um resumo financeiro para enviar ao contador em no máximo 3 cliques

### Business Success

- **MVP Validado (3 meses):** 50 empresas cadastradas ativas, com pelo menos 20 pagantes (40% conversão)
- **Retenção:** 70% dos clientes pagantes permanecem ativos após 90 dias
- **NPS:** Score mínimo de 50 entre usuários ativos (referência: bom para SaaS B2B pequeno)
- **CAC Payback:** Custo de aquisição recuperado em até 3 meses de receita recorrente

### Technical Success

- Dashboard carrega em menos de 2 segundos (p95)
- Transações (criar/atualizar) salvam em menos de 500ms (p95)
- Isolamento de dados entre tenants: zero vazamento cruzado comprovado por testes automatizados
- Disponibilidade: 99.5% uptime mensal (SLA MVP — adequado para estágio inicial)
- Todos os dados financeiros são persistidos com integridade transacional (ACID via SQLite)

### Measurable Outcomes

| Métrica | Alvo | Período |
|---------|------|---------|
| Empresas cadastradas | 50 | 90 dias |
| Taxa de conversão paga | 40% | 90 dias |
| Retenção 90 dias | 70% | 90 dias |
| NPS | ≥ 50 | Contínuo |
| Tempo para ver caixa | < 10s | Sempre |
| Tempo para lançar transação | < 30s | Sempre |
| Uptime mensal | ≥ 99.5% | Mensal |
| Vazamento entre tenants | 0 incidentes | Sempre |

## Product Scope

### MVP - Minimum Viable Product

O mínimo que precisa funcionar para o produto ser útil e validar a hipótese:

- **Autenticação e Multitenant:** Cadastro de empresa (tenant), login isolado, dados segregados por tenant
- **RBAC Básico:** 3 papéis — Admin (acesso total), Operacional (lança transações), Visualizador (só relatórios)
- **Contas a Pagar:** Criar, editar, marcar como paga, definir vencimento e valor
- **Contas a Receber:** Criar, editar, marcar como recebida, definir vencimento e valor
- **Fluxo de Caixa:** Listagem de entradas e saídas com saldo acumulado, filtro por período
- **Categorização:** Categorias de receita e despesa (pré-definidas + customizáveis pelo Admin)
- **Dashboard:** Resumo financeiro com saldo atual, contas a vencer (próximos 7 dias), top categorias
- **Relatório Básico:** Extrato por período exportável (PDF/CSV)

### Growth Features (Post-MVP)

O que torna o produto competitivo no mercado após validação do MVP:

- Integração bancária (importação automática de extrato via OFX)
- Emissão e gestão de boletos
- Lembretes automáticos de vencimento (email/SMS)
- Dashboard com gráficos e tendências
- Multi-usuário por empresa com aprovação hierárquica
- Planejamento orçamentário simples
- Integração com PIX para recebimento
- Relatórios avançados (DRE simplificado, fluxo de caixa projetado)
- MFA para login

### Vision (Future)

A versão sonho do produto:

- IA que prevê fluxo de caixa e sugere ações preventivas
- Integração contábil automática com envio de dados para o contador
- Marketplace de serviços financeiros (empréstimo, seguros) baseado nos dados da empresa
- App mobile nativo
- Gestão de estoque e notas fiscais — ERP leve completo para micro e pequenas empresas
- Open Banking para análise de crédito e comparação de produtos financeiros

## User Journeys

### Jornada 1: Marcos — O Dono da Padaria (Admin — Success Path)

**Cena de Abertura:** Marcos tem 42 anos, dona uma padaria que fatura R$ 35k/mês. Hoje, controla contas num caderno e "de cabeça". Perdeu R$ 2.000 no mês passado porque esqueceu duas contas vencendo. Está ansioso — sabe que vai quebrar se continuar assim.

**Ação Ascendente:** Ele descobre o agora-vai por indicação. Clica no link, cria conta com email e CNPJ. O sistema pede dados básicos: nome da empresa, faturamento estimado, se tem contador. Em 2 minutos, ele tem um dashboard vazio mas pronto. Ele adiciona sua primeira conta a pagar — o aluguel de R$ 3.500 com vencimento dia 15. Depois adiciona uma conta a receber de um cliente.

**Clímax:** Na manhã seguinte, Marcos abre o sistema no celular antes de ir para a padaria. O dashboard mostra: "Saldo atual: R$ 8.200. Contas a vencer em 7 dias: R$ 5.800. Está tranquilo." Ele sente um alívio que nunca teve. Pela primeira vez, sabe quanto dinheiro tem e quanto vai precisar.

**Resolução:** Duas semanas depois, Marcos tem 23 contas cadastradas. Usa o sistema todos os dias. Gerou um extrato e mandou pro contador por email. Convidou a esposa (operacional) para lançar as compras do fornecedor. "Finalmente sei onde está meu dinheiro."

### Jornada 2: Ana — A Auxiliar Administrativa (Operacional — Day-to-Day)

**Cena de Abertura:** Ana trabalha na empresa de Marcos há 2 anos. Ela recebe notas fiscais de fornecedores, boletos e comprovantes por WhatsApp. Até hoje, ela entregava os papéis para Marcos, que anotava no caderno. O processo era lento e coisas se perdiam.

**Ação Ascendente:** Marcos cria uma conta para Ana com papel "Operacional". Ela recebe um link por email, define senha e entra. O dashboard dela é mais simples — sem configurações, só as transações da empresa. Ela clica em "Nova Conta a Pagar", preenche: fornecedor "Distribuidora XYZ", valor R$ 1.200, vencimento dia 20, categoria "Matéria-prima". Salva em 15 segundos.

**Clímax:** Ana recebe 5 boletos num dia. Em vez de entregar a pilha de papel para Marcos, ela lança tudo no sistema em menos de 3 minutos. Marcos vê as 5 entradas aparecerem no dashboard dele em tempo real. Ele não precisa mais perguntar "chegou aquele boleto?" — já está lá.

**Resolução:** Ana se sente empoderada — não é mais a "menina dos papéis". Ela é a pessoa que mantém as contas em dia. Marcos confia nela para gerenciar o fluxo. O processo que levava horas agora leva minutos.

### Jornada 3: Roberto — O Contador Externo (Visualizador)

**Cena de Abertura:** Roberto é contador e atende 40 clientes pequenos. Cada um manda dados de um jeito diferente — alguns por WhatsApp, outros por email, alguns trazem pasta de papel. Ele gasta 3 dias por mês só coletando dados antes de começar a trabalhar.

**Ação Ascendente:** Marcos convida Roberto como "Visualizador". Roberto aceita o convite e acessa o sistema. Ele vê apenas relatórios e extratos — sem acesso para editar ou configurar. Clica em "Extrato por Período", seleciona o último mês, exporta em PDF.

**Clímax:** Roberto abre o PDF exportado e está tudo lá: receitas, despesas, categorias, datas. Formatado limpo, sem ruído. Pela primeira vez, ele recebe dados contábeis de um cliente sem precisar pedir nada. "Se todos os meus clientes fossem assim..."

**Resolução:** Roberto pede para 5 outros clientes dele usarem o agora-vai. Ele economiza 4 horas de trabalho por cliente por mês. Marcos economiza tempo explicando coisas para o contador — os dados falam por si.

### Jornada 4: Você — O Super Admin da Plataforma

**Cena de Abertura:** Você lançou o agora-vai há 2 semanas. Tem 12 empresas cadastradas, 4 pagantes. Precisa saber: o sistema está funcionando? Tem alguém tendo problema? Quem está usando de verdade?

**Ação Ascendente:** Você acessa o painel administrativo da plataforma. Vê a lista de tenants ativos, data de cadastro, status de pagamento (free trial, pagante, inativo). Nota que a "Padaria do Marcos" está ativa há 14 dias com 47 transações lançadas — um tenant saudável. Outro tenant não faz login há 5 dias — talvez precise de suporte.

**Clímax:** Você identifica que a "Loja X" não lançou nada há 3 dias após cadastro. Entra em contato proativamente. Descobre que eles tiveram dúvida na configuração. Resolve em 5 minutos. A empresa volta a usar. Você evita um churn antes que aconteça.

**Resolução:** O painel te dá visibilidade total da saúde da plataforma. Você consegue agir antes que clientes saiam, identificar os mais engajados, e entender padrões de uso. A operação é enxusta — você sozinho gerencia 50+ tenants.

### Journey Requirements Summary

| Jornada | Requisitos Revelados |
|---------|---------------------|
| Marcos (Admin) | Cadastro de empresa (self-service onboarding), dashboard com resumo financeiro, CRUD de contas a pagar/receber, convite de usuários, exportação de extrato |
| Ana (Operacional) | Interface simplificada de lançamento, acesso restrito (sem configurações), visibilidade de transações da empresa, categorização rápida |
| Roberto (Visualizador) | Acesso somente leitura, geração de relatórios, exportação PDF/CSV, sem capacidade de edição |
| Super Admin | Painel de gestão de tenants, métricas de uso, identificação de tenants inativos, status de pagamento, intervenção proativa |

**Capacidades do sistema reveladas pelas jornadas:**
- **Autenticação e Onboarding:** Self-service para empresa, convites para usuários por email
- **RBAC:** 3 papéis com permissões distintas + papel Super Admin de plataforma
- **Multitenant:** Isolamento total de dados por empresa
- **Gestão de Transações:** CRUD completo de contas a pagar/receber com categorização
- **Dashboard:** Resumos financeiros com alertas de vencimento
- **Relatórios:** Extrato por período com exportação PDF/CSV
- **Admin da Plataforma:** Gestão de tenants, métricas de saúde e uso

## Domain-Specific Requirements

### Compliance & Regulatory

- **LGPD (Lei Geral de Proteção de Dados):** Todos os dados pessoais dos usuários e das empresas (CNPJ, email, nome) devem ser tratados conforme LGPD. Consentimento explícito no cadastro. Direito à exclusão de dados sob demanda.
- **Integridade de Dados Financeiros:** Transações financeiras NÃO são deletadas fisicamente. Toda alteração gera registro de auditoria (quem, quando, o quê). Soft delete com flag `deleted_at` para rastreabilidade.
- **Rastreabilidade de Acesso:** Todos os acessos a dados financeiros são logados (login, visualização de relatórios, exportações) para auditoria futura.

### Technical Constraints

- **Criptografia em Trânsito:** HTTPS obrigatório para toda comunicação. Sem exceção.
- **Criptografia em Repouso:** Dados sensíveis (senhas, dados pessoais) criptografados no banco. Senhas com hashing bcrypt/argon2.
- **Isolamento Estrito de Tenants:** Nenhuma query pode retornar dados de outro tenant sem validação explícita do `tenant_id`. Middleware de filtragem obrigatório em todas as rotas.
- **Backup Automático:** Backup diário do banco com retenção de 30 dias mínimo. Recovery testado mensalmente.
- **Transações ACID:** Todas as operações financeiras usam transações SQLite com isolamento para garantir consistência (ex: marcar conta como paga + atualizar fluxo de caixa = atômico).

### Integration Requirements

- **Nenhuma integração externa no MVP:** O MVP é auto-contido. Sem API de banco, sem gateway de pagamento, sem serviço externo. Isso reduz superfície de risco e complexidade.
- **API futura preparada:** Design do backend deve permitir adição de integrações (OFX, PIX, boletos) sem refatoração massiva.

### Risk Mitigations

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Vazamento de dados entre tenants | Crítico — quebra de confiança e LGPD | Middleware obrigatório de tenant em todas as queries. Testes automatizados de isolamento. Code review focado nisso. |
| Perda de dados financeiros | Crítico — irreversível | Backup diário + transações ACID + soft delete |
| Acesso não autorizado | Alto — dados sensíveis | RBAC rigoroso. Senhas com hash forte. Rate limiting no login. |
| Dado financeiro inconsistente | Alto — decisões erradas de negócio | Validação de integridade em todas as operações. Soma de entradas/saídas sempre bate com saldo. |
| Ataque de força bruta no login | Médio | Rate limiting (5 tentativas/15min). Bloqueio temporário de IP. |

## Web App SaaS Specific Requirements

### Project-Type Overview

O **agora-vai** é um SaaS B2B web-based com arquitetura client-server: frontend Vue.js (SPA) consumindo uma API RESTful. O sistema é multitenant com RBAC, servindo pequenas empresas que precisam de gestão financeira básica. A stack prioriza simplicidade e custo baixo: SQLite como banco, backend em Node.js (Express), frontend em Vue.js 3 com Composition API.

### Technical Architecture Considerations

#### Architecture Pattern

- **Cliente:** Vue.js 3 SPA (Vite build tool) com Vue Router, Pinia para estado, e biblioteca de componentes leve (PrimeVue ou similar de baixo custo)
- **Servidor:** Node.js com Express (ou Fastify para performance), API RESTful versionada (`/api/v1/`)
- **Banco:** SQLite com WAL mode para concorrência de leitura
- **Deploy:** Single server (VPS) com reverse proxy (Nginx/Caddy) — custo mínimo de infra

#### Multi-Tenancy Model

- **Modelo: `tenant_id` em todas as tabelas de dados.** Abordagem de menor custo para MVP.
- Cada tabela de negócio (accounts, transactions, categories) possui coluna `tenant_id` NOT NULL com foreign key para a tabela `tenants`.
- **Middleware obrigatório** em todas as rotas protegidas: injeta `tenant_id` do usuário autenticado em toda query. Sem exceção.
- **Teste automatizado de isolamento** para cada nova rota: tentativa de acessar dados de outro tenant deve falhar.
- **Índices compostos** `(tenant_id, created_at)`, `(tenant_id, due_date)` para queries eficientes.

#### Authentication Model

- **MVP:** Email + senha com JWT (access token + refresh token).
- **Senha:** Hash com bcrypt (cost factor 12 mínimo).
- **Tokens:** JWT com expiração curta (15min access, 7 dias refresh). Refresh token armazenado em httpOnly cookie.
- **Recuperação de senha:** Magic link por email (sem setup de SMTP complexo — usar serviço como Resend ou SendGrid tier free).
- **MFA:** Post-MVP (Growth). Não justifica custo no MVP.

#### RBAC Permission Model

| Permissão | Admin | Operacional | Visualizador |
|-----------|-------|-------------|--------------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Criar/editar contas | ✅ | ✅ | ❌ |
| Excluir contas (soft delete) | ✅ | ❌ | ❌ |
| Gerenciar categorias | ✅ | ❌ | ❌ |
| Gerar relatórios/exportar | ✅ | ✅ | ✅ |
| Gerenciar usuários da empresa | ✅ | ❌ | ❌ |
| Configurar empresa | ✅ | ❌ | ❌ |
| Painel de plataforma (Super Admin) | ✅ (platform) | ❌ | ❌ |

#### API Design

- **RESTful** com recursos: `/tenants`, `/accounts-payable`, `/accounts-receivable`, `/transactions`, `/categories`, `/reports`, `/users`
- **Versionamento:** `/api/v1/` desde o início (custo baixo, evita breaking changes futuras)
- **Autenticação:** Bearer token no header `Authorization`
- **Tenant identification:** `tenant_id` extraído do JWT — não confiar em input do cliente
- **Paginação:** Offset-based (limit/offset) para MVP. Cursor-based só se necessário (Growth)
- **Erros padronizados:** Formato JSON consistente `{ error: { code, message, details } }`

#### Data Model (Entidades Principais)

**Convenções de dados:**
- **Moeda:** Todos os valores monetários (`amount`) armazenados como `INTEGER` em centavos (ex: R$ 1.234,56 → `123456`). Evita erros de floating point.
- **Timezone:** Todas as datas/horários em `America/Sao_Paulo` (BRT/BRST). `created_at`, `updated_at`, `due_date` armazenados como texto ISO 8601 com offset (ex: `2026-04-14T10:30:00-03:00`). MVP assume single timezone — suporte a multi-timezone deferido para Growth.

```
tenants
  - id, name, cnpj, email, plan, created_at, deleted_at

users
  - id, tenant_id, name, email, password_hash, role, created_at, deleted_at

categories
  - id, tenant_id, name, type (income/expense), created_at

accounts_payable
  - id, tenant_id, description, amount, due_date, paid_at, category_id, created_by, created_at, updated_at, deleted_at

accounts_receivable
  - id, tenant_id, description, amount, due_date, received_at, category_id, created_by, created_at, updated_at, deleted_at

audit_log
  - id, tenant_id, user_id, action, entity_type, entity_id, old_value, new_value, created_at

access_log
  - id, tenant_id, user_id, action, ip_address, created_at
```

### Implementation Considerations

#### Frontend (Vue.js)

- **SPA com Vite** — build rápido, HMR, custo zero de complexidade
- **Vue Router** com guards de autenticação e permissão
- **Pinia** para estado global (user info, tenant info, permissions)
- **Componentes:** Biblioteca open-source leve (ex: PrimeVue free tier) — sem custo de licença
- **Responsivo:** Mobile-first (usuário acessa pelo celular)
- **Estado de loading/erro:** Feedback visual claro em toda operação

#### Backend (Node.js)

- **Express com TypeScript** — type safety, reduz bugs em produção
- **Middleware chain:** auth → tenant → rbac → handler
- **Validação de input:** Zod ou Joi (esquemas tipados, custo baixo)
- **Transações:** Wrapper de transação SQLite para operações compostas
- **Error handling:** Global error handler com logging estruturado
- **Logging:** Winston ou pino — structured JSON logs para análise

#### Security

Detalhes de segurança estão documentados na seção **Domain-Specific Requirements > Technical Constraints** e nos **Non-Functional Requirements > Security**. Resumo da implementação:

- HTTPS obrigatório (TLS via Let's Encrypt)
- CORS restrito ao domínio do frontend
- Rate limiting no login e endpoints sensíveis
- Parameterized queries (zero SQL injection)
- Helmet.js para headers de segurança (HSTS, X-Frame-Options, CSP)

#### DevOps MVP (Custo Mínimo)

- **Server:** VPS único (ex: Hetzner, DigitalOcean — ~$5-10/mês)
- **Reverse proxy:** Caddy (TLS automático) ou Nginx
- **Process manager:** PM2 ou systemd
- **Backup:** Script cron + storage externo (ex: Backblaze B2 — barato)
- **Monitoramento:** Uptime Robot (free tier) + logs locais
- **CI/CD:** GitHub Actions (free tier) para build e deploy

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** **Problem-Solving MVP** — O foco é validar que pequenas empresas realmente querem e usam um sistema financeiro simples. Não é sobre tecnologia inovadora, é sobre resolver uma dor real (perda de dinheiro por falta de visibilidade) com o mínimo de fricção.

**Resource Requirements:** 1-2 desenvolvedores full-stack (frontend Vue.js + backend Node.js), 1 pessoa para operação/suporte (pode ser o fundador). MVP entregável em 6-8 semanas com equipe enxuta.

### MVP Feature Set (Phase 1)

As funcionalidades detalhadas do MVP estão documentadas na seção **Product Scope > MVP** acima. Aqui estão as decisões estratégicas de priorização:

**Core User Journeys Supported:**
1. Dono de empresa se cadastra, configura empresa, lança contas e vê dashboard
2. Funcionário operacional lança contas a pagar/receber no dia a dia
3. Contador visualizador gera e exporta relatórios
4. Super Admin da plataforma monitora saúde dos tenants

**Explicitamente FORA do MVP:** Integração bancária (OFX), emissão de boletos, lembretes automáticos, gráficos avançados, MFA, orçamento/planejamento, integração PIX, DRE/relatórios avançados, app mobile nativo.

### Post-MVP Features

**Phase 2 (Growth):** Detalhada na seção **Product Scope > Growth Features** acima.

**Phase 3 (Expansion):** Detalhada na seção **Product Scope > Vision** acima.

### Risk Mitigation Strategy

**Technical Risks:** O risco técnico mais alto é o **isolamento de dados entre tenants**. Mitigação: middleware obrigatório testado com testes automatizados para cada rota. Nenhum dado cruza tenant. Code review focado nisso em todo PR.

**Market Risks:** O maior risco de mercado é **ninguém querer pagar por "mais um" sistema financeiro** quando existem opções gratuitas ou baratas. Mitigação: MVP validado com 5-10 usuários beta gratuitos antes de cobrar. Feedback real > suposições.

**Resource Risks:** Se a equipe for menor que o planejado (1 dev só), o escopo MVP pode ser reduzido: remover painel Super Admin completo (substituir por query direta no banco) e adiar exportação PDF (manter só CSV inicialmente). O core (lançar contas + ver dashboard) permanece.

## Functional Requirements

### Onboarding e Autenticação

- FR1: Um visitante pode se cadastrar como uma nova empresa (tenant) com email, CNPJ e senha
  - *Critério de aceitação:* Visitante preenche email, CNPJ válido (módulo 11), senha (min 8 chars, 1 número, 1 maiúscula) → tenant criado → email de confirmação enviado → usuário pode fazer login. CNPJ inválido bloqueia cadastro com mensagem de erro.
  - *Nota técnica:* CNPJ validado com algoritmo módulo 11 no frontend e backend.
- FR2: Um usuário pode fazer login com email e senha
  - *Critério de aceitação:* Email + senha corretos → JWT access + refresh token retornados → usuário redirecionado ao dashboard. Credenciais inválidas → HTTP 401 sem distinguir se email ou senha está errado.
- FR3: Um usuário pode recuperar acesso via magic link enviado por email
  - *Critério de aceitação:* Usuário solicita recuperação → email com link único (expira em 15 min) → clique no link permite definir nova senha → sessão ativa. Link usado uma única vez.
- FR4: Um usuário autenticado pode fazer logout
  - *Critério de aceitação:* Logout → refresh token revogado no servidor → JWT invalidado → redirecionado para login.
- FR5: Um Admin pode convidar novos usuários para sua empresa via email
  - *Critério de aceitação:* Admin insere email do convidado + papel → token de convite gerado (expira em 7 dias) → email com link enviado → convidado clica, define senha → conta criada no tenant. Token usado uma única vez.
- FR6: Um usuário convidado pode aceitar o convite e definir sua senha
  - *Critério de aceitação:* Link de convite válido → formulário de definição de senha → senha definida → login automático → dashboard do tenant.

### Gestão de Usuários e Permissões (RBAC)

- FR7: Um Admin pode atribuir um papel (Admin, Operacional, Visualizador) a cada usuário da empresa
  - *Critério de aceitação:* Admin seleciona usuário → escolhe papel → permissão aplicada imediatamente. Usuário afetado vê/no vê os recursos conforme nova permissão no próximo reload.
- FR8: Um Admin pode remover um usuário da empresa
  - *Critério de aceitação:* Admin remove usuário → usuário removido perde acesso na próxima requisição. Dados criados pelo usuário permanecem (não são deletados).
- FR9: Um Admin pode alterar o papel de um usuário existente
  - *Critério de aceitação:* Admin altera papel de Operacional para Visualizador → usuário perde capacidade de criar/editar contas imediatamente.
- FR10: O sistema restringe acesso a cada recurso conforme o papel do usuário autenticado
  - *Critério de aceitação:* Tentativa de acesso a recurso não permitido retorna HTTP 403. Frontend oculta botões/ações não permitidas.

### Gestão de Empresa (Tenant)

- FR11: Um Admin pode editar as informações da empresa (nome, CNPJ, email)
  - *Critério de aceitação:* Admin edita campos → salva → alterações persistidas e refletidas imediatamente. CNPJ alterado passa por validação módulo 11.
- FR12: Um Admin pode criar, editar e excluir categorias de receita e despesa
  - *Critério de aceitação:* Admin cria categoria "nome + tipo" → aparece na lista. Editar nome atualiza em transações existentes. Excluir categoria usada em transações → aviso de confirmação → transações ficam sem categoria (campo nullable).
- FR13: Um Admin pode visualizar todas as transações e configurações da empresa
  - *Critério de aceitação:* Admin acessa configurações → vê lista completa de transações, usuários, categorias e dados da empresa.

### Contas a Pagar

- FR14: Um Admin ou Operacional pode criar uma conta a pagar com descrição, valor, data de vencimento e categoria
  - *Critério de aceitação:* Formulário com campos obrigatórios (descrição, valor em BRL armazenado como centavos integer, vencimento, categoria) → salva → aparece na lista com status "pendente". Valor negativo bloqueado.
- FR15: Um Admin ou Operacional pode editar uma conta a pagar existente
  - *Critério de aceitação:* Usuário edita campos → salva → alterações refletidas na lista e no fluxo de caixa. Audit log registra quem alterou e o quê.
- FR16: Um Admin ou Operacional pode marcar uma conta a pagar como paga
  - *Critério de aceitação:* Usuário clica "marcar como paga" → `paid_at` = now → status muda para "paga" → fluxo de caixa atualiza com saída. Operação atômica via transação SQLite. Audit log registra a ação.
  - *Nota:* Corrigido — Operacional também pode marcar como paga (consistência com FR14).
- FR17: Um Admin pode excluir (soft delete) uma conta a pagar
  - *Critério de aceitação:* Admin clica excluir → confirmação → `deleted_at` = now → item oculto das listas. Não afeta fluxo de caixa (transação removida retroativamente). Audit log registra exclusão.
- FR18: Um Admin ou Operacional pode visualizar a lista de contas a pagar com filtro por período e status
  - *Critério de aceitação:* Lista ordenada por vencimento. Filtros: período (de/até), status (pendente/paga/vencida). Paginação 20 itens por página.

### Contas a Receber

- FR19: Um Admin ou Operacional pode criar uma conta a receber com descrição, valor, data de vencimento e categoria
  - *Critério de aceitação:* Formulário com campos obrigatórios → salva → aparece na lista com status "pendente". Valor em BRL armazenado como centavos (integer). Valor negativo bloqueado.
- FR20: Um Admin ou Operacional pode editar uma conta a receber existente
  - *Critério de aceitação:* Usuário edita campos → salva → alterações refletidas na lista e fluxo de caixa. Audit log registra alterações.
- FR21: Um Admin ou Operacional pode marcar uma conta a receber como recebida
  - *Critério de aceitação:* Usuário clica "marcar como recebida" → `received_at` = now → status muda para "recebida" → fluxo de caixa atualiza com entrada. Operação atômica. Audit log registra a ação.
  - *Nota:* Corrigido — Operacional também pode marcar como recebida (consistência com FR19).
- FR22: Um Admin pode excluir (soft delete) uma conta a receber
  - *Critério de aceitação:* Admin clica excluir → confirmação → `deleted_at` = now → item oculto das listas. Audit log registra exclusão.
- FR23: Um Admin ou Operacional pode visualizar a lista de contas a receber com filtro por período e status
  - *Critério de aceitação:* Lista ordenada por vencimento. Filtros: período, status (pendente/recebida/vencida). Paginação 20 itens por página.

### Fluxo de Caixa

- FR24: Um Admin, Operacional ou Visualizador pode visualizar o fluxo de caixa com entradas e saídas ordenadas por data
  - *Critério de aceitação:* Lista cronológica com colunas: data, descrição, tipo (entrada/saída), valor, saldo acumulado. Saldo acumulado = soma de todas as entradas - saídas até aquela data.
- FR25: Um Admin, Operacional ou Visualizador pode filtrar o fluxo de caixa por período
  - *Critério de aceitação:* Filtro de/até → lista recalcula com apenas transações no período. Saldo inicial do período considera transações anteriores (saldo carry-over).
- FR26: Um Admin, Operacional ou Visualizador pode visualizar o saldo acumulado em cada ponto do fluxo de caixa
  - *Critério de aceitação:* Cada linha exibe coluna "saldo" que reflete o acumulado até aquele ponto. Soma final confere com saldo atual do dashboard.

### Dashboard

- FR27: Um Admin, Operacional ou Visualizador pode visualizar o dashboard com resumo financeiro ao fazer login
  - *Critério de aceitação:* Login → redirect para /dashboard → dados carregados em < 2s (p95). Layout responsivo mobile-first.
- FR28: O dashboard exibe o saldo atual consolidado
  - *Critério de aceitação:* Saldo = total recebido - total pago. Exibido em destaque no topo. Valor negativo exibido em vermelho.
- FR29: O dashboard exibe as contas a vencer nos próximos 7 dias
  - *Critério de aceitação:* Lista de contas com `due_date` entre hoje e hoje+7d, status "pendente", ordenadas por vencimento. Badge com contador total (ex: "5 contas vencendo").
- FR30: O dashboard exibe as top categorias de despesas e receitas
  - *Critério de aceitação:* Top 5 categorias de despesa e receita por valor acumulado no mês atual. Exibido como lista simples (nome + valor total). Gráficos deferidos para Growth.

### Relatórios e Exportação

- FR31: Um Admin, Operacional ou Visualizador pode gerar um extrato financeiro por período
  - *Critério de aceitação:* Seleciona período (de/até) → sistema retorna lista de todas as transações no período com colunas: data, descrição, tipo, valor, categoria, saldo acumulado.
- FR32: Um Admin, Operacional ou Visualizador pode exportar o extrato em formato CSV
  - *Critério de aceitação:* Clique em "Exportar CSV" → download de arquivo `.csv` com BOM UTF-8 (compatível Excel). Colunas separadas por `;` (padrão brasileiro). Download inicia em < 5s para período de até 12 meses. Access log registra exportação.
- FR33: Um Admin, Operacional ou Visualizador pode exportar o extrato em formato PDF
  - *Critério de aceitação:* Clique em "Exportar PDF" → download de arquivo `.pdf` formatado com cabeçalho (nome da empresa, período), tabela de transações e saldo final. Geração server-side via **pdfkit** (leve, ~2MB, sem dependência de browser headless). Download inicia em < 10s para período de até 12 meses. Access log registra exportação.
  - *Decisão técnica:* pdfkit escolhido por ser leve e adequado para VPS de $5-10/mês. Sem Puppeteer/browser headless.

### Auditoria e Rastreabilidade

- FR34: O sistema registra no audit log toda criação, edição e exclusão de contas a pagar/receber (quem, quando, o quê)
  - *Critério de aceitação:* Toda criação/edição/exclusão → entrada no `audit_log` com: `user_id`, `action` (create/update/delete), `entity_type`, `entity_id`, `old_value` (JSON null se create), `new_value` (JSON null se delete), `created_at`. Imutável — audit log nunca é deletado ou editado.
- FR35: O sistema registra no access log todo login e exportação de relatório (quem, quando, de onde)
  - *Critério de aceitação:* Todo login/export → entrada no `access_log` com: `user_id`, `action` (login/export_csv/export_pdf), `ip_address`, `created_at`. Retenção: 90 dias (após isso, soft delete).
- FR36: Um Admin pode visualizar o audit log das transações da empresa
  - *Critério de aceitação:* Admin acessa "Auditoria" → tabela simples com colunas: data/hora, usuário, ação, entidade (ex: "Conta a Pagar: Aluguel"), detalhes expansíveis (JSON do old_value/new_value). Sem filtros avançados no MVP — ordenação por data decrescente. Paginação 20 itens.
  - *Escopo:* Tabela simples, sem gráficos ou dashboards. Se demanda por filtros avançados crescer, mover para Growth.

### Painel Super Admin (Plataforma)

- FR37: Um Super Admin pode visualizar a lista de todas as empresas (tenants) cadastradas
  - *Critério de aceitação:* Tabela com: nome da empresa, CNPJ, data de cadastro, status (trial/pagante/inativo), último login. Ordenação por data de cadastro. Paginação 20 itens.
- FR38: Um Super Admin pode visualizar métricas de uso de cada tenant (último login, nº de transações, tempo ativo)
  - *Critério de aceitação:* Clique em tenant → painel simples com: último login (data/hora), total de transações criadas, dias desde cadastro, número de usuários ativos. **Definição de "tenant ativo":** fez login ou criou transação nos últimos 30 dias. Tenant sem atividade em 30 dias = "inativo".
- FR39: Um Super Admin pode visualizar o status de pagamento de cada tenant (free trial, pagante, inativo)
  - *Critério de aceitação:* Coluna "status" na lista de tenants com badge colorido: trial (amarelo), pagante (verde), inativo (cinza). Super Admin pode filtrar por status.
- FR40: Um Super Admin pode identificar tenants inativos para intervenção proativa
  - *Critério de aceitação:* Tenant sem login ou transação em 5 dias após cadastro → badge de alerta "precisa de atenção" na lista. Super Admin pode clicar em "contatar" → abre mailto: com template de email pré-preenchido. Métrica: nº de tenants com alerta ativo.
  - *Escopo MVP:* Intervenção manual via email. Sem automação de lembrete ou SMS (deferido para Growth).

### Isolamento e Segurança de Dados

- FR41: O sistema garante que um usuário só pode acessar dados da sua própria empresa (tenant)
  - *Critério de aceitação:* Toda query SQL inclui cláusula `WHERE tenant_id = ?` via middleware. Teste automatizado para cada rota: usuário de tenant A tenta acessar recurso de tenant B → HTTP 403 ou 404. Zero vazamento comprovado por suite de testes.
- FR42: O sistema impede que qualquer usuário acesse dados de outra empresa, independente do papel
  - *Critério de aceitação:* Mesmo Admin de tenant A não pode ver, editar ou criar dados em tenant B. Teste de integração com 2 tenants + 3 papéis por tenant → todas as combinações cruzadas falham.
- FR43: O sistema aplica soft delete (nunca delete físico) em todas as entidades financeiras
  - *Critério de aceitação:* Entidades com soft delete: `accounts_payable`, `accounts_receivable`, `categories`, `users`, `tenants`. DELETE lógico = set `deleted_at` = now. Todas as queries filtram `WHERE deleted_at IS NULL` por padrão. Super Admin pode ver deletados com flag explícita.

## Non-Functional Requirements

### Performance

- NFR1: O dashboard carrega e exibe dados em menos de 2 segundos (p95) para tenants com até 1.000 transações
- NFR2: A criação/edição de uma conta a pagar ou receber é concluída em menos de 500ms (p95)
- NFR3: A geração de extrato CSV para um período de até 12 meses é concluída em menos de 5 segundos
- NFR4: A geração de extrato PDF para um período de até 12 meses é concluída em menos de 10 segundos
- NFR5: O sistema suporta até 50 usuários simultâneos ativos sem degradação de performance perceptível
- NFR5b: Rate limiting baseline para endpoints autenticados: 100 requests/minuto por usuário. Exceder → HTTP 429 com header `Retry-After`. Endpoints sensíveis (login, exportação) têm limites próprios.

### Security

- NFR6: Toda comunicação entre cliente e servidor usa HTTPS/TLS 1.2 ou superior
- NFR7: Todas as senhas são armazenadas com hash bcrypt (cost factor ≥ 12) ou argon2
- NFR8: Tokens JWT expiram em 15 minutos (access token) e 7 dias (refresh token)
- NFR9: Refresh tokens são armazenados em cookies httpOnly com SameSite=Strict
- NFR10: Todas as queries de dados são parameterizadas — zero tolerância para SQL injection
- NFR11: Dados sensíveis (senhas, tokens) são criptografados em repouso no banco de dados
- NFR12: Headers de segurança (HSTS, X-Frame-Options, Content-Security-Policy, X-Content-Type-Options) são aplicados em todas as respostas
- NFR13: Rate limiting no endpoint de login: máximo 5 tentativas por IP em 15 minutos
- NFR14: CORS permite apenas o domínio do frontend oficial — bloqueio de origem para todos os demais

### Scalability

- NFR15: O sistema suporta até 500 tenants ativos simultâneos com performance dentro dos limites de NFR1-NFR4
- NFR16: O banco de dados suporta até 100.000 transações por tenant sem degradação significativa de performance
- NFR17: O crescimento de 10x no número de tenants não requer refatoração da arquitetura — apenas aumento de recursos do servidor

### Reliability

- NFR18: Disponibilidade mensal de 99.5% uptime (SLA MVP)
- NFR19: Backup automático diário do banco com retenção mínima de 30 dias
- NFR20: Recovery do banco a partir de backup é testado mensalmente e concluído em menos de 4 horas. **Justificativa de custo:** Em equipe de 1 dev e infraestrutura VPS simples, 2 horas é irrealista para restore + validação de integridade. 4 horas cobre restore de até 5GB + verificação de consistência. Backup size target: < 2GB por tenant (crescimento monitorado).
- NFR21: Todas as operações financeiras usam transações ACID — zero tolerância para dados inconsistentes (soma de entradas/saídas deve sempre bater com o saldo)
- NFR22: Em caso de falha do servidor, o sistema pode ser restaurado a partir do último backup + logs de auditoria sem perda de dados financeiros

### Accessibility

- NFR23: O frontend segue diretrizes WCAG 2.1 Level AA mínimo para contraste, navegação por teclado e leitores de tela
- NFR24: O sistema é responsivo e funcional em telas a partir de 320px de largura (mobile)
