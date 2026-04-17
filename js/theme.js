/**
 * Theme Management System
 * Handles theme loading, saving, toggling, and system preference detection
 * for the Premium POS UI
 * 
 * Supports: light, dark, high-contrast themes
 * 
 * @see design.md for theme specifications
 */

/** @typedef {'light'|'dark'|'high-contrast'} Theme */

/** @type {Theme} */
const DEFAULT_THEME = 'light';

/** @type {string} */
const STORAGE_KEY = 'pos-theme';

/** @type {Theme[]} */
const VALID_THEMES = ['light', 'dark', 'high-contrast'];

/**
 * Get current theme from localStorage or default
 * @returns {Theme}
 */
export function getCurrentTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && VALID_THEMES.includes(stored)) {
    return /** @type {Theme} */ (stored);
  }
  return DEFAULT_THEME;
}

/**
 * Save theme to localStorage
 * @param {Theme} theme
 */
export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Apply theme to document
 * @param {Theme} theme
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
  
  // Add new theme class
  root.classList.add(`theme-${theme}`);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const colors = {
      'light': '#fafafa',
      'dark': '#1f2937',
      'high-contrast': '#000000'
    };
    metaThemeColor.setAttribute('content', colors[theme]);
  }
  
  // Dispatch theme change event
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

/**
 * Set theme (save and apply)
 * @param {Theme} theme
 */
export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) {
    console.warn(`Invalid theme: ${theme}. Using default.`);
    theme = DEFAULT_THEME;
  }
  
  saveTheme(theme);
  applyTheme(theme);
}

/**
 * Toggle between light and dark themes
 * High-contrast is preserved when toggling
 */
export function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}

/**
 * Cycle through all available themes
 */
export function cycleTheme() {
  const current = getCurrentTheme();
  const currentIndex = VALID_THEMES.indexOf(current);
  const nextIndex = (currentIndex + 1) % VALID_THEMES.length;
  setTheme(VALID_THEMES[nextIndex]);
}

/**
 * Detect system color scheme preference
 * @returns {Theme}
 */
export function detectSystemTheme() {
  if (window.matchMedia('(prefers-contrast: more)').matches) {
    return 'high-contrast';
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * Initialize theme on page load
 * Uses saved theme, or detects system preference, or falls back to default
 * @param {Object} options
 * @param {boolean} options.detectSystem - Whether to detect system preference if no saved theme
 */
export function initTheme(options = {}) {
  const { detectSystem = true } = options;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored && VALID_THEMES.includes(stored)) {
    applyTheme(/** @type {Theme} */ (stored));
  } else if (detectSystem) {
    const systemTheme = detectSystemTheme();
    applyTheme(systemTheme);
    saveTheme(systemTheme);
  } else {
    applyTheme(DEFAULT_THEME);
    saveTheme(DEFAULT_THEME);
  }
  
  // Listen for system theme changes
  setupSystemThemeListener();
}

/**
 * Setup listener for system theme changes
 */
function setupSystemThemeListener() {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
  
  const handleChange = () => {
    // Only auto-switch if user hasn't manually set a preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const systemTheme = detectSystemTheme();
      applyTheme(systemTheme);
    }
  };
  
  darkModeQuery.addEventListener('change', handleChange);
  highContrastQuery.addEventListener('change', handleChange);
}

/**
 * Theme manager class for more complex use cases
 */
export class ThemeManager {
  constructor() {
    this.currentTheme = getCurrentTheme();
    this.listeners = [];
    
    // Listen for theme changes
    window.addEventListener('themechange', (e) => {
      this.currentTheme = e.detail.theme;
      this.notifyListeners();
    });
  }

  /**
   * Get current theme
   * @returns {Theme}
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Set theme
   * @param {Theme} theme
   */
  setTheme(theme) {
    setTheme(theme);
  }

  /**
   * Toggle light/dark
   */
  toggle() {
    toggleTheme();
  }

  /**
   * Subscribe to theme changes
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   * @private
   */
  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentTheme));
  }

  /**
   * Get theme label for display
   * @param {Theme} theme
   * @returns {string}
   */
  getThemeLabel(theme = this.currentTheme) {
    const labels = {
      'light': 'Claro',
      'dark': 'Escuro',
      'high-contrast': 'Alto Contraste'
    };
    return labels[theme] || theme;
  }

  /**
   * Get all available themes with labels
   * @returns {Array<{value: Theme, label: string}>}
   */
  getAvailableThemes() {
    return VALID_THEMES.map(theme => ({
      value: theme,
      label: this.getThemeLabel(theme)
    }));
  }
}

/**
 * Create and inject theme styles for dynamic theme switching
 * Injects CSS for smooth theme transitions
 */
export function injectThemeStyles() {
  const styleId = 'theme-transition-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    :root,
    :root.theme-light,
    :root.theme-dark,
    :root.theme-high-contrast {
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
                  color 300ms cubic-bezier(0.4, 0, 0.2, 1),
                  border-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Disable transitions for users who prefer reduced motion */
    @media (prefers-reduced-motion: reduce) {
      :root,
      :root.theme-light,
      :root.theme-dark,
      :root.theme-high-contrast {
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Auto-initialize on module load if in browser
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectThemeStyles();
      initTheme();
    });
  } else {
    injectThemeStyles();
    initTheme();
  }
}
