## ADDED Requirements

### Requirement: Visualizar métricas de vendas
O sistema DEVE exibir métricas resumidas das vendas no painel administrativo.

#### Scenario: Exibição de métricas
- **QUANDO** o usuário acessa o painel administrativo
- **ENTÃO** o sistema exibe:
  - Total de vendas do dia
  - Faturamento total
  - Quantidade de produtos vendidos
  - Ticket médio

### Requirement: Listar histórico de vendas
O sistema DEVE listar todas as vendas realizadas com filtros de data.

#### Scenario: Listagem de vendas
- **QUANDO** o usuário acessa o histórico de vendas
- **ENTÃO** o sistema exibe lista cronológica das vendas
- **E** cada venda mostra data, valor total e forma de pagamento

#### Scenario: Filtro por data
- **QUANDO** o usuário aplica filtro de data (hoje, semana, mês)
- **ENTÃO** o sistema exibe apenas vendas no período selecionado

### Requirement: Gerenciar estoque
O sistema DEVE permitir visualização e ajuste de estoque de produtos.

#### Scenario: Alerta de estoque baixo
- **QUANDO** um produto tem estoque menor ou igual a 5 unidades
- **ENTÃO** o sistema exibe alerta visual na listagem de produtos

#### Scenario: Ajuste manual de estoque
- **QUANDO** o usuário ajusta manualmente a quantidade em estoque
- **ENTÃO** o novo valor é persistido
- **E** o histórico de ajustes é registrado

### Requirement: Exportar dados
O sistema DEVE permitir exportação dos dados para backup.

#### Scenario: Exportação de dados
- **QUANDO** o usuário solicita exportação
- **ENTÃO** o sistema gera arquivo JSON com todos os dados (produtos e vendas)
- **E** inicia download do arquivo

#### Scenario: Importação de dados
- **QUANDO** o usuário seleciona arquivo JSON válido para importação
- **ENTÃO** o sistema carrega os dados e atualiza o localStorage
