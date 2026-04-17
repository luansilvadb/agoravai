# Phase 4: Funcionalidades Avançadas

## Phase Goal
Adicionar exportação/importação de dados, metas, busca e tema escuro.

## Requirements
- REQ-004: Funcionalidades Avançadas

## Entry State
- Dashboard completo
- CRUD de transações funcionando
- Gráficos implementados

## Success Criteria
- [ ] Exporta e importa dados corretamente
- [ ] Metas mostram progresso
- [ ] Busca funciona em tempo real
- [ ] Tema escuro aplicado em todas as telas

## Plans

### Plan 4.1: Exportação e Importação
**Complexity:** Medium  
**Estimated Time:** 3-4 horas

**Scope:** Permitir backup e restore dos dados.

**Key Deliverables:**
1. Exportação JSON/CSV
2. Importação com validação
3. UI de configurações

**HTML na Seção Configurações:**
```html
<section id="settings" class="section">
  <h2>Configurações</h2>
  
  <div class="card">
    <h3>Dados</h3>
    
    <div class="setting-item">
      <div>
        <div class="setting-label">Exportar Dados</div>
        <div class="setting-description">Faça backup de todas as suas transações</div>
      </div>
      <button class="btn btn--secondary" id="export-json">Exportar JSON</button>
    </div>
    
    <div class="setting-item">
      <div>
        <div class="setting-label">Exportar CSV</div>
        <div class="setting-description">Planilha compatível com Excel</div>
      </div>
      <button class="btn btn--secondary" id="export-csv">Exportar CSV</button>
    </div>
    
    <div class="setting-item">
      <div>
        <div class="setting-label">Importar Backup</div>
        <div class="setting-description">Restaurar dados de arquivo JSON</div>
      </div>
      <input type="file" id="import-file" accept=".json" hidden />
      <button class="btn btn--secondary" onclick="document.getElementById('import-file').click()">
        Importar
      </button>
    </div>
    
    <div class="setting-item setting-item--danger">
      <div>
        <div class="setting-label">Limpar Todos os Dados</div>
        <div class="setting-description">Esta ação não pode ser desfeita!</div>
      </div>
      <button class="btn btn--danger" id="clear-all">Limpar Tudo</button>
    </div>
  </div>
</section>
```

**JavaScript:**
```javascript
// js/settings.js
import Storage from './storage.js';

class DataManager {
  constructor() {
    this.init();
  }

  init() {
    document.getElementById('export-json')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('export-csv')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('import-file')?.addEventListener('change', (e) => this.importJSON(e));
    document.getElementById('clear-all')?.addEventListener('click', () => this.clearAll());
  }

  exportJSON() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions: Storage.getTransactions(),
      categories: Storage.getCategories(),
      settings: Storage.getSettings()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast('Backup exportado com sucesso!');
  }

  exportCSV() {
    const transactions = Storage.getTransactions();
    const categories = Storage.getCategories();
    
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'];
    
    const rows = transactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return [
        t.date,
        t.type === 'income' ? 'Receita' : 'Despesa',
        `"${t.description.replace(/"/g, '""')}"`,
        category?.name || 'Sem categoria',
        t.amount.toFixed(2)
      ].join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast('CSV exportado com sucesso!');
  }

  async importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate schema
      if (!this.validateImport(data)) {
        throw new Error('Arquivo inválido ou corrompido');
      }
      
      // Confirm
      if (!confirm(`Importar ${data.transactions?.length || 0} transações? Isso substituirá todos os dados atuais.`)) {
        return;
      }
      
      // Import
      Storage.set(Storage.KEYS.TRANSACTIONS, data.transactions || []);
      if (data.categories) {
        Storage.set(Storage.KEYS.CATEGORIES, data.categories);
      }
      if (data.settings) {
        Storage.set(Storage.KEYS.SETTINGS, data.settings);
      }
      
      this.showToast('Dados importados com sucesso!');
      
      // Reload page
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      alert('Erro ao importar: ' + error.message);
      console.error(error);
    }
    
    // Reset input
    event.target.value = '';
  }

  validateImport(data) {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.transactions)) return false;
    
    // Check transaction structure
    return data.transactions.every(t => 
      t.id && 
      t.type && 
      typeof t.amount === 'number' &&
      t.description &&
      t.date
    );
  }

  clearAll() {
    if (!confirm('TEM CERTEZA? Todos os dados serão permanentemente excluídos!')) return;
    if (!confirm('Última chance. Clique OK para apagar tudo.')) return;
    
    Storage.clearAll();
    this.showToast('Todos os dados foram apagados');
    setTimeout(() => window.location.reload(), 1000);
  }

  showToast(message) {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
}
```

**Definition of Done:**
- [ ] Exporta JSON com todas as tabelas
- [ ] Exporta CSV apenas com transações
- [ ] Importa validando schema
- [ ] Confirmações modais para ações destrutivas
- [ ] Toast de sucesso/erro

---

### Plan 4.2: Metas Financeiras
**Complexity:** Low  
**Estimated Time:** 2-3 horas

**Scope:** Permitir definir e acompanhar meta de economia mensal.

**HTML:**
```html
<div class="card">
  <h3>Meta de Economia</h3>
  
  <div id="goal-section">
    <div class="goal-input-wrapper">
      <label>Meta mensal (quanto quer economizar):</label>
      <div class="input-group">
        <span class="input-prefix">R$</span>
        <input type="number" id="goal-input" step="0.01" min="0" placeholder="0,00" />
        <button class="btn btn--primary" id="save-goal">Salvar</button>
      </div>
    </div>
    
    <div class="goal-progress-wrapper">
      <div class="goal-stats">
        <span>Economizado: <strong id="saved-amount">R$ 0,00</strong></span>
        <span>Meta: <strong id="goal-amount">R$ 0,00</strong></span>
      </div>
      
      <div class="progress-bar progress-bar--large">
        <div class="progress-bar__fill" id="goal-progress-bar"></div>
      </div>
      
      <div class="goal-message" id="goal-message">
        Você está a caminho da sua meta!
      </div>
    </div>
  </div>
</div>
```

**JavaScript:**
```javascript
// js/goals.js
import Storage from './storage.js';
import { formatCurrency } from './utils.js';

class GoalManager {
  constructor() {
    this.input = document.getElementById('goal-input');
    this.saveBtn = document.getElementById('save-goal');
    this.init();
  }

  init() {
    this.loadGoal();
    
    this.saveBtn?.addEventListener('click', () => this.saveGoal());
    
    // Listen for transaction changes to update progress
    window.addEventListener('transactionChanged', () => this.updateProgress());
  }

  loadGoal() {
    const settings = Storage.getSettings();
    if (this.input && settings.monthlyGoal > 0) {
      this.input.value = settings.monthlyGoal;
    }
    this.updateProgress();
  }

  saveGoal() {
    const value = parseFloat(this.input?.value);
    if (isNaN(value) || value < 0) {
      alert('Digite um valor válido');
      return;
    }
    
    const settings = Storage.getSettings();
    settings.monthlyGoal = value;
    Storage.saveSettings(settings);
    
    this.updateProgress();
    this.showToast('Meta salva!');
  }

  updateProgress() {
    const settings = Storage.getSettings();
    const goal = settings.monthlyGoal || 0;
    
    // Calculate current month savings
    const now = new Date();
    const transactions = Storage.getTransactions().filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && 
             tDate.getFullYear() === now.getFullYear();
    });
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const saved = income - expense;
    
    // Update UI
    const savedEl = document.getElementById('saved-amount');
    const goalEl = document.getElementById('goal-amount');
    const barEl = document.getElementById('goal-progress-bar');
    const messageEl = document.getElementById('goal-message');
    
    if (savedEl) savedEl.textContent = formatCurrency(saved);
    if (goalEl) goalEl.textContent = formatCurrency(goal);
    
    if (barEl) {
      const percent = goal > 0 ? Math.min(100, Math.max(0, (saved / goal) * 100)) : 0;
      barEl.style.width = `${percent}%`;
      
      // Color based on progress
      barEl.className = 'progress-bar__fill';
      if (percent >= 100) barEl.classList.add('success');
      else if (percent >= 75) barEl.classList.add('info');
      else if (percent >= 50) barEl.classList.add('warning');
      else barEl.classList.add('danger');
    }
    
    if (messageEl) {
      if (goal === 0) {
        messageEl.textContent = 'Defina uma meta para começar a economizar!';
      } else if (saved >= goal) {
        messageEl.textContent = '🎉 Parabéns! Você atingiu sua meta!';
        messageEl.className = 'goal-message success';
      } else if (saved > 0) {
        const remaining = goal - saved;
        messageEl.textContent = `Faltam ${formatCurrency(remaining)} para sua meta`;
        messageEl.className = 'goal-message';
      } else {
        messageEl.textContent = 'Você ainda não economizou este mês';
        messageEl.className = 'goal-message warning';
      }
    }
  }

  showToast(message) {
    // Reuse from DataManager or create shared util
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
}
```

**Definition of Done:**
- [ ] Pode definir meta monetária
- [ ] Progresso calcula automaticamente
- [ ] Barra colorida baseada no progresso
- [ ] Mensagens motivacionais

---

### Plan 4.3: Busca de Transações
**Complexity:** Low  
**Estimated Time:** 2-3 horas

**Scope:** Campo de busca em tempo real nas transações.

**HTML:**
```html
<div class="search-wrapper">
  <div class="input-group input-group--search">
    <i data-lucide="search" class="input-icon"></i>
    <input 
      type="text" 
      id="transaction-search" 
      placeholder="Buscar por descrição, categoria ou valor..."
      autocomplete="off"
    />
    <button class="btn btn--ghost clear-search" id="clear-search" hidden>
      <i data-lucide="x"></i>
    </button>
  </div>
  <div class="search-results-count" id="search-count"></div>
</div>
```

**JavaScript:**
```javascript
// js/search.js
import Storage from './storage.js';
import { formatCurrency, formatDate } from './utils.js';

class SearchManager {
  constructor(listElement) {
    this.input = document.getElementById('transaction-search');
    this.clearBtn = document.getElementById('clear-search');
    this.countEl = document.getElementById('search-count');
    this.listElement = listElement;
    this.allTransactions = [];
    
    this.init();
  }

  init() {
    if (!this.input) return;
    
    this.loadTransactions();
    
    // Debounced search
    let timeout;
    this.input.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this.search(e.target.value), 300);
    });
    
    this.clearBtn?.addEventListener('click', () => {
      this.input.value = '';
      this.search('');
      this.input.focus();
    });
    
    // Update when transactions change
    window.addEventListener('transactionChanged', () => {
      this.loadTransactions();
      this.search(this.input.value);
    });
  }

  loadTransactions() {
    this.allTransactions = Storage.getTransactions()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  search(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Toggle clear button
    if (this.clearBtn) {
      this.clearBtn.hidden = !normalizedQuery;
    }
    
    // Filter
    const filtered = normalizedQuery
      ? this.allTransactions.filter(t => this.matches(t, normalizedQuery))
      : this.allTransactions;
    
    // Update count
    if (this.countEl) {
      if (normalizedQuery) {
        this.countEl.textContent = `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`;
      } else {
        this.countEl.textContent = `${this.allTransactions.length} transações`;
      }
    }
    
    // Render
    this.render(filtered, normalizedQuery);
  }

  matches(transaction, query) {
    const category = Storage.getCategories().find(c => c.id === transaction.categoryId);
    
    const searchableText = [
      transaction.description,
      category?.name,
      formatCurrency(transaction.amount),
      formatDate(transaction.date),
      transaction.amount.toString()
    ].join(' ').toLowerCase();
    
    return searchableText.includes(query);
  }

  highlight(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  render(transactions, query) {
    const categories = Storage.getCategories();
    
    if (transactions.length === 0) {
      this.listElement.innerHTML = `
        <div class="empty-state">
          <i data-lucide="search-x"></i>
          <p>Nenhuma transação encontrada</p>
        </div>
      `;
      return;
    }
    
    this.listElement.innerHTML = transactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      
      return `
        <div class="transaction-item" data-id="${t.id}">
          <div class="transaction-icon" style="background: ${category?.color || '#ccc'}">
            <i data-lucide="${category?.icon || 'help-circle'}"></i>
          </div>
          <div class="transaction-info">
            <div class="transaction-description">
              ${this.highlight(t.description, query)}
            </div>
            <div class="transaction-meta">
              ${this.highlight(category?.name || 'Sem categoria', query)} • 
              ${formatDate(t.date)}
            </div>
          </div>
          <div class="transaction-amount ${t.type}">
            ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
          </div>
          <button class="btn btn--ghost delete-btn" data-id="${t.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
    }).join('');
    
    // Re-init icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Bind delete buttons
    this.listElement.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        // Call delete from TransactionsManager
        window.transactionsManager?.deleteTransaction(id);
      });
    });
  }
}
```

**Definition of Done:**
- [ ] Busca em tempo real (debounce 300ms)
- [ ] Busca por descrição, categoria, valor, data
- [ ] Highlight dos termos encontrados
- [ ] Contador de resultados
- [ ] Botão limpar busca

---

### Plan 4.4: Tema Escuro
**Complexity:** Low  
**Estimated Time:** 2-3 horas

**Scope:** Implementar tema escuro completo.

**CSS Variables para Tema Escuro:**
```css
/* css/theme.css */
:root {
  /* Light theme (default) */
  --color-background: hsl(0 0% 100%);
  --color-surface: hsl(0 0% 98%);
  --color-surface-elevated: hsl(0 0% 100%);
  --color-text: hsl(220 20% 20%);
  --color-text-muted: hsl(220 10% 50%);
  --color-border: hsl(220 13% 91%);
}

[data-theme="dark"] {
  --color-background: hsl(220 20% 10%);
  --color-surface: hsl(220 18% 14%);
  --color-surface-elevated: hsl(220 16% 18%);
  --color-text: hsl(220 10% 90%);
  --color-text-muted: hsl(220 10% 60%);
  --color-border: hsl(220 15% 25%);
}
```

**HTML Toggle:**
```html
<div class="card">
  <h3>Aparência</h3>
  
  <div class="setting-item">
    <div>
      <div class="setting-label">Tema</div>
      <div class="setting-description">Escolha entre claro ou escuro</div>
    </div>
    <div class="toggle-group">
      <button class="btn btn--sm" data-theme="light">☀️ Claro</button>
      <button class="btn btn--sm" data-theme="dark">🌙 Escuro</button>
      <button class="btn btn--sm" data-theme="auto">Auto</button>
    </div>
  </div>
</div>
```

**JavaScript:**
```javascript
// js/theme.js
import Storage from './storage.js';

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.init();
  }

  init() {
    // Load saved theme
    const settings = Storage.getSettings();
    this.applyTheme(settings.theme || 'light');
    
    // Bind buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
      });
    });
    
    // Listen for system preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (this.currentTheme === 'auto') {
          this.applyTheme(e.matches ? 'dark' : 'light', true);
        }
      });
    }
  }

  applyTheme(theme, isAuto = false) {
    let effectiveTheme = theme;
    
    if (theme === 'auto') {
      effectiveTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    this.currentTheme = theme;
    
    // Update active button
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  saveTheme(theme) {
    const settings = Storage.getSettings();
    settings.theme = theme;
    Storage.saveSettings(settings);
  }
}
```

**Chart Colors for Dark Mode:**
```javascript
// Update chart colors based on theme
const getChartColors = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#e2e8f0' : '#334155',
    grid: isDark ? '#334155' : '#e2e8f0',
    background: isDark ? '#1e293b' : '#ffffff'
  };
};
```

**Definition of Done:**
- [ ] Tema escuro aplicado em todos os elementos
- [ ] Toggle funcional
- [ ] Persiste entre sessões
- [ ] Respeita prefers-color-scheme
- [ ] Transição suave entre temas

---

## Exit State
- Exportação/importação funcionando
- Metas financeiras configuráveis
- Busca em tempo real
- Tema escuro completo
- Sistema 100% funcional

## UAT Items
- [ ] Exporta e importa sem perda de dados
- [ ] Meta calcula economia corretamente
- [ ] Busca encontra transações esperadas
- [ ] Tema escuro consistente em todas as telas

## Notes
- Implementar validação rigorosa na importação
- Foco em UX das metas (mensagens motivacionais)
- Busca case-insensitive
- Tema com transição CSS
