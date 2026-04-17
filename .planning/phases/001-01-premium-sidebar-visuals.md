---
phase: 001-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - css/layout.css
  - css/theme.css
  - index.html
autonomous: true
requirements:
  - REQ-001
---

## Objective
Implementar visual premium na sidebar com glassmorphism, glow effects e estados refinados conforme decisões do contexto.

## Context
- Decisão: Glassmorphism (fundo translúcido com blur)
- Decisão: Glow effect no logo/brand
- Decisão: Glow + scale no item ativo
- Código existente: Sidebar com collapse/expand funcional

## Tasks

### Task 1: Glassmorphism Sidebar Background
**Files:** `css/layout.css`, `css/theme.css`

**Action:**
1. Adicionar variáveis CSS para glassmorphism em `theme.css`:
   - `--sidebar-glass-bg: rgba(255, 255, 255, 0.7)`
   - `--sidebar-glass-bg-dark: rgba(30, 30, 30, 0.7)`
   - `--sidebar-blur: blur(20px)`
   - `--sidebar-backdrop: saturate(180%)`

2. Aplicar em `.navigation` em `layout.css`:
   - `backdrop-filter: var(--sidebar-blur) var(--sidebar-backdrop)`
   - `background: var(--sidebar-glass-bg)`
   - `border-right: 1px solid rgba(255,255,255,0.1)` (glass edge)
   - Fallback sólido para navegadores sem suporte

3. Adicionar variáveis dark mode para glassmorphism escuro

**Verify:** Abrir DevTools → Elements → Computed → verificar `backdrop-filter: blur(20px)` aplicado

**Done:** Sidebar tem fundo translúcido com blur visível

---

### Task 2: Glow Effect no Brand/Logo
**Files:** `css/layout.css`

**Action:**
1. Adicionar glow no `.nav-logo`:
   - `box-shadow: 0 0 20px var(--color-primary-light)`
   - `transition: box-shadow 0.3s ease`

2. Intensificar glow no hover:
   - Hover: `box-shadow: 0 0 30px var(--color-primary), 0 0 60px var(--color-primary-light)`

3. Animação sutil no logo (opcional):
   - `@keyframes pulse-glow` com variação de intensidade
   - Aplicar quando sidebar estiver ativa

**Verify:** Hover no logo → verificar glow/intensidade aumentada no DevTools

**Done:** Logo tem glow suave sempre presente, intensificado no hover

---

### Task 3: Glow + Scale no Item Ativo
**Files:** `css/layout.css`

**Action:**
1. Refinar `.nav-link.active`:
   - `background: linear-gradient(135deg, var(--color-primary-light), transparent)`
   - `box-shadow: 0 0 15px var(--color-primary-light), inset 0 0 10px rgba(255,255,255,0.1)`
   - `transform: scale(1.02)`
   - `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

2. Efeito hover nos itens não ativos:
   - `transform: translateX(4px)` (slide sutil)
   - Glow leve no background

3. Indicador lateral animado (opcional):
   - `::before` pseudo-element como barra vertical
   - `transform: scaleY(0) → scaleY(1)` animado

**Verify:** Clicar em diferentes menu items → verificar scale, glow e transição suave

**Done:** Item ativo tem glow, scale e transições premium

---

### Task 4: Transições e Polimento
**Files:** `css/layout.css`, `js/app.js`

**Action:**
1. Suavizar transição de collapse/expand:
   - `transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1)`
   - Adicionar `will-change: width` para performance

2. Ajustar tooltips no estado collapsed:
   - Fundo glassmorphism nos tooltips
   - `backdrop-filter: blur(10px)`

3. Verificar comportamento mobile:
   - Glassmorphism desabilitado em < 768px (performance)
   - Manter bottom bar limpa

**Verify:** Toggle collapse/expand → transição suave sem travamentos

**Done:** Todas as transições são fluidas e premium

## Verification
- [ ] Glassmorphism visível em desktop (>768px)
- [ ] Logo tem glow suave (intensificado no hover)
- [ ] Item ativo tem glow + scale
- [ ] Transições são suaves (cubic-bezier)
- [ ] Mobile não é afetado (sem glassmorphism)
- [ ] Fallback para navegadores sem backdrop-filter

## Success Criteria
- Lighthouse performance > 80 (glassmorphism não degrada significativamente)
- Visual identificado como "premium" por humano
- Transições em 60fps
