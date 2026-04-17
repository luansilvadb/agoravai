/**
 * Upload Security Module
 * File upload validation and sanitization
 */

/**
 * Upload configuration
 */
const UploadConfig = {
    // Default max file size (5MB)
    DEFAULT_MAX_SIZE: 5 * 1024 * 1024,
    
    // Allowed MIME types
    ALLOWED_MIME_TYPES: {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'image/webp': ['webp'],
        'application/pdf': ['pdf'],
    },
    
    // Allowed extensions
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    
    // Dangerous extensions to block
    DANGEROUS_EXTENSIONS: [
        'exe', 'dll', 'bat', 'cmd', 'sh', 'php', 'jsp', 'asp', 'aspx',
        'jar', 'war', 'ear', 'py', 'rb', 'pl', 'cgi', 'js', 'vbs',
        'ps1', 'psm1', 'scr', 'msi', 'com', 'gadget', 'wsf', 'wsh'
    ],
    
    // Dangerous MIME types to block
    DANGEROUS_MIME_TYPES: [
        'application/x-msdownload',
        'application/x-executable',
        'application/x-sh',
        'application/x-php',
        'text/x-python',
        'application/x-javascript',
        'text/javascript',
    ]
};

/**
 * Upload validation result
 */
class UploadValidationResult {
    constructor(valid, error = null, sanitized = null) {
        this.valid = valid;
        this.error = error;
        this.sanitized = sanitized;
    }
}

/**
 * Upload security utilities
 */
const UploadSecurity = {
    /**
     * Validate file size
     * @param {File} file - File to validate
     * @param {number} maxBytes - Maximum size in bytes
     * @returns {UploadValidationResult}
     */
    validateFileSize(file, maxBytes = UploadConfig.DEFAULT_MAX_SIZE) {
        if (!file) {
            return new UploadValidationResult(false, 'Nenhum arquivo fornecido');
        }
        
        if (file.size > maxBytes) {
            const maxMB = (maxBytes / 1024 / 1024).toFixed(1);
            return new UploadValidationResult(
                false, 
                `Arquivo muito grande. Tamanho máximo permitido: ${maxMB}MB`
            );
        }
        
        if (file.size === 0) {
            return new UploadValidationResult(false, 'Arquivo vazio não permitido');
        }
        
        return new UploadValidationResult(true);
    },

    /**
     * Validate file MIME type
     * @param {File} file - File to validate
     * @param {string[]} allowedTypes - Allowed MIME types
     * @returns {UploadValidationResult}
     */
    validateFileType(file, allowedTypes = Object.keys(UploadConfig.ALLOWED_MIME_TYPES)) {
        if (!file) {
            return new UploadValidationResult(false, 'Nenhum arquivo fornecido');
        }
        
        const mimeType = file.type.toLowerCase();
        
        // Check if MIME type is in allowed list
        if (!allowedTypes.includes(mimeType)) {
            return new UploadValidationResult(
                false,
                `Tipo de arquivo não permitido: ${mimeType}`
            );
        }
        
        // Check if MIME type is in dangerous list
        if (UploadConfig.DANGEROUS_MIME_TYPES.includes(mimeType)) {
            return new UploadValidationResult(
                false,
                'Tipo de arquivo não permitido por segurança'
            );
        }
        
        return new UploadValidationResult(true);
    },

    /**
     * Validate file extension
     * @param {string} filename - File name
     * @param {string[]} allowedExtensions - Allowed extensions
     * @returns {UploadValidationResult}
     */
    validateFileExtension(filename, allowedExtensions = UploadConfig.ALLOWED_EXTENSIONS) {
        if (!filename || typeof filename !== 'string') {
            return new UploadValidationResult(false, 'Nome de arquivo inválido');
        }
        
        // Extract extension
        const ext = filename.split('.').pop().toLowerCase();
        
        if (!ext || ext === filename) {
            return new UploadValidationResult(false, 'Arquivo sem extensão');
        }
        
        // Check if extension is dangerous
        if (UploadConfig.DANGEROUS_EXTENSIONS.includes(ext)) {
            return new UploadValidationResult(
                false,
                `Extensão de arquivo não permitida por segurança: .${ext}`
            );
        }
        
        // Check if extension is in allowed list
        if (!allowedExtensions.includes(ext)) {
            return new UploadValidationResult(
                false,
                `Extensão não permitida: .${ext}. Permitidas: ${allowedExtensions.join(', ')}`
            );
        }
        
        return new UploadValidationResult(true);
    },

    /**
     * Sanitize filename (remove path traversal, special chars)
     * @param {string} filename - Original filename
     * @returns {string} Sanitized filename
     */
    sanitizeFilename(filename) {
        if (!filename || typeof filename !== 'string') {
            return 'unnamed_file';
        }
        
        // Remove path traversal attempts
        let sanitized = filename
            .replace(/\.\./g, '') // Remove ..
            .replace(/\\/g, '') // Remove backslashes
            .replace(/\//g, '') // Remove forward slashes
            .replace(/^\.+/, '') // Remove leading dots
            .trim();
        
        // Remove special characters that could cause issues
        sanitized = sanitized
            .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid chars
            .replace(/\s+/g, '_'); // Replace spaces with underscores
        
        // Limit length
        const maxLength = 100;
        if (sanitized.length > maxLength) {
            const ext = sanitized.split('.').pop();
            const name = sanitized.substring(0, maxLength - ext.length - 1);
            sanitized = `${name}.${ext}`;
        }
        
        // If empty after sanitization, use default
        if (!sanitized || sanitized === '.' || sanitized === '..') {
            sanitized = 'unnamed_file';
        }
        
        return sanitized;
    },

    /**
     * Validate file magic bytes (header signatures)
     * @param {File} file - File to validate
     * @returns {Promise<UploadValidationResult>}
     */
    async validateMagicBytes(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve(new UploadValidationResult(false, 'Nenhum arquivo fornecido'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const arr = new Uint8Array(e.target.result);
                const isValid = this._checkMagicBytes(arr, file.type);
                
                if (!isValid) {
                    resolve(new UploadValidationResult(
                        false,
                        'Assinatura do arquivo inválida. O arquivo pode estar corrompido ou ser malicioso.'
                    ));
                } else {
                    resolve(new UploadValidationResult(true));
                }
            };
            
            reader.onerror = () => {
                resolve(new UploadValidationResult(false, 'Erro ao ler arquivo'));
            };
            
            // Read first 8 bytes
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    },

    /**
     * Check magic bytes against known signatures
     * @private
     * @param {Uint8Array} bytes - File bytes
     * @param {string} mimeType - Expected MIME type
     * @returns {boolean}
     */
    _checkMagicBytes(bytes, mimeType) {
        const signatures = {
            'image/jpeg': [[0xFF, 0xD8, 0xFF]],
            'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
            'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
            'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
            'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
        };
        
        const expectedSignatures = signatures[mimeType];
        if (!expectedSignatures) {
            return true; // Unknown type, skip check
        }
        
        return expectedSignatures.some(sig => {
            if (bytes.length < sig.length) return false;
            return sig.every((byte, i) => bytes[i] === byte);
        });
    },

    /**
     * Complete file validation
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Promise<UploadValidationResult>}
     */
    async validateFile(file, options = {}) {
        const {
            maxSize = UploadConfig.DEFAULT_MAX_SIZE,
            allowedTypes = Object.keys(UploadConfig.ALLOWED_MIME_TYPES),
            allowedExtensions = UploadConfig.ALLOWED_EXTENSIONS,
            checkMagicBytes = true
        } = options;
        
        // Size validation
        let result = this.validateFileSize(file, maxSize);
        if (!result.valid) return result;
        
        // Type validation
        result = this.validateFileType(file, allowedTypes);
        if (!result.valid) return result;
        
        // Extension validation
        result = this.validateFileExtension(file.name, allowedExtensions);
        if (!result.valid) return result;
        
        // Filename sanitization
        const sanitized = this.sanitizeFilename(file.name);
        
        // Magic bytes validation (async)
        if (checkMagicBytes) {
            result = await this.validateMagicBytes(file);
            if (!result.valid) return result;
        }
        
        return new UploadValidationResult(true, null, sanitized);
    },

    /**
     * Create safe file preview URL
     * @param {File} file - File to preview
     * @returns {Promise<string|null>} Object URL or null
     */
    async createSafePreview(file) {
        // Validate first
        const result = await this.validateFile(file);
        if (!result.valid) {
            return null;
        }
        
        // Only allow images for preview
        if (!file.type.startsWith('image/')) {
            return null;
        }
        
        return URL.createObjectURL(file);
    },

    /**
     * Revoke preview URL
     * @param {string} url - URL to revoke
     */
    revokePreview(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    },

    /**
     * Scan file for embedded scripts (basic check)
     * @param {File} file - File to scan
     * @returns {Promise<UploadValidationResult>}
     */
    async scanForScripts(file) {
        return new Promise((resolve) => {
            if (!file || !file.type.match(/image\/|application\/pdf/)) {
                resolve(new UploadValidationResult(true));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const content = e.target.result;
                const dangerous = [
                    '<script',
                    'javascript:',
                    'onerror=',
                    'onload=',
                    'eval(',
                    'fromCharCode'
                ];
                
                const found = dangerous.some(pattern => 
                    content.toLowerCase().includes(pattern)
                );
                
                if (found) {
                    resolve(new UploadValidationResult(
                        false,
                        'Arquivo potencialmente malicioso detectado'
                    ));
                } else {
                    resolve(new UploadValidationResult(true));
                }
            };
            
            reader.onerror = () => {
                resolve(new UploadValidationResult(true)); // Allow if can't read
            };
            
            // Read as text to check for embedded scripts
            reader.readAsText(file.slice(0, 8192)); // First 8KB
        });
    },

    /**
     * Get human-readable file size
     * @param {number} bytes - Size in bytes
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

/**
 * Upload manager for handling file uploads securely
 */
class SecureUploadManager {
    constructor(options = {}) {
        this.maxSize = options.maxSize || UploadConfig.DEFAULT_MAX_SIZE;
        this.allowedTypes = options.allowedTypes || Object.keys(UploadConfig.ALLOWED_MIME_TYPES);
        this.allowedExtensions = options.allowedExtensions || UploadConfig.ALLOWED_EXTENSIONS;
        this.onProgress = options.onProgress || null;
        this.onComplete = options.onComplete || null;
        this.onError = options.onError || null;
    }

    /**
     * Upload file securely
     * @param {File} file - File to upload
     * @param {string} endpoint - Upload endpoint
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>}
     */
    async upload(file, endpoint, metadata = {}) {
        try {
            // Validate file
            const validation = await UploadSecurity.validateFile(file, {
                maxSize: this.maxSize,
                allowedTypes: this.allowedTypes,
                allowedExtensions: this.allowedExtensions
            });
            
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Scan for embedded scripts
            const scan = await UploadSecurity.scanForScripts(file);
            if (!scan.valid) {
                throw new Error(scan.error);
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file, validation.sanitized);
            
            // Add metadata
            for (const [key, value] of Object.entries(metadata)) {
                formData.append(key, value);
            }

            // Add CSRF token if available
            if (window.csrfManager) {
                formData.append('_csrf_token', window.csrfManager.getToken());
            }

            // Upload with progress
            const xhr = new XMLHttpRequest();
            
            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable && this.onProgress) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        this.onProgress(percent);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        if (this.onComplete) this.onComplete(response);
                        resolve(response);
                    } else {
                        reject(new Error(`Upload failed: ${xhr.statusText}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    const error = new Error('Upload failed');
                    if (this.onError) this.onError(error);
                    reject(error);
                });

                xhr.open('POST', endpoint);
                
                // Add CSRF header
                if (window.csrfManager) {
                    xhr.setRequestHeader(
                        window.csrfManager.getHeaderName(),
                        window.csrfManager.getToken()
                    );
                }

                xhr.send(formData);
            });

        } catch (error) {
            if (this.onError) this.onError(error);
            throw error;
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UploadSecurity,
        SecureUploadManager,
        UploadConfig,
        UploadValidationResult
    };
}

// Expose globally
window.UploadSecurity = UploadSecurity;
window.SecureUploadManager = SecureUploadManager;
window.UploadConfig = UploadConfig;
window.UploadValidationResult = UploadValidationResult;
