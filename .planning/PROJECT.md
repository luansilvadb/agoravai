# Sistema Financeiro Pessoal

## Overview

Aplicativo de gestão financeira pessoal construído com HTML, CSS e JavaScript puro (vanilla), utilizando LocalStorage para persistência de dados.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Armazenamento**: LocalStorage (dados persistentes no navegador)
- **Estilo**: CSS moderno com variáveis, flexbox/grid, animações suaves
- **Ícones**: Lucide (via CDN) ou SVG inline
- **Fonte**: Inter ou sistema similar

## Core Features

### 1. Dashboard
- Resumo financeiro (saldo total, receitas, despesas)
- Gráficos visuais (despesas por categoria, evolução mensal)
- Transações recentes
- Alertas e metas

### 2. Gerenciamento de Transações
- Adicionar/editar/excluir transações
- Categorização (receitas/despesas)
- Filtros por data, categoria, valor
- Busca de transações

### 3. Categorias
- Categorias pré-definidas (Alimentação, Transporte, Moradia, Lazer, etc.)
- Criar categorias personalizadas
- Cores e ícones por categoria

### 4. Relatórios
- Visão mensal/anual
- Comparativo períodos
- Exportação de dados (JSON/CSV)

### 5. Configurações
- Limpar dados
- Exportar/importar backup
- Definir moeda padrão
- Tema claro/escuro

## Data Model

```javascript
// Transaction
{
  id: string,
  type: 'income' | 'expense',
  amount: number,
  description: string,
  category: string,
  date: string (ISO),
  createdAt: string (ISO)
}

// Category
{
  id: string,
  name: string,
  type: 'income' | 'expense',
  color: string,
  icon: string
}

// Settings
{
  currency: string,
  theme: 'light' | 'dark',
  monthlyGoal: number
}
```

## UI Design Principles

- **Moderno**: Design limpo com sombras sutis, bordas arredondadas
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Acessível**: Contraste adequado, navegação por teclado
- **Interativo**: Feedback visual imediato, transições suaves
- **Cards**: Layout baseado em cards para organização visual

## Project Structure

```
/
├── index.html          # Página principal
├── css/
│   ├── base.css       # Variáveis, reset, utilitários
│   ├── components.css # Componentes reutilizáveis
│   ├── layout.css     # Layout e grids
│   └── theme.css      # Temas claro/escuro
├── js/
│   ├── app.js         # Inicialização principal
│   ├── storage.js     # Gerenciamento do LocalStorage
│   ├── transactions.js # CRUD de transações
│   ├── categories.js  # Gerenciamento de categorias
│   ├── charts.js      # Visualização de gráficos (Canvas/SVG)
│   ├── dashboard.js   # Lógica do dashboard
│   └── utils.js       # Funções utilitárias
└── assets/
    └── icons/         # Ícones SVG (se necessário)
```

## Milestones

### v1.0 - MVP (Mínimo Produto Viável)
- Dashboard com resumo básico
- CRUD de transações
- Categorias pré-definidas
- Persistência LocalStorage
- UI moderna responsiva

### v2.0 - Visualização
- Gráficos de despesas
- Filtros avançados
- Relatórios mensais
- Tema escuro

### v3.0 - Aprimoramentos
- Metas financeiras
- Exportação/importação
- Categorias personalizadas
- Notificações locais

## Constraints

- Dados limitados ao LocalStorage (~5MB)
- Sem backend/servidor
- Single-page application (SPA feel)
- Sem frameworks (vanilla JS only)
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## Success Criteria

- [ ] Interface moderna e intuitiva
- [ ] Dados persistem entre sessões
- [ ] Funciona offline completamente
- [ ] Responsivo em todos os tamanhos de tela
- [ ] Performance fluida (< 100ms para operações)
