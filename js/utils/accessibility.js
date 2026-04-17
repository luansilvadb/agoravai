/**
 * Accessibility Utilities
 * Helpers for WCAG 2.2 AA compliance including focus management,
 * screen reader announcements, and keyboard navigation
 * 
 * @see design.md for accessibility specifications
 */

/**
 * Create a live region for screen reader announcements
 * @param {string} id - Unique ID for the region
 * @param {'polite'|'assertive'} priority - Announcement priority
 * @returns {HTMLElement} The created live region
 */
export function createLiveRegion(id, priority = 'polite') {
  let region = document.getElementById(id);
  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.style.position = 'absolute';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.padding = '0';
    region.style.margin = '-1px';
    region.style.overflow = 'hidden';
    region.style.clip = 'rect(0, 0, 0, 0)';
    region.style.whiteSpace = 'nowrap';
    region.style.border = '0';
    document.body.appendChild(region);
  }
  return region;
}

/**
 * Announce a message to screen readers
 * @param {string} message - Message to announce
 * @param {'polite'|'assertive'} priority - Announcement priority
 */
export function announce(message, priority = 'polite') {
  const regionId = `sr-announce-${priority}`;
  const region = createLiveRegion(regionId, priority);
  
  // Clear and set new message after a brief delay to ensure announcement
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
  }, 100);
}

/**
 * Focus trap for modals and drawers
 * Keeps focus within a container element
 */
export class FocusTrap {
  /**
   * @param {HTMLElement} container - Container to trap focus within
   */
  constructor(container) {
    this.container = container;
    this.previousFocus = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Get all focusable elements within the container
   * @returns {HTMLElement[]}
   */
  getFocusableElements() {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(', ');
    
    return Array.from(this.container.querySelectorAll(selectors))
      .filter(el => el.offsetParent !== null); // Only visible elements
  }

  /**
   * Handle Tab key to trap focus
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    if (event.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Activate the focus trap
   */
  activate() {
    this.previousFocus = document.activeElement;
    this.container.addEventListener('keydown', this.handleKeyDown);
    
    // Focus first focusable element
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Deactivate the focus trap and restore previous focus
   */
  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }
}

/**
 * Skip link manager for keyboard navigation
 * Creates and manages skip links for accessibility
 */
export class SkipLinkManager {
  /**
   * @param {Object[]} links - Array of skip link definitions
   * @param {string} links[].label - Link text
   * @param {string} links[].target - Target element ID or selector
   */
  constructor(links) {
    this.links = links;
    this.container = null;
  }

  /**
   * Render skip links
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'skip-links';
    this.container.setAttribute('role', 'navigation');
    this.container.setAttribute('aria-label', 'Skip links');
    
    this.links.forEach(link => {
      const a = document.createElement('a');
      a.href = `#${link.target}`;
      a.textContent = link.label;
      a.className = 'skip-link';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.target);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
      this.container.appendChild(a);
    });

    document.body.insertBefore(this.container, document.body.firstChild);
  }
}

/**
 * Apply focus visible styles programmatically
 * Adds :focus-visible behavior for browsers that don't support it
 */
export function setupFocusVisible() {
  document.body.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
  });

  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.remove('using-mouse');
    }
  });
}

/**
 * Generate unique ID for ARIA relationships
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'a11y') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set ARIA described by relationship
 * @param {HTMLElement} element - Element to describe
 * @param {HTMLElement|string} description - Description element or ID
 */
export function setAriaDescribedBy(element, description) {
  const descriptionId = typeof description === 'string' 
    ? description 
    : description.id || generateId('desc');
    
  if (typeof description !== 'string' && !description.id) {
    description.id = descriptionId;
  }
  
  element.setAttribute('aria-describedby', descriptionId);
}

/**
 * Keyboard shortcut manager
 * Handles keyboard shortcuts for the application
 */
export class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Register a keyboard shortcut
   * @param {string} key - Key to listen for (e.g., 'Escape', '/')
   * @param {Function} handler - Handler function
   * @param {Object} options - Options
   * @param {boolean} options.ctrl - Require Ctrl key
   * @param {boolean} options.shift - Require Shift key
   * @param {boolean} options.alt - Require Alt key
   * @param {string} options.context - Only active in this context selector
   */
  register(key, handler, options = {}) {
    this.shortcuts.set(key, { handler, options });
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    const key = event.key;
    const shortcut = this.shortcuts.get(key);
    
    if (!shortcut) return;

    const { handler, options } = shortcut;

    // Check modifier keys
    if (options.ctrl && !event.ctrlKey) return;
    if (options.shift && !event.shiftKey) return;
    if (options.alt && !event.altKey) return;

    // Check context
    if (options.context) {
      const contextElement = document.querySelector(options.context);
      if (!contextElement || !contextElement.contains(document.activeElement)) {
        return;
      }
    }

    event.preventDefault();
    handler(event);
  }

  /**
   * Activate keyboard shortcuts
   */
  activate() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Deactivate keyboard shortcuts
   */
  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

/**
 * Check if element is focusable
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isFocusable(element) {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Focus first element within container
 * @param {HTMLElement} container
 * @returns {boolean} True if an element was focused
 */
export function focusFirst(container) {
  const focusable = container.querySelector('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) {
    focusable.focus();
    return true;
  }
  return false;
}

/**
 * Announce cart updates to screen readers
 * @param {string} action - Action type ('add', 'remove', 'update')
 * @param {Object} item - Cart item
 * @param {number} quantity - Quantity
 */
export function announceCartUpdate(action, item, quantity) {
  const messages = {
    add: `${item.name} adicionado ao carrinho. Quantidade: ${quantity}`,
    remove: `${item.name} removido do carrinho`,
    update: `${item.name} atualizado. Nova quantidade: ${quantity}`,
  };
  
  announce(messages[action] || messages.update, 'polite');
}

/**
 * Setup touch target size validation
 * Logs warnings in development for elements that don't meet WCAG 2.5.8
 */
export function validateTouchTargets() {
  if (process.env.NODE_ENV === 'production') return;
  
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [onclick]'
  );
  
  interactiveElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 24 || rect.height < 24) {
      console.warn('Touch target too small (< 24x24px):', el);
    }
  });
}
