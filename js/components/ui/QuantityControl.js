/**
 * QuantityControl Component
 * Input with +/- buttons for quantity selection
 * 
 * Features: 44x44px touch targets, number animation, min/max limits
 * 
 * @see design.md for quantity control specifications
 */

import { Button } from './Button.js';
import { conditionalAnimation, Duration, Easing, animateElement } from '../../utils/animations.js';

/**
 * QuantityControl UI Component
 */
export class QuantityControl {
  /**
   * @param {Object} options
   * @param {number} options.value - Initial quantity value
   * @param {number} options.min - Minimum value (default: 1)
   * @param {number} options.max - Maximum value (default: 99)
   * @param {Function} options.onChange - Callback when quantity changes
   * @param {boolean} options.disabled - Disabled state
   * @param {boolean} options.compact - Compact mode for cart items
   */
  constructor(options = {}) {
    this.options = {
      value: 1,
      min: 1,
      max: 99,
      onChange: null,
      disabled: false,
      compact: false,
      ...options
    };

    this.currentValue = this.options.value;
    this.element = null;
    this.displayElement = null;
    this.decrementBtn = null;
    this.incrementBtn = null;
  }

  /**
   * Check if can decrement
   * @returns {boolean}
   * @private
   */
  _canDecrement() {
    return this.currentValue > this.options.min;
  }

  /**
   * Check if can increment
   * @returns {boolean}
   * @private
   */
  _canIncrement() {
    return this.currentValue < this.options.max;
  }

  /**
   * Animate number change
   * @param {string} direction - 'up' or 'down'
   * @private
   */
  async _animateNumberChange(direction) {
    if (!this.displayElement) return;

    const scale = direction === 'up' ? 1.2 : 0.8;
    const color = direction === 'up' ? 'var(--color-success)' : 'var(--color-error)';
    const originalColor = this.displayElement.style.color;

    await animateElement(
      this.displayElement,
      { transform: 'scale(1)', color: originalColor },
      { transform: `scale(${scale})`, color },
      100,
      Easing.BOUNCE
    );

    await animateElement(
      this.displayElement,
      { transform: `scale(${scale})`, color },
      { transform: 'scale(1)', color: originalColor },
      100,
      Easing.BOUNCE
    );
  }

  /**
   * Update the quantity value
   * @param {number} newValue
   * @private
   */
  _updateValue(newValue) {
    const oldValue = this.currentValue;
    this.currentValue = Math.max(this.options.min, Math.min(this.options.max, newValue));

    // Animate if value changed
    if (this.currentValue !== oldValue) {
      const direction = this.currentValue > oldValue ? 'up' : 'down';
      conditionalAnimation(() => this._animateNumberChange(direction));
    }

    // Update display
    if (this.displayElement) {
      this.displayElement.textContent = this.currentValue;
      this.displayElement.setAttribute('aria-label', `Quantidade: ${this.currentValue}`);
    }

    // Update button states
    this._updateButtonStates();

    // Call external handler
    if (this.options.onChange) {
      this.options.onChange(this.currentValue, oldValue);
    }
  }

  /**
   * Update button disabled states
   * @private
   */
  _updateButtonStates() {
    if (this.decrementBtn) {
      this.decrementBtn.setDisabled(!this._canDecrement() || this.options.disabled);
    }
    if (this.incrementBtn) {
      this.incrementBtn.setDisabled(!this._canIncrement() || this.options.disabled);
    }
  }

  /**
   * Handle decrement
   * @private
   */
  _handleDecrement() {
    if (this.options.disabled) return;
    this._updateValue(this.currentValue - 1);
  }

  /**
   * Handle increment
   * @private
   */
  _handleIncrement() {
    if (this.options.disabled) return;
    this._updateValue(this.currentValue + 1);
  }

  /**
   * Handle direct input change
   * @param {InputEvent} event
   * @private
   */
  _handleInputChange(event) {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      this._updateValue(value);
    }
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeyDown(event) {
    if (this.options.disabled) return;

    switch (event.key) {
      case 'ArrowUp':
      case '+':
        event.preventDefault();
        this._handleIncrement();
        break;
      case 'ArrowDown':
      case '-':
        event.preventDefault();
        this._handleDecrement();
        break;
    }
  }

  /**
   * Render the component
   * @returns {HTMLElement}
   */
  render() {
    const size = this.options.compact ? 'sm' : 'md';
    const buttonSize = this.options.compact ? 36 : 44;

    this.element = document.createElement('div');
    this.element.className = `quantity-control ${this.options.compact ? 'quantity-control--compact' : ''}`;
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-label', 'Controle de quantidade');

    // Decrement button
    this.decrementBtn = new Button({
      variant: 'ghost',
      size: size,
      icon: `<svg width="${buttonSize / 2}" height="${buttonSize / 2}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>`,
      ariaLabel: 'Diminuir quantidade',
      onClick: () => this._handleDecrement(),
      disabled: !this._canDecrement() || this.options.disabled
    });

    // Quantity display/input
    const displayWrapper = document.createElement('div');
    displayWrapper.className = 'quantity-control__display';
    displayWrapper.innerHTML = `
      <span 
        class="quantity-control__value" 
        role="status" 
        aria-live="polite"
        aria-label="Quantidade: ${this.currentValue}"
      >${this.currentValue}</span>
    `;
    this.displayElement = displayWrapper.querySelector('.quantity-control__value');

    // Increment button
    this.incrementBtn = new Button({
      variant: 'ghost',
      size: size,
      icon: `<svg width="${buttonSize / 2}" height="${buttonSize / 2}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>`,
      ariaLabel: 'Aumentar quantidade',
      onClick: () => this._handleIncrement(),
      disabled: !this._canIncrement() || this.options.disabled
    });

    // Assemble
    this.element.appendChild(this.decrementBtn.render());
    this.element.appendChild(displayWrapper);
    this.element.appendChild(this.incrementBtn.render());

    // Keyboard navigation
    this.element.addEventListener('keydown', (e) => this._handleKeyDown(e));

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Get current value
   * @returns {number}
   */
  getValue() {
    return this.currentValue;
  }

  /**
   * Set value programmatically
   * @param {number} value
   */
  setValue(value) {
    this._updateValue(value);
  }

  /**
   * Set disabled state
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this._updateButtonStates();
    
    if (disabled) {
      this.element.classList.add('quantity-control--disabled');
      this.element.setAttribute('aria-disabled', 'true');
    } else {
      this.element.classList.remove('quantity-control--disabled');
      this.element.removeAttribute('aria-disabled');
    }
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'quantity-control-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Quantity Control Base */
      .quantity-control {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        padding: var(--spacing-1);
      }

      .quantity-control--disabled {
        opacity: 0.6;
      }

      /* Quantity Display */
      .quantity-control__display {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        height: 44px;
        padding: 0 var(--spacing-2);
      }

      .quantity-control--compact .quantity-control__display {
        min-width: 36px;
        height: 36px;
      }

      .quantity-control__value {
        font-family: var(--font-family);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        text-align: center;
        user-select: none;
        font-variant-numeric: tabular-nums;
      }

      .quantity-control--compact .quantity-control__value {
        font-size: var(--font-size-base);
      }

      /* Button overrides for circular shape */
      .quantity-control .button {
        border-radius: 50%;
        min-width: 44px;
        min-height: 44px;
        width: 44px;
        height: 44px;
        padding: 0;
        border: none;
        background-color: transparent;
      }

      .quantity-control .button:hover:not(:disabled) {
        background-color: var(--color-surface-elevated);
        transform: none;
      }

      .quantity-control .button:active:not(:disabled) {
        transform: scale(0.95);
      }

      .quantity-control--compact .button {
        min-width: 36px;
        min-height: 36px;
        width: 36px;
        height: 36px;
      }

      /* Ripple effect for quantity buttons */
      .quantity-control .button::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: currentColor;
        opacity: 0;
        transform: scale(0);
        transition: transform 200ms var(--ease-default), opacity 200ms var(--ease-default);
      }

      .quantity-control .button:active::before {
        opacity: 0.1;
        transform: scale(1);
      }

      /* Focus states */
      .quantity-control .button:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: 0;
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .quantity-control__value {
          transition: none;
        }
        
        .quantity-control .button::before {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.decrementBtn) {
      this.decrementBtn.destroy();
    }
    if (this.incrementBtn) {
      this.incrementBtn.destroy();
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default QuantityControl;
