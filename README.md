# PDV System - POS Premium

Sistema de Ponto de Venda com interface premium moderna.

## ⚠️ IMPORTANTE: Servidor Local Necessário

O POS Premium usa ES Modules (módulos JavaScript modernos). **Você precisa rodar a partir de um servidor local**, não diretamente do sistema de arquivos (`file://`).

### Opções de servidor local:

```bash
# Python 3
python -m http.server 3000

# Node.js (http-server)
npx http-server -p 3000

# VS Code: instale a extensão "Live Server" e clique "Go Live"
```

Depois acesse: `http://localhost:3000` (não `file://...`)

## Features

### POS Premium View
Nova interface de vendas com design system premium:
- **3 layouts responsivos**: Desktop (3 colunas), Tablet (sidebar + drawer), Mobile (bottom sheet)
- **Sistema de temas**: Claro, escuro e alto contraste
- **Micro-interações**: Animações suaves para feedback visual
- **Acessibilidade WCAG 2.2 AA**: Suporte completo a teclado e leitores de tela

### Componentes UI
- `Button` - Botões com variantes e estados
- `Card` - Cards de produto com hover effects
- `CartItemRow` - Itens do carrinho com quantidade
- `QuantityControl` - Controle de quantidade +/-
- `ThemeToggle` - Seletor de tema
- `Toast` - Notificações
- `SkeletonCard` - Loading states
- `Drawer` / `BottomSheet` - Painéis deslizantes
- `CartBadge` - Badge animado do carrinho

## Quick Start

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

## Uso do POS Premium

### Ativar via URL
```
http://localhost:3000/#pos-premium
```

### Ativar via Feature Flag
```javascript
// Console do navegador
localStorage.setItem('pos-feature-usePremiumPOS', 'true');
```

### Ativar via JavaScript
```javascript
import { featureFlags } from './js/utils/featureFlags.js';
featureFlags.enablePremiumPOS();
```

## Segurança

O PDV System implementa proteções de segurança abrangentes:

- **Input Validation** - Schemas Zod para validação strict de dados
- **XSS Protection** - DOMPurify para sanitização de conteúdo
- **CSRF Protection** - Tokens CSRF em requisições state-changing
- **Rate Limiting** - Limitação de requisições em operações críticas
- **Security Headers** - CSP, X-Frame-Options, Referrer-Policy
- **Secure Error Handling** - Logs sem exposição de dados sensíveis
- **Upload Security** - Validação de tamanho, tipo e extensão

Veja [docs/SECURITY.md](./docs/SECURITY.md) para detalhes completos.

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Secrets (gerar valores fortes para produção)
SESSION_SECRET=your_session_secret_here
CSRF_SECRET=your_csrf_secret_here

# Ambiente
NODE_ENV=production
DEBUG_ERRORS=false
```

## Estrutura do Projeto

```
├── css/
│   ├── style.css                    # Estilos base
│   └── pos-premium/
│       ├── tokens.css               # Design tokens
│       ├── theme-dark.css           # Tema escuro
│       ├── theme-high-contrast.css  # Alto contraste
│       ├── layout-desktop.css       # Layout desktop
│       ├── layout-tablet.css      # Layout tablet
│       ├── layout-mobile.css      # Layout mobile
│       ├── accessibility.css        # Acessibilidade
│       └── print.css               # Estilos de impressão
├── js/
│   ├── components/ui/               # Componentes UI
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── CartBadge.js
│   │   ├── CartItemRow.js
│   │   ├── QuantityControl.js
│   │   ├── ThemeToggle.js
│   │   ├── Toast.js
│   │   ├── SkeletonCard.js
│   │   ├── Drawer.js
│   │   ├── BottomSheet.js
│   │   └── SkipLinks.js
│   ├── security/                    # Módulos de segurança
│   │   ├── config.js                # Gerenciamento de secrets
│   │   ├── validation.js            # Validação Zod
│   │   ├── xss.js                   # Proteção XSS
│   │   ├── csrf.js                  # Proteção CSRF
│   │   ├── rateLimit.js             # Rate limiting
│   │   ├── errors.js                # Tratamento de erros
│   │   └── upload.js                # Validação de uploads
│   ├── views/
│   │   └── PosPremiumView.js        # View principal
│   ├── utils/
│   │   ├── animations.js            # Animações
│   │   ├── accessibility.js         # Acessibilidade
│   │   ├── theme.js                 # Gerenciamento de tema
│   │   └── featureFlags.js          # Feature flags
│   └── app.js                       # App principal
└── docs/
    ├── POS-PREMIUM-COMPONENTS.md    # Documentação de componentes
    ├── POS-PREMIUM-TOKENS.md        # Design tokens
    └── POS-PREMIUM-SHORTCUTS.md     # Atalhos de teclado
```

## Documentação

- [Componentes UI](./docs/POS-PREMIUM-COMPONENTS.md)
- [Design Tokens](./docs/POS-PREMIUM-TOKENS.md)
- [Atalhos de Teclado](./docs/POS-PREMIUM-SHORTCUTS.md)
- [Segurança](./docs/SECURITY.md) - Guia completo de segurança

## Temas

### Tema Claro (Padrão)
```css
--color-bg: #fafafa;
--color-surface: #ffffff;
--color-primary: #6366f1;
```

### Tema Escuro
```css
--color-bg: #111827;
--color-surface: #1f2937;
--color-primary: #818cf8;
```

### Alto Contraste
```css
--color-bg: #ffffff;
--color-text-primary: #000000;
--color-border: #000000;
```

## Responsividade

| Viewport | Layout | Características |
|----------|--------|-----------------|
| Desktop (1024px+) | 3 colunas | Sidebar catégories + Grid produtos + Coluna carrinho |
| Tablet (768-1023px) | 2 colunas | Sidebar colapsável + Drawer carrinho |
| Mobile (< 768px) | 1 coluna | Bottom sheet carrinho + Chips categorias |

## Acessibilidade

- ✅ Navegação completa por teclado
- ✅ Screen reader compatible
- ✅ Contraste WCAG 2.2 AA
- ✅ Skip links para navegação rápida
- ✅ Focus trap em modais/drawers
- ✅ Suporte a `prefers-reduced-motion`
- ✅ Suporte a `prefers-contrast`
- ✅ Testado com zoom 400%

## Animações

| Animação | Duração | Easing |
|----------|---------|--------|
| Hover cards | 200ms | ease-out |
| Click botões | 150ms | bounce |
| Badge pop | 150ms | spring |
| Cart shake | 300ms | default |
| Toast slide | 400ms | ease-out |
| Stagger grid | 50ms delay | ease-out |

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `/` | Focar busca |
| `ESC` | Fechar painéis |
| `+` / `-` | Ajustar quantidade |
| `Tab` | Navegar elementos |
| `Enter` | Ativar botão |

## Contribuição

Veja [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para guia de contribuição.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
