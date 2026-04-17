/**
 * CartItem Model
 * Representa um item no carrinho de compras
 */
class CartItem {
    /**
     * @param {Object} data - Dados do item
     * @param {Product} data.product - Produto associado
     * @param {number} [data.quantity=1] - Quantidade do produto
     */
    constructor(data = {}) {
        this.product = data.product || null;
        this.quantity = this._parseQuantity(data.quantity, 1);
        this._subtotal = null; // Cache do subtotal
    }

    /**
     * Converte um valor para quantidade válida
     * @private
     * @param {*} value - Valor a ser convertido
     * @param {number} defaultValue - Valor padrão
     * @returns {number}
     */
    _parseQuantity(value, defaultValue = 1) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 1) {
            return defaultValue;
        }
        return parsed;
    }

    /**
     * Valida o item do carrinho
     * @returns {Object} Resultado da validação { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.product) {
            errors.push('Produto não informado');
            return { isValid: false, errors };
        }

        if (!(this.product instanceof Product)) {
            errors.push('Produto inválido');
        }

        if (this.quantity < 1) {
            errors.push('Quantidade deve ser pelo menos 1');
        }

        if (!Number.isInteger(this.quantity)) {
            errors.push('Quantidade deve ser um número inteiro');
        }

        // Verifica se há estoque suficiente
        if (this.product && this.product.stock < this.quantity) {
            errors.push(`Estoque insuficiente. Disponível: ${this.product.stock}`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Calcula o subtotal do item
     * @returns {number} Subtotal (preço × quantidade)
     */
    getSubtotal() {
        if (!this.product) return 0;
        
        // Usa cache para evitar recalcular
        if (this._subtotal === null) {
            this._subtotal = this.product.price * this.quantity;
        }
        return this._subtotal;
    }

    /**
     * Retorna o subtotal formatado como moeda
     * @param {string} [locale='pt-BR'] - Localização
     * @param {string} [currency='BRL'] - Moeda
     * @returns {string}
     */
    getFormattedSubtotal(locale = 'pt-BR', currency = 'BRL') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(this.getSubtotal());
    }

    /**
     * Aumenta a quantidade do item
     * @param {number} [amount=1] - Quantidade a aumentar
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    increaseQuantity(amount = 1) {
        if (amount <= 0) return false;
        
        const newQuantity = this.quantity + amount;
        if (this.product && newQuantity > this.product.stock) {
            return false; // Não permite exceder o estoque
        }
        
        this.quantity = newQuantity;
        this._subtotal = null; // Invalida cache
        return true;
    }

    /**
     * Diminui a quantidade do item
     * @param {number} [amount=1] - Quantidade a diminuir
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    decreaseQuantity(amount = 1) {
        if (amount <= 0) return false;
        
        const newQuantity = this.quantity - amount;
        if (newQuantity < 1) {
            return false; // Não permite quantidade menor que 1
        }
        
        this.quantity = newQuantity;
        this._subtotal = null; // Invalida cache
        return true;
    }

    /**
     * Define uma nova quantidade
     * @param {number} quantity - Nova quantidade
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    setQuantity(quantity) {
        const parsed = this._parseQuantity(quantity, 0);
        
        if (parsed < 1) return false;
        if (this.product && parsed > this.product.stock) return false;
        
        this.quantity = parsed;
        this._subtotal = null; // Invalida cache
        return true;
    }

    /**
     * Verifica se o item corresponde a um produto específico
     * @param {string} productId - ID do produto
     * @returns {boolean}
     */
    matchesProduct(productId) {
        return this.product && this.product.id === productId;
    }

    /**
     * Retorna uma cópia simples do objeto para serialização
     * @returns {Object}
     */
    toJSON() {
        return {
            product: this.product ? this.product.toJSON() : null,
            quantity: this.quantity,
            subtotal: this.getSubtotal()
        };
    }

    /**
     * Cria uma instância de CartItem a partir de dados JSON
     * @param {Object} json - Dados do item
     * @returns {CartItem}
     */
    static fromJSON(json) {
        const data = {
            quantity: json.quantity
        };
        
        if (json.product) {
            data.product = Product.fromJSON(json.product);
        }
        
        return new CartItem(data);
    }

    /**
     * Cria uma cópia do item
     * @returns {CartItem}
     */
    clone() {
        const clonedProduct = this.product ? this.product.clone() : null;
        return new CartItem({
            product: clonedProduct,
            quantity: this.quantity
        });
    }
}

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartItem;
}
