/**
 * CartItemRow Component
 * Row displaying cart item with thumbnail, name, quantity, price, and remove action
 * 
 * @see design.md for cart specifications
 */

import { QuantityControl } from './QuantityControl.js';
import { Button } from './Button.js';
import { fadeOutSlide, conditionalAnimation, Duration } from '../../utils/animations.js';

/**
 * CartItemRow UI Component
 */
export class CartItemRow {
  /**
   * @param {Object} options
   * @param {Object} options.item - Cart item {id, product, quantity}
   * @param {Function} options.onQuantityChange - Callback when quantity changes
   * @param {Function} options.onRemove - Callback when item is removed
   * @param {boolean} options.compact - Compact mode for mobile/drawer
   */
  constructor(options = {}) {
    this.options = {
      item: null,
      onQuantityChange: null,
      onRemove: null,
      compact: false,
      ...options
    };

    this.element = null;
    this.quantityControl = null;
    this.removeButton = null;
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
   * Calculate total price for item
   * @returns {number}
   * @private
   */
  _getTotalPrice() {
    const { item } = this.options;
    return (item.product?.price || 0) * item.quantity;
  }

  /**
   * Handle quantity change
   * @param {number} newQuantity
   * @private
   */
  _handleQuantityChange(newQuantity) {
    if (this.options.onQuantityChange) {
      this.options.onQuantityChange(this.options.item.id, newQuantity);
    }
  }

  /**
   * Handle remove with animation
   * @private
   */
  async _handleRemove() {
    // Animate removal
    await conditionalAnimation(() => 
      fadeOutSlide(this.element, 'right', Duration.NORMAL)
    );

    // Call external handler
    if (this.options.onRemove) {
      this.options.onRemove(this.options.item.id);
    }
  }

  /**
   * Render the component
   * @returns {HTMLElement}
   */
  render() {
    const { item, compact } = this.options;
    const product = item.product || {};

    this.element = document.createElement('div');
    this.element.className = `cart-item-row ${compact ? 'cart-item-row--compact' : ''}`;
    this.element.setAttribute('role', 'listitem');
    this.element.setAttribute('data-item-id', item.id);

    // Thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'cart-item-row__thumbnail';
    thumbnail.innerHTML = `
      <img 
        src="${product.image || '/assets/placeholder-product.png'}" 
        alt="${product.name || 'Produto'}"
        loading="lazy"
        onerror="this.src='/assets/placeholder-product.png'"
      />
    `;

    // Content
    const content = document.createElement('div');
    content.className = 'cart-item-row__content';
    content.innerHTML = `
      <h4 class="cart-item-row__name">${product.name || 'Produto'}</h4>
      <span class="cart-item-row__unit-price">${this._formatPrice(product.price || 0)} un.</span>
    `;

    // Quantity and price section
    const actions = document.createElement('div');
    actions.className = 'cart-item-row__actions';

    // Quantity control
    this.quantityControl = new QuantityControl({
      value: item.quantity,
      min: 1,
      max: 99,
      compact: compact,
      onChange: (newQty) => this._handleQuantityChange(newQty)
    });
    actions.appendChild(this.quantityControl.render());

    // Total price
    const totalPrice = document.createElement('span');
    totalPrice.className = 'cart-item-row__total';
    totalPrice.textContent = this._formatPrice(this._getTotalPrice());
    actions.appendChild(totalPrice);

    // Remove button
    this.removeButton = new Button({
      variant: 'ghost',
      size: compact ? 'sm' : 'md',
      icon: `<svg width="${compact ? '16' : '20'}" height="${compact ? '16' : '20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`,
      ariaLabel: `Remover ${product.name || 'produto'} do carrinho`,
      onClick: () => this._handleRemove()
    });
    this.removeButton.element.classList.add('cart-item-row__remove-btn');
    actions.appendChild(this.removeButton.render());

    // Assemble
    this.element.appendChild(thumbnail);
    this.element.appendChild(content);
    this.element.appendChild(actions);

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Update item data
   * @param {Object} newItem
   */
  update(newItem) {
    this.options.item = newItem;
    this.quantityControl.setValue(newItem.quantity);
    
    const totalEl = this.element.querySelector('.cart-item-row__total');
    if (totalEl) {
      totalEl.textContent = this._formatPrice(this._getTotalPrice());
    }
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'cart-item-row-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Cart Item Row Base */
      .cart-item-row {
        display: grid;
        grid-template-columns: 64px 1fr auto;
        gap: var(--spacing-3);
        align-items: center;
        padding: var(--spacing-3);
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        transition: all 200ms var(--ease-default);
        contain: layout paint;
      }

      .cart-item-row:hover {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-sm);
      }

      /* Compact Mode */
      .cart-item-row--compact {
        grid-template-columns: 48px 1fr auto;
        padding: var(--spacing-2);
        gap: var(--spacing-2);
      }

      /* Thumbnail */
      .cart-item-row__thumbnail {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-md);
        overflow: hidden;
        background-color: var(--color-bg);
        flex-shrink: 0;
      }

      .cart-item-row__thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cart-item-row--compact .cart-item-row__thumbnail {
        width: 48px;
        height: 48px;
      }

      /* Content */
      .cart-item-row__content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
        min-width: 0;
      }

      .cart-item-row__name {
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .cart-item-row__unit-price {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
      }

      /* Actions */
      .cart-item-row__actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
      }

      .cart-item-row__total {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        font-variant-numeric: tabular-nums;
        min-width: 80px;
        text-align: right;
      }

      /* Remove Button */
      .cart-item-row__remove-btn {
        color: var(--color-text-tertiary) !important;
        border-color: var(--color-border) !important;
      }

      .cart-item-row__remove-btn:hover {
        color: var(--color-error) !important;
        border-color: var(--color-error) !important;
        background-color: var(--color-error-bg) !important;
      }

      /* Compact adjustments */
      .cart-item-row--compact .cart-item-row__total {
        font-size: var(--font-size-sm);
        min-width: 70px;
      }

      .cart-item-row--compact .cart-item-row__actions {
        gap: var(--spacing-2);
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .cart-item-row {
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
    if (this.quantityControl) {
      this.quantityControl.destroy();
    }
    if (this.removeButton) {
      this.removeButton.destroy();
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default CartItemRow;
