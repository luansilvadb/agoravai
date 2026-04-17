/**
 * Drawer Component
 * Slide-in drawer with backdrop for tablet cart and other panels
 * 
 * @see design.md for drawer specifications
 */

import { FocusTrap } from '../../utils/accessibility.js';
import { animateElement, Duration, Easing } from '../../utils/animations.js';

/**
 * Drawer UI Component
 */
export class Drawer {
  /**
   * @param {Object} options
   * @param {string} options.position - 'left', 'right', 'top', 'bottom'
   * @param {string} options.width - Drawer width (for left/right)
   * @param {string} options.height - Drawer height (for top/bottom)
   * @param {HTMLElement} options.content - Content to render inside drawer
   * @param {boolean} options.showCloseButton - Show close button in header
   * @param {string} options.title - Drawer title
   * @param {Function} options.onClose - Close callback
   * @param {boolean} options.closeOnBackdropClick - Close when clicking backdrop
   */
  constructor(options = {}) {
    this.options = {
      position: 'right',
      width: '400px',
      height: '400px',
      content: null,
      showCloseButton: true,
      title: '',
      onClose: null,
      closeOnBackdropClick: true,
      ...options
    };

    this.element = null;
    this.backdrop = null;
    this.content = null;
    this.isOpen = false;
    this.focusTrap = null;
  }

  /**
   * Get transform styles based on position
   * @returns {Object}
   * @private
   */
  _getTransformStyles() {
    const closed = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)'
    };
    return {
      closed: closed[this.options.position],
      open: 'translate(0, 0)'
    };
  }

  /**
   * Get dimension styles based on position
   * @returns {Object}
   * @private
   */
  _getDimensionStyles() {
    const isHorizontal = ['left', 'right'].includes(this.options.position);
    return {
      width: isHorizontal ? this.options.width : '100%',
      height: isHorizontal ? '100%' : this.options.height
    };
  }

  /**
   * Create backdrop element
   * @returns {HTMLElement}
   * @private
   */
  _createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    
    if (this.options.closeOnBackdropClick) {
      backdrop.addEventListener('click', () => this.close());
    }

    return backdrop;
  }

  /**
   * Create drawer element
   * @returns {HTMLElement}
   * @private
   */
  _createDrawer() {
    const drawer = document.createElement('div');
    drawer.className = `drawer drawer--${this.options.position}`;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    if (this.options.title) {
      drawer.setAttribute('aria-labelledby', 'drawer-title');
    }

    const dimensions = this._getDimensionStyles();
    drawer.style.width = dimensions.width;
    drawer.style.height = dimensions.height;

    // Header
    if (this.options.showCloseButton || this.options.title) {
      const header = document.createElement('div');
      header.className = 'drawer__header';

      if (this.options.title) {
        const title = document.createElement('h2');
        title.id = 'drawer-title';
        title.className = 'drawer__title';
        title.textContent = this.options.title;
        header.appendChild(title);
      }

      if (this.options.showCloseButton) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'drawer__close-btn';
        closeBtn.setAttribute('aria-label', 'Fechar');
        closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>`;
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
      }

      drawer.appendChild(header);
    }

    // Content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'drawer__content';
    
    if (this.options.content) {
      contentWrapper.appendChild(this.options.content);
    }
    
    drawer.appendChild(contentWrapper);
    this.content = contentWrapper;

    return drawer;
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  /**
   * Render the drawer
   * @returns {HTMLElement}
   */
  render() {
    this.backdrop = this._createBackdrop();
    this.element = this._createDrawer();

    // Setup focus trap
    this.focusTrap = new FocusTrap(this.element);

    // Keyboard handler
    this._keyDownHandler = (e) => this._handleKeyDown(e);
    document.addEventListener('keydown', this._keyDownHandler);

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Open the drawer
   */
  async open() {
    if (this.isOpen) return;

    // Add to DOM
    if (!this.element || !this.backdrop) {
      this.render();
    }
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.element);
    document.body.style.overflow = 'hidden';

    const transforms = this._getTransformStyles();

    // Initial state
    this.element.style.transform = transforms.closed;
    this.backdrop.classList.add('is-visible');

    // Animate in
    await animateElement(
      this.element,
      { transform: transforms.closed },
      { transform: transforms.open },
      Duration.NORMAL,
      Easing.OUT
    );

    this.element.classList.add('is-open');
    this.isOpen = true;

    // Focus trap
    this.focusTrap.activate();
  }

  /**
   * Close the drawer
   */
  async close() {
    if (!this.isOpen) return;

    const transforms = this._getTransformStyles();

    // Animate out
    await animateElement(
      this.element,
      { transform: transforms.open },
      { transform: transforms.closed },
      Duration.NORMAL,
      Easing.IN
    );

    this.element.classList.remove('is-open');
    this.backdrop.classList.remove('is-visible');

    // Cleanup
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    document.body.style.overflow = '';

    this.focusTrap.deactivate();
    this.isOpen = false;

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * Toggle drawer state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update content
   * @param {HTMLElement} content
   */
  setContent(content) {
    if (this.content) {
      this.content.innerHTML = '';
      this.content.appendChild(content);
    }
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'drawer-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Backdrop */
      .drawer-backdrop {
        position: fixed;
        inset: 0;
        background-color: var(--color-overlay);
        z-index: calc(var(--z-drawer) - 1);
        opacity: 0;
        visibility: hidden;
        transition: opacity 300ms var(--ease-default), visibility 300ms;
      }

      .drawer-backdrop.is-visible {
        opacity: 1;
        visibility: visible;
      }

      /* Drawer Base */
      .drawer {
        position: fixed;
        background-color: var(--color-surface);
        box-shadow: var(--shadow-xl);
        z-index: var(--z-drawer);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        will-change: transform;
      }

      .drawer--left {
        top: 0;
        left: 0;
        bottom: 0;
      }

      .drawer--right {
        top: 0;
        right: 0;
        bottom: 0;
      }

      .drawer--top {
        top: 0;
        left: 0;
        right: 0;
      }

      .drawer--bottom {
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      }

      /* Header */
      .drawer__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-3) var(--spacing-4);
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
      }

      .drawer__title {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
      }

      .drawer__close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 150ms var(--ease-default);
        flex-shrink: 0;
      }

      .drawer__close-btn:hover {
        background-color: var(--color-bg);
        color: var(--color-text-primary);
      }

      .drawer__close-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: 0;
      }

      /* Content */
      .drawer__content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-4);
      }

      /* Focus */
      .drawer:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: calc(-1 * var(--focus-ring-width));
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .drawer,
        .drawer-backdrop {
          transition: none;
        }
        
        .drawer:not(.is-open) {
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
    this.close();
    document.removeEventListener('keydown', this._keyDownHandler);
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default Drawer;
