/**
 * BottomSheet Component
 * Swipeable bottom sheet for mobile cart and panels
 * 
 * @see design.md for bottom sheet specifications
 */

import { FocusTrap } from '../../utils/accessibility.js';
import { animateElement, Duration, Easing } from '../../utils/animations.js';

/**
 * BottomSheet UI Component
 */
export class BottomSheet {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.content - Content to render inside sheet
   * @param {string} options.title - Sheet title
   * @param {boolean} options.showHandle - Show drag handle
   * @param {boolean} options.showCloseButton - Show close button
   * @param {Function} options.onClose - Close callback
   * @param {Function} options.onOpen - Open callback
   * @param {number} options.peekHeight - Height when peeking (in px)
   * @param {number} options.maxHeight - Maximum height percentage (0-100)
   */
  constructor(options = {}) {
    this.options = {
      content: null,
      title: '',
      showHandle: true,
      showCloseButton: true,
      onClose: null,
      onOpen: null,
      peekHeight: 100,
      maxHeight: 85,
      ...options
    };

    this.element = null;
    this.backdrop = null;
    this.handle = null;
    this.content = null;
    this.isOpen = false;
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.focusTrap = null;
  }

  /**
   * Create backdrop element
   * @returns {HTMLElement}
   * @private
   */
  _createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    backdrop.addEventListener('click', () => this.close());
    return backdrop;
  }

  /**
   * Create sheet element
   * @returns {HTMLElement}
   * @private
   */
  _createSheet() {
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    if (this.options.title) {
      sheet.setAttribute('aria-labelledby', 'bottom-sheet-title');
    }
    sheet.style.maxHeight = `${this.options.maxHeight}vh`;

    // Drag handle
    if (this.options.showHandle) {
      this.handle = document.createElement('div');
      this.handle.className = 'bottom-sheet__handle';
      this.handle.setAttribute('role', 'button');
      this.handle.setAttribute('aria-label', 'Arraste para expandir/recolher');
      
      // Touch/mouse events for dragging
      this.handle.addEventListener('touchstart', (e) => this._handleDragStart(e.touches[0].clientY), { passive: false });
      this.handle.addEventListener('mousedown', (e) => this._handleDragStart(e.clientY));
      
      sheet.appendChild(this.handle);
    }

    // Header
    if (this.options.title || this.options.showCloseButton) {
      const header = document.createElement('div');
      header.className = 'bottom-sheet__header';

      if (this.options.title) {
        const title = document.createElement('h2');
        title.id = 'bottom-sheet-title';
        title.className = 'bottom-sheet__title';
        title.textContent = this.options.title;
        header.appendChild(title);
      }

      if (this.options.showCloseButton) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'bottom-sheet__close-btn';
        closeBtn.setAttribute('aria-label', 'Fechar');
        closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>`;
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
      }

      sheet.appendChild(header);
    }

    // Content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'bottom-sheet__content';
    
    if (this.options.content) {
      contentWrapper.appendChild(this.options.content);
    }
    
    sheet.appendChild(contentWrapper);
    this.content = contentWrapper;

    // Drag events on sheet
    sheet.addEventListener('touchstart', (e) => {
      if (e.target === sheet || e.target === contentWrapper) {
        this._handleDragStart(e.touches[0].clientY);
      }
    }, { passive: false });
    
    sheet.addEventListener('mousedown', (e) => {
      if (e.target === sheet || e.target === contentWrapper) {
        this._handleDragStart(e.clientY);
      }
    });

    return sheet;
  }

  /**
   * Handle drag start
   * @param {number} clientY
   * @private
   */
  _handleDragStart(clientY) {
    this.isDragging = true;
    this.startY = clientY;
    this.currentY = clientY;
    this.element.style.transition = 'none';
    
    document.addEventListener('touchmove', this._handleDragMove, { passive: false });
    document.addEventListener('touchend', this._handleDragEnd);
    document.addEventListener('mousemove', this._handleDragMove);
    document.addEventListener('mouseup', this._handleDragEnd);
  }

  /**
   * Handle drag move
   * @param {Event} event
   * @private
   */
  _handleDragMove = (event) => {
    if (!this.isDragging) return;
    
    event.preventDefault();
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    this.currentY = clientY;
    
    const deltaY = this.currentY - this.startY;
    if (deltaY > 0) {
      this.element.style.transform = `translateY(${deltaY}px)`;
    }
  };

  /**
   * Handle drag end
   * @private
   */
  _handleDragEnd = () => {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.element.style.transition = '';
    
    const deltaY = this.currentY - this.startY;
    const threshold = this.element.offsetHeight * 0.3; // 30% threshold
    
    if (deltaY > threshold) {
      this.close();
    } else {
      // Snap back
      this.element.style.transform = '';
    }
    
    document.removeEventListener('touchmove', this._handleDragMove);
    document.removeEventListener('touchend', this._handleDragEnd);
    document.removeEventListener('mousemove', this._handleDragMove);
    document.removeEventListener('mouseup', this._handleDragEnd);
  };

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
   * Render the sheet
   * @returns {HTMLElement}
   */
  render() {
    this.backdrop = this._createBackdrop();
    this.element = this._createSheet();

    // Setup focus trap
    this.focusTrap = new FocusTrap(this.element);

    // Keyboard handler
    this._keyDownHandler = (e) => this._handleKeyDown(e);

    // Inject styles
    this._injectStyles();

    return this.element;
  }

  /**
   * Open the sheet
   */
  async open() {
    if (this.isOpen) return;

    if (!this.element || !this.backdrop) {
      this.render();
    }
    
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.element);
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', this._keyDownHandler);

    // Initial state
    this.element.style.transform = 'translateY(100%)';
    this.backdrop.classList.add('is-visible');

    // Animate in
    await animateElement(
      this.element,
      { transform: 'translateY(100%)' },
      { transform: 'translateY(0)' },
      Duration.NORMAL,
      Easing.OUT
    );

    this.element.classList.add('is-open');
    this.isOpen = true;

    // Focus trap
    this.focusTrap.activate();

    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }

  /**
   * Close the sheet
   */
  async close() {
    if (!this.isOpen) return;

    // Animate out
    await animateElement(
      this.element,
      { transform: 'translateY(0)' },
      { transform: 'translateY(100%)' },
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
    document.removeEventListener('keydown', this._keyDownHandler);

    this.focusTrap.deactivate();
    this.isOpen = false;

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * Toggle sheet state
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
    const styleId = 'bottom-sheet-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Backdrop */
      .bottom-sheet-backdrop {
        position: fixed;
        inset: 0;
        background-color: var(--color-overlay);
        z-index: calc(var(--z-drawer) - 1);
        opacity: 0;
        visibility: hidden;
        transition: opacity 300ms var(--ease-default), visibility 300ms;
      }

      .bottom-sheet-backdrop.is-visible {
        opacity: 1;
        visibility: visible;
      }

      /* Bottom Sheet Base */
      .bottom-sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: var(--color-surface);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.2);
        z-index: var(--z-drawer);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        will-change: transform;
        transition: transform 300ms var(--ease-default);
        padding-bottom: env(safe-area-inset-bottom);
      }

      /* Drag Handle */
      .bottom-sheet__handle {
        display: flex;
        justify-content: center;
        padding: var(--spacing-3);
        cursor: grab;
        touch-action: none;
        flex-shrink: 0;
      }

      .bottom-sheet__handle::before {
        content: '';
        width: 40px;
        height: 4px;
        background-color: var(--color-border);
        border-radius: var(--radius-full);
        transition: background-color 150ms var(--ease-default);
      }

      .bottom-sheet__handle:active {
        cursor: grabbing;
      }

      .bottom-sheet__handle:active::before {
        background-color: var(--color-text-tertiary);
      }

      /* Header */
      .bottom-sheet__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--spacing-4) var(--spacing-3);
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
      }

      .bottom-sheet__title {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
      }

      .bottom-sheet__close-btn {
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

      .bottom-sheet__close-btn:hover {
        background-color: var(--color-bg);
        color: var(--color-text-primary);
      }

      .bottom-sheet__close-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: 0;
      }

      /* Content */
      .bottom-sheet__content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-3) var(--spacing-4);
        -webkit-overflow-scrolling: touch;
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .bottom-sheet,
        .bottom-sheet-backdrop {
          transition: none;
        }
        
        .bottom-sheet:not(.is-open) {
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
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default BottomSheet;
