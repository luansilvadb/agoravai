/* ============================================
   TRANSACTIONS.JS - Transaction Management UI
   ============================================ */

import Storage from './storage.js';
import Transaction from './models/Transaction.js';

/**
 * TransactionsManager class
 * Handles transaction CRUD operations and UI rendering
 */
class TransactionsManager {
  constructor() {
    this.form = document.getElementById('transaction-form');
    this.formCard = document.getElementById('transaction-form-card');
    this.list = document.getElementById('transactions-list');
    this.searchInput = document.getElementById('transaction-search');
    this.clearSearchBtn = document.getElementById('clear-search');
    this.searchCount = document.getElementById('search-count');
    this.categorySelect = this.form?.querySelector('[name="categoryId"]');
    this.typeSelect = this.form?.querySelector('[name="type"]');
    
    this.transactions = [];
    this.filteredTransactions = [];
    
    this.init();
  }

  init() {
    if (!this.form || !this.list) {
      console.warn('Transaction form or list not found');
      return;
    }
    
    this.loadTransactions();
    this.populateCategories();
    this.bindEvents();
    this.render();
    
    // Listen for storage changes
    window.addEventListener('transactionChanged', () => {
      this.loadTransactions();
      this.render();
    });
  }

  loadTransactions() {
    this.transactions = Storage.getTransactions();
    this.filteredTransactions = [...this.transactions];
  }

  bindEvents() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTransaction();
    });

    // Form reset
    this.form.addEventListener('reset', () => {
      // Reset date to today
      setTimeout(() => {
        const dateInput = this.form.querySelector('[name="date"]');
        if (dateInput) {
          dateInput.value = new Date().toISOString().split('T')[0];
        }
        this.populateCategories();
      }, 0);
    });

    // Type change updates categories
    this.typeSelect?.addEventListener('change', () => {
      this.populateCategories();
    });

    // Search with debounce
    let searchTimeout;
    this.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.search(e.target.value);
      }, 300);
    });

    // Clear search
    this.clearSearchBtn?.addEventListener('click', () => {
      if (this.searchInput) {
        this.searchInput.value = '';
        this.search('');
        this.searchInput.focus();
      }
    });

    // Delete buttons (event delegation)
    this.list.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        this.deleteTransaction(id);
      }
    });
  }

  populateCategories() {
    if (!this.categorySelect) return;
    
    const type = this.typeSelect?.value || 'expense';
    const categories = Storage.getCategoriesByType(type);
    
    const currentValue = this.categorySelect.value;
    
    this.categorySelect.innerHTML = [
      '<option value="">Selecione...</option>',
      ...categories.map(c => `<option value="${c.id}">${c.name}</option>`)
    ].join('');
    
    // Restore selection if still valid
    if (currentValue && categories.find(c => c.id === currentValue)) {
      this.categorySelect.value = currentValue;
    }
  }

  saveTransaction() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    const transaction = new Transaction(data);
    const errors = transaction.validate();
    
    if (errors.length > 0) {
      window.showToast?.(errors.join('\n'), 'error');
      return;
    }

    const success = Storage.saveTransaction(transaction.toJSON());
    
    if (success) {
      window.showToast?.('Transação salva com sucesso!', 'success');
      this.form.reset();
      
      // Reset date to today
      const dateInput = this.form.querySelector('[name="date"]');
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
      
      // Reload and render
      this.loadTransactions();
      this.render();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('transactionChanged'));
    } else {
      window.showToast?.('Erro ao salvar transação', 'error');
    }
  }

  deleteTransaction(id) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    const success = Storage.deleteTransaction(id);
    
    if (success) {
      window.showToast?.('Transação excluída', 'success');
      this.loadTransactions();
      this.render();
      window.dispatchEvent(new CustomEvent('transactionChanged'));
    }
  }

  search(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Toggle clear button
    if (this.clearSearchBtn) {
      this.clearSearchBtn.hidden = !normalizedQuery;
    }
    
    // Filter transactions
    if (!normalizedQuery) {
      this.filteredTransactions = [...this.transactions];
    } else {
      const categories = Storage.getCategories();
      
      this.filteredTransactions = this.transactions.filter(t => {
        const category = categories.find(c => c.id === t.categoryId);
        const searchableText = [
          t.description,
          category?.name,
          t.amount.toString(),
          t.date,
          t.type === 'income' ? 'receita' : 'despesa'
        ].join(' ').toLowerCase();
        
        return searchableText.includes(normalizedQuery);
      });
    }
    
    // Update count
    this.updateSearchCount();
    
    // Render
    this.render(this.filteredTransactions, normalizedQuery);
  }

  updateSearchCount() {
    if (!this.searchCount) return;
    
    const total = this.transactions.length;
    const filtered = this.filteredTransactions.length;
    
    if (filtered !== total) {
      this.searchCount.textContent = `${filtered} de ${total} transações`;
    } else {
      this.searchCount.textContent = `${total} transações`;
    }
  }

  highlight(text, query) {
    if (!query) return this.escapeHtml(text);
    
    const escapedQuery = this.escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const escapedText = this.escapeHtml(text);
    
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  render(transactionsToRender = this.filteredTransactions, query = '') {
    const categories = Storage.getCategories();
    const settings = Storage.getSettings();
    
    if (transactionsToRender.length === 0) {
      this.list.innerHTML = `
        <div class="empty-state">
          <i data-lucide="receipt"></i>
          <p>${query ? 'Nenhuma transação encontrada' : 'Nenhuma transação cadastrada'}</p>
          ${!query ? '<p class="text-muted">Adicione sua primeira transação acima</p>' : ''}
        </div>
      `;
    } else {
      this.list.innerHTML = transactionsToRender.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        const formattedAmount = new Intl.NumberFormat(settings.locale, {
          style: 'currency',
          currency: settings.currency
        }).format(t.amount);
        
        return `
          <div class="transaction-item" data-id="${t.id}">
            <div class="transaction-icon" style="background-color: ${category?.color || '#94a3b8'}">
              <i data-lucide="${category?.icon || 'help-circle'}"></i>
            </div>
            <div class="transaction-info">
              <div class="transaction-description">
                ${this.highlight(t.description, query)}
              </div>
              <div class="transaction-meta">
                ${this.highlight(category?.name || 'Sem categoria', query)} • 
                ${window.formatDate?.(t.date) || t.date}
              </div>
            </div>
            <div class="transaction-amount ${t.type}">
              ${t.type === 'income' ? '+' : '-'} ${formattedAmount}
            </div>
            <button class="btn btn--ghost delete-btn" data-id="${t.id}" aria-label="Excluir transação">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        `;
      }).join('');
    }
    
    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    this.updateSearchCount();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.transactionsManager = new TransactionsManager();
});

export default TransactionsManager;
