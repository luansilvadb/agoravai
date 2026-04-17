## Context

A tela de POS atual utiliza um layout de coluna única que funciona bem em mobile, mas subutiliza o espaço disponível em desktop. O carrinho está contido em uma área de altura fixa, forçando scroll interno mesmo quando há espaço vertical disponível na tela.

O projeto utiliza TailwindCSS e segue o design system PDV Pro (tema claro profissional tipo Stripe/Linear), com cores específicas:
- Background: #FAFBFC (off-white)
- Cards: #FFFFFF
- Primary: #2563EB (blue-600)
- Texto: #0F172A a #475569

## Goals / Non-Goals

**Goals:**
1. Carrinho deve ocupar 100% da altura visível em desktop (viewport height menos header)
2. Layout responsivo com breakpoints claros: mobile (<768px), tablet (768-1024px), desktop (>1024px)
3. Aproveitar espaço horizontal em desktop para áreas de produtos, carrinho e ações/resumo
4. Preservar consistência visual com design system existente

**Non-Goals:**
1. Não modificar funcionalidades de negócio (adicionar/remover itens, cálculos)
2. Não alterar esquema de cores ou identidade visual
3. Não implementar novas features além do layout responsivo

## Decisions

### 1. Estrutura de Layout Grid

**Decisão**: Usar CSS Grid para desktop, Flexbox para mobile

**Racional**:
- Grid permite definir áreas nomeadas (`grid-template-areas`) tornando o layout semântico e fácil de manter
- Flexbox é mais simples para layouts unidimensionais (mobile)
- Tailwind suporta ambos nativamente

**Implementação**:
```css
/* Desktop */
.pos-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr 300px;
  grid-template-rows: 1fr;
  grid-template-areas: "products cart summary";
  height: calc(100vh - 64px); /* menos header */
}

/* Mobile - mantém comportamento atual */
@media (max-width: 768px) {
  .pos-container {
    display: flex;
    flex-direction: column;
    height: auto;
  }
}
```

### 2. Altura Dinâmica do Carrinho

**Decisão**: Usar `min-h-0` com `flex-1` para permitir que o carrinho cresça e ocupe espaço disponível

**Racional**:
- `h-full` ou `h-screen` podem causar problemas com headers/fixos
- Flexbox com `flex-1` distribui espaço proporcionalmente
- `min-h-0` é necessário em containers flex para permitir scroll interno quando o conteúdo excede

**Implementação**:
- Container principal: `flex flex-col h-[calc(100vh-4rem)]`
- Carrinho: `flex-1 min-h-0 overflow-y-auto`

### 3. Scroll Behavior

**Decisão**: Carrinho com scroll interno apenas quando necessário; página sem scroll global em desktop

**Rationale**:
- Em desktop, queremos que o carrinho seja auto-contido e não afete o scroll da página
- Seção de produtos terá seu próprio scroll
- Resumo/ações ficam fixos à direita

### 4. Breakpoints

**Decisão**:
- **Mobile** (< 768px): Layout atual, 1 coluna, carrinho em drawer ou área colapsável
- **Tablet** (768px - 1024px): 2 colunas - produtos + carrinho expandido
- **Desktop** (> 1024px): 3 colunas - produtos | carrinho | resumo/ações

### 5. Preservação de Estado

**Decisão**: Não alterar lógica JavaScript de estado do carrinho

**Rationale**:
- O estado (itens, quantidades, valores) permanece inalterado
- Apenas a renderização/presentação muda
- Menor risco de regressões

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layout quebra em telas muito pequenas (height < 600px) | Médio | Adicionar media query `max-height` com scroll global fallback |
| Conteúdo do carrinho muito extenso em desktop | Baixo | Scroll interno no carrinho mantém UX consistente |
| Testes manuais necessários em múltiplos dispositivos | Médio | Usar Chrome DevTools device simulation; priorizar 1366px e 1920px |
| Possível conflito com estilos existentes | Baixo | Usar classes específicas (BEM-like) ou scoped styles |

## Migration Plan

1. **Preparação**: Backup do arquivo `pages/pos.html` e CSS relacionado
2. **Implementação**: Aplicar novas classes grid/flex seguindo design acima
3. **Testes**: Verificar em breakpoints definidos
4. **Rollback**: Reverter para backup se necessário

## Open Questions

1. O header atual é fixo (sticky) ou scrolla com a página? Isso afeta o cálculo de `100vh - header`
2. Existe um footer visível na tela de POS ou é apenas header + conteúdo?
3. A lista de produtos atualmente é exibida em grid ou lista? Isso afeta a coluna da esquerda
