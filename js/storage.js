/* ============================================
   STORAGE.JS - LocalStorage Management Module
   ============================================ */

/**
 * Storage module for managing LocalStorage operations
 * Provides CRUD operations for transactions, categories, and settings
 */
const Storage = {
  // Storage keys
  KEYS: {
    TRANSACTIONS: 'finance_app_transactions',
    CATEGORIES: 'finance_app_categories',
    SETTINGS: 'finance_app_settings'
  },

  /**
   * Get item from LocalStorage
   * @param {string} key - Storage key
   * @returns {any} Parsed value or null
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set item in LocalStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        window.showToast?.('Armazenamento cheio! Exporte seus dados.', 'error');
      }
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Update item using a callback function
   * @param {string} key - Storage key
   * @param {Function} updaterFn - Function that receives current value and returns new value
   * @returns {boolean} Success status
   */
  update(key, updaterFn) {
    const current = this.get(key);
    const updated = updaterFn(current);
    return this.set(key, updated);
  },

  /**
   * Remove item from LocalStorage
   * @param {string} key - Storage key
   */
  delete(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clear all app data from LocalStorage
   */
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // ===========================================
  // TRANSACTION OPERATIONS
  // ===========================================

  /**
   * Get all transactions
   * @returns {Array} Array of transactions
   */
  getTransactions() {
    return this.get(this.KEYS.TRANSACTIONS) || [];
  },

  /**
   * Save a transaction (create or update)
   * @param {Object} transaction - Transaction object
   * @returns {boolean} Success status
   */
  saveTransaction(transaction) {
    return this.update(this.KEYS.TRANSACTIONS, transactions => {
      transactions = transactions || [];
      const existingIndex = transactions.findIndex(t => t.id === transaction.id);
      
      const now = new Date().toISOString();
      
      if (existingIndex >= 0) {
        // Update existing
        transactions[existingIndex] = {
          ...transaction,
          updatedAt: now
        };
      } else {
        // Create new
        transactions.push({
          ...transaction,
          createdAt: now,
          updatedAt: now
        });
      }
      
      // Sort by date (newest first)
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  },

  /**
   * Delete a transaction by ID
   * @param {string} id - Transaction ID
   * @returns {boolean} Success status
   */
  deleteTransaction(id) {
    return this.update(this.KEYS.TRANSACTIONS, transactions => {
      return (transactions || []).filter(t => t.id !== id);
    });
  },

  /**
   * Get a single transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Object|null} Transaction or null
   */
  getTransactionById(id) {
    const transactions = this.getTransactions();
    return transactions.find(t => t.id === id) || null;
  },

  // ===========================================
  // CATEGORY OPERATIONS
  // ===========================================

  /**
   * Get all categories (or defaults if none)
   * @returns {Array} Array of categories
   */
  getCategories() {
    const stored = this.get(this.KEYS.CATEGORIES);
    if (stored && stored.length > 0) {
      return stored;
    }
    
    // Return default categories
    const defaults = this.getDefaultCategories();
    this.set(this.KEYS.CATEGORIES, defaults);
    return defaults;
  },

  /**
   * Get default categories
   * @returns {Array} Default categories
   */
  getDefaultCategories() {
    return [
      { 
        id: 'food', 
        name: 'Alimentação', 
        type: 'expense', 
        color: '#ef4444', 
        icon: 'utensils', 
        isDefault: true 
      },
      { 
        id: 'transport', 
        name: 'Transporte', 
        type: 'expense', 
        color: '#f97316', 
        icon: 'car', 
        isDefault: true 
      },
      { 
        id: 'housing', 
        name: 'Moradia', 
        type: 'expense', 
        color: '#8b5cf6', 
        icon: 'home', 
        isDefault: true 
      },
      { 
        id: 'entertainment', 
        name: 'Lazer', 
        type: 'expense', 
        color: '#ec4899', 
        icon: 'gamepad-2', 
        isDefault: true 
      },
      { 
        id: 'health', 
        name: 'Saúde', 
        type: 'expense', 
        color: '#14b8a6', 
        icon: 'heart-pulse', 
        isDefault: true 
      },
      { 
        id: 'shopping', 
        name: 'Compras', 
        type: 'expense', 
        color: '#06b6d4', 
        icon: 'shopping-bag', 
        isDefault: true 
      },
      { 
        id: 'education', 
        name: 'Educação', 
        type: 'expense', 
        color: '#6366f1', 
        icon: 'graduation-cap', 
        isDefault: true 
      },
      { 
        id: 'salary', 
        name: 'Salário', 
        type: 'income', 
        color: '#22c55e', 
        icon: 'banknote', 
        isDefault: true 
      },
      { 
        id: 'freelance', 
        name: 'Freelance', 
        type: 'income', 
        color: '#10b981', 
        icon: 'briefcase', 
        isDefault: true 
      },
      { 
        id: 'investment', 
        name: 'Investimentos', 
        type: 'income', 
        color: '#84cc16', 
        icon: 'trending-up', 
        isDefault: true 
      }
    ];
  },

  /**
   * Save a category
   * @param {Object} category - Category object
   * @returns {boolean} Success status
   */
  saveCategory(category) {
    return this.update(this.KEYS.CATEGORIES, categories => {
      categories = categories || [];
      const existingIndex = categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = category;
      } else {
        categories.push(category);
      }
      
      return categories;
    });
  },

  /**
   * Delete a category (only non-default)
   * @param {string} id - Category ID
   * @returns {boolean} Success status
   */
  deleteCategory(id) {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === id);
    
    if (category?.isDefault) {
      console.warn('Cannot delete default category:', id);
      return false;
    }
    
    return this.update(this.KEYS.CATEGORIES, cats => {
      return (cats || []).filter(c => c.id !== id);
    });
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Object|null} Category or null
   */
  getCategoryById(id) {
    const categories = this.getCategories();
    return categories.find(c => c.id === id) || null;
  },

  /**
   * Get categories by type
   * @param {string} type - 'income' or 'expense'
   * @returns {Array} Filtered categories
   */
  getCategoriesByType(type) {
    return this.getCategories().filter(c => 
      c.type === type || c.type === 'both'
    );
  },

  // ===========================================
  // SETTINGS OPERATIONS
  // ===========================================

  /**
   * Get settings with defaults
   * @returns {Object} Settings object
   */
  getSettings() {
    const defaults = {
      currency: 'BRL',
      locale: 'pt-BR',
      theme: 'light',
      monthlyGoal: 0
    };
    
    const stored = this.get(this.KEYS.SETTINGS);
    return { ...defaults, ...stored };
  },

  /**
   * Save settings
   * @param {Object} settings - Settings object
   * @returns {boolean} Success status
   */
  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  },

  /**
   * Update partial settings
   * @param {Object} partialSettings - Partial settings to update
   * @returns {boolean} Success status
   */
  updateSettings(partialSettings) {
    const current = this.getSettings();
    return this.saveSettings({ ...current, ...partialSettings });
  },

  // ===========================================
  // EXPORT/IMPORT
  // ===========================================

  /**
   * Export all data
   * @returns {Object} Complete data object
   */
  exportData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions: this.getTransactions(),
      categories: this.getCategories(),
      settings: this.getSettings()
    };
  },

  /**
   * Import data (replaces all)
   * @param {Object} data - Data object to import
   * @returns {boolean} Success status
   */
  importData(data) {
    try {
      if (data.transactions) {
        this.set(this.KEYS.TRANSACTIONS, data.transactions);
      }
      if (data.categories) {
        this.set(this.KEYS.CATEGORIES, data.categories);
      }
      if (data.settings) {
        this.set(this.KEYS.SETTINGS, data.settings);
      }
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  },

  /**
   * Validate import data structure
   * @param {Object} data - Data to validate
   * @returns {boolean} Is valid
   */
  validateImportData(data) {
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
};

// Make globally available
window.Storage = Storage;

export default Storage;
