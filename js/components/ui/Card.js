/**
 * Card Component
 * Product card with image, title, price, and actions
 * 
 * States: default, hover (elevation +4px), active, disabled
 * 
 * @see design.md for card specifications
 */

import { Button } from './Button.js';
import { conditionalAnimation, popAnimation, Duration, Easing, animateElement } from '../../utils/animations.js';

/**
 * Card UI Component for products
 */
export class Card {
  /**
   * @param {Object} options
   * @param {Object} options.product - Product data {id, name, price, image, category, description}
   * @param {Function} options.onAddToCart - Add to cart handler
   * @param {Function} options.onClick - Card click handler
   * @param {boolean} options.disabled - Disabled state
   * @param {boolean} options.loading - Loading/skeleton state
   */
  constructor(options = {}) {
    this.options = {
      product: null,
      onAddToCart: null,
      onClick: null,
      disabled: false,
      loading: false,
      ...options
    };

    this.element = null;
    this.addButton = null;
    this.isPressed = false;
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
   * Handle add to cart action
   * @private
   */
  _handleAddToCart(event) {
    event.stopPropagation();
    
    if (this.options.disabled || this.options.loading) return;

    // Animate the card "pop"
    conditionalAnimation(popAnimation, this.element, 1.05, Duration.INSTANT);

    // Call external handler
    if (this.options.onAddToCart) {
      this.options.onAddToCart(this.options.product);
    }
  }

  /**
   * Handle card click
   * @private
   */
  _handleClick() {
    if (this.options.disabled || this.options.loading) return;
    
    if (this.options.onClick) {
      this.options.onClick(this.options.product);
    }
  }

  /**
   * Render skeleton loading state
   * @returns {HTMLElement}
   * @private
   */
  _renderSkeleton() {
    const card = document.createElement('div');
    card.className = 'card card--skeleton';
    card.setAttribute('aria-busy', 'true');
    card.innerHTML = `
      <div class="card__image-skeleton skeleton"></div>
      <div class="card__content">
        <div class="card__title-skeleton skeleton"></div>
        <div class="card__price-skeleton skeleton"></div>
        <div class="card__button-skeleton skeleton"></div>
      </div>
    `;
    return card;
  }

  /**
   * Render the card
   * @returns {HTMLElement}
   */
  render() {
    // Skeleton state
    if (this.options.loading) {
      this.element = this._renderSkeleton();
      this._injectStyles();
      return this.element;
    }

    const { product } = this.options;
    if (!product) {
      console.warn('Card: No product data provided');
      return document.createElement('div');
    }

    this.element = document.createElement('article');
    this.element.className = 'card';
    this.element.tabIndex = 0;
    this.element.setAttribute('role', 'article');
    this.element.setAttribute('aria-label', `${product.name}, ${this._formatPrice(product.price)}`);

    if (this.options.disabled) {
      this.element.classList.add('card--disabled');
      this.element.setAttribute('aria-disabled', 'true');
    }

    // Card content
    this.element.innerHTML = `
      <div class="card__image-wrapper">
        <img 
          class="card__image" 
          src="${product.image || '/assets/placeholder-product.png'}" 
          alt="${product.name}" 
          loading="lazy"
          onerror="this.src='/assets/placeholder-product.png'"
        />
        ${product.category ? `<span class="card__category">${product.category}</span>` : ''}
      </div>
      <div class="card__content">
        <h3 class="card__title">${product.name}</h3>
        ${product.description ? `<p class="card__description">${product.description}</p>` : ''}
        <div class="card__footer">
          <span class="card__price">${this._formatPrice(product.price)}</span>
          <div class="card__actions"></div>
        </div>
      </div>
    `;

    // Add button
    const actionsContainer = this.element.querySelector('.card__actions');
    this.addButton = new Button({
      variant: 'primary',
      size: 'sm',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>`,
      ariaLabel: `Adicionar ${product.name} ao carrinho`,
      onClick: (e) => this._handleAddToCart(e),
      disabled: this.options.disabled
    });
    actionsContainer.appendChild(this.addButton.render());

    // Event listeners
    this.element.addEventListener('click', () => this._handleClick());
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._handleClick();
      }
    });

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Play "hop" animation when adding to cart
   */
  hopAnimation() {
    conditionalAnimation(popAnimation, this.element, 1.05, Duration.INSTANT);
  }

  /**
   * Update card state
   * @param {Object} updates
   */
  update(updates) {
    this.options = { ...this.options, ...updates };
    
    const newElement = this.render();
    if (this.element.parentNode) {
      this.element.parentNode.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  /**
   * Set disabled state
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this.update({ disabled });
  }

  /**
   * Set loading state
   * @param {boolean} loading
   */
  setLoading(loading) {
    this.update({ loading });
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'card-component-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Card Base */
      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        background-color: var(--color-surface);
        border: 1px solid transparent;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        cursor: pointer;
        transition: all 200ms var(--ease-default);
        contain: layout paint;
      }

      .card:hover:not(.card--disabled):not(.card--skeleton) {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-border);
      }

      .card:active:not(.card--disabled):not(.card--skeleton) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
      }

      .card:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: var(--focus-ring-offset);
      }

      /* Disabled State */
      .card--disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .card--disabled .card__image {
        filter: grayscale(100%);
      }

      /* Image Wrapper */
      .card__image-wrapper {
        position: relative;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        background-color: var(--color-bg);
      }

      .card__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 300ms var(--ease-default);
      }

      .card:hover .card__image {
        transform: scale(1.05);
      }

      /* Category Badge */
      .card__category {
        position: absolute;
        top: var(--spacing-2);
        left: var(--spacing-2);
        padding: var(--spacing-1) var(--spacing-2);
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        border-radius: var(--radius-md);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Content */
      .card__content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: var(--spacing-3);
        gap: var(--spacing-2);
      }

      .card__title {
        margin: 0;
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        line-height: var(--line-height-tight);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card__description {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        line-height: var(--line-height-normal);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Footer */
      .card__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: var(--spacing-2);
        border-top: 1px solid var(--color-border-subtle);
      }

      .card__price {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        font-variant-numeric: tabular-nums;
      }

      .card__actions {
        display: flex;
        gap: var(--spacing-2);
      }

      /* Skeleton State */
      .card--skeleton {
        cursor: default;
        pointer-events: none;
      }

      .card__image-skeleton {
        aspect-ratio: 4 / 3;
        width: 100%;
      }

      .card__title-skeleton {
        height: 1.25rem;
        width: 80%;
        border-radius: var(--radius-sm);
      }

      .card__price-skeleton {
        height: 1.5rem;
        width: 60px;
        border-radius: var(--radius-sm);
      }

      .card__button-skeleton {
        height: 36px;
        width: 80px;
        border-radius: var(--radius-lg);
      }

      /* Skeleton Animation */
      .skeleton {
        background: linear-gradient(90deg, var(--color-border-subtle) 25%, var(--color-border) 50%, var(--color-border-subtle) 75%);
        background-size: 200% 100%;
        animation: card-skeleton 1.5s infinite;
      }

      @keyframes card-skeleton {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .card {
          transition: none;
        }
        
        .card:hover {
          transform: none;
        }
        
        .card__image {
          transition: none;
        }
        
        .skeleton {
          animation: none;
          background: var(--color-border);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.addButton) {
      this.addButton.destroy();
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default Card;
