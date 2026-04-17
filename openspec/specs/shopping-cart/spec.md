## ADDED Requirements

### Requirement: Adicionar produto ao carrinho
O sistema DEVE permitir adicionar produtos ao carrinho de compras.

#### Scenario: Adicionar produto disponível
- **QUANDO** o usuário adiciona um produto com estoque disponível
- **ENTÃO** o produto é adicionado ao carrinho
- **E** o estoque do produto é decrementado
- **E** o total do carrinho é atualizado

#### Scenario: Adicionar produto sem estoque
- **QUANDO** o usuário tenta adicionar produto sem estoque
- **ENTÃO** o sistema exibe mensagem "Produto sem estoque"
- **E** o produto não é adicionado ao carrinho

### Requirement: Visualizar carrinho
O sistema DEVE exibir o conteúdo atual do carrinho com itens, quantidades e valores.

#### Scenario: Carrinho com itens
- **QUANDO** o carrinho contém produtos
- **ENTÃO** o sistema exibe nome, quantidade, preço unitário e subtotal de cada item
- **E** exibe o valor total do carrinho

#### Scenario: Carrinho vazio
- **QUANDO** o carrinho está vazio
- **ENTÃO** o sistema exibe mensagem "Carrinho vazio"

### Requirement: Remover produto do carrinho
O sistema DEVE permitir remover produtos do carrinho.

#### Scenario: Remover item
- **QUANDO** o usuário remove um item do carrinho
- **ENTÃO** o item é removido
- **E** o estoque do produto é restaurado
- **E** o total é recalculado

#### Scenario: Diminuir quantidade
- **QUANDO** o usuário diminui a quantidade de um item
- **ENTÃO** a quantidade é reduzida
- **E** o estoque é restaurado proporcionalmente

### Requirement: Aplicar desconto
O sistema DEVE permitir aplicar desconto no valor total do carrinho.

#### Scenario: Desconto percentual
- **QUANDO** o usuário aplica um desconto percentual válido
- **ENTÃO** o valor total é recalculado com o desconto aplicado

#### Scenario: Desconto em valor
- **QUANDO** o usuário aplica um desconto em valor fixo
- **ENTÃO** o valor total é reduzido pelo valor do desconto
