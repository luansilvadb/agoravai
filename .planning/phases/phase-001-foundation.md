# Phase 1: Fundação UI/UX

## Phase Goal
Criar estrutura HTML/CSS moderna, responsiva e acessível para o Sistema Financeiro.

## Requirements
- REQ-001: Fundação UI/UX

## Entry State
- Projeto vazio (greenfield)
- Sem código existente

## Success Criteria
- [ ] Interface funciona em 320px até 1920px+
- [ ] Navegação SPA-like entre seções
- [ ] Tema claro implementado (preparado para escuro)
- [ ] Lighthouse accessibility > 90

## Plans

### Plan 1.1: Estrutura HTML Base
**Complexity:** Low  
**Estimated Time:** 2-3 horas

**Scope:** Criar o arquivo HTML principal com estrutura semântica completa.

**Key Deliverables:**
1. Arquivo `index.html` na raiz
2. Meta tags (charset, viewport, description)
3. Estrutura de seções:
   - Header com navegação
   - Main com: Dashboard, Transações, Categorias, Relatórios, Configurações
   - Footer
4. Links para CSS e JS
5. CDN Lucide icons

**Approach:**
- HTML5 semântico (header, nav, main, section, footer)
- IDs nas seções para navegação (#dashboard, #transactions, etc.)
- Classes BEM-like desde o início
- Placeholder content para visualização

**Code Structure:**
```
/index.html
  ├── head (meta, title, css links, Lucide CDN)
  ├── body
      ├── nav.navigation (menu lateral/mobile)
      ├── main
      │   ├── section#dashboard
      │   ├── section#transactions
      │   ├── section#categories
      │   ├── section#reports
      │   └── section#settings
      └── footer
```

**Definition of Done:**
- [ ] HTML válido (validator.w3.org)
- [ ] Título e meta description preenchidos
- [ ] Todas as 5 seções presentes
- [ ] Navegação com links âncora funcionando

---

### Plan 1.2: Sistema de Design CSS
**Complexity:** Medium  
**Estimated Time:** 4-6 horas

**Scope:** Criar sistema CSS completo com variáveis, reset, utilitários e componentes.

**Key Deliverables:**
1. `css/base.css` - Reset, variáveis, tipografia
2. `css/layout.css` - Grid, flexbox, containers
3. `css/components.css` - Botões, cards, inputs, modals
4. `css/theme.css` - Variáveis de cor (claro/escuro)

**Design System Specifications:**

**Cores (HSL):**
```css
--color-primary: hsl(220 90% 56%);
--color-success: hsl(142 76% 36%);
--color-danger: hsl(0 84% 60%);
--color-warning: hsl(38 92% 50%);
--color-background: hsl(0 0% 100%);
--color-surface: hsl(0 0% 98%);
--color-text: hsl(220 20% 20%);
--color-text-muted: hsl(220 10% 50%);
--color-border: hsl(220 13% 91%);
```

**Espaçamento (4px base):**
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
```

**Sombreamento:**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

**Raio de borda:**
```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
```

**Componentes:**

**Botões:**
```css
.btn { padding, border-radius, transition }
.btn--primary { background, color }
.btn--secondary { border, background }
.btn--danger { background: red variant }
.btn--ghost { transparent }
.btn--sm, .btn--lg { size variants }
```

**Cards:**
```css
.card { 
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}
```

**Inputs:**
```css
.input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  transition: border-color, box-shadow;
}
.input:focus { border-color: var(--color-primary); }
```

**Approach:**
- Mobile-first CSS
- CSS variables para todo tema
- Classes utilitárias para spacing, colors, text
- BEM naming convention

**Definition of Done:**
- [ ] Todas as variáveis CSS definidas
- [ ] Componentes visuais renderizam corretamente
- [ ] Botões têm estados: default, hover, active, disabled
- [ ] Inputs têm estados: default, focus, error
- [ ] Cards com sombras e bordas arredondadas

---

### Plan 1.3: Layout Responsivo
**Complexity:** Medium  
**Estimated Time:** 3-4 horas

**Scope:** Implementar layout responsivo com navegação adaptativa.

**Key Deliverables:**
1. Navegação desktop (lateral) vs mobile (barra inferior)
2. Grid system fluido
3. Breakpoints responsivos
4. Container queries onde apropriado

**Breakpoints:**
```css
/* Mobile first */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

**Estrutura de Layout:**
```
Desktop (> 768px):
  ┌─────────────────────────────┐
  │  NAV    │    MAIN CONTENT   │
  │  240px  │    flex: 1        │
  │         │                   │
  └─────────────────────────────┘

Mobile (< 768px):
  ┌─────────────────┐
  │   MAIN CONTENT  │
  │                 │
  │                 │
  ├─────────────────┤
  │  NAV (bottom)   │
  └─────────────────┘
```

**Classes de Layout:**
```css
.container { max-width, margin auto, padding }
.grid { display: grid, gap }
.grid--2, .grid--3, .grid--4 { responsive columns }
.flex { display: flex }
.flex--col { flex-direction: column }
.flex--between { justify-content: space-between }
```

**Navegação Desktop:**
- Sidebar fixa à esquerda (240px)
- Logo no topo
- Links verticais com ícones
- Hover/active states

**Navegação Mobile:**
- Bottom bar fixa (64px altura)
- 5 ícones principais
- Safe area padding para notch

**Main Content:**
- Scroll independente
- Padding responsivo
- Seções com padding-top para âncoras

**Definition of Done:**
- [ ] Layout funciona em 320px (iPhone SE)
- [ ] Layout funciona em 1920px+ (desktop)
- [ ] Navegação alterna entre lateral/bottom automaticamente
- [ ] Sem scroll horizontal em nenhum breakpoint
- [ ] Conteúdo legível em todos os tamanhos

---

### Plan 1.4: JavaScript Base
**Complexity:** Low  
**Estimated Time:** 2 horas

**Scope:** JavaScript inicial para navegação SPA-like e utilitários.

**Key Deliverables:**
1. `js/app.js` - Inicialização da aplicação
2. `js/navigation.js` - Navegação entre seções
3. `js/utils.js` - Funções utilitárias

**Funcionalidades:**

**Navegação:**
- Clique no menu → mostra seção correspondente
- URL hash atualizado (#dashboard, #transactions)
- Transição suave (fade ou slide)
- Seção ativa destacada no menu

**Utilitários:**
```javascript
// DOM helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Formatters (placeholders)
const formatCurrency = (value) => { /* TODO */ };
const formatDate = (date) => { /* TODO */ };

// Debounce
const debounce = (fn, delay) => { /* implementation */ };
```

**Initial State:**
- Mostra dashboard por padrão
- Lê hash da URL para deep linking
- Inicializa ícones Lucide

**Definition of Done:**
- [ ] Clique no menu muda de seção
- [ ] URL atualiza com hash
- [ ] Refresh mantém seção atual (via hash)
- [ ] Transição visual entre seções
- [ ] Ícones Lucide renderizam corretamente

---

## Exit State
- Estrutura HTML completa
- Sistema CSS funcional
- Layout responsivo operacional
- Navegação SPA-like funcionando
- Pronto para implementar dados e funcionalidades

## UAT Items
- [ ] Visualização responsiva testada em múltiplos tamanhos
- [ ] Navegação acessível por teclado (Tab, Enter)
- [ ] Contraste de cores WCAG AA compliant
- [ ] Lighthouse score: Performance > 80, Accessibility > 90

## Notes
- Nenhuma dependência externa além de Lucide icons CDN
- Vanilla JS apenas (sem frameworks)
- Código limpo e comentado para fases futuras
