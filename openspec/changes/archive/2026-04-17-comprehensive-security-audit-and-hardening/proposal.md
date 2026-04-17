## Why

O projeto atual necessita de uma auditoria de segurança abrangente e hardening para estar pronto para produção. Sem uma revisão sistemática de vulnerabilidades comuns (XSS, CSRF, injeção, autenticação insegura, exposição de dados sensíveis), o sistema está em risco de ataques que podem comprometer dados de usuários e integridade do sistema.

## What Changes

- **Segurança de Autenticação e Autorização**: Implementar armazenamento seguro de tokens (httpOnly cookies), verificação de permissões antes de operações sensíveis
- **Validação de Input**: Adicionar validação strict de todas entradas de usuário usando schemas (Zod), sanitização de HTML/DOM
- **Proteção XSS**: Implementar CSP headers, sanitização de conteúdo dinâmico, DOMPurify para HTML de usuário
- **Proteção CSRF**: CSRF tokens em operações state-changing, SameSite=Strict em todos cookies
- **Rate Limiting**: Limitação de requests em endpoints de API, limites mais agressivos para operações caras
- **Headers de Segurança**: X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy
- **Gerenciamento de Secrets**: Remover secrets hardcoded, mover para variáveis de ambiente, verificação de existência
- **Tratamento de Erros**: Mensagens genéricas para usuários, logs detalhados apenas no servidor sem dados sensíveis
- **Segurança de Uploads**: Validação de tamanho, tipo e extensão de arquivos
- **CORS Configuration**: Configuração adequada de CORS para produção

## Capabilities

### New Capabilities
- `secure-authentication`: Sistema de autenticação seguro com httpOnly cookies, verificação de wallet signatures (se blockchain), gestão de sessões
- `input-validation`: Validação strict de todas entradas de usuário usando Zod schemas, sanitização de dados
- `xss-protection`: Proteção contra XSS com CSP headers, DOMPurify sanitization, safe DOM manipulation
- `csrf-protection`: Proteção CSRF com tokens e SameSite cookies
- `rate-limiting`: Rate limiting em API endpoints com diferentes tiers para operações normais vs caras
- `security-headers`: Configuração completa de headers de segurança (CSP, HSTS, X-Frame-Options, etc)
- `secrets-management`: Gerenciamento seguro de secrets via environment variables, sem hardcoded values
- `secure-error-handling`: Tratamento de erros que não expõe informações sensíveis, logging seguro
- `upload-security`: Validação e sanitização de file uploads

### Modified Capabilities
- `user-context`: Adicionar verificação de autorização e validação de input em operações de usuário
- `checkout-payment`: Reforçar validação de dados de pagamento e sanitização de inputs financeiros
- `shopping-cart`: Adicionar rate limiting em operações de carrinho, validação de quantidades/preços

## Impact

- **Todos os arquivos JS**: Validação de input, tratamento de erros seguro
- **js/services/**: Adicionar rate limiting, autenticação segura
- **js/models/**: Validação de dados usando schemas
- **js/utils/**: Novos utilities de sanitização, validação
- **CSS/HTML**: Configuração de CSP, headers de segurança via meta tags ou servidor
- **package.json**: Adicionar dependências (zod, dompurify, express-rate-limit se necessário)
- **.env.example**: Documentar todas variáveis de ambiente necessárias
