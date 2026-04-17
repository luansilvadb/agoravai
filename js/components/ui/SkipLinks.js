/**
 * SkipLinks Component
 * Accessibility skip links for keyboard navigation
 * WCAG 2.2 AA - Bypass Blocks (Success Criterion 2.4.1)
 * 
 * @see design.md for accessibility specifications
 */

import { SkipLinkManager } from '../../utils/accessibility.js';

/**
 * SkipLinks UI Component
 * Provides skip links for main content areas
 */
export class SkipLinks {
  /**
   * @param {Object} options
   * @param {Array<{id: string, label: string}>} options.links - Skip link definitions
   */
  constructor(options = {}) {
    this.options = {
      links: [
        { id: 'products-section', label: 'Pular para produtos' },
        { id: 'cart-section', label: 'Pular para carrinho' },
        { id: 'categories-section', label: 'Pular para categorias' }
      ],
      ...options
    };

    this.element = null;
    this.manager = null;
  }

  /**
   * Render the skip links
   * @returns {HTMLElement}
   */
  render() {
    this.element = document.createElement('nav');
    this.element.className = 'skip-links';
    this.element.setAttribute('aria-label', 'Links de acesso rápido');

    this.options.links.forEach(link => {
      const a = document.createElement('a');
      a.href = `#${link.id}`;
      a.textContent = link.label;
      a.className = 'skip-link';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.id);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Announce to screen reader
          target.setAttribute('aria-label', `${link.label}. Início da seção.`);
        }
      });
      this.element.appendChild(a);
    });

    // Inject styles
    this._injectStyles();

    // Insert at start of body
    if (document.body.firstChild) {
      document.body.insertBefore(this.element, document.body.firstChild);
    } else {
      document.body.appendChild(this.element);
    }

    return this.element;
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'skip-links-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Skip Links Container */
      .skip-links {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
      }

      /* Individual Skip Link */
      .skip-link {
        position: absolute;
        top: -100px;
        left: var(--spacing-4);
        padding: var(--spacing-3) var(--spacing-4);
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
        font-family: var(--font-family);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        text-decoration: none;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        transition: top 200ms var(--ease-default);
        min-height: 44px;
        display: flex;
        align-items: center;
      }

      /* Show on focus */
      .skip-link:focus {
        top: var(--spacing-4);
        outline: var(--focus-ring-width) solid var(--color-text-inverse);
        outline-offset: var(--focus-ring-offset);
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .skip-link {
          transition: none;
        }
      }

      /* High Contrast Mode */
      @media (prefers-contrast: more) {
        .skip-link {
          background-color: CanvasText;
          color: Canvas;
          border: 2px solid CanvasText;
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

export default SkipLinks;
