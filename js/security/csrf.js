/**
 * CSRF Protection Module
 * Cross-Site Request Forgery protection utilities
 */

/**
 * CSRF Token Manager
 * Handles generation, storage, and validation of CSRF tokens
 */
class CsrfManager {
    constructor() {
        this.tokenKey = 'csrf_token';
        this.sessionKey = 'csrf_session';
        this.token = null;
        this.headerName = 'X-CSRF-Token';
    }

    /**
     * Initialize CSRF protection
     * Generates or retrieves existing token
     */
    init() {
        // Try to get existing token from storage
        this.token = this._getStoredToken();
        
        if (!this.token) {
            // Generate new token
            this.token = this.generateToken();
            this._storeToken(this.token);
        }

        // Setup fetch interceptor
        this._setupFetchInterceptor();

        console.log('[CSRF] Protection initialized');
    }

    /**
     * Generate cryptographically secure CSRF token
     * @returns {string} CSRF token
     */
    generateToken() {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            // Use crypto.getRandomValues for browser environment
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        } else {
            // Fallback for environments without crypto
            return this._generateFallbackToken();
        }
    }

    /**
     * Generate fallback token (less secure, only for legacy browsers)
     * @private
     * @returns {string}
     */
    _generateFallbackToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        const timestamp = Date.now().toString(36);
        
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return timestamp + token;
    }

    /**
     * Get current CSRF token
     * @returns {string|null}
     */
    getToken() {
        return this.token;
    }

    /**
     * Validate a CSRF token against the stored token
     * @param {string} token - Token to validate
     * @returns {boolean}
     */
    validateToken(token) {
        if (!token || !this.token) {
            return false;
        }
        
        // Use constant-time comparison to prevent timing attacks
        return this._constantTimeCompare(token, this.token);
    }

    /**
     * Constant-time string comparison to prevent timing attacks
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {boolean}
     */
    _constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }

    /**
     * Store token in sessionStorage (more secure than localStorage for session-based tokens)
     * @private
     * @param {string} token
     */
    _storeToken(token) {
        try {
            // Use sessionStorage for CSRF token (cleared when tab closes)
            sessionStorage.setItem(this.tokenKey, token);
            
            // Also store in a cookie with SameSite for double-submit cookie pattern
            this._setCookie(token);
        } catch (e) {
            console.warn('[CSRF] Failed to store token:', e);
        }
    }

    /**
     * Get stored token from sessionStorage
     * @private
     * @returns {string|null}
     */
    _getStoredToken() {
        try {
            return sessionStorage.getItem(this.tokenKey);
        } catch (e) {
            console.warn('[CSRF] Failed to retrieve token:', e);
            return null;
        }
    }

    /**
     * Set CSRF token as cookie (for double-submit pattern)
     * @private
     * @param {string} token
     */
    _setCookie(token) {
        // Cookie with SameSite=Strict prevents cross-origin requests
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${this.tokenKey}=${token}; Path=/; SameSite=Strict${secure}`;
    }

    /**
     * Get CSRF token from cookie
     * @returns {string|null}
     */
    getCookieToken() {
        const match = document.cookie.match(new RegExp(`${this.tokenKey}=([^;]+)`));
        return match ? match[1] : null;
    }

    /**
     * Clear stored token (logout)
     */
    clearToken() {
        this.token = null;
        try {
            sessionStorage.removeItem(this.tokenKey);
        } catch (e) {
            console.warn('[CSRF] Failed to clear token:', e);
        }
        
        // Clear cookie
        document.cookie = `${this.tokenKey}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    }

    /**
     * Refresh token (after security-sensitive operations)
     */
    refreshToken() {
        this.clearToken();
        this.token = this.generateToken();
        this._storeToken(this.token);
        return this.token;
    }

    /**
     * Get the CSRF header name
     * @returns {string}
     */
    getHeaderName() {
        return this.headerName;
    }

    /**
     * Setup fetch interceptor to automatically add CSRF token
     * @private
     */
    _setupFetchInterceptor() {
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = function(url, options = {}) {
            // Only add CSRF token for state-changing methods
            const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
            const method = (options.method || 'GET').toUpperCase();

            if (stateChangingMethods.includes(method)) {
                options = self._addCsrfHeader(options);
            }

            return originalFetch.call(this, url, options);
        };

        // Store reference to restore if needed
        window._originalFetch = originalFetch;
    }

    /**
     * Add CSRF header to fetch options
     * @private
     * @param {Object} options
     * @returns {Object}
     */
    _addCsrfHeader(options) {
        const token = this.getToken();
        if (!token) {
            console.warn('[CSRF] No token available for request');
            return options;
        }

        // Clone options to avoid mutating original
        const newOptions = { ...options };
        
        // Create or clone headers
        newOptions.headers = newOptions.headers ? 
            (newOptions.headers instanceof Headers ? 
                new Headers(newOptions.headers) : 
                { ...newOptions.headers }) : 
            {};

        // Add CSRF token header
        newOptions.headers[this.headerName] = token;

        return newOptions;
    }

    /**
     * Create form with CSRF token hidden field
     * @returns {HTMLInputElement} Hidden input element
     */
    createFormToken() {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_csrf_token';
        input.value = this.getToken() || '';
        return input;
    }

    /**
     * Add CSRF token to form element
     * @param {HTMLFormElement} form
     */
    addTokenToForm(form) {
        if (!(form instanceof HTMLFormElement)) {
            console.warn('[CSRF] Invalid form element');
            return;
        }

        // Remove existing token if present
        const existing = form.querySelector('input[name="_csrf_token"]');
        if (existing) {
            existing.remove();
        }

        // Add new token
        form.appendChild(this.createFormToken());
    }

    /**
     * Validate request CSRF token (for server-side validation)
     * @param {string} requestToken - Token from request header/body
     * @returns {boolean}
     */
    validateRequest(requestToken) {
        return this.validateToken(requestToken);
    }

    /**
     * Double-submit cookie validation
     * Validates that header token matches cookie token
     * @param {string} headerToken - Token from request header
     * @returns {boolean}
     */
    validateDoubleSubmit(headerToken) {
        const cookieToken = this.getCookieToken();
        
        if (!headerToken || !cookieToken) {
            return false;
        }

        return this._constantTimeCompare(headerToken, cookieToken);
    }
}

// Create singleton instance
const csrfManager = new CsrfManager();

/**
 * CSRF-protected fetch wrapper
 * Automatically adds CSRF tokens to state-changing requests
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
function csrfFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    if (stateChangingMethods.includes(method)) {
        const token = csrfManager.getToken();
        if (!token) {
            return Promise.reject(new Error('CSRF token not available'));
        }

        options.headers = options.headers || {};
        options.headers[csrfManager.getHeaderName()] = token;
    }

    return fetch(url, options);
}

/**
 * CSRF Error class
 */
class CsrfError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'CsrfError';
        this.code = code;
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => csrfManager.init());
    } else {
        csrfManager.init();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CsrfManager,
        csrfManager,
        csrfFetch,
        CsrfError,
    };
}

// Expose globally
window.CsrfManager = CsrfManager;
window.csrfManager = csrfManager;
window.csrfFetch = csrfFetch;
window.CsrfError = CsrfError;
