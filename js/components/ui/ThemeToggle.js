/**
 * ThemeToggle Component
 * Dropdown button for switching between light, dark, and high-contrast themes
 * 
 * @see design.md for theme specifications
 */

import { ThemeManager } from '../../theme.js';
import { announce } from '../../utils/accessibility.js';

/**
 * ThemeToggle UI Component
 * Provides a dropdown interface for theme selection
 */
export class ThemeToggle {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Container element to render into (optional)
   * @param {Function} options.onChange - Callback when theme changes
   */
  constructor(options = {}) {
    this.container = options.container;
    this.onChange = options.onChange;
    this.themeManager = new ThemeManager();
    this.isOpen = false;
    
    this.element = null;
    this.dropdown = null;
    this.button = null;
  }

  /**
   * Get icon for theme
   * @param {string} theme
   * @returns {string} SVG icon HTML
   * @private
   */
  _getThemeIcon(theme) {
    const icons = {
      light: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>`,
      dark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`,
      'high-contrast': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20" fill="currentColor" fill-opacity="0.3"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>`
    };
    return icons[theme] || icons.light;
  }

  /**
   * Get accessible label for theme
   * @param {string} theme
   * @returns {string}
   * @private
   */
  _getThemeLabel(theme) {
    return this.themeManager.getThemeLabel(theme);
  }

  /**
   * Render the component
   * @returns {HTMLElement}
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = 'theme-toggle';
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-label', 'Seletor de tema');

    const currentTheme = this.themeManager.getTheme();

    // Create toggle button
    this.button = document.createElement('button');
    this.button.className = 'theme-toggle__button';
    this.button.type = 'button';
    this.button.setAttribute('aria-haspopup', 'listbox');
    this.button.setAttribute('aria-expanded', 'false');
    this.button.setAttribute('aria-label', `Tema atual: ${this._getThemeLabel(currentTheme)}. Clique para alterar`);
    this.button.innerHTML = `
      <span class="theme-toggle__icon">${this._getThemeIcon(currentTheme)}</span>
      <span class="theme-toggle__label">${this._getThemeLabel(currentTheme)}</span>
      <svg class="theme-toggle__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;

    // Create dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'theme-toggle__dropdown';
    this.dropdown.setAttribute('role', 'listbox');
    this.dropdown.setAttribute('aria-label', 'Temas disponíveis');
    this.dropdown.style.display = 'none';

    const themes = this.themeManager.getAvailableThemes();
    themes.forEach(({ value, label }) => {
      const option = document.createElement('button');
      option.className = `theme-toggle__option ${value === currentTheme ? 'is-active' : ''}`;
      option.type = 'button';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', value === currentTheme ? 'true' : 'false');
      option.setAttribute('data-theme', value);
      option.innerHTML = `
        <span class="theme-toggle__option-icon">${this._getThemeIcon(value)}</span>
        <span class="theme-toggle__option-label">${label}</span>
      `;
      
      option.addEventListener('click', () => this._selectTheme(value));
      this.dropdown.appendChild(option);
    });

    // Event listeners
    this.button.addEventListener('click', () => this._toggleDropdown());
    document.addEventListener('click', (e) => this._handleClickOutside(e));
    document.addEventListener('keydown', (e) => this._handleKeyDown(e));

    // Subscribe to theme changes
    this.themeManager.subscribe((theme) => {
      this._updateUI(theme);
    });

    this.element.appendChild(this.button);
    this.element.appendChild(this.dropdown);

    // Inject styles
    this._injectStyles();

    if (this.container) {
      this.container.appendChild(this.element);
    }

    return this.element;
  }

  /**
   * Toggle dropdown visibility
   * @private
   */
  _toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.dropdown.style.display = this.isOpen ? 'block' : 'none';
    this.button.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
    
    if (this.isOpen) {
      // Focus first option
      const firstOption = this.dropdown.querySelector('.theme-toggle__option');
      if (firstOption) firstOption.focus();
    }
  }

  /**
   * Close dropdown
   * @private
   */
  _closeDropdown() {
    this.isOpen = false;
    this.dropdown.style.display = 'none';
    this.button.setAttribute('aria-expanded', 'false');
  }

  /**
   * Handle click outside to close dropdown
   * @param {MouseEvent} event
   * @private
   */
  _handleClickOutside(event) {
    if (this.isOpen && !this.element.contains(event.target)) {
      this._closeDropdown();
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeyDown(event) {
    if (!this.isOpen) return;

    const options = Array.from(this.dropdown.querySelectorAll('.theme-toggle__option'));
    const currentIndex = options.findIndex(opt => opt === document.activeElement);

    switch (event.key) {
      case 'Escape':
        this._closeDropdown();
        this.button.focus();
        event.preventDefault();
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex]?.focus();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex]?.focus();
        break;
      
      case 'Home':
        event.preventDefault();
        options[0]?.focus();
        break;
      
      case 'End':
        event.preventDefault();
        options[options.length - 1]?.focus();
        break;
    }
  }

  /**
   * Select a theme
   * @param {string} theme
   * @private
   */
  _selectTheme(theme) {
    this.themeManager.setTheme(theme);
    this._closeDropdown();
    this.button.focus();
    
    // Announce to screen readers
    announce(`Tema alterado para ${this._getThemeLabel(theme)}`, 'polite');
    
    if (this.onChange) {
      this.onChange(theme);
    }
  }

  /**
   * Update UI when theme changes
   * @param {string} theme
   * @private
   */
  _updateUI(theme) {
    // Update button
    this.button.querySelector('.theme-toggle__icon').innerHTML = this._getThemeIcon(theme);
    this.button.querySelector('.theme-toggle__label').textContent = this._getThemeLabel(theme);
    this.button.setAttribute('aria-label', `Tema atual: ${this._getThemeLabel(theme)}. Clique para alterar`);

    // Update options
    this.dropdown.querySelectorAll('.theme-toggle__option').forEach(option => {
      const optionTheme = option.getAttribute('data-theme');
      const isSelected = optionTheme === theme;
      option.classList.toggle('is-active', isSelected);
      option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'theme-toggle-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .theme-toggle {
        position: relative;
        display: inline-block;
      }

      .theme-toggle__button {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        color: var(--color-text-primary);
        font-family: var(--font-family);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all 150ms var(--ease-default);
        min-height: 44px;
      }

      .theme-toggle__button:hover {
        background-color: var(--color-surface-elevated);
        border-color: var(--color-primary);
      }

      .theme-toggle__button:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: var(--focus-ring-offset);
      }

      .theme-toggle__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-primary);
      }

      .theme-toggle__chevron {
        margin-left: var(--spacing-1);
        transition: transform 150ms var(--ease-default);
      }

      .theme-toggle__button[aria-expanded="true"] .theme-toggle__chevron {
        transform: rotate(180deg);
      }

      .theme-toggle__dropdown {
        position: absolute;
        top: calc(100% + var(--spacing-1));
        right: 0;
        min-width: 200px;
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: var(--spacing-2);
        z-index: var(--z-dropdown);
      }

      .theme-toggle__option {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        width: 100%;
        padding: var(--spacing-2) var(--spacing-3);
        background: none;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        font-family: var(--font-family);
        font-size: var(--font-size-sm);
        text-align: left;
        cursor: pointer;
        transition: all 150ms var(--ease-default);
        min-height: 44px;
      }

      .theme-toggle__option:hover {
        background-color: var(--color-surface-elevated);
      }

      .theme-toggle__option:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: 0;
      }

      .theme-toggle__option.is-active {
        background-color: var(--color-primary-50);
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      .theme-toggle__option-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default ThemeToggle;
