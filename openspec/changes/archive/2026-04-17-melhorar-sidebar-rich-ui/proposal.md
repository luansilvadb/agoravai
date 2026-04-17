# Proposal: Melhorar Sidebar com UI/UX Rica

## Motivation

A sidebar atual do PDV System é funcional mas básica. Ela carece de:
- **Flexibilidade de espaço**: Não permite colapsar para liberar área de trabalho
- **Navegação hierárquica**: Todos os itens são planos, dificultando organização quando o sistema crescer
- **Contexto do operador**: Não mostra quem está logado nem caixa atual
- **Feedback visual rico**: Estados de hover, transições e indicadores limitados

Uma sidebar mais rica melhora a eficiência do operador, reduz erros de navegação e prepara o sistema para expansão futura.

## Scope

### In Scope
- Sidebar colapsável/expansível (manual, botão + atalho keyboard)
- Navegação hierárquica com submenus expansíveis (2 níveis)
- Footer fixo com contexto do operador (nome, caixa, status)
- Layout flexbox (sem overlay drawer no desktop)
- Persistência de estado (localStorage)
- Animações e transições suaves
- Tooltips no modo colapsado
- Indicadores de item ativo (pai destacado quando filho selecionado)

### Out of Scope
- Drawer overlay mobile (manter comportamento atual separado)
- Navegação 3+ níveis hierárquicos
- Drag-and-drop reorganização
- Temas múltiplos (apenas manter tema atual)

## Capabilities

### New Capabilities
- `sidebar-navigation`: Navegação hierárquica colapsável com submenus
- `sidebar-state`: Persistência e gerenciamento de estado da sidebar
- `user-context`: Exibição de contexto do operador no footer

### Modified Capabilities
- Nenhuma - requisitos existentes não mudam, apenas a implementação visual

## Impact

### Affected Code
- `index.html`: Estrutura da sidebar e navegação
- `css/style.css`: Estilos completos da sidebar (layout, animações, estados)
- `js/app.js`: Lógica de estado, persistência, navegação hierárquica
- Potencialmente views individuais se precisarem ajustar margin-left dinamicamente

### Dependencies
- Lucide icons (já incluído)
- CSS variables do design system existente (serão estendidas)

### Breaking Changes
- Nenhuma - comportamento legado mantido para mobile
