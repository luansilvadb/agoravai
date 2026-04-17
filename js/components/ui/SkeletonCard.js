/**
 * SkeletonCard Component
 * Placeholder loading state with shimmer effect for product cards
 * 
 * @see design.md for skeleton specifications
 */

/**
 * SkeletonCard UI Component
 */
export class SkeletonCard {
  /**
   * @param {Object} options
   * @param {boolean} options.compact - Compact mode for mobile
   * @param {number} options.count - Number of skeleton items to render
   */
  constructor(options = {}) {
    this.options = {
      compact: false,
      count: 1,
      ...options
    };

    this.element = null;
  }

  /**
   * Render a single skeleton card
   * @returns {HTMLElement}
   * @private
   */
  _renderSingle() {
    const card = document.createElement('div');
    card.className = `skeleton-card ${this.options.compact ? 'skeleton-card--compact' : ''}`;
    card.setAttribute('aria-busy', 'true');
    card.setAttribute('aria-label', 'Carregando produto...');

    card.innerHTML = `
      <div class="skeleton-card__image skeleton-shimmer"></div>
      <div class="skeleton-card__content">
        <div class="skeleton-card__title skeleton-shimmer"></div>
        <div class="skeleton-card__description skeleton-shimmer"></div>
        <div class="skeleton-card__footer">
          <div class="skeleton-card__price skeleton-shimmer"></div>
          <div class="skeleton-card__button skeleton-shimmer"></div>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Render the component
   * @returns {HTMLElement}
   */
  render() {
    // Single card
    if (this.options.count === 1) {
      this.element = this._renderSingle();
      this._injectStyles();
      return this.element;
    }

    // Multiple cards (grid container)
    this.element = document.createElement('div');
    this.element.className = 'skeleton-card-grid';
    this.element.setAttribute('aria-busy', 'true');
    this.element.setAttribute('aria-label', `Carregando ${this.options.count} produtos...`);

    for (let i = 0; i < this.options.count; i++) {
      const card = this._renderSingle();
      // Staggered animation delay
      card.style.animationDelay = `${i * 100}ms`;
      this.element.appendChild(card);
    }

    this._injectStyles();
    return this.element;
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'skeleton-card-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Skeleton Card Base */
      .skeleton-card {
        display: flex;
        flex-direction: column;
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        overflow: hidden;
        min-height: 280px;
      }

      /* Compact Mode */
      .skeleton-card--compact {
        min-height: 240px;
      }

      /* Shimmer Animation Base */
      .skeleton-shimmer {
        background: linear-gradient(
          90deg,
          var(--color-border-subtle) 0%,
          var(--color-border) 50%,
          var(--color-border-subtle) 100%
        );
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
      }

      @keyframes skeleton-shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* Image Skeleton */
      .skeleton-card__image {
        aspect-ratio: 4 / 3;
        width: 100%;
      }

      /* Content */
      .skeleton-card__content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: var(--spacing-3);
        gap: var(--spacing-3);
      }

      /* Title Skeleton */
      .skeleton-card__title {
        height: 1.25rem;
        width: 80%;
        border-radius: var(--radius-sm);
      }

      /* Description Skeleton */
      .skeleton-card__description {
        height: 0.875rem;
        width: 60%;
        border-radius: var(--radius-sm);
      }

      /* Footer */
      .skeleton-card__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: var(--spacing-2);
      }

      /* Price Skeleton */
      .skeleton-card__price {
        height: 1.5rem;
        width: 80px;
        border-radius: var(--radius-sm);
      }

      /* Button Skeleton */
      .skeleton-card__button {
        height: 36px;
        width: 80px;
        border-radius: var(--radius-lg);
      }

      /* Skeleton Grid */
      .skeleton-card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--spacing-4);
        width: 100%;
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .skeleton-shimmer {
          animation: none;
          background: var(--color-border);
        }
      }

      /* High Contrast Mode */
      @media (prefers-contrast: more) {
        .skeleton-shimmer {
          background: var(--color-border);
          border: 1px dashed var(--color-text-secondary);
          animation: none;
        }
        
        .skeleton-card__image::before,
        .skeleton-card__title::before,
        .skeleton-card__description::before,
        .skeleton-card__price::before,
        .skeleton-card__button::before {
          content: '...';
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create multiple skeleton cards
   * @param {number} count
   * @param {boolean} compact
   * @returns {HTMLElement}
   */
  static createGrid(count, compact = false) {
    const skeleton = new SkeletonCard({ count, compact });
    return skeleton.render();
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

export default SkeletonCard;
