# Capability: full-height-cart

## Requirement: viewport height adaptation

O carrinho deve ocupar toda a altura vertical disponível da viewport em desktop, descontando apenas o espaço ocupado pelo header.

### Scenario: desktop normal height (768px+)
- **WHEN** a tela tem altura maior ou igual a 768px
- **THEN** o carrinho usa `height: calc(100vh - 64px)` (assumindo header de 64px)
- **AND** não há scroll vertical na página, apenas no carrinho se necessário

### Scenario: desktop pequena altura (<600px)
- **WHEN** a tela tem altura menor que 600px
- **THEN** o carrinho usa `min-height: 400px` como fallback
- **AND** o scroll da página é permitido para acessar conteúdo abaixo

## Requirement: flex container behavior

Usar Flexbox para distribuir espaço entre seções do carrinho (lista de itens vs resumo).

### Scenario: carrinho estrutura
- **WHEN** o carrinho é renderizado
- **THEN** ele usa `display: flex; flex-direction: column`
- **AND** a lista de itens tem `flex: 1; min-height: 0` para ocupar espaço disponível
- **AND** a seção de total/resumo tem `flex-shrink: 0` para permanecer visível

## Requirement: scroll interno otimizado

Scroll no carrinho deve ser suave e apenas quando necessário.

### Scenario: poucos itens
- **WHEN** há poucos itens no carrinho (altura total < disponível)
- **THEN** não há scrollbar visível
- **AND** espaço vazio é distribuído naturalmente

### Scenario: muitos itens
- **WHEN** há muitos itens no carrinho (altura total > disponível)
- **THEN** scrollbar aparece apenas na lista de itens
- **AND** o resumo/total permanece fixo visível
- **AND** scroll é smooth com `scroll-behavior: smooth`
