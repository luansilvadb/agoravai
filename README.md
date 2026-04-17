# 💰 Finanças Pessoais

Sistema financeiro pessoal offline construído com HTML, CSS e JavaScript puro. Armazenamento local via LocalStorage - seus dados permanecem no seu navegador.

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Funcionalidades

### 📊 Dashboard
- Resumo financeiro em tempo real (saldo, receitas, despesas)
- Filtros por período: Hoje, Semana, Mês, Ano
- Comparativo com período anterior
- Metas de economia mensal

### 📈 Gráficos
- **Donut Chart**: Despesas por categoria (Top 5 + Outros)
- **Bar Chart**: Evolução mensal (últimos 6 meses)
- Gráficos responsivos com Canvas API

### 💳 Transações
- Adicionar/editar/excluir transações
- Categorização automática
- Busca em tempo real
- Filtros e ordenação

### 🏷️ Categorias
- 10 categorias padrão (receitas e despesas)
- Cores e ícones por categoria
- Suporte para categorias personalizadas

### ⚙️ Configurações
- **Tema**: Claro, Escuro ou Automático
- **Moeda**: Real (R$), Dólar ($), Euro (€)
- **Metas**: Defina metas de economia mensal
- **Backup**: Exportar/Importar dados JSON
- **CSV**: Exportar transações para planilha

## 🚀 Como Usar

### Online
Acesse: `http://localhost:8080` (ou hospede em qualquer servidor estático)

### Local
```bash
# Clone ou baixe o projeto
cd finanças-pessoais

# Inicie um servidor local
python -m http.server 8080
# ou
npx serve .
# ou simplesmente abra o index.html no navegador
```

## 📱 Compatibilidade

- ✅ Chrome/Edge (últimas 2 versões)
- ✅ Firefox (últimas 2 versões)
- ✅ Safari (últimas 2 versões)
- ✅ Mobile (iOS Safari, Chrome Android)
- ⚠️ Internet Explorer não suportado

## 🏗️ Estrutura do Projeto

```
/
├── index.html          # Página principal (SPA)
├── css/
│   ├── base.css       # Reset, variáveis, tipografia
│   ├── layout.css     # Grid, navegação, responsivo
│   ├── components.css # Botões, cards, forms
│   └── theme.css      # Tema claro/escuro
├── js/
│   ├── app.js         # Navegação e utilitários
│   ├── app-init.js    # Inicialização do app
│   ├── storage.js     # LocalStorage manager
│   ├── models/
│   │   ├── Transaction.js  # Modelo de transação
│   │   └── Category.js   # Modelo de categoria
│   ├── transactions.js   # CRUD de transações
│   ├── categories.js     # Gerenciamento de categorias
│   ├── data-manager.js   # Import/export, metas
│   ├── dashboard.js      # Dashboard e cards
│   └── charts.js         # Gráficos Canvas
└── .planning/         # Documentação do projeto
```

## 💾 Dados

Todos os dados são armazenados localmente no navegador via **LocalStorage**:

- `finance_app_transactions` - Transações
- `finance_app_categories` - Categorias
- `finance_app_settings` - Configurações

### Backup
Use a função "Exportar JSON" em Configurações para fazer backup.

### Limite
LocalStorage tem limite de ~5MB. Para usuários com muitas transações, recomendamos exportar dados periodicamente.

## 🎨 Design

- **Mobile-first**: Responsivo de 320px a 1920px+
- **Acessível**: Navegação por teclado, contraste WCAG AA
- **Moderno**: CSS variables, Flexbox, Grid
- **Performance**: Zero dependências externas (exceto ícones)

## ⌨️ Atalhos

| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + K` | Foco na busca |
| `Esc` | Limpar busca |

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Ícones**: Lucide (CDN)
- **Armazenamento**: LocalStorage
- **Gráficos**: Canvas API nativa

## 📝 Licença

MIT License - use livremente!

---

Desenvolvido com ❤️ usando vanilla JavaScript
