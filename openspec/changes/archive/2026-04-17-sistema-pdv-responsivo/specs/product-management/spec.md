## ADDED Requirements

### Requirement: Cadastrar produto
O sistema DEVE permitir o cadastro de produtos com nome, preço, categoria e quantidade em estoque.

#### Scenario: Cadastro de produto válido
- **QUANDO** o usuário preenche nome, preço, categoria e estoque
- **ENTÃO** o produto é salvo no localStorage
- **E** o produto aparece na listagem

#### Scenario: Cadastro com dados inválidos
- **QUANDO** o usuário tenta salvar sem preencher nome ou preço
- **ENTÃO** o sistema exibe mensagem de erro
- **E** o produto não é salvo

### Requirement: Listar produtos
O sistema DEVE exibir todos os produtos cadastrados em formato de lista ou grid.

#### Scenario: Listagem com produtos
- **QUANDO** existem produtos cadastrados
- **ENTÃO** o sistema exibe nome, preço, categoria e estoque de cada produto

#### Scenario: Listagem vazia
- **QUANDO** não existem produtos cadastrados
- **ENTÃO** o sistema exibe mensagem "Nenhum produto cadastrado"

### Requirement: Editar produto
O sistema DEVE permitir a edição dos dados de um produto existente.

#### Scenario: Edição bem-sucedida
- **QUANDO** o usuário altera dados de um produto e salva
- **ENTÃO** as alterações são persistidas no localStorage
- **E** a listagem é atualizada

### Requirement: Excluir produto
O sistema DEVE permitir a exclusão de produtos cadastrados.

#### Scenario: Exclusão com confirmação
- **QUANDO** o usuário solicita exclusão de um produto
- **ENTÃO** o sistema solicita confirmação
- **E** após confirmação, o produto é removido do localStorage
