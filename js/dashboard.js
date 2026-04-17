/* ============================================
   DASHBOARD.JS - Dashboard & Summary Cards
   ============================================ */

import Storage from './storage.js';

/**
 * DashboardManager class
 * Handles dashboard data calculations and UI updates
 */
class DashboardManager {
  constructor() {
    this.periodFilter = 'month';
    this.elements = {};
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.update();
  }

  cacheElements() {
    this.elements = {
      balance: document.getElementById('total-balance'),
      income: document.getElementById('month-income'),
      expense: document.getElementById('month-expense'),
      incomeDelta: document.getElementById('income-delta'),
      expenseDelta: document.getElementById('expense-delta'),
      goalProgress: document.getElementById('goal-progress'),
      goalBar: document.getElementById('goal-bar'),
      recentList: document.getElementById('recent-transactions')
    };
  }

  bindEvents() {
    // Period filter buttons
    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.periodFilter = e.target.dataset.period;
        this.update();
      });
    });

    // Listen for transaction changes
    window.addEventListener('transactionChanged', () => this.update());
  }

  update() {
    const transactions = this.getFilteredTransactions();
    const calculations = this.calculate(transactions);
    
    this.render(calculations);
    this.renderRecentTransactions();
  }

  getFilteredTransactions() {
    const all = Storage.getTransactions();
    const now = new Date();
    
    return all.filter(t => {
      const tDate = new Date(t.date);
      
      switch (this.periodFilter) {
        case 'today':
          return tDate.toDateString() === now.toDateString();
        
        case 'week':
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
          return tDate >= weekAgo;
        
        case 'month':
          return tDate.getMonth() === now.getMonth() && 
                 tDate.getFullYear() === now.getFullYear();
        
        case 'year':
          return tDate.getFullYear() === now.getFullYear();
        
        default:
          return true;
      }
    });
  }

  calculate(transactions) {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    // Calculate previous period for comparison
    const prevCalculations = this.calculatePreviousPeriod();
    const incomeDelta = prevCalculations.income > 0 
      ? ((income - prevCalculations.income) / prevCalculations.income * 100).toFixed(1)
      : 0;
    const expenseDelta = prevCalculations.expense > 0
      ? ((expense - prevCalculations.expense) / prevCalculations.expense * 100).toFixed(1)
      : 0;
    
    // Goal progress
    const settings = Storage.getSettings();
    const goalPercent = settings.monthlyGoal > 0
      ? Math.min(100, Math.max(0, (income - expense) / settings.monthlyGoal * 100))
      : 0;
    
    return { income, expense, balance, incomeDelta, expenseDelta, goalPercent };
  }

  calculatePreviousPeriod() {
    const all = Storage.getTransactions();
    const now = new Date();
    let prevTransactions = [];
    
    switch (this.periodFilter) {
      case 'today':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        prevTransactions = all.filter(t => new Date(t.date).toDateString() === yesterday.toDateString());
        break;
      
      case 'week':
        const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        prevTransactions = all.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= twoWeeksAgo && tDate < oneWeekAgo;
        });
        break;
      
      case 'month':
        prevTransactions = all.filter(t => {
          const tDate = new Date(t.date);
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return tDate.getMonth() === prevMonth && tDate.getFullYear() === prevYear;
        });
        break;
      
      case 'year':
        prevTransactions = all.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === now.getFullYear() - 1;
        });
        break;
    }
    
    const income = prevTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = prevTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense };
  }

  render({ income, expense, balance, incomeDelta, expenseDelta, goalPercent }) {
    const settings = Storage.getSettings();
    const formatter = new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency
    });
    
    // Animate values
    this.animateValue(this.elements.balance, balance, formatter);
    this.animateValue(this.elements.income, income, formatter);
    this.animateValue(this.elements.expense, expense, formatter);
    
    // Deltas
    if (this.elements.incomeDelta) {
      const delta = parseFloat(incomeDelta);
      this.elements.incomeDelta.textContent = delta > 0 ? `+${delta}%` : `${delta}%`;
      this.elements.incomeDelta.className = `card-delta ${delta >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (this.elements.expenseDelta) {
      const delta = parseFloat(expenseDelta);
      this.elements.expenseDelta.textContent = delta > 0 ? `+${delta}%` : `${delta}%`;
      this.elements.expenseDelta.className = `card-delta ${delta <= 0 ? 'positive' : 'negative'}`;
    }
    
    // Goal
    if (this.elements.goalProgress) {
      this.elements.goalProgress.textContent = `${Math.round(goalPercent)}%`;
    }
    if (this.elements.goalBar) {
      this.elements.goalBar.style.width = `${goalPercent}%`;
      this.elements.goalBar.className = 'progress-bar__fill';
      if (goalPercent >= 100) this.elements.goalBar.classList.add('success');
    }
  }

  animateValue(element, target, formatter) {
    if (!element) return;
    
    const current = parseFloat(element.dataset.value) || 0;
    const duration = 500;
    const start = performance.now();
    
    element.dataset.value = target;
    
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const value = current + (target - current) * easeOut;
      element.textContent = formatter.format(value);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  renderRecentTransactions() {
    if (!this.elements.recentList) return;
    
    const transactions = Storage.getTransactions().slice(0, 5);
    const categories = Storage.getCategories();
    const settings = Storage.getSettings();
    
    if (transactions.length === 0) {
      this.elements.recentList.innerHTML = `
        <div class="empty-state">
          <i data-lucide="inbox"></i>
          <p>Nenhuma transação ainda</p>
        </div>
      `;
    } else {
      const formatter = new Intl.NumberFormat(settings.locale, {
        style: 'currency',
        currency: settings.currency
      });
      
      this.elements.recentList.innerHTML = transactions.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        
        return `
          <div class="transaction-item" data-id="${t.id}">
            <div class="transaction-icon" style="background-color: ${category?.color || '#94a3b8'}">
              <i data-lucide="${category?.icon || 'help-circle'}"></i>
            </div>
            <div class="transaction-info">
              <div class="transaction-description">${t.description}</div>
              <div class="transaction-meta">
                ${category?.name || 'Sem categoria'} • ${window.formatDate?.(t.date) || t.date}
              </div>
            </div>
            <div class="transaction-amount ${t.type}">
              ${t.type === 'income' ? '+' : '-'} ${formatter.format(t.amount)}
            </div>
          </div>
        `;
      }).join('');
    }
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardManager = new DashboardManager();
});

export default DashboardManager;
