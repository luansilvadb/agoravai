/**
 * XSS Protection Module
 * Sanitization utilities using DOMPurify
 */

// DOMPurify will be loaded from CDN or available globally
let DOMPurify;
if (typeof require !== 'undefined') {
    DOMPurify = require('isomorphic-dompurify');
} else if (typeof window !== 'undefined' && window.DOMPurify) {
    DOMPurify = window.DOMPurify;
}

/**
 * XSS protection configuration
 */
const XSSConfig = {
    // Allowed tags for basic formatting
    BASIC_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],

    // Allowed attributes for basic formatting
    BASIC_ATTRS: ['class'],

    // Dangerous patterns to detect
    DANGEROUS_PATTERNS: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // Event handlers: onclick=, onerror=, etc.
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /<form/gi,
    ],

    // Character entity mappings for HTML escaping
    HTML_ENTITIES: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    },
};

/**
 * DOMPurify configurations
 */
const PurifyConfigs = {
    // Default: Remove all HTML, keep only text
    textOnly: {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
    },

    // Basic formatting: Allow simple text formatting
    basicFormat: {
        ALLOWED_TAGS: XSSConfig.BASIC_TAGS,
        ALLOWED_ATTR: XSSConfig.BASIC_ATTRS,
    },

    // Strict: No HTML at all
    strict: {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: false,
    },

    // Rich text: More formatting options (use with caution)
    richText: {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div',
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'a', 'img', 'blockquote', 'code', 'pre'
        ],
        ALLOWED_ATTR: [
            'class', 'id', 'href', 'title', 'alt', 'src',
            'target', 'rel', 'width', 'height'
        ],
        ALLOW_DATA_ATTR: false,
    },
};

/**
 * XSS Protection utilities
 */
const XSSProtection = {
    /**
     * Check if DOMPurify is available
     * @returns {boolean}
     */
    isReady() {
        return typeof DOMPurify !== 'undefined' && DOMPurify.sanitize;
    },

    /**
     * Initialize DOMPurify with custom hooks
     */
    init() {
        if (!this.isReady()) {
            console.warn('[XSSProtection] DOMPurify not available');
            return;
        }

        // Add hook to remove all event handlers
        DOMPurify.addHook('afterSanitizeAttributes', (node) => {
            // Remove all event attributes
            const attrs = node.attributes;
            if (attrs) {
                for (let i = attrs.length - 1; i >= 0; i--) {
                    const attr = attrs[i];
                    if (attr && attr.name && attr.name.toLowerCase().startsWith('on')) {
                        node.removeAttribute(attr.name);
                    }
                }
            }

            // Force safe target for links
            if (node.tagName === 'A' && node.hasAttribute('target')) {
                node.setAttribute('rel', 'noopener noreferrer');
            }
        });

        console.log('[XSSProtection] Initialized successfully');
    },

    /**
     * Sanitize HTML string
     * @param {string} html - HTML string to sanitize
     * @param {string|Object} config - Configuration name or custom config
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html, config = 'textOnly') {
        if (!html || typeof html !== 'string') return '';

        if (!this.isReady()) {
            // Fallback: strip all HTML tags
            return this.stripHtml(html);
        }

        const purifyConfig = typeof config === 'string'
            ? (PurifyConfigs[config] || PurifyConfigs.textOnly)
            : config;

        return DOMPurify.sanitize(html, purifyConfig);
    },

    /**
     * Sanitize HTML allowing basic formatting
     * @param {string} html - HTML string
     * @returns {string} Sanitized HTML with basic formatting
     */
    sanitizeBasicHtml(html) {
        return this.sanitizeHtml(html, 'basicFormat');
    },

    /**
     * Strip all HTML tags, keep only text
     * @param {string} html - HTML string
     * @returns {string} Plain text
     */
    stripHtml(html) {
        if (!html || typeof html !== 'string') return '';
        return html.replace(/<[^>]*>/g, '');
    },

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str || typeof str !== 'string') return '';

        return str.replace(/[&<>"'/]/g, (char) => XSSConfig.HTML_ENTITIES[char] || char);
    },

    /**
     * Unescape HTML entities
     * @param {string} str - String to unescape
     * @returns {string} Unescaped string
     */
    unescapeHtml(str) {
        if (!str || typeof html !== 'string') return '';

        const textarea = document.createElement('textarea');
        textarea.innerHTML = str;
        return textarea.value;
    },

    /**
     * Safe text content - recommended for most text insertion
     * @param {string} text - Text to sanitize
     * @returns {string} Text safe for textContent
     */
    safeTextContent(text) {
        if (!text || typeof text !== 'string') return '';
        // For textContent, we just need to ensure it's a string
        // The browser handles the rest
        return String(text);
    },

    /**
     * Check if string contains potentially dangerous content
     * @param {string} str - String to check
     * @returns {boolean} True if dangerous content detected
     */
    isDangerous(str) {
        if (!str || typeof str !== 'string') return false;

        return XSSConfig.DANGEROUS_PATTERNS.some(pattern => pattern.test(str));
    },

    /**
     * Sanitize URL to prevent javascript: protocol
     * @param {string} url - URL to sanitize
     * @param {string} defaultUrl - Default URL if invalid
     * @returns {string} Safe URL
     */
    sanitizeUrl(url, defaultUrl = '#') {
        if (!url || typeof url !== 'string') return defaultUrl;

        // Check for javascript: protocol
        const sanitized = url.trim().toLowerCase();
        if (sanitized.startsWith('javascript:') ||
            sanitized.startsWith('data:') ||
            sanitized.startsWith('vbscript:')) {
            return defaultUrl;
        }

        return url;
    },

    /**
     * Sanitize CSS value to prevent injection
     * @param {string} value - CSS value to sanitize
     * @returns {string} Sanitized CSS value
     */
    sanitizeCss(value) {
        if (!value || typeof value !== 'string') return '';

        // Remove dangerous CSS expressions and behaviors
        return value
            .replace(/expression\s*\(/gi, '')
            .replace(/javascript\s*:/gi, '')
            .replace(/behavior\s*:/gi, '');
    },

    /**
     * Create a safe HTML template literal handler
     * Usage: html`Hello ${userName}`
     * @param {string[]} strings - Template strings
     * @param {...*} values - Interpolated values
     * @returns {string} Safe HTML string
     */
    html(strings, ...values) {
        return strings.reduce((result, str, i) => {
            const value = values[i];
            if (value === undefined || value === null) {
                return result + str;
            }
            // Escape all interpolated values
            return result + str + this.escapeHtml(String(value));
        }, '');
    },

    /**
     * Safely set innerHTML with sanitization
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML string
     * @param {string|Object} config - Sanitization config
     */
    setInnerHTML(element, html, config = 'textOnly') {
        if (!element || !(element instanceof HTMLElement)) {
            console.warn('[XSSProtection] Invalid element provided to setInnerHTML');
            return;
        }

        element.innerHTML = this.sanitizeHtml(html, config);
    },

    /**
     * Safely set textContent (always safe)
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text content
     */
    setTextContent(element, text) {
        if (!element || !(element instanceof HTMLElement)) {
            console.warn('[XSSProtection] Invalid element provided to setTextContent');
            return;
        }

        element.textContent = this.safeTextContent(text);
    },
};

/**
 * Safe DOM manipulation utilities
 */
const SafeDOM = {
    /**
     * Create element with safe attributes
     * @param {string} tag - Tag name
     * @param {Object} attrs - Attributes (will be escaped)
     * @param {string} textContent - Text content
     * @returns {HTMLElement}
     */
    createElement(tag, attrs = {}, textContent = '') {
        const element = document.createElement(tag);

        // Set attributes safely
        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'style') {
                // Style needs special handling
                Object.assign(element.style, value);
            } else if (key.startsWith('on')) {
                // Reject event handlers
                console.warn(`[SafeDOM] Rejected event handler attribute: ${key}`);
            } else if (key === 'href' || key === 'src') {
                // Sanitize URLs
                element.setAttribute(key, XSSProtection.sanitizeUrl(value));
            } else {
                element.setAttribute(key, XSSProtection.escapeHtml(String(value)));
            }
        }

        // Set text content safely
        if (textContent) {
            element.textContent = XSSProtection.safeTextContent(textContent);
        }

        return element;
    },

    /**
     * Safely insert HTML at position
     * @param {HTMLElement} element - Target element
     * @param {string} position - 'beforebegin', 'afterbegin', 'beforeend', 'afterend'
     * @param {string} html - HTML string (will be sanitized)
     */
    insertHTML(element, position, html) {
        if (!element || !(element instanceof HTMLElement)) {
            console.warn('[SafeDOM] Invalid element provided to insertHTML');
            return;
        }

        const sanitized = XSSProtection.sanitizeHtml(html, 'basicFormat');
        element.insertAdjacentHTML(position, sanitized);
    },

    /**
     * Safely append child
     * @param {HTMLElement} parent - Parent element
     * @param {HTMLElement} child - Child element
     */
    appendChild(parent, child) {
        if (!parent || !child) {
            console.warn('[SafeDOM] Invalid elements provided to appendChild');
            return;
        }
        parent.appendChild(child);
    },

    /**
     * Remove all children safely
     * @param {HTMLElement} element - Element to clear
     */
    clearChildren(element) {
        if (!element) return;
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => XSSProtection.init());
    } else {
        XSSProtection.init();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        XSSProtection,
        SafeDOM,
        XSSConfig,
        PurifyConfigs,
    };
}

// Expose globally
window.XSSProtection = XSSProtection;
window.SafeDOM = SafeDOM;
window.XSSConfig = XSSConfig;
