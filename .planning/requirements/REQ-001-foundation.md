# REQ-001: Fundação UI/UX

## Phase Goal
Criar a estrutura visual completa do sistema financeiro com HTML/CSS moderno, responsivo e acessível.

## User Story
> Como usuário, quero uma interface moderna e intuitiva que funcione em qualquer dispositivo, para que eu possa gerenciar minhas finanças com facilidade.

## Functional Requirements

### FR1: Estrutura HTML
- [ ] Página única (SPA feel) com seções: Dashboard, Transações, Categorias, Relatórios, Configurações
- [ ] Navegação lateral/barra inferior mobile
- [ ] Componentes semânticos (header, main, nav, section)
- [ ] Meta tags para responsividade e PWA-ready

### FR2: Sistema de Design CSS
- [ ] CSS variables para cores, espaçamento, tipografia, sombras
- [ ] Reset CSS moderno
- [ ] Utilitários comuns (flex, grid, spacing, text)
- [ ] Animações/ transições base

### FR3: Componentes UI
- [ ] Cards com sombras e bordas arredondadas
- [ ] Botões primários/secundários/terciários
- [ ] Inputs de formulário estilizados
- [ ] Modal/dialog component
- [ ] Toast/notificação component

### FR4: Layout Responsivo
- [ ] Mobile-first (base 320px)
- [ ] Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- [ ] Navegação adapta (barra inferior mobile, lateral desktop)
- [ ] Grid fluido para cards e listas

### FR5: Tema
- [ ] Variáveis para tema claro (default)
- [ ] Estrutura preparada para tema escuro
- [ ] Transição suave entre temas

## Non-Functional Requirements

### NFR1: Performance
- CSS crítico inline no head
- CSS separado em arquivos por responsabilidade
- Nenhuma framework CSS externa (puro)

### NFR2: Acessibilidade
- Contraste mínimo 4.5:1
- Foco visível em elementos interativos
- Labels em inputs
- aria-labels onde necessário

## Technical Decisions

| Decisão | Escolha | Rationale |
|---------|---------|-----------|
| Arquitetura CSS | BEM-like naming | Clareza e manutenção |
| Unidades | rem + px fallback | Acessibilidade + compatibilidade |
| Cores | HSL variables | Facilidade de ajuste de tonalidades |
| Ícones | Lucide CDN | Leve, moderno, sem build step |

## UI/UX References
- Cards com border-radius: 12px
- Sombras sutis: 0 2px 8px rgba(0,0,0,0.08)
- Espaçamento base: 4px scale (4, 8, 12, 16, 24, 32, 48)
- Tipografia: system-ui stack

## Definition of Done
- [ ] Visualização funciona de 320px a 1920px+
- [ ] Lighthouse accessibility score > 90
- [ ] Sem scroll horizontal em mobile
- [ ] Transições entre seções < 300ms

## Estimates
- **Complexity:** Medium
- **Effort:** 2-3 dias
