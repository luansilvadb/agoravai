/**
 * Product Model
 * Representa um produto no sistema PDV
 */
class Product {
    /**
     * @param {Object} data - Dados do produto
     * @param {string} [data.id] - ID único do produto (gerado automaticamente se não fornecido)
     * @param {string} data.name - Nome do produto
     * @param {number} data.price - Preço do produto
     * @param {string} data.category - Categoria do produto
     * @param {number} data.stock - Quantidade em estoque
     * @param {string} [data.description] - Descrição opcional do produto
     * @param {string} [data.createdAt] - Data de criação (ISO string)
     * @param {string} [data.updatedAt] - Data de atualização (ISO string)
     */
    constructor(data = {}) {
        const { id, name, price, category, stock, description, createdAt, updatedAt } = data;
        this.id = id || this._generateId();
        this.name = name || '';
        this.price = this._parseNumber(price, 0);
        this.category = category || '';
        this.stock = this._parseNumber(stock, 0);
        this.description = description || '';
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    /**
     * Gera um ID único para o produto
     * @private
     * @returns {string} ID único
     */
    _generateId() {
        return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    /**
     * Converte um valor para número com segurança
     * @private
     * @param {*} value - Valor a ser convertido
     * @param {number} defaultValue - Valor padrão se conversão falhar
     * @returns {number}
     */
    _parseNumber(value, defaultValue = 0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Valida os dados do produto
     * @returns {Object} Resultado da validação { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];
        const nameTrimmed = this.name?.trim();

        if (!nameTrimmed) errors.push('O nome do produto é obrigatório');
        else if (nameTrimmed.length > 100) errors.push('O nome do produto deve ter no máximo 100 caracteres');

        if (this.price == null || isNaN(this.price)) errors.push('O preço do produto é obrigatório');
        else if (this.price < 0) errors.push('O preço do produto não pode ser negativo');

        if (this.stock == null || isNaN(this.stock)) errors.push('A quantidade em estoque é obrigatória');
        else if (this.stock < 0) errors.push('A quantidade em estoque não pode ser negativa');
        else if (!Number.isInteger(this.stock)) errors.push('A quantidade em estoque deve ser um número inteiro');

        if (this.category?.trim().length > 50) errors.push('A categoria deve ter no máximo 50 caracteres');

        return { isValid: !errors.length, errors };
    }

    /**
     * Verifica se o produto tem estoque disponível
     * @param {number} [quantity=1] - Quantidade desejada
     * @returns {boolean}
     */
    hasStock(quantity = 1) {
        return this.stock >= quantity;
    }

    /**
     * Diminui o estoque do produto
     * @param {number} quantity - Quantidade a ser decrementada
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    decreaseStock(quantity) {
        if (quantity <= 0) return false;
        if (!this.hasStock(quantity)) return false;
        
        this.stock -= quantity;
        this.updatedAt = new Date().toISOString();
        return true;
    }

    /**
     * Aumenta o estoque do produto
     * @param {number} quantity - Quantidade a ser incrementada
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    increaseStock(quantity) {
        if (quantity <= 0) return false;
        
        this.stock += quantity;
        this.updatedAt = new Date().toISOString();
        return true;
    }

    /**
     * Retorna o status do estoque
     * @returns {string} 'ok', 'low' (<= 5), 'critical' (0), ou 'out' (< 0)
     */
    getStockStatus() {
        if (this.stock <= 0) return 'out';
        if (this.stock <= 5) return 'low';
        return 'ok';
    }

    /**
     * Formata o preço para exibição
     * @param {string} [locale='pt-BR'] - Localização
     * @param {string} [currency='BRL'] - Moeda
     * @returns {string} Preço formatado
     */
    getFormattedPrice(locale = 'pt-BR', currency = 'BRL') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(this.price);
    }

    /**
     * Retorna uma cópia simples do objeto para serialização
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            category: this.category,
            stock: this.stock,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Cria uma instância de Product a partir de dados JSON
     * @param {Object} json - Dados do produto
     * @returns {Product}
     */
    static fromJSON(json) {
        return new Product(json);
    }

    /**
     * Cria uma cópia do produto
     * @returns {Product}
     */
    clone() {
        return new Product(this.toJSON());
    }
}

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Product;
}
