## Context

O PDV System é uma aplicação vanilla JavaScript/CSS com design system já estabelecido (variáveis CSS em `:root`, ícones Lucide, layout responsivo). A sidebar atual é estática, 240px de largura, com navegação plana de 4 itens.

Restrições técnicas:
- Não usar frameworks (React/Vue) - vanilla JS/CSS only
- Manter compatibilidade mobile existente (drawer overlay)
- Preservar design system atual (cores, tipografia, sombras)
- Suporte a navegação por teclado (acessibilidade)

## Goals / Non-Goals

**Goals:**
- Sidebar colapsável manual (botão visível + atalho Ctrl/Cmd+B)
- Navegação hierárquica de 2 níveis com submenus expansíveis
- Footer fixo com contexto do operador (avatar, nome, caixa, status)
- Layout flexbox puro: `main-content` ajusta `margin-left` dinamicamente
- Persistência de estado via localStorage
- Animações suaves (300ms ease) para transições de estado
- Tooltips elegantes no modo colapsado

**Non-Goals:**
- Navegação 3+ níveis (evitar complexidade desnecessária para PDV)
- Auto-collapse baseado em breakpoint (apenas manual)
- Largura redimensionável via drag
- Temas múltiplos

## Decisions

### 1. Flexbox vs Overlay para Layout Desktop
**Decisão:** Flexbox com `margin-left` dinâmico no `main-content`.

**Racional:** O usuário explicitamente solicitou "não quero drawer overlay, quero flexbox". Isso mantém o layout fluido sem camadas flutuantes, melhor integração visual e aproveitamento de espaço real.

**Alternativa considerada:** Overlay drawer (rejeitada por requisito do usuário).

### 2. Estado de Collapse: Persistência vs Sessão
**Decisão:** Persistir em localStorage com chave `pdv_sidebar_state`.

**Estrutura:**
```json
{
  "collapsed": false,
  "expandedMenus": ["products"],
  "lastRoute": "pos"
}
```

**Racional:** Usuários esperam que preferências de UI persistam entre sessões. Melhora UX diária para operadores fixos.

### 3. Hierarquia de Navegação: 2 Níveis
**Decisão:** Máximo 2 níveis (pais e filhos).

**Estrutura proposta:**
```
Vendas (raiz, sem filhos)
Produtos (pai)
  ├── Cadastrar (filho)
  ├── Listar (filho)
  └── Categorias (filho)
Dashboard (raiz)
Histórico (pai)
  ├── Vendas (filho)
  └── Cancelamentos (filho)
```

**Racional:** Suficiente para organizar funcionalidades de PDV sem criar complexidade de navegação profunda.

### 4. Indicador de Item Ativo
**Decisão:** Quando filho está ativo, pai recebe estado visual "indireto" (borda lateral ou background sutil diferente do ativo direto).

**Racional:** Ajuda operador a manter contexto mental de onde está no sistema.

### 5. Animações: CSS Transitions vs JavaScript
**Decisão:** CSS transitions para largura, margin, opacity. JavaScript apenas para trigger de classes.

**Propriedades animadas:**
- `width`: 240px ↔ 64px (350ms ease)
- `margin-left` do main-content: sincronizado com sidebar
- `opacity` de textos: fade out/in
- `transform` de submenus: slide down

**Racional:** Performance superior via GPU, código JavaScript mais simples.

### 6. Tooltips no Modo Colapsado
**Decisão:** CSS-only tooltips usando `::after` pseudo-element no hover, posicionados à direita do ícone.

**Racional:** Sem JavaScript necessário, funcionam mesmo com JS desabilitado. Estilo consistente com design system.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Sidebar colapsada oculta labels → usuário confuso | Tooltips claros + ícones distintivos + persistência de aprendizado |
| Mais JavaScript = mais complexidade | Modularizar em classe `SidebarController`, testes unitários |
| Submenus podem ocupar muito espaço vertical | Scroll interno na navegação se necessário, footer sempre visível |
| Transições em dispositivos lentos | Usar `transform` e `opacity` (GPU accelerated), não animar `width` diretamente em mobile |

## Migration Plan

1. **Fase 1:** Implementar estrutura HTML/CSS nova com classes paralelas (não remover antiga ainda)
2. **Fase 2:** Implementar JavaScript de estado e navegação hierárquica
3. **Fase 3:** Remover estrutura antiga da sidebar
4. **Fase 4:** Testes em desktop e mobile
5. **Rollback:** Reverter commit ou restaurar backup de `index.html`/`style.css`/`app.js`

## Open Questions

- Quantos itens de submenu em média? (afeta altura e scroll)
- Precisa de badge/notificação em itens do menu? (ex: "Vendas pendentes")
- Avatar do operador: foto real ou ícone genérico?
