## 1. Estrutura Base do Projeto

- [x] 1.1 Criar estrutura de diretórios (css/, js/models/, js/services/, js/views/)
- [x] 1.2 Criar arquivo HTML principal (index.html)
- [x] 1.3 Configurar meta tags responsivas e viewport
- [x] 1.4 Adicionar Lucide icons via CDN

## 2. CSS Base e Design System

- [x] 2.1 Criar arquivo CSS principal (css/style.css)
- [x] 2.2 Definir variáveis CSS (cores, fontes, espaçamentos)
- [x] 2.3 Estilos base (reset, typography)
- [x] 2.4 Componentes reutilizáveis (botões, inputs, cards)
- [x] 2.5 Media queries para responsividade (mobile, tablet, desktop)
- [x] 2.6 Estilos do layout (sidebar, header, main content)

## 3. Modelos de Dados

- [x] 3.1 Criar classe Product (id, name, price, category, stock)
- [x] 3.2 Criar classe CartItem (product, quantity, subtotal)
- [x] 3.3 Criar classe Cart (items, total, discount)
- [x] 3.4 Criar classe Sale (id, items, total, paymentMethod, date, customer)

## 4. Serviços de Armazenamento

- [x] 4.1 Criar StorageService para localStorage
- [x] 4.2 Implementar métodos CRUD para produtos
- [x] 4.3 Implementar persistência de vendas
- [x] 4.4 Criar métodos de exportação/importação JSON

## 5. Gerenciamento de Produtos

- [x] 5.1 Criar view de listagem de produtos (ProductListView)
- [x] 5.2 Criar formulário de cadastro/edição de produtos
- [x] 5.3 Implementar validação de campos obrigatórios
- [x] 5.4 Adicionar funcionalidade de exclusão com confirmação
- [x] 5.5 Implementar busca/filtro de produtos
- [x] 5.6 Exibir alerta de estoque baixo

## 6. Carrinho de Compras

- [x] 6.1 Criar CartManager para gerenciar estado do carrinho
- [x] 6.2 Implementar adicionar produto ao carrinho
- [x] 6.3 Implementar remover produto do carrinho
- [x] 6.4 Implementar aumentar/diminuir quantidade
- [x] 6.5 Calcular totais e subtotais automaticamente
- [x] 6.6 Criar view do carrinho com lista de itens

## 7. Checkout e Pagamento

- [x] 7.1 Criar view de checkout
- [x] 7.2 Implementar seleção de forma de pagamento (dinheiro, cartão, Pix)
- [x] 7.3 Calcular troco para pagamento em dinheiro
- [x] 7.4 Validar dados antes de finalizar
- [x] 7.5 Registrar venda no histórico
- [x] 7.6 Exibir resumo/Comprovante da venda

## 8. Painel Administrativo

- [x] 8.1 Criar DashboardView com métricas
- [x] 8.2 Implementar cálculo de métricas (vendas do dia, faturamento, ticket médio)
- [x] 8.3 Criar view de histórico de vendas
- [x] 8.4 Implementar filtros de data (hoje, semana, mês)
- [x] 8.5 Criar tela de detalhes da venda
- [x] 8.6 Adicionar funcionalidade de ajuste de estoque

## 9. Navegação e Layout

- [x] 9.1 Criar sistema de roteamento entre views
- [x] 9.2 Implementar sidebar de navegação (desktop)
- [x] 9.3 Implementar menu hambúrguer (mobile)
- [x] 9.4 Criar header com título da view atual
- [x] 9.5 Adicionar transições suaves entre telas

## 10. Responsividade e UX

- [x] 10.1 Ajustar grid de produtos para 1 coluna (mobile), 2 colunas (tablet), 3+ colunas (desktop)
- [x] 10.2 Garantir botões com área de toque mínima 44x44px
- [x] 10.3 Implementar feedback visual para interações
- [x] 10.4 Adicionar estados de loading
- [x] 10.5 Testar em diferentes tamanhos de tela
- [x] 10.6 Otimizar performance (lazy loading, event delegation)

## 11. Testes e Polimento

- [x] 11.1 Testar fluxo completo de venda
- [x] 11.2 Verificar persistência de dados após refresh
- [x] 11.3 Testar exportação/importação de dados
- [x] 11.4 Corrigir bugs de interface
- [x] 11.5 Adicionar tratamento de erros
- [x] 11.6 Revisar código e refatorar se necessário
