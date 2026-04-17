/**
 * Security Configuration Module
 * Handles environment variables and secrets management for the PDV System
 * 
 * For client-side applications, configuration is loaded from:
 * 1. window.ENV (runtime injected config)
 * 2. localStorage (user preferences, non-sensitive)
 * 3. Default values (fallbacks)
 */

/**
 * SecureError class for configuration errors
 * Does not expose sensitive data in error messages
 */
class ConfigError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'ConfigError';
        this.code = code;
    }
}

/**
 * Configuration manager for secrets and environment variables
 */
class SecurityConfig {
    constructor() {
        this._config = new Map();
        this._initialized = false;
        this._requiredVars = new Set();
        this._sensitivePatterns = ['password', 'secret', 'token', 'key', 'private', 'credential'];
    }

    /**
     * Initialize configuration from available sources
     * @param {Object} runtimeConfig - Optional runtime configuration object
     * @param {boolean} strict - If true, throw error on missing required vars
     */
    init(runtimeConfig = {}, strict = false) {
        // Load from runtime config (injected at build/deploy time)
        this._loadFromObject(runtimeConfig);

        // Load from meta tags (for static hosting)
        this._loadFromMetaTags();

        // Set defaults for non-sensitive config
        this._setDefaults();

        // Validate required variables
        if (strict) {
            this._validateRequired();
        }

        this._initialized = true;
        console.log('[SecurityConfig] Initialized successfully');
    }

    /**
     * Load configuration from plain object
     * @private
     * @param {Object} config
     */
    _loadFromObject(config) {
        for (const [key, value] of Object.entries(config)) {
            if (value !== undefined && value !== null && value !== '') {
                this._config.set(key, value);
            }
        }
    }

    /**
     * Load configuration from meta tags
     * @private
     */
    _loadFromMetaTags() {
        const metaTags = document.querySelectorAll('meta[name^="env-"]');
        metaTags.forEach(tag => {
            const key = tag.name.replace('env-', '');
            const value = tag.content;
            if (value) {
                this._config.set(key, value);
            }
        });
    }

    /**
     * Set default values for configuration
     * @private
     */
    _setDefaults() {
        const defaults = {
            // Rate limiting defaults
            RATE_LIMIT_GENERAL: 100,
            RATE_LIMIT_SEARCH: 10,
            RATE_LIMIT_PAYMENT: 5,

            // Upload defaults
            MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
            ALLOWED_FILE_TYPES: 'jpg,png,gif',

            // Feature flags
            ENABLE_POS_PREMIUM: false,
            SECURITY_REPORT_ONLY: false,

            // Environment
            NODE_ENV: 'development',
            DEBUG_ERRORS: true,

            // CSP nonce (generated if not provided)
            CSP_NONCE: this._generateNonce()
        };

        for (const [key, value] of Object.entries(defaults)) {
            if (!this._config.has(key)) {
                this._config.set(key, value);
            }
        }
    }

    /**
     * Generate a cryptographically secure nonce
     * @private
     * @returns {string}
     */
    _generateNonce() {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
        // Fallback for older browsers
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    /**
     * Validate that all required variables are present
     * @private
     */
    _validateRequired() {
        const missing = [];
        for (const key of this._requiredVars) {
            if (!this._config.has(key) || this._config.get(key) === '') {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            throw new ConfigError(
                `Missing required configuration variables: ${missing.join(', ')}`,
                'MISSING_REQUIRED_CONFIG'
            );
        }
    }

    /**
     * Mark a variable as required
     * @param {string} name - Variable name
     */
    require(name) {
        this._requiredVars.add(name);
        return this;
    }

    /**
     * Mark multiple variables as required
     * @param {string[]} names - Variable names
     */
    requireMany(names) {
        names.forEach(name => this.require(name));
        return this;
    }

    /**
     * Get environment variable value
     * @param {string} name - Variable name
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Variable value or default
     */
    get(name, defaultValue = undefined) {
        if (!this._initialized) {
            console.warn('[SecurityConfig] Accessing config before initialization');
        }
        return this._config.has(name) ? this._config.get(name) : defaultValue;
    }

    /**
     * Get environment variable value (required)
     * @param {string} name - Variable name
     * @returns {*} Variable value
     * @throws {ConfigError} If variable is not set
     */
    getRequired(name) {
        const value = this.get(name);
        if (value === undefined || value === null || value === '') {
            throw new ConfigError(
                `Required configuration variable "${name}" is not set`,
                'MISSING_CONFIG'
            );
        }
        return value;
    }

    /**
     * Get string value
     * @param {string} name - Variable name
     * @param {string} defaultValue - Default value
     * @returns {string}
     */
    getString(name, defaultValue = '') {
        const value = this.get(name, defaultValue);
        return String(value);
    }

    /**
     * Get integer value
     * @param {string} name - Variable name
     * @param {number} defaultValue - Default value
     * @returns {number}
     */
    getInt(name, defaultValue = 0) {
        const value = this.get(name, defaultValue);
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Get boolean value
     * @param {string} name - Variable name
     * @param {boolean} defaultValue - Default value
     * @returns {boolean}
     */
    getBool(name, defaultValue = false) {
        const value = this.get(name, defaultValue);
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
    }

    /**
     * Set a configuration value
     * @param {string} name - Variable name
     * @param {*} value - Value to set
     */
    set(name, value) {
        this._config.set(name, value);
    }

    /**
     * Check if running in production
     * @returns {boolean}
     */
    isProduction() {
        return this.getString('NODE_ENV') === 'production';
    }

    /**
     * Check if running in development
     * @returns {boolean}
     */
    isDevelopment() {
        return this.getString('NODE_ENV') === 'development';
    }

    /**
     * Check if debug errors are enabled
     * @returns {boolean}
     */
    isDebugEnabled() {
        return this.getBool('DEBUG_ERRORS', false);
    }

    /**
     * Check if a variable is sensitive (should be redacted in logs)
     * @param {string} name - Variable name
     * @returns {boolean}
     */
    isSensitive(name) {
        const lowerName = name.toLowerCase();
        return this._sensitivePatterns.some(pattern => lowerName.includes(pattern));
    }

    /**
     * Get config snapshot for logging (sensitive values redacted)
     * @returns {Object}
     */
    getSafeSnapshot() {
        const snapshot = {};
        for (const [key, value] of this._config) {
            snapshot[key] = this.isSensitive(key) ? '[REDACTED]' : value;
        }
        return snapshot;
    }

    /**
     * Get all configuration values
     * @returns {Object}
     */
    getAll() {
        const all = {};
        for (const [key, value] of this._config) {
            all[key] = value;
        }
        return all;
    }

    /**
     * Check if configuration is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this._initialized;
    }
}

// Create singleton instance
const securityConfig = new SecurityConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityConfig, ConfigError, securityConfig };
}

// Expose globally
window.SecurityConfig = SecurityConfig;
window.ConfigError = ConfigError;
window.securityConfig = securityConfig;
