## 1. Setup e Dependências

- [x] 1.1 Instalar Zod para validação de schemas: `npm install zod`
- [x] 1.2 Instalar DOMPurify para sanitização XSS: `npm install isomorphic-dompurify`
- [x] 1.3 Criar arquivo `.env.example` com todas variáveis necessárias documentadas
- [x] 1.4 Adicionar `.env` e `.env.local` ao `.gitignore`
- [x] 1.5 Criar estrutura de diretórios para módulos de segurança em `js/security/`

## 2. Secrets Management

- [x] 2.1 Criar `js/security/config.js` para carregar e validar variáveis de ambiente
- [x] 2.2 Implementar função `getEnvVar(name, required)` que verifica existência de secrets
- [x] 2.3 Criar validação que impede aplicação de iniciar sem secrets críticos configurados
- [x] 2.4 Adicionar verificação de secrets no ponto de entrada da aplicação
- [x] 2.5 Auditar código existente e remover qualquer secret hardcoded

## 3. Input Validation

- [x] 3.1 Criar `js/security/validation.js` com schemas Zod para entidades do sistema
- [x] 3.2 Implementar schema `ProductSchema` com validação de id, nome, preço, estoque
- [x] 3.3 Implementar schema `CartItemSchema` com validação de quantidade bounds (1-999)
- [x] 3.4 Implementar schema `UserSchema` com validação de email e nome (max 100 chars)
- [x] 3.5 Implementar schema `PaymentSchema` com validação de valor (positivo, max limit)
- [x] 3.6 Criar função `validateInput(schema, data)` que retorna erros formatados
- [x] 3.7 Integrar validação em `js/models/Cart.js` para operações de adicionar/remover
- [x] 3.8 Integrar validação em `js/models/Product.js` para criação/atualização
- [x] 3.9 Adicionar validação de input em formulários de checkout

## 4. XSS Protection

- [x] 4.1 Criar `js/security/xss.js` com função `sanitizeHtml(html, allowedTags)`
- [x] 4.2 Implementar sanitização padrão que remove todos scripts e event handlers
- [x] 4.3 Criar configuração DOMPurify com whitelist de tags seguras (b, i, em, strong, p)
- [x] 4.4 Implementar função `safeTextContent(text)` para inserção segura via textContent
- [x] 4.5 Criar função `escapeHtml(str)` para escapar caracteres especiais
- [x] 4.6 Auditar todos usos de `innerHTML` no código e substituir por sanitização
- [x] 4.7 Auditar manipulação DOM dinâmica em componentes de UI
- [x] 4.8 Garantir que dados de produtos renderizados sejam sanitizados antes do DOM

## 5. CSRF Protection

- [x] 5.1 Criar `js/security/csrf.js` com funções para gerar e validar tokens
- [x] 5.2 Implementar `generateCsrfToken()` que cria token criptograficamente seguro
- [x] 5.3 Implementar `validateCsrfToken(token)` que verifica contra sessão
- [x] 5.4 Criar mecanismo de armazenamento de token CSRF (cookie SameSite ou sessionStorage)
- [x] 5.5 Implementar interceptor que adiciona CSRF header em requisições POST/PUT/DELETE
- [x] 5.6 Integrar validação CSRF em endpoints de API que modificam estado
- [x] 5.7 Configurar cookies de sessão com SameSite=Strict

## 6. Rate Limiting

- [x] 6.1 Criar `js/security/rateLimit.js` com implementação client-side de rate limiting
- [x] 6.2 Implementar `RateLimiter` class com tracking de requests por IP/usuário
- [x] 6.3 Configurar limites: API geral (100 req/15min), busca (10 req/min), pagamento (5 req/min)
- [x] 6.4 Implementar função `checkRateLimit(endpoint, tier)` que retorna true/false
- [x] 6.5 Criar middleware de rate limiting para requisições fetch
- [x] 6.6 Integrar rate limiting em operações de carrinho (adicionar/remover itens)
- [x] 6.7 Integrar rate limiting em operações de checkout e pagamento
- [x] 6.8 Implementar feedback visual quando rate limit é atingido (mensagem de espera)

## 7. Security Headers

- [x] 7.1 Criar `meta` tags CSP em `index.html` com política restritiva
- [x] 7.2 Configurar CSP: default-src 'self', script-src 'self', style-src 'self' 'unsafe-inline'
- [x] 7.3 Adicionar `X-Content-Type-Options: nosniff` via meta tag ou config servidor
- [x] 7.4 Adicionar `X-Frame-Options: DENY` para prevenir clickjacking
- [x] 7.5 Adicionar `Referrer-Policy: strict-origin-when-cross-origin`
- [x] 7.6 Verificar se hosting suporta headers HTTP customizados (Vercel, Netlify config)
- [x] 7.7 Testar CSP em modo report-only antes de enforcement (se possível)

## 8. Secure Error Handling

- [x] 8.1 Criar `js/security/errors.js` com sistema centralizado de tratamento de erros
- [x] 8.2 Implementar `SecureError` class que redacta dados sensíveis automaticamente
- [x] 8.3 Criar função `logError(error, context)` que loga detalhes sem expor secrets
- [x] 8.4 Implementar `formatUserError(error)` que retorna mensagens genéricas seguras
- [x] 8.5 Criar lista de patterns de dados sensíveis para redação (password, token, key, secret)
- [x] 8.6 Substituir todos try-catch existentes por tratamento via utilitário seguro
- [x] 8.7 Garantir que erros de API retornem formato consistente `{ success: false, error: string }`
- [x] 8.8 Remover stack traces de respostas de erro para usuários

## 9. Upload Security

- [x] 9.1 Criar `js/security/upload.js` com validação de arquivos
- [x] 9.2 Implementar `validateFileSize(file, maxBytes)` que rejeita arquivos grandes
- [x] 9.3 Implementar `validateFileType(file, allowedTypes)` que verifica MIME type
- [x] 9.4 Implementar `validateFileExtension(filename, allowedExtensions)`
- [x] 9.5 Criar função `sanitizeFilename(filename)` que remove path traversal
- [x] 9.6 Configurar limites: tamanho máximo 5MB, tipos permitidos (jpg, png, gif)
- [x] 9.7 Integrar validação em qualquer componente de upload de arquivos
- [x] 9.8 Implementar preview seguro de imagens uploadadas

## 10. Integração com Capabilities Existentes

- [x] 10.1 Adicionar verificação de autorização em `user-context` para dados de operador
- [x] 10.2 Implementar validação de input no footer (nome operador, número caixa)
- [x] 10.3 Adicionar sanitização em exibição de dados do operador
- [x] 10.4 Implementar logout seguro que invalida sessão em `user-context`
- [x] 10.5 Adicionar validação strict de valores de pagamento em `checkout-payment`
- [x] 10.6 Implementar rate limiting em operações de checkout
- [x] 10.7 Sanitizar inputs de pagamento (valor recebido, notas)
- [x] 10.8 Garantir que histórico de vendas não armazene dados sensíveis de pagamento
- [x] 10.9 Adicionar validação bounds (quantidade 1-999) em `shopping-cart`
- [x] 10.10 Implementar rate limiting em operações de adicionar/remover itens
- [x] 10.11 Validar preços server-side em `shopping-cart` para prevenir tampering
- [x] 10.12 Adicionar validação de descontos com limites máximos

## 11. Testing e Validação

- [x] 11.1 Criar testes unitários para schemas de validação Zod
- [x] 11.2 Criar testes para funções de sanitização XSS (DOMPurify)
- [x] 11.3 Testar rate limiting com simulação de múltiplas requisições
- [x] 11.4 Verificar que secrets não aparecem em logs ou erros
- [x] 11.5 Testar proteção CSRF com tentativas de requisição sem token
- [x] 11.6 Validar CSP com ferramenta online (csp-evaluator.withgoogle.com)
- [x] 11.7 Testar upload de arquivos maliciosos (tamanho grande, tipos perigosos)
- [x] 11.8 Realizar teste manual de XSS com payloads comuns (<script>, onerror, etc)
- [x] 11.9 Verificar que mensagens de erro são genéricas e não vazam informação
- [x] 11.10 Testar que validação de input rejeita dados malformados
- [x] 11.11 Executar `npm audit` e corrigir vulnerabilidades encontradas
- [x] 11.12 Revisar código completo focado em segurança (security review)

## 12. Documentação

- [x] 12.1 Atualizar README.md com seção de segurança e variáveis de ambiente necessárias
- [x] 12.2 Criar `docs/SECURITY.md` documentando todas proteções implementadas
- [x] 12.3 Documentar como configurar secrets em diferentes ambientes (dev, staging, prod)
- [x] 12.4 Criar checklist de pre-deployment para revisão de segurança
- [x] 12.5 Documentar como reportar vulnerabilidades de segurança
