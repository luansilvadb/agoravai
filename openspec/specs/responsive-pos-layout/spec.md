# Capability: responsive-pos-layout

## Requirement: layout grid responsivo

O layout da tela POS deve adaptar-se a diferentes tamanhos de tela usando CSS Grid e Flexbox, garantindo ótima experiência tanto em desktop quanto mobile.

### Scenario: desktop wide (>1024px)
- **WHEN** a viewport tem largura maior que 1024px
- **THEN** o layout exibe 3 colunas: produtos (esquerda), carrinho (centro), resumo/ações (direita)
- **AND** o carrinho ocupa 100% da altura disponível da viewport

### Scenario: tablet (768px - 1024px)
- **WHEN** a viewport está entre 768px e 1024px
- **THEN** o layout exibe 2 colunas: produtos (esquerda 40%), carrinho expandido (direita 60%)
- **AND** o resumo é colapsado ou integrado ao carrinho

### Scenario: mobile (<768px)
- **WHEN** a viewport é menor que 768px
- **THEN** o layout mantém comportamento atual de 1 coluna
- **AND** o carrinho pode ser apresentado em drawer ou área dedicada

## Requirement: altura dinâmica

O carrinho deve ajustar sua altura automaticamente para ocupar o espaço vertical disponível, sem scroll externo da página em desktop.

### Scenario: carrinho vazio
- **WHEN** o carrinho está vazio
- **THEN** ele ocupa toda a altura disponível, exibindo estado vazio centralizado

### Scenario: carrinho com itens
- **WHEN** o carrinho contém itens
- **THEN** a lista de itens expande até ocupar o espaço disponível
- **AND** scroll interno aparece apenas quando itens excedem a altura disponível
- **AND** o total/resumo permanece visível fixo na parte inferior

## Requirement: consistência visual

Todos os breakpoints devem manter consistência com o design system PDV Pro.

### Scenario: cores e tipografia
- **WHEN** o layout é renderizado em qualquer breakpoint
- **THEN** as cores (#FAFBFC background, #FFFFFF cards, #2563EB primary) são preservadas
- **AND** a tipografia Inter com pesos 400-600 é mantida
- **AND** espaçamento segue sistema de 4px
