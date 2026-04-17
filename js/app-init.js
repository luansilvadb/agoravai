/* ============================================
   APP-INIT.JS - Application Initialization
   ============================================ */

import Storage from './storage.js';

/**
 * AppInitializer - Ensures all app components are properly initialized
 */
class AppInitializer {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Finanças Pessoais...');
    
    // Initialize storage with defaults if empty
    this.initializeStorage();
    
    // Initialize theme
    this.initializeTheme();
    
    // Initialize event listeners
    this.initializeEventListeners();
    
    // Mark as initialized
    this.initialized = true;
    
    console.log('✅ Application ready!');
  }

  initializeStorage() {
    // Ensure categories exist
    const categories = Storage.getCategories();
    if (categories.length === 0) {
      console.log('📝 Loading default categories...');
      Storage.getCategories(); // This will set defaults
    }
    
    // Ensure settings exist
    const settings = Storage.getSettings();
    if (!settings.currency) {
      console.log('⚙️ Loading default settings...');
      Storage.saveSettings(settings);
    }
    
    console.log(`📊 ${Storage.getTransactions().length} transactions loaded`);
    console.log(`🏷️ ${categories.length} categories loaded`);
  }

  initializeTheme() {
    const settings = Storage.getSettings();
    const savedTheme = localStorage.getItem('finance_app_theme');
    
    // Apply theme
    const theme = savedTheme || settings.theme || 'light';
    this.applyTheme(theme);
    
    // Update theme toggle buttons
    this.updateThemeButtons(theme);
    
    console.log(`🎨 Theme: ${theme}`);
  }

  applyTheme(theme) {
    let effectiveTheme = theme;
    
    if (theme === 'auto') {
      effectiveTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    
    // Dispatch theme changed event
    window.dispatchEvent(new CustomEvent('themeChanged'));
  }

  updateThemeButtons(activeTheme) {
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === activeTheme);
    });
  }

  initializeEventListeners() {
    // Theme toggle buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.applyTheme(theme);
        localStorage.setItem('finance_app_theme', theme);
        this.updateThemeButtons(theme);
      });
    });

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem('finance_app_theme');
        if (!savedTheme || savedTheme === 'auto') {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // Add transaction button
    document.getElementById('btn-add-transaction')?.addEventListener('click', () => {
      window.location.hash = 'transactions';
      // Focus on form
      setTimeout(() => {
        document.querySelector('#transactions .input')?.focus();
      }, 100);
    });

    // Add category button
    document.getElementById('btn-add-category')?.addEventListener('click', () => {
      window.showToast?.('Funcionalidade em desenvolvimento', 'info');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('transaction-search');
        if (searchInput) {
          window.location.hash = 'transactions';
          setTimeout(() => searchInput.focus(), 100);
        }
      }
      
      // Escape to close/clear
      if (e.key === 'Escape') {
        const clearBtn = document.getElementById('clear-search');
        if (clearBtn && !clearBtn.hidden) {
          clearBtn.click();
        }
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.appInitializer = new AppInitializer();
});

export default AppInitializer;
