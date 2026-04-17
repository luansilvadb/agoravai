# Capability: desktop-optimized-grid

## Requirement: grid de 3 colunas

Em desktop (>1024px), o layout deve usar CSS Grid com 3 áreas distintas para maximizar uso do espaço.

### Scenario: estrutura grid
- **WHEN** a viewport é maior que 1024px
- **THEN** o container usa `display: grid`
- **AND** `grid-template-columns: 280px 1fr 320px` (produtos | carrinho flexível | resumo)
- **AND** `grid-template-rows: 1fr`
- **AND** `grid-template-areas: "products cart summary"`
- **AND** `gap: 16px` ( espaçamento entre colunas)

### Scenario: altura consistente
- **WHEN** o grid é aplicado
- **THEN** todas as 3 colunas têm a mesma altura (`height: calc(100vh - 64px)`)
- **AND** conteúdo interno de cada coluna gerencia seu próprio scroll se necessário

## Requirement: coluna de produtos

A coluna de produtos (esquerda) deve exibir catálogo em grid responsivo com scroll interno.

### Scenario: grid de produtos
- **WHEN** a coluna de produtos é renderizada
- **THEN** ela usa `display: grid; grid-template-columns: repeat(2, 1fr)` para miniaturas
- **AND** `gap: 12px` entre produtos
- **AND** `overflow-y: auto` para scroll interno
- **AND** categoria/filtro fixo no topo da coluna

## Requirement: coluna de resumo

A coluna de resumo (direita) deve exibir totais, ações rápidas e métodos de pagamento de forma fixa e sempre visível.

### Scenario: resumo visível
- **WHEN** a coluna de resumo é renderizada
- **THEN** ela usa `position: sticky; top: 0` ou flex equivalente
- **AND** conteúdo inclui: subtotal, descontos, total, botões de ação (limpar, finalizar)
- **AND** botão de finalizar é prominentemente visível (CTA primary)

### Scenario: scroll independente
- **WHEN** o usuário scrolla no carrinho (centro)
- **THEN** a coluna de resumo permanece fixa visível
- **AND** a coluna de produtos mantém sua posição de scroll

## Requirement: transições suaves

Transições entre breakpoints devem ser suaves e não abruptas.

### Scenario: resize de janela
- **WHEN** o usuário redimensiona a janela do browser
- **THEN** o layout transiciona suavemente entre breakpoints
- **AND** não há quebra de layout ou flickering durante a transição
- **AND** Tailwind `transition-all duration-200 ease-smooth` é aplicado

## Requirement: acessibilidade

O layout grid deve ser acessível para navegação por teclado e leitores de tela.

### Scenario: tab navigation
- **WHEN** o usuário navega via Tab
- **THEN** a ordem de foco segue a ordem lógica: produtos → carrinho → resumo
- **AND** landmarks/regiões são identificadas com roles apropriados (complementary, main, aside)

### Scenario: screen reader
- **WHEN** um leitor de tela interpreta a página
- **THEN** as 3 colunas são identificadas como regiões distintas
- **AND** navegação por landmarks permite saltar entre seções
