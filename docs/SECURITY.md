# Security Guide - PDV System

Este documento descreve as medidas de segurança implementadas no sistema PDV e como utilizá-las corretamente.

## Sumário

- [Visão Geral](#visão-geral)
- [Proteções Implementadas](#proteções-implementadas)
- [Configuração de Segurança](#configuração-de-segurança)
- [Uso das APIs de Segurança](#uso-das-apis-de-segurança)
- [Checklist Pré-Deploy](#checklist-pré-deploy)
- [Reportando Vulnerabilidades](#reportando-vulnerabilidades)

## Visão Geral

O sistema PDV implementa uma abordagem de defesa em profundidade com múltiplas camadas de segurança:

1. **Validação de Input** - Schemas Zod para validação strict
2. **Proteção XSS** - DOMPurify para sanitização
3. **Proteção CSRF** - Tokens CSRF com SameSite cookies
4. **Rate Limiting** - Limitação de requisições client-side
5. **Headers de Segurança** - CSP, X-Frame-Options, etc.
6. **Gerenciamento de Secrets** - Configuração segura de variáveis
7. **Tratamento de Erros** - Logs seguros sem exposição de dados sensíveis

## Proteções Implementadas

### 1. Input Validation (Zod)

Todos os inputs de usuário são validados usando schemas Zod.

```javascript
// Validar produto
const result = Validation.Validators.product({
    name: 'Produto Teste',
    price: 29.99,
    category: 'Eletrônicos',
    stock: 100
});

if (!result.success) {
    console.error(result.error.message);
}

// Validar quantidade (bounds: 1-999)
const qty = Validation.Validators.quantity(150);
// qty = { success: true, value: 150 }
```

**Schemas disponíveis:**
- `Validation.Validators.product()` - Valida dados de produto
- `Validation.Validators.cartItem()` - Valida itens do carrinho
- `Validation.Validators.user()` - Valida dados de usuário
- `Validation.Validators.payment()` - Valida pagamentos
- `Validation.Validators.quantity()` - Valida quantidade (1-999)
- `Validation.Validators.price()` - Valida preços
- `Validation.Validators.email()` - Valida emails

### 2. XSS Protection (DOMPurify)

Proteção contra Cross-Site Scripting via DOMPurify.

```javascript
// Sanitizar HTML
const clean = XSSProtection.sanitizeHtml(userInput);

// Escapar para inserção segura
const safe = XSSProtection.escapeHtml(userInput);

// Usar textContent (sempre seguro)
XSSProtection.setTextContent(element, userInput);

// Sanitizar URL
const safeUrl = XSSProtection.sanitizeUrl(userUrl);
```

**Funções principais:**
- `XSSProtection.sanitizeHtml(html, config)` - Remove scripts e eventos
- `XSSProtection.escapeHtml(str)` - Escapa caracteres especiais
- `XSSProtection.safeTextContent(text)` - Para uso com textContent
- `XSSProtection.isDangerous(str)` - Detecta conteúdo perigoso

### 3. CSRF Protection

Tokens CSRF para proteger operações que modificam estado.

```javascript
// CSRF é automaticamente adicionado a requisições POST/PUT/DELETE
// via interceptor do fetch

// Obter token atual
const token = csrfManager.getToken();

// Adicionar token a formulário
csrfManager.addTokenToForm(formElement);

// Requisição manual com CSRF
fetch('/api/endpoint', {
    method: 'POST',
    headers: {
        [csrfManager.getHeaderName()]: csrfManager.getToken()
    }
});
```

### 4. Rate Limiting

Limitação de requisições para prevenir abuso.

```javascript
// Verificar limite antes de operação
const status = operationRateLimiter.checkCartOperation('add');
if (!status.allowed) {
    alert(`Aguarde ${status.retryAfter} segundos`);
    return;
}

// Verificar limite de checkout
const checkoutStatus = operationRateLimiter.checkCheckout();
if (!checkoutStatus.allowed) {
    showToast('Muitas tentativas de checkout. Aguarde.');
    return;
}

// Verificar status atual
const limits = operationRateLimiter.getStatus();
console.log(limits.cart.remaining); // requisições restantes
```

**Limites configurados:**
- API Geral: 100 requisições / 15 minutos
- Busca: 10 requisições / minuto
- Pagamento: 5 requisições / minuto
- Carrinho: 30 operações / minuto

### 5. Security Headers

Headers de segurança configurados via meta tags:

```html
<meta http-equiv="Content-Security-Policy" content="...">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

**CSP Policy:**
- `default-src 'self'` - Recursos padrão do mesmo domínio
- `script-src 'self' https://unpkg.com` - Scripts permitidos
- `style-src 'self' 'unsafe-inline'` - CSS inline permitido
- `frame-ancestors 'none'` - Não permite embed em iframes

### 6. Secure Error Handling

Tratamento de erros que não expõe informações sensíveis.

```javascript
// Criar erro seguro
throw ErrorHandler.create.validation('Email inválido');

// Ou usar SecureError diretamente
throw new SecureError('Erro interno', {
    code: 'SERVER_ERROR',
    context: { userId: 123 },
    severity: 'error'
});

// Log seguro (redata dados sensíveis automaticamente)
ErrorHandler.log(error, { userId: 123 });

// Resposta para usuário (nunca expõe detalhes internos)
const userResponse = ErrorHandler.formatForUser(error);
// { success: false, error: "Ocorreu um erro...", requestId: "abc123" }
```

### 7. Upload Security

Validação segura de uploads de arquivos.

```javascript
// Validar arquivo
const result = await UploadSecurity.validateFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['jpg', 'png']
});

if (!result.valid) {
    console.error(result.error);
    return;
}

// Usar nome sanitizado
const safeFilename = result.sanitized;

// Criar preview seguro
const previewUrl = await UploadSecurity.createSafePreview(file);
```

**Validações:**
- Tamanho máximo (padrão: 5MB)
- Tipo MIME
- Extensão de arquivo
- Magic bytes (assinatura do arquivo)
- Sanitização de nome (remove path traversal)
- Scan básico para scripts embutidos

### 8. Secrets Management

Gerenciamento seguro de configurações e secrets.

```javascript
// Inicializar configuração
securityConfig.init({
    SESSION_SECRET: '...',
    API_BASE_URL: 'https://api.example.com'
}, strict = true);

// Obter valores
const apiUrl = securityConfig.get('API_BASE_URL', 'http://localhost:3000');
const required = securityConfig.getRequired('SESSION_SECRET');

// Verificar ambiente
if (securityConfig.isProduction()) {
    // Comportamento específico para produção
}

// Snapshot seguro para logs (redata secrets)
console.log(securityConfig.getSafeSnapshot());
```

## Configuração de Segurança

### Ambiente de Desenvolvimento

1. Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Preencha os valores necessários (deixe secrets vazios para dev)

3. As proteções de segurança funcionam em modo mais permissivo

### Ambiente de Produção

1. **Gerar secrets fortes:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Configurar variáveis obrigatórias:**
```bash
SESSION_SECRET=<valor_gerado>
CSRF_SECRET=<valor_diferente>
NODE_ENV=production
DEBUG_ERRORS=false
```

3. **Habilitar CSP enforcement** (remover `unsafe-inline` gradualmente)

4. **Configurar headers no servidor** (substituir meta tags):
```
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

## Uso das APIs de Segurança

### Validação de Formulários

```javascript
function handleSubmit(formData) {
    // 1. Validar input
    const validation = Validation.Validators.product(formData);
    if (!validation.success) {
        showErrors(validation.error.errors);
        return;
    }
    
    // 2. Sanitizar strings
    const name = XSSProtection.escapeHtml(formData.name);
    
    // 3. Verificar rate limit
    const rateCheck = operationRateLimiter.checkCartOperation('add');
    if (!rateCheck.allowed) {
        showToast(`Aguarde ${rateCheck.retryAfter}s`);
        return;
    }
    
    // 4. Processar
    try {
        await api.addProduct(validation.data);
    } catch (error) {
        // 5. Tratar erro de forma segura
        ErrorHandler.handle(error, { action: 'addProduct' });
    }
}
```

### Manipulação Segura do DOM

```javascript
// ❌ Inseguro
element.innerHTML = userInput;

// ✅ Seguro - usar textContent
XSSProtection.setTextContent(element, userInput);

// ✅ Seguro - criar elemento via SafeDOM
const el = SafeDOM.createElement('div', { class: 'item' }, userInput);
SafeDOM.appendChild(container, el);

// ✅ Seguro - sanitizar antes de innerHTML
element.innerHTML = XSSProtection.sanitizeHtml(userInput);
```

## Checklist Pré-Deploy

- [ ] Executar `npm audit` e corrigir vulnerabilidades
- [ ] Gerar secrets fortes para produção
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Desabilitar `DEBUG_ERRORS` (definir como `false`)
- [ ] Verificar CSP não bloqueia recursos legítimos
- [ ] Testar rate limiting em operações críticas
- [ ] Validar que erros não expõem stack traces
- [ ] Confirmar que secrets não aparecem em logs
- [ ] Verificar CSRF tokens em todas as requisições POST/PUT/DELETE
- [ ] Testar upload de arquivos com arquivos maliciosos
- [ ] Validar headers de segurança no servidor
- [ ] Revisar código para innerHTML não sanitizado
- [ ] Testar XSS com payloads comuns

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança no PDV System, por favor:

1. **NÃO** crie uma issue pública no GitHub
2. Envie um email para: security@exemplo.com
3. Inclua:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se houver)

**Resposta esperada:**
- Confirmação de recebimento em 24 horas
- Avaliação inicial em 72 horas
- Correção e divulgação coordenada

Agradecemos sua contribuição para manter o sistema seguro!

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Zod Documentation](https://zod.dev/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
