/**
 * Button Component
 * Reusable button with variants, sizes, states, and ripple effect
 * 
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 * States: default, hover, active, disabled, loading
 * 
 * @see design.md for button specifications
 */

import { popAnimation, conditionalAnimation, Duration } from '../../utils/animations.js';

/**
 * Button UI Component
 */
export class Button {
  /**
   * @param {Object} options
   * @param {string} options.text - Button text
   * @param {'primary'|'secondary'|'ghost'|'danger'} options.variant - Button style variant
   * @param {'sm'|'md'|'lg'} options.size - Button size
   * @param {string} options.icon - SVG icon HTML (optional)
   * @param {string} options.ariaLabel - Accessible label (required if no text)
   * @param {Function} options.onClick - Click handler
   * @param {boolean} options.disabled - Disabled state
   * @param {boolean} options.loading - Loading state
   * @param {boolean} options.fullWidth - Full width button
   * @param {string} options.type - Button type (button, submit, reset)
   */
  constructor(options = {}) {
    this.options = {
      text: '',
      variant: 'primary',
      size: 'md',
      icon: null,
      ariaLabel: null,
      onClick: null,
      disabled: false,
      loading: false,
      fullWidth: false,
      type: 'button',
      ...options
    };

    this.element = null;
    this.isPressed = false;
  }

  /**
   * Get variant-specific CSS classes
   * @private
   */
  _getVariantClasses() {
    const { variant } = this.options;
    const baseClass = 'button';
    return `${baseClass} ${baseClass}--${variant}`;
  }

  /**
   * Get size-specific CSS classes
   * @private
   */
  _getSizeClass() {
    const { size } = this.options;
    return `button--${size}`;
  }

  /**
   * Get loading spinner SVG
   * @private
   */
  _getSpinner() {
    return `<svg class="button__spinner" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31.416" stroke-dashoffset="31.416" stroke-linecap="round">
        <animate attributeName="stroke-dashoffset" values="31.416;0;31.416" dur="1.5s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>`;
  }

  /**
   * Create ripple effect on click
   * @param {MouseEvent} event
   * @private
   */
  _createRipple(event) {
    const button = this.element;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'button__ripple';
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.3;
      transform: scale(0);
      animation: button-ripple 400ms cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    `;

    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 400);
  }

  /**
   * Handle click events
   * @param {MouseEvent} event
   * @private
   */
  _handleClick(event) {
    if (this.options.disabled || this.options.loading) {
      event.preventDefault();
      return;
    }

    // Create ripple effect
    this._createRipple(event);

    // Scale animation
    conditionalAnimation(popAnimation, this.element, 0.98, Duration.INSTANT);

    // Call external handler
    if (this.options.onClick) {
      this.options.onClick(event);
    }
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.element.click();
    }
  }

  /**
   * Render the button
   * @returns {HTMLButtonElement}
   */
  render() {
    this.element = document.createElement('button');
    this.element.type = this.options.type;
    this.element.className = `${this._getVariantClasses()} ${this._getSizeClass()}`;
    
    if (this.options.fullWidth) {
      this.element.classList.add('button--full-width');
    }

    // Set states
    if (this.options.disabled) {
      this.element.disabled = true;
      this.element.setAttribute('aria-disabled', 'true');
    }

    if (this.options.loading) {
      this.element.disabled = true;
      this.element.setAttribute('aria-busy', 'true');
      this.element.classList.add('button--loading');
    }

    // Accessibility
    if (this.options.ariaLabel) {
      this.element.setAttribute('aria-label', this.options.ariaLabel);
    }

    // Content
    let content = '';
    
    if (this.options.loading) {
      content += this._getSpinner();
    }
    
    if (this.options.icon && !this.options.loading) {
      content += `<span class="button__icon" aria-hidden="true">${this.options.icon}</span>`;
    }
    
    if (this.options.text) {
      content += `<span class="button__text">${this.options.text}</span>`;
    }

    this.element.innerHTML = content;

    // Event listeners
    this.element.addEventListener('click', (e) => this._handleClick(e));
    this.element.addEventListener('keydown', (e) => this._handleKeyDown(e));

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Update button state
   * @param {Object} updates
   */
  update(updates) {
    this.options = { ...this.options, ...updates };
    
    // Re-render
    const newElement = this.render();
    if (this.element.parentNode) {
      this.element.parentNode.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  /**
   * Set loading state
   * @param {boolean} loading
   */
  setLoading(loading) {
    this.update({ loading });
  }

  /**
   * Set disabled state
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this.update({ disabled });
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'button-component-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Button Base */
      .button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        padding: var(--spacing-3) var(--spacing-4);
        border: 2px solid transparent;
        border-radius: var(--radius-lg);
        font-family: var(--font-family);
        font-weight: var(--font-weight-semibold);
        text-align: center;
        text-decoration: none;
        cursor: pointer;
        overflow: hidden;
        transition: all 150ms var(--ease-default);
        user-select: none;
        touch-action: manipulation;
        min-height: 44px;
        min-width: 44px;
      }

      .button:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: var(--focus-ring-offset);
      }

      /* Button Sizes */
      .button--sm {
        padding: var(--spacing-1) var(--spacing-3);
        font-size: var(--font-size-sm);
        min-height: 36px;
      }

      .button--md {
        padding: var(--spacing-2) var(--spacing-4);
        font-size: var(--font-size-base);
      }

      .button--lg {
        padding: var(--spacing-3) var(--spacing-6);
        font-size: var(--font-size-lg);
      }

      /* Button Variants */
      .button--primary {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
        color: var(--color-text-inverse);
        box-shadow: var(--shadow-primary-md);
      }

      .button--primary:hover:not(:disabled) {
        transform: scale(1.02);
        box-shadow: var(--shadow-primary-lg);
      }

      .button--primary:active:not(:disabled) {
        transform: scale(0.98);
        box-shadow: var(--shadow-primary-sm);
      }

      .button--secondary {
        background-color: var(--color-surface);
        color: var(--color-primary);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-sm);
      }

      .button--secondary:hover:not(:disabled) {
        background-color: var(--color-primary-50);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .button--secondary:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: var(--shadow-sm);
      }

      .button--ghost {
        background-color: transparent;
        color: var(--color-text-secondary);
        border-color: var(--color-border);
      }

      .button--ghost:hover:not(:disabled) {
        background-color: var(--color-surface);
        color: var(--color-text-primary);
        border-color: var(--color-border);
      }

      .button--danger {
        background-color: var(--color-error);
        color: var(--color-text-inverse);
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
      }

      .button--danger:hover:not(:disabled) {
        background-color: #dc2626;
        transform: scale(1.02);
      }

      .button--danger:active:not(:disabled) {
        transform: scale(0.98);
      }

      /* Disabled State */
      .button:disabled,
      .button--loading {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }

      /* Loading State */
      .button--loading .button__text {
        opacity: 0.7;
      }

      .button__spinner {
        flex-shrink: 0;
        animation: none;
      }

      /* Full Width */
      .button--full-width {
        width: 100%;
      }

      /* Icon */
      .button__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* Ripple Animation Keyframes */
      @keyframes button-ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .button {
          transition: none;
        }
        
        .button:hover:not(:disabled) {
          transform: none;
        }
        
        .button__ripple {
          display: none;
        }
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

export default Button;
