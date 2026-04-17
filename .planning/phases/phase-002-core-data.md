# Phase 2: Core Data & Storage

## Phase Goal
Implementar persistência de dados com LocalStorage e CRUD completo de transações.

## Requirements
- REQ-002: Core Data & Storage

## Entry State
- Estrutura HTML/CSS pronta (da Phase 1)
- Placeholders no HTML para dados

## Success Criteria
- [ ] Dados persistem após refresh
- [ ] CRUD completo de transações funcional
- [ ] Categorias pré-definidas populadas
- [ ] Validação de formulários operacional

## Plans

### Plan 2.1: Storage Module
**Complexity:** Medium  
**Estimated Time:** 3-4 horas

**Scope:** Criar módulo de armazenamento com LocalStorage.

**Key Deliverables:**
1. `js/storage.js` - Módulo de persistência

**API do Módulo:**
```javascript
const Storage = {
  // Keys
  KEYS: {
    TRANSACTIONS: 'finance_app_transactions',
    CATEGORIES: 'finance_app_categories',
    SETTINGS: 'finance_app_settings'
  },
  
  // CRUD
  get(key),
  set(key, value),
  update(key, updaterFn),
  delete(key),
  clearAll(),
  
  // Specific helpers
  getTransactions(),
  saveTransaction(transaction),
  deleteTransaction(id),
  getCategories(),
  getSettings(),
  saveSettings(settings)
};
```

**Implementação:**
```javascript
const Storage = {
  KEYS: {
    TRANSACTIONS: 'finance_app_transactions',
    CATEGORIES: 'finance_app_categories', 
    SETTINGS: 'finance_app_settings'
  },

  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('Armazenamento cheio! Exporte seus dados.');
      }
      console.error('Storage set error:', e);
      return false;
    }
  },

  update(key, updaterFn) {
    const current = this.get(key) || [];
    const updated = updaterFn(current);
    return this.set(key, updated);
  },

  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Transaction helpers
  getTransactions() {
    return this.get(this.KEYS.TRANSACTIONS) || [];
  },

  saveTransaction(transaction) {
    return this.update(this.KEYS.TRANSACTIONS, transactions => {
      const existing = transactions.findIndex(t => t.id === transaction.id);
      if (existing >= 0) {
        transactions[existing] = { ...transaction, updatedAt: new Date().toISOString() };
        return transactions;
      }
      return [...transactions, { ...transaction, createdAt: new Date().toISOString() }];
    });
  },

  deleteTransaction(id) {
    return this.update(this.KEYS.TRANSACTIONS, transactions => 
      transactions.filter(t => t.id !== id)
    );
  },

  // Categories
  getCategories() {
    return this.get(this.KEYS.CATEGORIES) || this.getDefaultCategories();
  },

  getDefaultCategories() {
    return [
      { id: 'food', name: 'Alimentação', type: 'expense', color: '#ef4444', icon: 'utensils', isDefault: true },
      { id: 'transport', name: 'Transporte', type: 'expense', color: '#f97316', icon: 'car', isDefault: true },
      { id: 'housing', name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: 'home', isDefault: true },
      { id: 'entertainment', name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'gamepad-2', isDefault: true },
      { id: 'health', name: 'Saúde', type: 'expense', color: '#14b8a6', icon: 'heart-pulse', isDefault: true },
      { id: 'shopping', name: 'Compras', type: 'expense', color: '#06b6d4', icon: 'shopping-bag', isDefault: true },
      { id: 'education', name: 'Educação', type: 'expense', color: '#6366f1', icon: 'graduation-cap', isDefault: true },
      { id: 'salary', name: 'Salário', type: 'income', color: '#22c55e', icon: 'banknote', isDefault: true },
      { id: 'freelance', name: 'Freelance', type: 'income', color: '#10b981', icon: 'briefcase', isDefault: true },
      { id: 'investment', name: 'Investimentos', type: 'income', color: '#84cc16', icon: 'trending-up', isDefault: true }
    ];
  },

  // Settings
  getSettings() {
    return this.get(this.KEYS.SETTINGS) || {
      currency: 'BRL',
      locale: 'pt-BR',
      theme: 'light',
      monthlyGoal: 0
    };
  },

  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  }
};

export default Storage;
```

**Definition of Done:**
- [ ] Módulo exporta todas as funções
- [ ] Dados persistem no LocalStorage
- [ ] Tratamento de erro (LS cheio, corrompido)
- [ ] Categorias padrão são carregadas se vazio

---

### Plan 2.2: Data Models
**Complexity:** Low  
**Estimated Time:** 2 horas

**Scope:** Definir e implementar modelos de dados.

**Key Deliverables:**
1. `js/models/Transaction.js`
2. `js/models/Category.js`

**Transaction Model:**
```javascript
class Transaction {
  constructor({ id, type, amount, description, categoryId, date, createdAt, updatedAt }) {
    this.id = id || crypto.randomUUID();
    this.type = type; // 'income' | 'expense'
    this.amount = Math.abs(parseFloat(amount));
    this.description = description?.trim();
    this.categoryId = categoryId;
    this.date = date || new Date().toISOString().split('T')[0];
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  validate() {
    const errors = [];
    
    if (!['income', 'expense'].includes(this.type)) {
      errors.push('Tipo inválido');
    }
    
    if (isNaN(this.amount) || this.amount <= 0 || this.amount > 999999999.99) {
      errors.push('Valor inválido');
    }
    
    if (!this.description || this.description.length < 3) {
      errors.push('Descrição muito curta');
    }
    
    if (this.description.length > 100) {
      errors.push('Descrição muito longa');
    }
    
    if (!this.categoryId) {
      errors.push('Categoria obrigatória');
    }
    
    const dateObj = new Date(this.date);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (isNaN(dateObj.getTime()) || dateObj > maxDate) {
      errors.push('Data inválida');
    }
    
    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      amount: this.amount,
      description: this.description,
      categoryId: this.categoryId,
      date: this.date,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

**Category Model:**
```javascript
class Category {
  constructor({ id, name, type, color, icon, isDefault }) {
    this.id = id || crypto.randomUUID();
    this.name = name?.trim();
    this.type = type; // 'income' | 'expense' | 'both'
    this.color = color;
    this.icon = icon;
    this.isDefault = isDefault || false;
  }

  validate() {
    const errors = [];
    
    if (!this.name || this.name.length < 2) {
      errors.push('Nome muito curto');
    }
    
    if (this.name.length > 30) {
      errors.push('Nome muito longo');
    }
    
    if (!/^#[0-9A-Fa-f]{6}$/.test(this.color)) {
      errors.push('Cor inválida');
    }
    
    return errors;
  }
}
```

**Definition of Done:**
- [ ] Classes exportadas
- [ ] Validação completa
- [ ] Método toJSON() funcional
- [ ] Testes manuais dos modelos

---

### Plan 2.3: CRUD de Transações
**Complexity:** Medium-High  
**Estimated Time:** 4-6 horas

**Scope:** Implementar formulário e lista de transações com CRUD completo.

**Key Deliverables:**
1. Formulário de adicionar transação
2. Lista de transações
3. Edição inline ou modal
4. Exclusão com confirmação

**HTML da Seção de Transações:**
```html
<section id="transactions" class="section">
  <h2>Transações</h2>
  
  <!-- Form -->
  <form id="transaction-form" class="card">
    <div class="form-row">
      <label>
        Tipo
        <select name="type" required>
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </label>
      
      <label>
        Valor
        <input type="number" name="amount" step="0.01" min="0.01" required />
      </label>
    </div>
    
    <label>
      Descrição
      <input type="text" name="description" maxlength="100" required />
    </label>
    
    <label>
      Categoria
      <select name="categoryId" required>
        <!-- Populated by JS -->
      </select>
    </label>
    
    <label>
      Data
      <input type="date" name="date" required />
    </label>
    
    <button type="submit" class="btn btn--primary">Salvar</button>
  </form>
  
  <!-- List -->
  <div id="transactions-list" class="transactions-list">
    <!-- Populated by JS -->
  </div>
</section>
```

**JavaScript:**
```javascript
// js/transactions.js
import Storage from './storage.js';
import Transaction from './models/Transaction.js';

class TransactionsManager {
  constructor() {
    this.form = document.getElementById('transaction-form');
    this.list = document.getElementById('transactions-list');
    this.categorySelect = this.form?.querySelector('[name="categoryId"]');
    
    this.init();
  }

  init() {
    if (!this.form) return;
    
    this.populateCategories();
    this.bindEvents();
    this.render();
  }

  populateCategories() {
    const categories = Storage.getCategories();
    const type = this.form.querySelector('[name="type"]')?.value || 'expense';
    
    this.categorySelect.innerHTML = categories
      .filter(c => c.type === type || c.type === 'both')
      .map(c => `<option value="${c.id}">${c.name}</option>`)
      .join('');
  }

  bindEvents() {
    // Form submit
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTransaction();
    });
    
    // Type change updates categories
    this.form.querySelector('[name="type"]')?.addEventListener('change', () => {
      this.populateCategories();
    });
  }

  saveTransaction() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    const transaction = new Transaction(data);
    const errors = transaction.validate();
    
    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }
    
    Storage.saveTransaction(transaction.toJSON());
    this.form.reset();
    this.render();
    
    // Dispatch event for dashboard update
    window.dispatchEvent(new CustomEvent('transactionChanged'));
  }

  deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      Storage.deleteTransaction(id);
      this.render();
      window.dispatchEvent(new CustomEvent('transactionChanged'));
    }
  }

  render() {
    const transactions = Storage.getTransactions()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    this.list.innerHTML = transactions.map(t => this.renderTransaction(t)).join('');
  }

  renderTransaction(t) {
    const category = Storage.getCategories().find(c => c.id === t.categoryId);
    
    return `
      <div class="transaction-item" data-id="${t.id}">
        <div class="transaction-icon" style="background: ${category?.color || '#ccc'}">
          <i data-lucide="${category?.icon || 'help-circle'}"></i>
        </div>
        <div class="transaction-info">
          <div class="transaction-description">${t.description}</div>
          <div class="transaction-meta">
            ${category?.name || 'Sem categoria'} • ${formatDate(t.date)}
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
  }

  showErrors(errors) {
    alert(errors.join('\n'));
  }
}
```

**Definition of Done:**
- [ ] Pode adicionar transação
- [ ] Pode excluir transação (com confirmação)
- [ ] Validação mostra erros claros
- [ ] Lista ordenada por data (mais recente primeiro)
- [ ] Evento 'transactionChanged' disparado

---

### Plan 2.4: Formatters
**Complexity:** Low  
**Estimated Time:** 1-2 horas

**Scope:** Implementar funções de formatação de moeda e data.

**Key Deliverables:**
1. Atualizar `js/utils.js` com formatters

**Implementação:**
```javascript
// js/utils.js
import Storage from './storage.js';

export const formatCurrency = (value) => {
  const settings = Storage.getSettings();
  return new Intl.NumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.currency
  }).format(value);
};

export const formatDate = (dateString) => {
  const settings = Storage.getSettings();
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(settings.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short'
  }).format(date);
};

export const parseCurrency = (value) => {
  return parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.'));
};

// Make formatters globally available for HTML templates
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
```

**Definition of Done:**
- [ ] Moeda formatada conforme locale (R$ 1.234,56)
- [ ] Data formatada (DD/MM/YYYY)
- [ ] Funciona com diferentes configurações de locale

---

## Exit State
- Módulo Storage funcional e testado
- Modelos de dados validando corretamente
- CRUD de transações operacional
- Formatadores prontos para uso
- Dados persistem no LocalStorage

## UAT Items
- [ ] Adicionar transação → aparece na lista → persiste após F5
- [ ] Excluir transação → some da lista → persiste após F5
- [ ] Validação rejeita dados inválidos
- [ ] Categorias padrão aparecem no dropdown
- [ ] Formatação de moeda e data correta

## Notes
- Não implementar edição nesta fase (basta delete + re-add)
- Lista simples, sem paginação ainda
- Foco em funcionalidade, não em UI perfeita (ainda)
