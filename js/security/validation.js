/**
 * Input Validation Module
 * Zod-based validation schemas for the PDV System
 */

// Import Zod (works in both module and script contexts)
let z;
if (typeof require !== 'undefined') {
    z = require('zod').z;
} else if (typeof window !== 'undefined' && window.Zod) {
    z = window.Zod.z;
}

/**
 * Validation error class
 */
class ValidationError extends Error {
    constructor(message, errors = [], field = null) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
        this.field = field;
    }
}

/**
 * Validation schemas for PDV entities
 */
const Schemas = {
    /**
     * Product ID schema
     */
    ProductId: z.string()
        .min(1, 'ID do produto é obrigatório')
        .max(50, 'ID deve ter no máximo 50 caracteres')
        .regex(/^[a-zA-Z0-9_-]+$/, 'ID deve conter apenas letras, números, hífen e underscore'),

    /**
     * Product name schema
     */
    ProductName: z.string()
        .min(1, 'Nome do produto é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .transform(val => val.trim()),

    /**
     * Price schema (positive number, max 999999.99)
     */
    Price: z.number()
        .nonnegative('Preço não pode ser negativo')
        .max(999999.99, 'Preço excede o limite máximo')
        .refine(val => !isNaN(val), 'Preço inválido'),

    /**
     * Stock quantity schema
     */
    Stock: z.number()
        .int('Estoque deve ser um número inteiro')
        .min(0, 'Estoque não pode ser negativo')
        .max(999999, 'Estoque excede o limite máximo'),

    /**
     * Category schema
     */
    Category: z.string()
        .max(50, 'Categoria deve ter no máximo 50 caracteres')
        .transform(val => val.trim()),

    /**
     * Description schema (optional)
     */
    Description: z.string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional()
        .or(z.literal('')),

    /**
     * Quantity schema (for cart items)
     */
    Quantity: z.number()
        .int('Quantidade deve ser um número inteiro')
        .min(1, 'Quantidade mínima é 1')
        .max(999, 'Quantidade máxima é 999'),

    /**
     * Discount schema
     */
    Discount: z.number()
        .nonnegative('Desconto não pode ser negativo')
        .refine(val => !isNaN(val), 'Desconto inválido'),

    /**
     * Discount type schema
     */
    DiscountType: z.enum(['fixed', 'percentage']),

    /**
     * Email schema
     */
    Email: z.string()
        .email('Email inválido')
        .max(100, 'Email deve ter no máximo 100 caracteres')
        .transform(val => val.trim().toLowerCase()),

    /**
     * User name schema
     */
    UserName: z.string()
        .min(1, 'Nome é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .transform(val => val.trim()),

    /**
     * Payment value schema
     */
    PaymentValue: z.number()
        .positive('Valor de pagamento deve ser positivo')
        .max(999999.99, 'Valor excede o limite máximo'),

    /**
     * Payment notes schema
     */
    PaymentNotes: z.string()
        .max(200, 'Notas devem ter no máximo 200 caracteres')
        .optional()
        .or(z.literal('')),

    /**
     * Currency code schema
     */
    CurrencyCode: z.string()
        .length(3, 'Código da moeda deve ter 3 caracteres')
        .regex(/^[A-Z]{3}$/, 'Código da moeda inválido'),

    /**
     * Cart ID schema
     */
    CartId: z.string()
        .min(1, 'ID do carrinho é obrigatório')
        .max(50, 'ID deve ter no máximo 50 caracteres'),

    /**
     * Sale ID schema
     */
    SaleId: z.string()
        .min(1, 'ID da venda é obrigatório')
        .max(50, 'ID deve ter no máximo 50 caracteres'),
};

/**
 * Complex schemas for full entities
 */
const EntitySchemas = {
    /**
     * Product schema
     */
    Product: z.object({
        id: Schemas.ProductId.optional(),
        name: Schemas.ProductName,
        price: z.union([Schemas.Price, z.string().transform(val => parseFloat(val))]).pipe(Schemas.Price),
        category: Schemas.Category,
        stock: z.union([Schemas.Stock, z.string().transform(val => parseInt(val, 10))]).pipe(Schemas.Stock),
        description: Schemas.Description,
    }).strict(),

    /**
     * Cart item schema
     */
    CartItem: z.object({
        productId: Schemas.ProductId,
        quantity: z.union([Schemas.Quantity, z.string().transform(val => parseInt(val, 10))]).pipe(Schemas.Quantity),
        unitPrice: Schemas.Price.optional(),
    }).strict(),

    /**
     * Cart update operation schema
     */
    CartUpdate: z.object({
        productId: Schemas.ProductId,
        quantity: Schemas.Quantity,
        operation: z.enum(['add', 'remove', 'update']),
    }).strict(),

    /**
     * User/Operator schema
     */
    User: z.object({
        name: Schemas.UserName,
        email: Schemas.Email.optional(),
        operatorId: z.string().max(20).optional(),
        registerNumber: z.string().max(10).optional(),
    }).strict(),

    /**
     * Payment schema
     */
    Payment: z.object({
        amount: z.union([Schemas.PaymentValue, z.string().transform(val => parseFloat(val))]).pipe(Schemas.PaymentValue),
        method: z.enum(['cash', 'credit', 'debit', 'pix', 'wallet']),
        notes: PaymentNotes,
    }).strict(),

    /**
     * Checkout schema
     */
    Checkout: z.object({
        cartId: Schemas.CartId,
        payment: z.lazy(() => EntitySchemas.Payment),
        operatorId: z.string().max(20).optional(),
        discount: z.object({
            value: Schemas.Discount,
            type: Schemas.DiscountType,
        }).optional(),
    }).strict(),

    /**
     * Discount application schema
     */
    Discount: z.object({
        value: Schemas.Discount,
        type: Schemas.DiscountType,
    }).refine(data => {
        if (data.type === 'percentage' && data.value > 100) {
            return false;
        }
        return true;
    }, {
        message: 'Desconto percentual não pode exceder 100%',
        path: ['value'],
    }),
};

/**
 * Validation utilities
 */
const ValidationUtils = {
    /**
     * Validate data against a schema
     * @param {z.ZodSchema} schema - Zod schema
     * @param {*} data - Data to validate
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    validate(schema, data) {
        try {
            const result = schema.parse(data);
            return { success: true, data: result };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formatted = this.formatZodError(error);
                return {
                    success: false,
                    error: new ValidationError(
                        formatted.message,
                        formatted.errors
                    ),
                };
            }
            return {
                success: false,
                error: new ValidationError('Erro de validação desconhecido'),
            };
        }
    },

    /**
     * Validate data safely (returns null on error)
     * @param {z.ZodSchema} schema - Zod schema
     * @param {*} data - Data to validate
     * @returns {*} Validated data or null
     */
    validateSafe(schema, data) {
        const result = this.validate(schema, data);
        return result.success ? result.data : null;
    },

    /**
     * Validate asynchronously
     * @param {z.ZodSchema} schema - Zod schema
     * @param {*} data - Data to validate
     * @returns {Promise<{ success: boolean, data?: *, error?: ValidationError }>}
     */
    async validateAsync(schema, data) {
        try {
            const result = await schema.parseAsync(data);
            return { success: true, data: result };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formatted = this.formatZodError(error);
                return {
                    success: false,
                    error: new ValidationError(
                        formatted.message,
                        formatted.errors
                    ),
                };
            }
            return {
                success: false,
                error: new ValidationError('Erro de validação desconhecido'),
            };
        }
    },

    /**
     * Format ZodError into user-friendly format
     * @param {z.ZodError} error - Zod error
     * @returns {{ message: string, errors: Array<{ path: string, message: string }> }}
     */
    formatZodError(error) {
        const errors = error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
        }));

        const messages = errors.map(e => e.message);
        const message = messages.length === 1
            ? messages[0]
            : `${messages.length} erros de validação: ${messages.join('; ')}`;

        return { message, errors };
    },

    /**
     * Create a partial schema (all fields optional)
     * @param {z.ZodObject} schema - Object schema
     * @returns {z.ZodObject}
     */
    partial(schema) {
        return schema.partial();
    },

    /**
     * Create a schema that allows extra fields
     * @param {z.ZodObject} schema - Object schema
     * @returns {z.ZodObject}
     */
    passthrough(schema) {
        return schema.passthrough();
    },

    /**
     * Sanitize string input (remove dangerous characters)
     * @param {string} str - Input string
     * @returns {string}
     */
    sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/[<>]/g, '') // Remove < and >
            .trim();
    },

    /**
     * Check if value is a valid number
     * @param {*} value - Value to check
     * @returns {boolean}
     */
    isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    },

    /**
     * Parse and validate number
     * @param {*} value - Value to parse
     * @param {number} defaultValue - Default if invalid
     * @param {Object} options - Options { min, max }
     * @returns {number}
     */
    parseNumber(value, defaultValue = 0, options = {}) {
        let parsed = parseFloat(value);
        if (isNaN(parsed)) return defaultValue;

        if (options.min !== undefined) parsed = Math.max(options.min, parsed);
        if (options.max !== undefined) parsed = Math.min(options.max, parsed);

        return parsed;
    },
};

/**
 * Predefined validators for common operations
 */
const Validators = {
    /**
     * Validate product data
     * @param {*} data - Product data
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    product(data) {
        return ValidationUtils.validate(EntitySchemas.Product, data);
    },

    /**
     * Validate cart item
     * @param {*} data - Cart item data
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    cartItem(data) {
        return ValidationUtils.validate(EntitySchemas.CartItem, data);
    },

    /**
     * Validate cart operation
     * @param {*} data - Cart operation data
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    cartOperation(data) {
        return ValidationUtils.validate(EntitySchemas.CartUpdate, data);
    },

    /**
     * Validate user/operator
     * @param {*} data - User data
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    user(data) {
        return ValidationUtils.validate(EntitySchemas.User, data);
    },

    /**
     * Validate payment
     * @param {*} data - Payment data
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    payment(data) {
        return ValidationUtils.validate(EntitySchemas.Payment, data);
    },

    /**
     * Validate checkout
     * @param {*} data - Checkout data
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    checkout(data) {
        return ValidationUtils.validate(EntitySchemas.Checkout, data);
    },

    /**
     * Validate discount
     * @param {*} data - Discount data
     * @returns {{ success: boolean, data?: *, error?: ValidationError }}
     */
    discount(data) {
        return ValidationUtils.validate(EntitySchemas.Discount, data);
    },

    /**
     * Validate quantity (1-999)
     * @param {*} value - Quantity value
     * @returns {{ success: boolean, value?: number, error?: string }}
     */
    quantity(value) {
        const result = ValidationUtils.validate(Schemas.Quantity, value);
        if (result.success) {
            return { success: true, value: result.data };
        }
        return { success: false, error: result.error?.message || 'Quantidade inválida' };
    },

    /**
     * Validate price
     * @param {*} value - Price value
     * @returns {{ success: boolean, value?: number, error?: string }}
     */
    price(value) {
        const result = ValidationUtils.validate(Schemas.Price, value);
        if (result.success) {
            return { success: true, value: result.data };
        }
        return { success: false, error: result.error?.message || 'Preço inválido' };
    },

    /**
     * Validate email
     * @param {*} value - Email value
     * @returns {{ success: boolean, value?: string, error?: string }}
     */
    email(value) {
        const result = ValidationUtils.validate(Schemas.Email, value);
        if (result.success) {
            return { success: true, value: result.data };
        }
        return { success: false, error: result.error?.message || 'Email inválido' };
    },
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Schemas,
        EntitySchemas,
        ValidationUtils,
        Validators,
        ValidationError,
    };
}

// Expose globally
window.Validation = {
    Schemas,
    EntitySchemas,
    Utils: ValidationUtils,
    Validators,
    ValidationError,
};
