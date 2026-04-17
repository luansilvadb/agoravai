/* ============================================
   APP.JS - Main Application Entry Point
   ============================================ */

// Initialize Lucide icons when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Initialize navigation
  initNavigation();
  
  // Initialize theme
  initTheme();
  
  // Set today's date as default in date inputs
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    if (!input.value) {
      input.value = today;
    }
  });
  
  console.log('💰 Finanças Pessoais - App initialized');
});

/* ============================================
   NAVIGATION - SPA-like section switching
   ============================================ */

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  
  // Handle navigation clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.dataset.section;
      showSection(targetSection);
      updateActiveNav(link);
      
      // Update URL hash without scrolling
      history.pushState(null, null, `#${targetSection}`);
    });
  });
  
  // Handle initial load and hash changes
  const handleHash = () => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    showSection(hash);
    
    const activeLink = document.querySelector(`.nav-link[data-section="${hash}"]`);
    if (activeLink) {
      updateActiveNav(activeLink);
    }
  };
  
  // Initial load
  handleHash();
  
  // Hash change (back/forward buttons)
  window.addEventListener('hashchange', handleHash);
}

function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  
  sections.forEach(section => {
    section.classList.remove('section--active');
    if (section.id === sectionId) {
      section.classList.add('section--active');
    }
  });
}

function updateActiveNav(activeLink) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}

/* ============================================
   THEME MANAGEMENT
   ============================================ */

function initTheme() {
  const savedTheme = localStorage.getItem('finance_app_theme') || 'light';
  applyTheme(savedTheme);
  
  // Theme toggle buttons
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      applyTheme(theme);
      saveTheme(theme);
      updateThemeButtons(theme);
    });
  });
  
  // Listen for system preference changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const currentTheme = localStorage.getItem('finance_app_theme');
      if (!currentTheme || currentTheme === 'auto') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

function applyTheme(theme) {
  let effectiveTheme = theme;
  
  if (theme === 'auto') {
    effectiveTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', effectiveTheme);
}

function saveTheme(theme) {
  localStorage.setItem('finance_app_theme', theme);
}

function updateThemeButtons(activeTheme) {
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === activeTheme);
  });
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// DOM helpers
window.$ = (selector) => document.querySelector(selector);
window.$$ = (selector) => document.querySelectorAll(selector);

// Format currency
window.formatCurrency = (value, currency = 'BRL', locale = 'pt-BR') => {
  if (typeof value !== 'number' || isNaN(value)) {
    value = 0;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
};

// Format date
window.formatDate = (dateString, locale = 'pt-BR') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Format date short (month only)
window.formatDateShort = (dateString, locale = 'pt-BR') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short'
  }).format(date);
};

// Parse currency string to number
window.parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
};

// Debounce function
window.debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Throttle function
window.throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Generate UUID
window.generateId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Show toast notification
window.showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
};

/* ============================================
   PERIOD FILTERS
   ============================================ */

// Initialize period filter buttons
document.addEventListener('DOMContentLoaded', () => {
  const periodButtons = document.querySelectorAll('[data-period]');
  
  periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      periodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Dispatch custom event
      const period = btn.dataset.period;
      window.dispatchEvent(new CustomEvent('periodChanged', { detail: { period } }));
    });
  });
});
