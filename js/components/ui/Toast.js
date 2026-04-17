/**
 * Toast Component
 * Notification system with variants, auto-dismiss, and positioning
 * 
 * Variants: success, error, info, warning
 * Position: top-right (desktop), top-center (mobile)
 * Auto-dismiss: 4 seconds
 * 
 * @see design.md for toast specifications
 */

import { slideIn, conditionalAnimation, Duration, Easing, animateElement } from '../../utils/animations.js';
import { announce } from '../../utils/accessibility.js';

/**
 * Toast UI Component
 */
export class Toast {
  /**
   * @param {Object} options
   * @param {'success'|'error'|'info'|'warning'} options.variant - Toast style
   * @param {string} options.title - Toast title
   * @param {string} options.message - Toast message
   * @param {number} options.duration - Auto-dismiss duration in ms (default: 4000)
   * @param {boolean} options.persistent - Don't auto-dismiss
   * @param {Function} options.onClose - Close callback
   * @param {Function} options.onAction - Action button callback
   * @param {string} options.actionText - Action button text
   */
  constructor(options = {}) {
    this.options = {
      variant: 'info',
      title: '',
      message: '',
      duration: 4000,
      persistent: false,
      onClose: null,
      onAction: null,
      actionText: '',
      ...options
    };

    this.element = null;
    this.closeButton = null;
    this.progressBar = null;
    this.dismissTimer = null;
    this.progressInterval = null;
  }

  /**
   * Get icon for variant
   * @returns {string} SVG HTML
   * @private
   */
  _getIcon() {
    const icons = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`
    };
    return icons[this.options.variant] || icons.info;
  }

  /**
   * Get accessible label for variant
   * @returns {string}
   * @private
   */
  _getAccessibleLabel() {
    const labels = {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Informação'
    };
    return labels[this.options.variant] || 'Notificação';
  }

  /**
   * Start auto-dismiss timer
   * @private
   */
  _startDismissTimer() {
    if (this.options.persistent) return;

    let remaining = this.options.duration;
    const interval = 16; // ~60fps

    // Update progress bar
    if (this.progressBar) {
      this.progressInterval = setInterval(() => {
        remaining -= interval;
        const progress = (remaining / this.options.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
      }, interval);
    }

    // Dismiss timer
    this.dismissTimer = setTimeout(() => {
      this.dismiss();
    }, this.options.duration);
  }

  /**
   * Clear timers
   * @private
   */
  _clearTimers() {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Pause auto-dismiss on hover
   * @private
   */
  _pauseDismiss() {
    this._clearTimers();
    if (this.progressBar) {
      this.progressBar.style.animationPlayState = 'paused';
    }
  }

  /**
   * Resume auto-dismiss
   * @private
   */
  _resumeDismiss() {
    if (this.options.persistent) return;
    this._startDismissTimer();
    if (this.progressBar) {
      this.progressBar.style.animationPlayState = 'running';
    }
  }

  /**
   * Handle close
   * @private
   */
  _handleClose() {
    this.dismiss();
  }

  /**
   * Dismiss the toast
   */
  async dismiss() {
    this._clearTimers();

    // Animate out
    if (this.element) {
      await animateElement(
        this.element,
        { opacity: '1', transform: 'translateX(0)' },
        { opacity: '0', transform: 'translateX(100%)' },
        Duration.NORMAL,
        Easing.IN
      );

      this.element.remove();
    }

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * Render the toast
   * @returns {HTMLElement}
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = `toast toast--${this.options.variant}`;
    this.element.setAttribute('role', 'alert');
    this.element.setAttribute('aria-live', this.options.variant === 'error' ? 'assertive' : 'polite');
    this.element.setAttribute('aria-atomic', 'true');
    this.element.setAttribute('aria-label', this._getAccessibleLabel());

    // Icon
    const icon = document.createElement('div');
    icon.className = 'toast__icon';
    icon.innerHTML = this._getIcon();
    icon.setAttribute('aria-hidden', 'true');

    // Content
    const content = document.createElement('div');
    content.className = 'toast__content';
    
    if (this.options.title) {
      const title = document.createElement('h4');
      title.className = 'toast__title';
      title.textContent = this.options.title;
      content.appendChild(title);
    }

    if (this.options.message) {
      const message = document.createElement('p');
      message.className = 'toast__message';
      message.textContent = this.options.message;
      content.appendChild(message);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'toast__actions';

    // Action button (if provided)
    if (this.options.onAction && this.options.actionText) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast__action-btn';
      actionBtn.textContent = this.options.actionText;
      actionBtn.addEventListener('click', () => {
        this.options.onAction();
        this.dismiss();
      });
      actions.appendChild(actionBtn);
    }

    // Close button
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'toast__close-btn';
    this.closeButton.setAttribute('aria-label', 'Fechar notificação');
    this.closeButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`;
    this.closeButton.addEventListener('click', () => this._handleClose());
    actions.appendChild(this.closeButton);

    // Progress bar (for auto-dismiss)
    if (!this.options.persistent) {
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'toast__progress';
      this.element.appendChild(this.progressBar);
    }

    // Assemble
    this.element.appendChild(icon);
    this.element.appendChild(content);
    this.element.appendChild(actions);

    // Event listeners for pause/resume
    this.element.addEventListener('mouseenter', () => this._pauseDismiss());
    this.element.addEventListener('mouseleave', () => this._resumeDismiss());
    this.element.addEventListener('focusin', () => this._pauseDismiss());
    this.element.addEventListener('focusout', () => this._resumeDismiss());

    // Inject styles
    this._injectStyles();

    // Animate in
    conditionalAnimation(() => 
      slideIn(this.element, 'top', 20, Duration.SLOW)
    );

    // Announce to screen readers
    const announcement = [this.options.title, this.options.message]
      .filter(Boolean)
      .join('. ');
    announce(announcement, this.options.variant === 'error' ? 'assertive' : 'polite');

    // Start auto-dismiss
    this._startDismissTimer();

    return this.element;
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    const styleId = 'toast-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Toast Container */
      .toast-container {
        position: fixed;
        top: var(--spacing-4);
        right: var(--spacing-4);
        z-index: var(--z-toast);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        max-width: 400px;
        width: calc(100% - var(--spacing-4) * 2);
        pointer-events: none;
      }

      /* Mobile: center on top */
      @media (max-width: 640px) {
        .toast-container {
          left: var(--spacing-4);
          right: var(--spacing-4);
          max-width: none;
        }
      }

      /* Toast Base */
      .toast {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-3);
        padding: var(--spacing-3) var(--spacing-4);
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        border-left: 4px solid var(--toast-color);
        position: relative;
        overflow: hidden;
        pointer-events: auto;
        min-height: 60px;
      }

      /* Toast Variants */
      .toast--success {
        --toast-color: var(--color-success);
        --toast-bg: var(--color-success-bg);
      }

      .toast--error {
        --toast-color: var(--color-error);
        --toast-bg: var(--color-error-bg);
      }

      .toast--warning {
        --toast-color: var(--color-warning);
        --toast-bg: var(--color-warning-bg);
      }

      .toast--info {
        --toast-color: var(--color-info);
        --toast-bg: var(--color-info-bg);
      }

      /* Icon */
      .toast__icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        color: var(--toast-color);
        margin-top: 2px;
      }

      /* Content */
      .toast__content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
      }

      .toast__title {
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      }

      .toast__message {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        line-height: var(--line-height-normal);
      }

      /* Actions */
      .toast__actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        flex-shrink: 0;
      }

      /* Action Button */
      .toast__action-btn {
        padding: var(--spacing-1) var(--spacing-2);
        background: none;
        border: none;
        color: var(--toast-color);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: background-color 150ms var(--ease-default);
      }

      .toast__action-btn:hover {
        background-color: var(--toast-bg);
      }

      .toast__action-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: 0;
      }

      /* Close Button */
      .toast__close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        background: none;
        border: none;
        color: var(--color-text-tertiary);
        cursor: pointer;
        border-radius: var(--radius-md);
        transition: all 150ms var(--ease-default);
        flex-shrink: 0;
      }

      .toast__close-btn:hover {
        background-color: var(--color-bg);
        color: var(--color-text-primary);
      }

      .toast__close-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: 0;
      }

      /* Progress Bar */
      .toast__progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background-color: var(--toast-color);
        opacity: 0.3;
        transition: width 16ms linear;
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .toast {
          transition: none;
        }
        
        .toast__progress {
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
    this._clearTimers();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * Toast manager for global toast notifications
 */
export class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
  }

  /**
   * Get or create toast container
   * @returns {HTMLElement}
   * @private
   */
  _getContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  /**
   * Show a toast
   * @param {Object} options
   * @returns {Toast}
   */
  show(options) {
    const toast = new Toast({
      ...options,
      onClose: () => {
        this.toasts = this.toasts.filter(t => t !== toast);
        if (options.onClose) options.onClose();
      }
    });

    const element = toast.render();
    this._getContainer().appendChild(element);
    this.toasts.push(toast);

    return toast;
  }

  /**
   * Show success toast
   * @param {string} message
   * @param {string} title
   */
  success(message, title = 'Sucesso') {
    return this.show({ variant: 'success', title, message });
  }

  /**
   * Show error toast
   * @param {string} message
   * @param {string} title
   */
  error(message, title = 'Erro') {
    return this.show({ variant: 'error', title, message });
  }

  /**
   * Show warning toast
   * @param {string} message
   * @param {string} title
   */
  warning(message, title = 'Aviso') {
    return this.show({ variant: 'warning', title, message });
  }

  /**
   * Show info toast
   * @param {string} message
   * @param {string} title
   */
  info(message, title = 'Informação') {
    return this.show({ variant: 'info', title, message });
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    this.toasts.forEach(t => t.dismiss());
    this.toasts = [];
  }
}

// Singleton instance
export const toast = new ToastManager();

export default Toast;
