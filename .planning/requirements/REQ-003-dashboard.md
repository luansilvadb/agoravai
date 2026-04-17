# REQ-003: Dashboard & Visualização

## Phase Goal
Criar dashboard interativo com gráficos, resumos financeiros e insights visuais.

## User Story
> Como usuário, quero ver meu panorama financeiro em um piscar de olhos, com gráficos bonitos e números claros, para que eu entenda para onde meu dinheiro está indo.

## Functional Requirements

### FR1: Resumo Financeiro (Cards)
- [ ] Card Saldo Total (receitas - despesas)
- [ ] Card Total Receitas (mês atual)
- [ ] Card Total Despesas (mês atual)
- [ ] Card Projeção/Status (meta mensal)
- [ ] Cores indicativas (verde receitas, vermelho despesas)
- [ ] Animação de contagem (count up)

### FR2: Gráfico de Despesas por Categoria
- [ ] Gráfico donut ou pizza
- [ ] Mostrar top 5 categorias + "Outros"
- [ ] Legenda interativa (clique para filtrar)
- [ ] Porcentagem e valor absoluto
- [ ] Canvas ou SVG puro (sem bibliotecas externas)

### FR3: Gráfico de Evolução Mensal
- [ ] Gráfico de linha ou barras
- [ ] Últimos 6-12 meses
- [ ] Comparativo receitas vs despesas
- [ ] Hover para valores exatos
- [ ] Eixo Y com formatação de moeda

### FR4: Transações Recentes
- [ ] Lista das últimas 5-10 transações
- [ ] Ícone de categoria, descrição, valor, data
- [ ] Badge de tipo (receita/despesa)
- [ ] Link "Ver todas" para página completa

### FR5: Filtros de Período
- [ ] Presets: Hoje, Semana, Mês, Ano
- [ ] Filtro custom: date picker (de/para)
- [ ] Todos os dados do dashboard filtram por período
- [ ] Persistir filtro na sessão

### FR6: Insights
- [ ] Categoria com maior gasto
- [ ] Comparação com mês anterior
- [ ] Média de gasto diário
- [ ] Projeção de saldo (se mantiver ritmo)

## Non-Functional Requirements

### NFR1: Performance
- [ ] Gráficos renderizam < 500ms
- [ ] Cálculos em Web Worker (se pesado)
- [ ] Throttle em atualizações de filtro

### NFR2: Responsividade
- [ ] Gráficos redimensionam com container
- [ ] Mobile: gráficos empilhados verticalmente
- [ ] Touch-friendly (swipe entre períodos)

## Technical Decisions

| Decisão | Escolha | Rationale |
|---------|---------|-----------|
| Gráficos | Canvas API | Nativo, leve, controle total |
| Animações | requestAnimationFrame | 60fps smooth |
| Cores | Categorias mantêm consistência | Familiaridade |

## Charts Specifications

### Donut Chart
- Raio interno: 60% do raio externo
- Animação: rotação 0→360 + scale in
- Tooltip no hover

### Bar Chart
- Barras agrupadas (receita/despesa lado a lado)
- Espaçamento: 20% da largura da barra
- Grid lines sutis

## Definition of Done
- [ ] Dashboard atualiza em tempo real ao adicionar transação
- [ ] Gráficos renderizam corretamente em todos os tamanhos
- [ ] Período filtra todos os widgets consistentemente
- [ ] Animações não causam jank

## Estimates
- **Complexity:** High
- **Effort:** 3-4 dias
