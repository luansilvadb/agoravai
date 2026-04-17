/**
 * Secure Error Handling Module
 * Centralized error handling with sensitive data redaction
 */

/**
 * Sensitive data patterns for redaction
 */
const SENSITIVE_PATTERNS = [
    // Keys and tokens
    /api[_-]?key["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-]{16,})/gi,
    /auth[_-]?token["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{16,})/gi,
    /bearer\s+([a-zA-Z0-9_\-\.]{16,})/gi,
    /session[_-]?id["']?\s*[:=]\s*["']?([a-zA-Z0-9]{16,})/gi,
    /csrf[_-]?token["']?\s*[:=]\s*["']?([a-zA-Z0-9]{16,})/gi,
    
    // Secrets
    /secret["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-]{8,})/gi,
    /private[_-]?key["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-\s]{20,})/gi,
    /password["']?\s*[:=]\s*["']?([^"']{4,})/gi,
    /pwd["']?\s*[:=]\s*["']?([^"']{4,})/gi,
    
    // Credit cards (basic pattern)
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    
    // Common sensitive headers
    /authorization["']?\s*[:=]\s*["']?([^"']{8,})/gi,
    /cookie["']?\s*[:=]\s*["']?([^"']{8,})/gi,
];

/**
 * SecureError class
 * Error that automatically redacts sensitive information
 */
class SecureError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'SecureError';
        this.code = options.code || 'UNKNOWN_ERROR';
        this.timestamp = new Date().toISOString();
        this.requestId = options.requestId || this._generateRequestId();
        
        // Store original error safely
        if (options.cause) {
            this.cause = this._sanitizeError(options.cause);
        }
        
        // Store context (sanitized)
        if (options.context) {
            this.context = this._sanitizeContext(options.context);
        }
        
        // User-facing message (never exposes internals)
        this.userMessage = options.userMessage || this._getGenericMessage(this.code);
        
        // Severity level
        this.severity = options.severity || 'error';
    }

    /**
     * Generate unique request ID for tracking
     * @private
     * @returns {string}
     */
    _generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get generic user-friendly message
     * @private
     * @param {string} code
     * @returns {string}
     */
    _getGenericMessage(code) {
        const messages = {
            'VALIDATION_ERROR': 'Dados inválidos. Por favor, verifique e tente novamente.',
            'AUTHENTICATION_ERROR': 'Não foi possível autenticar. Por favor, faça login novamente.',
            'AUTHORIZATION_ERROR': 'Você não tem permissão para realizar esta ação.',
            'NOT_FOUND': 'O recurso solicitado não foi encontrado.',
            'RATE_LIMIT_EXCEEDED': 'Muitas requisições. Por favor, aguarde um momento.',
            'SERVER_ERROR': 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
            'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.',
            'TIMEOUT_ERROR': 'A operação demorou muito. Tente novamente.',
            'SECURITY_ERROR': 'Erro de segurança detectado.',
            'XSS_ATTEMPT': 'Conteúdo não permitido detectado.',
            'CSRF_ERROR': 'Erro de validação de segurança.',
            'UNKNOWN_ERROR': 'Ocorreu um erro inesperado. Tente novamente.'
        };
        
        return messages[code] || messages['UNKNOWN_ERROR'];
    }

    /**
     * Sanitize error object
     * @private
     * @param {Error} error
     * @returns {Object}
     */
    _sanitizeError(error) {
        if (!error) return null;
        
        const sanitized = {
            name: error.name,
            message: this._redactSensitiveData(error.message),
            stack: this._redactStack(error.stack)
        };
        
        return sanitized;
    }

    /**
     * Redact sensitive data from string
     * @private
     * @param {string} str
     * @returns {string}
     */
    _redactSensitiveData(str) {
        if (!str || typeof str !== 'string') return str;
        
        let redacted = str;
        
        SENSITIVE_PATTERNS.forEach(pattern => {
            redacted = redacted.replace(pattern, '[REDACTED]');
        });
        
        return redacted;
    }

    /**
     * Redact sensitive data from stack trace
     * @private
     * @param {string} stack
     * @returns {string}
     */
    _redactStack(stack) {
        if (!stack || typeof stack !== 'string') return stack;
        
        // Limit stack trace depth in production
        if (typeof window !== 'undefined' && 
            window.securityConfig && 
            window.securityConfig.isProduction && 
            window.securityConfig.isProduction()) {
            const lines = stack.split('\n');
            return lines.slice(0, 5).join('\n');
        }
        
        return this._redactSensitiveData(stack);
    }

    /**
     * Sanitize context object
     * @private
     * @param {Object} context
     * @returns {Object}
     */
    _sanitizeContext(context) {
        if (!context || typeof context !== 'object') return {};
        
        const sanitized = {};
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential', 
                              'credit', 'card', 'cvv', 'ssn', 'apiKey', 'api_key'];
        
        for (const [key, value] of Object.entries(context)) {
            const lowerKey = key.toLowerCase();
            const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
            
            if (isSensitive) {
                sanitized[key] = '[REDACTED]';
            } else if (typeof value === 'string') {
                sanitized[key] = this._redactSensitiveData(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this._sanitizeContext(value);
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }

    /**
     * Get safe object for logging (no sensitive data)
     * @returns {Object}
     */
    toLogObject() {
        return {
            name: this.name,
            code: this.code,
            message: this._redactSensitiveData(this.message),
            timestamp: this.timestamp,
            requestId: this.requestId,
            severity: this.severity,
            cause: this.cause,
            context: this.context
        };
    }

    /**
     * Get user-friendly response
     * @returns {{ success: false, error: string, requestId: string, code: string }}
     */
    toUserResponse() {
        return {
            success: false,
            error: this.userMessage,
            requestId: this.requestId,
            code: this.code
        };
    }
}

/**
 * Error handler utilities
 */
const ErrorHandler = {
    /**
     * Log error securely (redacts sensitive data)
     * @param {Error} error - Error to log
     * @param {Object} context - Additional context
     * @param {string} level - Log level: debug, info, warn, error
     */
    log(error, context = {}, level = 'error') {
        let logData;
        
        if (error instanceof SecureError) {
            logData = error.toLogObject();
        } else {
            // Wrap regular error in SecureError
            const secureError = new SecureError(error.message, {
                code: 'UNKNOWN_ERROR',
                cause: error,
                context,
                severity: level === 'error' ? 'error' : 'warning'
            });
            logData = secureError.toLogObject();
        }
        
        // Add context
        logData.logContext = context;
        
        // Log to console (in production, send to logging service)
        const consoleMethod = console[level] || console.error;
        consoleMethod('[SecureError]', logData);
        
        return logData;
    },

    /**
     * Format error for user display
     * @param {Error} error
     * @returns {{ success: false, error: string, requestId?: string }}
     */
    formatForUser(error) {
        if (error instanceof SecureError) {
            return error.toUserResponse();
        }
        
        // Create generic secure response
        const secureError = new SecureError(error.message, {
            code: 'UNKNOWN_ERROR',
            cause: error
        });
        
        return secureError.toUserResponse();
    },

    /**
     * Handle async errors safely
     * @param {Function} fn - Async function to wrap
     * @returns {Function}
     */
    asyncHandler(fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handle(error);
                throw error;
            }
        };
    },

    /**
     * Central error handler
     * @param {Error} error
     * @param {Object} context
     */
    handle(error, context = {}) {
        // Log the error
        this.log(error, context);
        
        // Show user-friendly message if in UI context
        if (typeof window !== 'undefined' && window.showToast) {
            const userResponse = this.formatForUser(error);
            window.showToast(userResponse.error, 'error');
        }
        
        // Return safe response
        return this.formatForUser(error);
    },

    /**
     * Create specific error types
     */
    create: {
        validation(message, context) {
            return new SecureError(message, {
                code: 'VALIDATION_ERROR',
                context,
                severity: 'warning',
                userMessage: 'Dados inválidos. Por favor, verifique e tente novamente.'
            });
        },
        
        authentication(message, context) {
            return new SecureError(message, {
                code: 'AUTHENTICATION_ERROR',
                context,
                severity: 'error',
                userMessage: 'Não foi possível autenticar. Por favor, faça login novamente.'
            });
        },
        
        authorization(message, context) {
            return new SecureError(message, {
                code: 'AUTHORIZATION_ERROR',
                context,
                severity: 'warning',
                userMessage: 'Você não tem permissão para realizar esta ação.'
            });
        },
        
        notFound(resource, context) {
            return new SecureError(`${resource} não encontrado`, {
                code: 'NOT_FOUND',
                context,
                severity: 'warning',
                userMessage: 'O recurso solicitado não foi encontrado.'
            });
        },
        
        rateLimit(retryAfter, context) {
            return new SecureError('Rate limit exceeded', {
                code: 'RATE_LIMIT_EXCEEDED',
                context,
                severity: 'warning',
                userMessage: `Muitas requisições. Por favor, aguarde ${retryAfter}s.`
            });
        },
        
        network(message, context) {
            return new SecureError(message, {
                code: 'NETWORK_ERROR',
                context,
                severity: 'error',
                userMessage: 'Erro de conexão. Verifique sua internet.'
            });
        },
        
        server(message, context) {
            return new SecureError(message, {
                code: 'SERVER_ERROR',
                context,
                severity: 'error',
                userMessage: 'Ocorreu um erro no servidor. Tente novamente mais tarde.'
            });
        },
        
        security(message, code = 'SECURITY_ERROR', context) {
            return new SecureError(message, {
                code,
                context,
                severity: 'error',
                userMessage: 'Erro de segurança detectado. Por favor, recarregue a página.'
            });
        }
    },

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        if (typeof window === 'undefined') return;
        
        // Handle unhandled errors
        window.addEventListener('error', (event) => {
            this.handle(event.error, {
                type: 'unhandled_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handle(event.reason, {
                type: 'unhandled_promise_rejection'
            });
        });
    }
};

/**
 * Safe try-catch wrapper
 * @param {Function} fn - Function to execute
 * @param {Object} options - Options { defaultValue, context, onError }
 * @returns {*} Result or default value
 */
function safeTry(fn, options = {}) {
    try {
        return fn();
    } catch (error) {
        const { defaultValue, context, onError } = options;
        
        ErrorHandler.log(error, context);
        
        if (onError) {
            onError(error);
        }
        
        return defaultValue;
    }
}

/**
 * Safe async try-catch wrapper
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Options { defaultValue, context, onError }
 * @returns {Promise<*>} Result or default value
 */
async function safeTryAsync(fn, options = {}) {
    try {
        return await fn();
    } catch (error) {
        const { defaultValue, context, onError } = options;
        
        ErrorHandler.log(error, context);
        
        if (onError) {
            onError(error);
        }
        
        return defaultValue;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SecureError,
        ErrorHandler,
        safeTry,
        safeTryAsync,
        SENSITIVE_PATTERNS
    };
}

// Expose globally
window.SecureError = SecureError;
window.ErrorHandler = ErrorHandler;
window.safeTry = safeTry;
window.safeTryAsync = safeTryAsync;
window.SENSITIVE_PATTERNS = SENSITIVE_PATTERNS;
