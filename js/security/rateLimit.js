/**
 * Rate Limiting Module
 * Client-side rate limiting for API requests and operations
 */

/**
 * Rate limiting configuration tiers
 */
const RateLimitTiers = {
    GENERAL: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
        name: 'API Geral'
    },
    SEARCH: {
        maxRequests: 10,
        windowMs: 60 * 1000, // 1 minute
        name: 'Busca'
    },
    PAYMENT: {
        maxRequests: 5,
        windowMs: 60 * 1000, // 1 minute
        name: 'Pagamento'
    },
    CART: {
        maxRequests: 30,
        windowMs: 60 * 1000, // 1 minute
        name: 'Operações de Carrinho'
    },
    LOGIN: {
        maxRequests: 5,
        windowMs: 5 * 60 * 1000, // 5 minutes
        name: 'Login'
    }
};

/**
 * Rate Limiter class
 * Tracks requests per user/endpoint with sliding window
 */
class RateLimiter {
    constructor() {
        // Storage for rate limit data
        this.requests = new Map();
        
        // Default user identifier (for client-side)
        this.userId = this._generateUserId();
        
        // Cleanup interval (every 5 minutes)
        this.cleanupInterval = setInterval(() => this._cleanup(), 5 * 60 * 1000);
        
        // Event callbacks
        this.onRateLimit = null;
    }

    /**
     * Generate unique user identifier
     * @private
     * @returns {string}
     */
    _generateUserId() {
        try {
            // Try to get from session storage
            let userId = sessionStorage.getItem('rate_limit_user_id');
            if (userId) return userId;
            
            // Generate new ID
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                userId = crypto.randomUUID();
            } else {
                userId = Date.now().toString(36) + Math.random().toString(36).slice(2);
            }
            
            sessionStorage.setItem('rate_limit_user_id', userId);
            return userId;
        } catch (e) {
            return 'anonymous_' + Date.now();
        }
    }

    /**
     * Get rate limit key
     * @private
     * @param {string} endpoint - API endpoint or operation
     * @param {string} tier - Rate limit tier
     * @returns {string}
     */
    _getKey(endpoint, tier) {
        return `${this.userId}:${tier}:${endpoint}`;
    }

    /**
     * Check if request is allowed
     * @param {string} endpoint - API endpoint or operation name
     * @param {string} tier - Rate limit tier key (from RateLimitTiers)
     * @returns {{ allowed: boolean, remaining: number, resetTime: number, retryAfter?: number }}
     */
    checkLimit(endpoint, tier = 'GENERAL') {
        const config = RateLimitTiers[tier];
        if (!config) {
            console.warn(`[RateLimiter] Unknown tier: ${tier}`);
            return { allowed: true, remaining: Infinity, resetTime: 0 };
        }

        const key = this._getKey(endpoint, tier);
        const now = Date.now();
        const windowStart = now - config.windowMs;

        // Get existing requests for this endpoint
        let requests = this.requests.get(key) || [];
        
        // Filter out old requests outside the window
        requests = requests.filter(time => time > windowStart);

        // Check if limit exceeded
        const currentCount = requests.length;
        const remaining = Math.max(0, config.maxRequests - currentCount);
        
        if (currentCount >= config.maxRequests) {
            // Rate limit exceeded
            const oldestRequest = requests[0];
            const resetTime = oldestRequest + config.windowMs;
            const retryAfter = Math.ceil((resetTime - now) / 1000);

            // Trigger callback if set
            if (this.onRateLimit) {
                this.onRateLimit({
                    endpoint,
                    tier,
                    retryAfter,
                    limit: config.maxRequests,
                    window: config.windowMs
                });
            }

            return {
                allowed: false,
                remaining: 0,
                resetTime,
                retryAfter
            };
        }

        // Request is allowed
        const resetTime = now + config.windowMs;
        
        return {
            allowed: true,
            remaining,
            resetTime
        };
    }

    /**
     * Track a request
     * @param {string} endpoint - API endpoint or operation name
     * @param {string} tier - Rate limit tier
     */
    trackRequest(endpoint, tier = 'GENERAL') {
        const config = RateLimitTiers[tier];
        if (!config) return;

        const key = this._getKey(endpoint, tier);
        const now = Date.now();
        const windowStart = now - config.windowMs;

        let requests = this.requests.get(key) || [];
        
        // Clean old requests
        requests = requests.filter(time => time > windowStart);
        
        // Add new request
        requests.push(now);
        
        // Store updated requests
        this.requests.set(key, requests);
    }

    /**
     * Check and track in one call
     * @param {string} endpoint - API endpoint or operation name
     * @param {string} tier - Rate limit tier
     * @returns {{ allowed: boolean, remaining: number, resetTime: number, retryAfter?: number }}
     */
    checkAndTrack(endpoint, tier = 'GENERAL') {
        const result = this.checkLimit(endpoint, tier);
        
        if (result.allowed) {
            this.trackRequest(endpoint, tier);
        }
        
        return result;
    }

    /**
     * Get current rate limit status
     * @param {string} endpoint - API endpoint or operation name
     * @param {string} tier - Rate limit tier
     * @returns {{ count: number, limit: number, remaining: number, resetTime: number }}
     */
    getStatus(endpoint, tier = 'GENERAL') {
        const config = RateLimitTiers[tier];
        if (!config) {
            return { count: 0, limit: Infinity, remaining: Infinity, resetTime: 0 };
        }

        const key = this._getKey(endpoint, tier);
        const now = Date.now();
        const windowStart = now - config.windowMs;

        let requests = this.requests.get(key) || [];
        requests = requests.filter(time => time > windowStart);

        const count = requests.length;
        const remaining = Math.max(0, config.maxRequests - count);
        const resetTime = requests.length > 0 
            ? requests[0] + config.windowMs 
            : now + config.windowMs;

        return {
            count,
            limit: config.maxRequests,
            remaining,
            resetTime
        };
    }

    /**
     * Clean up old entries
     * @private
     */
    _cleanup() {
        const now = Date.now();
        const maxWindow = Math.max(...Object.values(RateLimitTiers).map(t => t.windowMs));
        const cutoff = now - maxWindow;

        for (const [key, requests] of this.requests) {
            const validRequests = requests.filter(time => time > cutoff);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validRequests);
            }
        }
    }

    /**
     * Reset rate limit for an endpoint
     * @param {string} endpoint - API endpoint or operation name
     * @param {string} tier - Rate limit tier
     */
    reset(endpoint, tier = 'GENERAL') {
        const key = this._getKey(endpoint, tier);
        this.requests.delete(key);
    }

    /**
     * Reset all rate limits
     */
    resetAll() {
        this.requests.clear();
    }

    /**
     * Set rate limit exceeded callback
     * @param {Function} callback - Function called when rate limit is exceeded
     */
    setOnRateLimit(callback) {
        this.onRateLimit = callback;
    }

    /**
     * Destroy rate limiter (cleanup)
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.requests.clear();
    }
}

/**
 * Rate limiting middleware for fetch
 * Automatically applies rate limiting to requests
 */
class RateLimitMiddleware {
    constructor(rateLimiter) {
        this.rateLimiter = rateLimiter || new RateLimiter();
        this.originalFetch = null;
        this.isActive = false;
    }

    /**
     * Install middleware
     */
    install() {
        if (this.isActive) return;

        this.originalFetch = window.fetch;
        const self = this;

        window.fetch = async function(url, options = {}) {
            const method = (options.method || 'GET').toUpperCase();
            
            // Only rate limit state-changing requests
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                const endpoint = self._extractEndpoint(url);
                
                // Determine tier based on URL pattern
                const tier = self._determineTier(url);
                
                const result = self.rateLimiter.checkAndTrack(endpoint, tier);
                
                if (!result.allowed) {
                    const error = new Error(`Rate limit exceeded. Retry after ${result.retryAfter}s`);
                    error.name = 'RateLimitError';
                    error.retryAfter = result.retryAfter;
                    throw error;
                }
            }

            return self.originalFetch.call(this, url, options);
        };

        this.isActive = true;
    }

    /**
     * Uninstall middleware
     */
    uninstall() {
        if (!this.isActive || !this.originalFetch) return;
        
        window.fetch = this.originalFetch;
        this.isActive = false;
    }

    /**
     * Extract endpoint identifier from URL
     * @private
     * @param {string} url
     * @returns {string}
     */
    _extractEndpoint(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname;
        } catch (e) {
            return url;
        }
    }

    /**
     * Determine rate limit tier based on URL
     * @private
     * @param {string} url
     * @returns {string}
     */
    _determineTier(url) {
        const lowerUrl = url.toLowerCase();
        
        if (lowerUrl.includes('payment') || lowerUrl.includes('checkout') || lowerUrl.includes('pay')) {
            return 'PAYMENT';
        }
        if (lowerUrl.includes('search') || lowerUrl.includes('find') || lowerUrl.includes('query')) {
            return 'SEARCH';
        }
        if (lowerUrl.includes('cart') || lowerUrl.includes('item')) {
            return 'CART';
        }
        if (lowerUrl.includes('login') || lowerUrl.includes('auth')) {
            return 'LOGIN';
        }
        
        return 'GENERAL';
    }
}

/**
 * Operation rate limiter
 * For limiting user operations (cart operations, etc.)
 */
class OperationRateLimiter {
    constructor(rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    /**
     * Check if cart operation is allowed
     * @param {string} operation - Operation name (add, remove, update)
     * @returns {{ allowed: boolean, retryAfter?: number }}
     */
    checkCartOperation(operation) {
        const result = this.rateLimiter.checkAndTrack(`cart:${operation}`, 'CART');
        return {
            allowed: result.allowed,
            retryAfter: result.retryAfter
        };
    }

    /**
     * Check if checkout is allowed
     * @returns {{ allowed: boolean, retryAfter?: number }}
     */
    checkCheckout() {
        const result = this.rateLimiter.checkAndTrack('checkout', 'PAYMENT');
        return {
            allowed: result.allowed,
            retryAfter: result.retryAfter
        };
    }

    /**
     * Check if payment is allowed
     * @returns {{ allowed: boolean, retryAfter?: number }}
     */
    checkPayment() {
        const result = this.rateLimiter.checkAndTrack('payment', 'PAYMENT');
        return {
            allowed: result.allowed,
            retryAfter: result.retryAfter
        };
    }

    /**
     * Check if search is allowed
     * @returns {{ allowed: boolean, retryAfter?: number }}
     */
    checkSearch() {
        const result = this.rateLimiter.checkAndTrack('search', 'SEARCH');
        return {
            allowed: result.allowed,
            retryAfter: result.retryAfter
        };
    }

    /**
     * Get remaining operations info
     * @returns {Object}
     */
    getStatus() {
        return {
            cart: this.rateLimiter.getStatus('cart:add', 'CART'),
            checkout: this.rateLimiter.getStatus('checkout', 'PAYMENT'),
            payment: this.rateLimiter.getStatus('payment', 'PAYMENT'),
            search: this.rateLimiter.getStatus('search', 'SEARCH')
        };
    }
}

/**
 * Rate limit error
 */
class RateLimitError extends Error {
    constructor(message, retryAfter) {
        super(message);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

// Create singleton instances
const rateLimiter = new RateLimiter();
const rateLimitMiddleware = new RateLimitMiddleware(rateLimiter);
const operationRateLimiter = new OperationRateLimiter(rateLimiter);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RateLimiter,
        RateLimitMiddleware,
        OperationRateLimiter,
        RateLimitTiers,
        RateLimitError,
        rateLimiter,
        rateLimitMiddleware,
        operationRateLimiter
    };
}

// Expose globally
window.RateLimiter = RateLimiter;
window.RateLimitMiddleware = RateLimitMiddleware;
window.OperationRateLimiter = OperationRateLimiter;
window.RateLimitTiers = RateLimitTiers;
window.RateLimitError = RateLimitError;
window.rateLimiter = rateLimiter;
window.rateLimitMiddleware = rateLimitMiddleware;
window.operationRateLimiter = operationRateLimiter;
