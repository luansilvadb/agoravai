## ADDED Requirements

### Requirement: Finalizar venda
O sistema DEVE permitir finalizar uma venda com dados do cliente e forma de pagamento.

#### Scenario: Venda à vista em dinheiro
- **QUANDO** o usuário finaliza venda com pagamento em dinheiro
- **ENTÃO** o sistema registra a venda com status "concluída"
- **E** o carrinho é esvaziado
- **E** um resumo da venda é exibido

#### Scenario: Venda com cartão
- **QUANDO** o usuário seleciona pagamento com cartão (débito ou crédito)
- **ENTÃO** o sistema registra a venda com a forma de pagamento selecionada
- **E** o carrinho é esvaziado

#### Scenario: Venda com Pix
- **QUANDO** o usuário seleciona pagamento via Pix
- **ENTÃO** o sistema registra a venda com forma de pagamento Pix
- **E** exibe informações para simulação de pagamento

### Requirement: Calcular troco
O sistema DEVE calcular o troco para pagamentos em dinheiro.

#### Scenario: Cálculo de troco
- **QUANDO** o usuário informa o valor recebido em dinheiro
- **ENTÃO** o sistema calcula e exibe o valor do troco
- **E** exibe alerta se o valor recebido for insuficiente

### Requirement: Registrar histórico de vendas
O sistema DEVE armazenar o histórico de todas as vendas realizadas.

#### Scenario: Registro de venda
- **QUANDO** uma venda é concluída
- **ENTÃO** os dados da venda (itens, valor, data, forma de pagamento) são salvos
- **E** a venda aparece no histórico

#### Scenario: Visualização de detalhes da venda
- **QUANDO** o usuário visualiza uma venda no histórico
- **ENTÃO** o sistema exibe todos os itens vendidos, valores e forma de pagamento
