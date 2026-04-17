# Phase 1: Fundação UI/UX - Context

## Domain
Criar estrutura HTML/CSS moderna, responsiva e acessível para o Sistema Financeiro — com foco especial em sidebar premium visual.

## Decisions

### Visual Style: Sidebar Premium
- **Glassmorphism background** — Sidebar com fundo translúcido (`backdrop-filter: blur`), permitindo que o conteúdo principal vaze sutilmente atrás
- **Glow effect on brand** — Logo/brand com sombra/glow sutil em hover, criando destaque premium
- **Active item: Glow + Scale** — Item ativo com sombra sutil e leve scale transform para destacar seleção

### Component Behavior
- Sidebar collapse/expand: Persist state in localStorage
- Mobile adaptation: Bottom bar em telas < 768px (glassmorphism disabled neste breakpoint)

## Deferred Ideas
- Micro-interações avançadas (ripple, spring physics) — pode ser aprimorado futuramente
- Badge notifications nos menus — requer dados de notificação (fase futura)
- Drag-and-drop reorder — nova capacidade para backlog

## Canonical Refs
- `.planning/PROJECT.md` — Visão geral e princípios de UI
- `.planning/phases/phase-001-foundation.md` — Planos detalhados da fase
- `css/layout.css` — Implementação atual da sidebar
- `index.html` — Estrutura HTML existente

## Assumptions
- Glassmorphism suportado nos navegadores alvo (Chrome, Firefox, Safari, Edge modernos)
- Fallback para sólido em navegadores sem backdrop-filter
- Performance do blur é aceitável em dispositivos mobile desktop

## Notes
- User explicitly chose premium visual direction over minimal/clean
- Collapse/expand já implementado — foco desta discussão foi elevar o visual

## Plans Created
- `001-01-premium-sidebar-visuals.md` — Glassmorphism, glow effects, active states premium
