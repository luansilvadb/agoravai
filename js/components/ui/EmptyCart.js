/**
 * EmptyCart Component
 * Illustrative empty state for the shopping cart
 * 
 * @see design.md for cart specifications
 */

import { Button } from './Button.js';

/**
 * EmptyCart UI Component
 */
export class EmptyCart {
  /**
   * @param {Object} options
   * @param {Function} options.onBrowseProducts - Callback to browse products
   * @param {string} options.title - Custom title text
   * @param {string} options.message - Custom message text
   */
  constructor(options = {}) {
    this.options = {
      onBrowseProducts: null,
      title: 'Carrinho vazio',
      message: 'Adicione produtos para começar uma venda',
      ...options
    };

    this.element = null;
  }

  /**
   * Render the component
   * @returns {HTMLElement}
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = 'empty-cart';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');

    // Illustration
    const illustration = document.createElement('div');
    illustration.className = 'empty-cart__illustration';
    illustration.innerHTML = `
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Shopping cart icon -->
        <rect x="20" y="30" width="80" height="70" rx="8" fill="var(--color-border-subtle)" opacity="0.5"/>
        <rect x="30" y="40" width="60" height="50" rx="4" fill="var(--color-surface)"/>
        <!-- Cart handle -->
        <path d="M45 30V20C45 17.2386 47.2386 15 50 15H70C72.7614 15 75 17.2386 75 20V30" 
              stroke="var(--color-border)" stroke-width="4" stroke-linecap="round"/>
        <!-- Items placeholder (dashed) -->
        <rect x="38" y="50" width="20" height="20" rx="2" stroke="var(--color-border)" stroke-width="2" stroke-dasharray="4 2"/>
        <rect x="62" y="50" width="20" height="20" rx="2" stroke="var(--color-border)" stroke-width="2" stroke-dasharray="4 2"/>
        <rect x="38" y="74" width="20" height="8" rx="2" stroke="var(--color-border)" stroke-width="2" stroke-dasharray="4 2"/>
        <rect x="62" y="74" width="20" height="8" rx="2" stroke="var(--color-border)" stroke-width="2" stroke-dasharray="4 2"/>
        <!-- Plus icon indicating add action -->
        <circle cx="90" cy="90" r="15" fill="var(--color-primary)"/>
        <path d="M90 84V96M84 90H96" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `;

    // Text content
    const content = document.createElement('div');
    content.className = 'empty-cart__content';
    content.innerHTML = `
      <h3 class="empty-cart__title">${this.options.title}</h3>
      <p class="empty-cart__message">${this.options.message}</p>
    `;

    // CTA button (if callback provided)
    if (this.options.onBrowseProducts) {
      const ctaButton = new Button({
        variant: 'primary',
        size: 'md',
        text: 'Ver produtos',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>`,
        onClick: () => this.options.onBrowseProducts()
      });
      content.appendChild(ctaButton.render());
    }

    // Assemble
    this.element.appendChild(illustration);
    this.element.appendChild(content);

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'empty-cart-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Empty Cart Base */
      .empty-cart {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-8) var(--spacing-4);
        text-align: center;
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 2px dashed var(--color-border);
        min-height: 300px;
      }

      /* Illustration */
      .empty-cart__illustration {
        width: 120px;
        height: 120px;
        margin-bottom: var(--spacing-4);
        opacity: 0.8;
        animation: empty-cart-float 3s ease-in-out infinite;
      }

      .empty-cart__illustration svg {
        width: 100%;
        height: 100%;
      }

      @keyframes empty-cart-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      /* Content */
      .empty-cart__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-3);
      }

      .empty-cart__title {
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
      }

      .empty-cart__message {
        margin: 0;
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
        max-width: 280px;
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .empty-cart__illustration {
          animation: none;
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

export default EmptyCart;
