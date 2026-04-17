/* ============================================
   CATEGORY.JS - Category Model
   ============================================ */

/**
 * Category model class
 * Handles category data structure and validation
 */
class Category {
  /**
   * Create a Category instance
   * @param {Object} data - Category data
   */
  constructor(data = {}) {
    this.id = data.id || window.generateId?.() || this._generateId();
    this.name = (data.name || '').trim();
    this.type = data.type || 'expense'; // 'income' | 'expense' | 'both'
    this.color = data.color || this._getRandomColor();
    this.icon = data.icon || 'tag';
    this.isDefault = data.isDefault || false;
  }

  /**
   * Generate simple ID
   * @returns {string} Generated ID
   * @private
   */
  _generateId() {
    return 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get a random color from palette
   * @returns {string} Hex color
   * @private
   */
  _getRandomColor() {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Validate category data
   * @returns {Array} Array of error messages (empty if valid)
   */
  validate() {
    const errors = [];
    
    // Name validation
    if (!this.name || this.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    if (this.name.length > 30) {
      errors.push('Nome deve ter no máximo 30 caracteres');
    }
    
    // Type validation
    if (!['income', 'expense', 'both'].includes(this.type)) {
      errors.push('Tipo inválido');
    }
    
    // Color validation (hex format)
    if (!/^#[0-9A-Fa-f]{6}$/.test(this.color)) {
      errors.push('Cor inválida');
    }
    
    // Icon validation (non-empty string)
    if (!this.icon || typeof this.icon !== 'string') {
      errors.push('Ícone inválido');
    }
    
    return errors;
  }

  /**
   * Check if category is valid
   * @returns {boolean} Is valid
   */
  isValid() {
    return this.validate().length === 0;
  }

  /**
   * Get icon SVG for Lucide
   * @returns {string} Icon name
   */
  getIconName() {
    return this.icon;
  }

  /**
   * Get display name with type indicator
   * @returns {string} Display text
   */
  getDisplayName() {
    const typeLabels = {
      income: '(R)',
      expense: '(D)',
      both: '(R/D)'
    };
    return `${this.name} ${typeLabels[this.type] || ''}`;
  }

  /**
   * Check if category can be deleted
   * @returns {boolean} Can delete
   */
  canDelete() {
    return !this.isDefault;
  }

  /**
   * Convert to plain object for storage
   * @returns {Object} Plain object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      icon: this.icon,
      isDefault: this.isDefault
    };
  }

  /**
   * Create Category from plain object
   * @param {Object} obj - Plain object
   * @returns {Category} New Category instance
   */
  static fromObject(obj) {
    return new Category(obj);
  }

  /**
   * Get available icons list
   * @returns {Array} Array of icon names
   */
  static getAvailableIcons() {
    return [
      'tag', 'wallet', 'credit-card', 'banknote', 'coins',
      'shopping-bag', 'shopping-cart', 'store', 'utensils', 'coffee',
      'car', 'bus', 'train', 'plane', 'fuel',
      'home', 'building', 'bed', 'sofa', 'lamp',
      'gamepad-2', 'film', 'music', 'tv', 'smartphone',
      'heart-pulse', 'pill', 'stethoscope', 'activity',
      'graduation-cap', 'book', 'pen', 'notebook',
      'briefcase', 'trending-up', 'pie-chart', 'dollar-sign',
      'gift', 'party-popper', 'plane', 'luggage',
      'wrench', 'hammer', 'scissors',
      'paw-print', 'baby', 'heart', 'users',
      'wifi', 'phone', 'smartphone', 'monitor'
    ];
  }

  /**
   * Get available colors
   * @returns {Array} Array of color objects
   */
  static getAvailableColors() {
    return [
      { name: 'Vermelho', value: '#ef4444' },
      { name: 'Laranja', value: '#f97316' },
      { name: 'Âmbar', value: '#f59e0b' },
      { name: 'Amarelo', value: '#eab308' },
      { name: 'Lima', value: '#84cc16' },
      { name: 'Verde', value: '#22c55e' },
      { name: 'Esmeralda', value: '#10b981' },
      { name: 'Turquesa', value: '#14b8a6' },
      { name: 'Ciano', value: '#06b6d4' },
      { name: 'Azul Claro', value: '#0ea5e9' },
      { name: 'Azul', value: '#3b82f6' },
      { name: 'Índigo', value: '#6366f1' },
      { name: 'Violeta', value: '#8b5cf6' },
      { name: 'Roxo', value: '#a855f7' },
      { name: 'Magenta', value: '#d946ef' },
      { name: 'Rosa', value: '#ec4899' },
      { name: 'Rosa Claro', value: '#f43f5e' },
      { name: 'Cinza', value: '#64748b' }
    ];
  }
}

// Make globally available
window.Category = Category;

export default Category;
