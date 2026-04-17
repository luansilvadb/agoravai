/* ============================================
   DATA-MANAGER.JS - Import/Export & Settings
   ============================================ */

import Storage from './storage.js';

/**
 * DataManager class
 * Handles data import/export and application settings
 */
class DataManager {
  constructor() {
    this.init();
  }

  init() {
    // Bind export buttons
    document.getElementById('export-json')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('export-csv')?.addEventListener('click', () => this.exportCSV());
    
    // Bind import
    const importFile = document.getElementById('import-file');
    const importBtn = document.getElementById('btn-import');
    
    importBtn?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', (e) => this.importJSON(e));
    
    // Bind clear all
    document.getElementById('clear-all')?.addEventListener('click', () => this.clearAll());
    
    // Bind currency selector
    document.getElementById('currency-select')?.addEventListener('change', (e) => {
      this.updateSetting('currency', e.target.value);
    });
    
    // Bind goal
    document.getElementById('save-goal')?.addEventListener('click', () => this.saveGoal());
    
    // Initialize values
    this.loadSettings();
    
    // Listen for transaction changes to update goal display
    window.addEventListener('transactionChanged', () => {
      this.updateGoalDisplay();
    });
    
    // Initial goal display
    this.updateGoalDisplay();
  }

  loadSettings() {
    const settings = Storage.getSettings();
    
    // Set currency
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.value = settings.currency;
    }
    
    // Set goal
    const goalInput = document.getElementById('goal-input');
    if (goalInput && settings.monthlyGoal > 0) {
      goalInput.value = settings.monthlyGoal;
    }
  }

  updateSetting(key, value) {
    const settings = Storage.getSettings();
    settings[key] = value;
    Storage.saveSettings(settings);
    window.showToast?.('Configuração salva', 'success');
    
    // Reload to apply changes
    if (key === 'currency') {
      window.dispatchEvent(new CustomEvent('transactionChanged'));
    }
  }

  saveGoal() {
    const input = document.getElementById('goal-input');
    const value = parseFloat(input?.value);
    
    if (isNaN(value) || value < 0) {
      window.showToast?.('Digite um valor válido', 'error');
      return;
    }
    
    this.updateSetting('monthlyGoal', value);
    this.updateGoalDisplay();
  }

  updateGoalDisplay() {
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
    const percent = goal > 0 ? Math.min(100, Math.max(0, (saved / goal) * 100)) : 0;
    
    // Update UI
    const savedEl = document.getElementById('saved-amount');
    const goalEl = document.getElementById('goal-amount');
    const barEl = document.getElementById('goal-progress-bar');
    const messageEl = document.getElementById('goal-message');
    
    const currency = settings.currency;
    const locale = settings.locale;
    
    if (savedEl) {
      savedEl.textContent = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(saved);
    }
    
    if (goalEl) {
      goalEl.textContent = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(goal);
    }
    
    if (barEl) {
      barEl.style.width = `${percent}%`;
      barEl.className = 'progress-bar__fill';
      if (percent >= 100) barEl.classList.add('success');
      else if (percent >= 75) barEl.classList.add('info');
      else if (percent >= 50) barEl.classList.add('warning');
      else barEl.classList.add('danger');
    }
    
    if (messageEl) {
      if (goal === 0) {
        messageEl.textContent = 'Defina uma meta para começar a economizar!';
        messageEl.className = 'goal-message';
      } else if (saved >= goal) {
        messageEl.textContent = '🎉 Parabéns! Você atingiu sua meta!';
        messageEl.className = 'goal-message success';
      } else if (saved > 0) {
        const remaining = goal - saved;
        const formattedRemaining = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency
        }).format(remaining);
        messageEl.textContent = `Faltam ${formattedRemaining} para sua meta`;
        messageEl.className = 'goal-message';
      } else {
        messageEl.textContent = 'Você ainda não economizou este mês';
        messageEl.className = 'goal-message warning';
      }
    }
  }

  exportJSON() {
    const data = Storage.exportData();
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.showToast?.('Backup exportado com sucesso!', 'success');
  }

  exportCSV() {
    const transactions = Storage.getTransactions();
    const categories = Storage.getCategories();
    const settings = Storage.getSettings();
    
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
    
    window.showToast?.('CSV exportado com sucesso!', 'success');
  }

  async importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate
      if (!Storage.validateImportData(data)) {
        throw new Error('Arquivo inválido ou corrompido');
      }
      
      // Confirm
      const txCount = data.transactions?.length || 0;
      if (!confirm(`Importar ${txCount} transações? Isso substituirá todos os dados atuais.`)) {
        event.target.value = '';
        return;
      }
      
      // Import
      const success = Storage.importData(data);
      
      if (success) {
        window.showToast?.('Dados importados com sucesso!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error('Erro ao salvar dados');
      }
      
    } catch (error) {
      window.showToast?.('Erro ao importar: ' + error.message, 'error');
      console.error(error);
    }
    
    event.target.value = '';
  }

  clearAll() {
    if (!confirm('TEM CERTEZA? Todos os dados serão permanentemente excluídos!')) return;
    if (!confirm('Última chance. Clique OK para apagar tudo.')) return;
    
    Storage.clearAll();
    window.showToast?.('Todos os dados foram apagados', 'success');
    setTimeout(() => window.location.reload(), 1000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dataManager = new DataManager();
});

export default DataManager;
