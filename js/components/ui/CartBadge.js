/**
 * CartBadge Component
 * Animated badge showing cart item count with pop animation
 * 
 * @see design.md for animation specifications
 */

import { badgePopAnimation, conditionalAnimation, cartHeaderShake } from '../../utils/animations.js';

/**
 * CartBadge UI Component
 */
export class CartBadge {
  /**
   * @param {Object} options
   * @param {number} options.count - Initial item count
   * @param {number} options.total - Total price
   * @param {HTMLElement} options.headerElement - Header element to shake (optional)
   * @param {Function} options.onClick - Click handler
   */
  constructor(options = {}) {
    this.options = {
      count: 0,
      total: 0,
      headerElement: null,
      onClick: null,
      ...options
    };

    this.element = null;
    this.countElement = null;
    this.previousCount = this.options.count;
  }

  /**
   * Format price as currency
   * @param {number} price
   * @returns {string}
   * @private
   */
  _formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  /**
   * Render the badge
   * @returns {HTMLElement}
   */
  render() {
    this.element = document.createElement('button');
    this.element.className = 'cart-badge';
    this.element.type = 'button';
    this.element.setAttribute('aria-label', `Carrinho com ${this.options.count} itens, total ${this._formatPrice(this.options.total)}`);

    this.element.innerHTML = `
      <svg class="cart-badge__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M9 22a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/>
        <path d="M20 22a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <span class="cart-badge__count">${this.options.count}</span>
    `;

    this.countElement = this.element.querySelector('.cart-badge__count');

    // Event listeners
    if (this.options.onClick) {
      this.element.addEventListener('click', () => this.options.onClick());
    }

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Update badge count and trigger animations
   * @param {number} newCount
   * @param {number} newTotal
   */
  update(newCount, newTotal) {
    const countChanged = newCount !== this.previousCount;
    
    this.options.count = newCount;
    this.options.total = newTotal;
    this.previousCount = newCount;

    // Update text
    if (this.countElement) {
      this.countElement.textContent = newCount;
    }

    // Update aria-label
    this.element.setAttribute('aria-label', `Carrinho com ${newCount} itens, total ${this._formatPrice(newTotal)}`);

    // Show/hide based on count
    if (newCount === 0) {
      this.element.classList.add('is-empty');
    } else {
      this.element.classList.remove('is-empty');
    }

    // Animate if count increased
    if (countChanged && newCount > 0) {
      // Badge pop animation
      conditionalAnimation(() => badgePopAnimation(this.countElement));

      // Header shake if provided
      if (this.options.headerElement) {
        conditionalAnimation(() => cartHeaderShake(this.options.headerElement));
      }
    }
  }

  /**
   * Get current count
   * @returns {number}
   */
  getCount() {
    return this.options.count;
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'cart-badge-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Cart Badge Base */
      .cart-badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
        border: none;
        border-radius: var(--radius-full);
        font-family: var(--font-family);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: all 200ms var(--ease-default);
        min-height: 44px;
        box-shadow: var(--shadow-primary-md);
      }

      .cart-badge:hover {
        background-color: var(--color-primary-dark);
        transform: scale(1.05);
        box-shadow: var(--shadow-primary-lg);
      }

      .cart-badge:active {
        transform: scale(0.98);
      }

      .cart-badge:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: var(--focus-ring-offset);
      }

      /* Empty State */
      .cart-badge.is-empty {
        background-color: var(--color-surface);
        color: var(--color-text-secondary);
        box-shadow: var(--shadow-sm);
      }

      .cart-badge.is-empty:hover {
        background-color: var(--color-surface-elevated);
      }

      .cart-badge.is-empty .cart-badge__count {
        display: none;
      }

      /* Icon */
      .cart-badge__icon {
        flex-shrink: 0;
      }

      /* Count */
      .cart-badge__count {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 4px;
        background-color: var(--color-error);
        color: var(--color-text-inverse);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        will-change: transform;
      }

      .cart-badge.is-empty .cart-badge__count {
        background-color: var(--color-text-tertiary);
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .cart-badge {
          transition: none;
        }
        
        .cart-badge:hover {
          transform: none;
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

export default CartBadge;
