/* ============================================
   CATEGORIES.JS - Category Management UI
   ============================================ */

import Storage from './storage.js';
import Category from './models/Category.js';

/**
 * CategoriesManager class
 * Handles category display and management
 */
class CategoriesManager {
  constructor() {
    this.container = document.getElementById('categories-list');
    this.init();
  }

  init() {
    if (!this.container) return;
    
    this.render();
    
    // Re-render when categories might have changed
    window.addEventListener('focus', () => {
      this.render();
    });
  }

  render() {
    const categories = Storage.getCategories();
    
    if (categories.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="tags"></i>
          <p>Nenhuma categoria cadastrada</p>
        </div>
      `;
      return;
    }

    // Group by type
    const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
    const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');

    this.container.innerHTML = `
      ${this.renderCategoryGroup('Despesas', expenseCategories)}
      ${this.renderCategoryGroup('Receitas', incomeCategories)}
    `;

    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderCategoryGroup(title, categories) {
    if (categories.length === 0) return '';

    return `
      <div class="category-group">
        <h4>${title}</h4>
        <div class="categories-grid">
          ${categories.map(cat => `
            <div class="category-card" data-id="${cat.id}">
              <div class="category-icon" style="background-color: ${cat.color}">
                <i data-lucide="${cat.icon}"></i>
              </div>
              <div class="category-info">
                <div class="category-name">${cat.name}</div>
                <div class="category-type">${cat.isDefault ? 'Padrão' : 'Personalizada'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.categoriesManager = new CategoriesManager();
});

export default CategoriesManager;
