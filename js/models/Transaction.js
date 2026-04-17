/* ============================================
   TRANSACTION.JS - Transaction Model
   ============================================ */

/**
 * Transaction model class
 * Handles transaction data structure and validation
 */
class Transaction {
  /**
   * Create a Transaction instance
   * @param {Object} data - Transaction data
   */
  constructor(data = {}) {
    this.id = data.id || window.generateId?.() || this._generateId();
    this.type = data.type || 'expense'; // 'income' | 'expense'
    this.amount = this._parseAmount(data.amount);
    this.description = (data.description || '').trim();
    this.categoryId = data.categoryId || '';
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Parse and validate amount
   * @param {number|string} amount - Amount value
   * @returns {number} Parsed amount
   * @private
   */
  _parseAmount(amount) {
    if (typeof amount === 'string') {
      amount = parseFloat(amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
    }
    return Math.abs(parseFloat(amount) || 0);
  }

  /**
   * Generate simple ID if crypto.randomUUID not available
   * @returns {string} Generated ID
   * @private
   */
  _generateId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validate transaction data
   * @returns {Array} Array of error messages (empty if valid)
   */
  validate() {
    const errors = [];
    
    // Type validation
    if (!['income', 'expense'].includes(this.type)) {
      errors.push('Tipo de transação inválido');
    }
    
    // Amount validation
    if (isNaN(this.amount) || this.amount <= 0) {
      errors.push('Valor deve ser maior que zero');
    }
    if (this.amount > 999999999.99) {
      errors.push('Valor muito grande');
    }
    
    // Description validation
    if (!this.description || this.description.length < 2) {
      errors.push('Descrição deve ter pelo menos 2 caracteres');
    }
    if (this.description.length > 100) {
      errors.push('Descrição deve ter no máximo 100 caracteres');
    }
    
    // Category validation
    if (!this.categoryId) {
      errors.push('Categoria é obrigatória');
    }
    
    // Date validation
    const dateObj = new Date(this.date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Data inválida');
    } else {
      // Check if date is not more than 1 year in the future
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (dateObj > maxDate) {
        errors.push('Data não pode ser mais de 1 ano no futuro');
      }
      // Check if date is not too old (optional)
      const minDate = new Date('2000-01-01');
      if (dateObj < minDate) {
        errors.push('Data deve ser a partir de 2000');
      }
    }
    
    return errors;
  }

  /**
   * Check if transaction is valid
   * @returns {boolean} Is valid
   */
  isValid() {
    return this.validate().length === 0;
  }

  /**
   * Format amount as currency
   * @param {string} currency - Currency code
   * @param {string} locale - Locale code
   * @returns {string} Formatted amount
   */
  formatAmount(currency = 'BRL', locale = 'pt-BR') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(this.amount);
  }

  /**
   * Get sign prefix based on type
   * @returns {string} '+' or '-'
   */
  getSign() {
    return this.type === 'income' ? '+' : '-';
  }

  /**
   * Get display class based on type
   * @returns {string} 'income' or 'expense'
   */
  getTypeClass() {
    return this.type;
  }

  /**
   * Convert to plain object for storage
   * @returns {Object} Plain object
   */
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

  /**
   * Create Transaction from form data
   * @param {FormData} formData - Form data
   * @returns {Transaction} New Transaction instance
   */
  static fromFormData(formData) {
    const data = Object.fromEntries(formData);
    return new Transaction(data);
  }

  /**
   * Create Transaction from plain object
   * @param {Object} obj - Plain object
   * @returns {Transaction} New Transaction instance
   */
  static fromObject(obj) {
    return new Transaction(obj);
  }

  /**
   * Get empty transaction template
   * @returns {Object} Template object
   */
  static getTemplate() {
    return {
      id: '',
      type: 'expense',
      amount: '',
      description: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0]
    };
  }
}

// Make globally available
window.Transaction = Transaction;

export default Transaction;
