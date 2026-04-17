/**
 * Cart Model
 * Representa o carrinho de compras completo
 */
class Cart {
    /**
     * @param {Object} [data={}] - Dados do carrinho
     * @param {CartItem[]} [data.items=[]] - Itens do carrinho
     * @param {number} [data.discount=0] - Desconto aplicado
     * @param {string} [data.discountType='fixed'] - Tipo de desconto: 'fixed' ou 'percentage'
     */
    constructor(data = {}) {
        const { items, discount, discountType, createdAt, updatedAt } = data;
        this.items = items?.map(item => item instanceof CartItem ? item : CartItem.fromJSON(item)) ?? [];
        this.discount = parseFloat(discount) || 0;
        this.discountType = discountType === 'percentage' ? 'percentage' : 'fixed';
        this.createdAt = createdAt ?? new Date().toISOString();
        this.updatedAt = updatedAt ?? new Date().toISOString();
        this._subtotal = null;
        this._total = null;
        this._discountAmount = null;
    }

    /**
     * Invalida os caches de cálculo
     * @private
     */
    _invalidateCache() {
        this._subtotal = this._total = this._discountAmount = null;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Adiciona um produto ao carrinho
     * @param {Product} product - Produto a adicionar
     * @param {number} [quantity=1] - Quantidade
     * @returns {Object} { success: boolean, message: string, item: CartItem|null }
     */
    addItem(product, quantity = 1) {
        if (!(product instanceof Product)) return { success: false, message: 'Produto inválido', item: null };
        if (!product.hasStock(quantity)) return { success: false, message: `Estoque insuficiente. Disponível: ${product.stock}`, item: null };

        const existingItem = this.items.find(item => item.matchesProduct(product.id));
        if (existingItem?.increaseQuantity(quantity)) {
            this._invalidateCache();
            return { success: true, message: 'Quantidade atualizada no carrinho', item: existingItem };
        }
        if (existingItem) return { success: false, message: 'Não é possível adicionar mais unidades (estoque limitado)', item: null };

        const newItem = new CartItem({ product, quantity });
        const { isValid, errors } = newItem.validate();
        if (!isValid) return { success: false, message: errors.join(', '), item: null };

        this.items.push(newItem);
        this._invalidateCache();
        return { success: true, message: 'Produto adicionado ao carrinho', item: newItem };
    }

    /**
     * Remove um item do carrinho
     * @param {string} productId - ID do produto
     * @returns {boolean} True se o item foi removido
     */
    removeItem(productId) {
        const filtered = this.items.filter(item => !item.matchesProduct(productId));
        const removed = filtered.length < this.items.length;
        if (removed) {
            this.items = filtered;
            this._invalidateCache();
        }
        return removed;
    }

    /**
     * Atualiza a quantidade de um item
     * @param {string} productId - ID do produto
     * @param {number} quantity - Nova quantidade
     * @returns {Object} { success: boolean, message: string }
     */
    updateItemQuantity(productId, quantity) {
        const item = this.items.find(item => item.matchesProduct(productId));
        if (!item) return { success: false, message: 'Item não encontrado no carrinho' };
        if (quantity <= 0) {
            this.removeItem(productId);
            return { success: true, message: 'Item removido do carrinho' };
        }
        if (!item.setQuantity(quantity)) return { success: false, message: `Quantidade inválida ou estoque insuficiente (máx: ${item.product?.stock})` };

        this._invalidateCache();
        return { success: true, message: 'Quantidade atualizada' };
    }

    /**
     * Aumenta a quantidade de um item
     * @param {string} productId - ID do produto
     * @param {number} [amount=1] - Quantidade a aumentar
     * @returns {Object} { success: boolean, message: string }
     */
    increaseItemQuantity(productId, amount = 1) {
        const item = this.items.find(item => item.matchesProduct(productId));
        if (!item) return { success: false, message: 'Item não encontrado no carrinho' };
        if (!item.increaseQuantity(amount)) return { success: false, message: 'Não é possível aumentar (estoque insuficiente)' };
        this._invalidateCache();
        return { success: true, message: 'Quantidade aumentada' };
    }

    /**
     * Diminui a quantidade de um item
     * @param {string} productId - ID do produto
     * @param {number} [amount=1] - Quantidade a diminuir
     * @returns {Object} { success: boolean, message: string, removed: boolean }
     */
    decreaseItemQuantity(productId, amount = 1) {
        const item = this.items.find(item => item.matchesProduct(productId));
        if (!item) return { success: false, message: 'Item não encontrado no carrinho', removed: false };

        const newQuantity = item.quantity - amount;
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return { success: true, message: 'Item removido do carrinho', removed: true };
        }
        if (!item.decreaseQuantity(amount)) return { success: false, message: 'Não foi possível diminuir a quantidade', removed: false };

        this._invalidateCache();
        return { success: true, message: 'Quantidade diminuída', removed: false };
    }

    /**
     * Calcula o subtotal (soma dos subtotais dos itens)
     * @returns {number}
     */
    getSubtotal() {
        return this._subtotal ??= this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
    }

    /**
     * Calcula o valor do desconto
     * @returns {number}
     */
    getDiscountAmount() {
        if (this._discountAmount !== null) return this._discountAmount;
        const subtotal = this.getSubtotal();
        return this._discountAmount = this.discountType === 'percentage'
            ? subtotal * (Math.min(this.discount, 100) / 100)
            : Math.min(this.discount, subtotal);
    }

    /**
     * Calcula o total (subtotal - desconto)
     * @returns {number}
     */
    getTotal() {
        return this._total ??= Math.max(0, this.getSubtotal() - this.getDiscountAmount());
    }

    /**
     * Retorna o total de itens (soma das quantidades)
     * @returns {number}
     */
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Retorna o número de produtos únicos no carrinho
     * @returns {number}
     */
    getUniqueItemCount() {
        return this.items.length;
    }

    /**
     * Aplica um desconto ao carrinho
     * @param {number} discount - Valor do desconto
     * @param {string} [type='fixed'] - Tipo: 'fixed' ou 'percentage'
     * @returns {boolean} True se o desconto foi aplicado
     */
    applyDiscount(discount, type = 'fixed') {
        const parsed = parseFloat(discount);
        if (isNaN(parsed) || parsed < 0 || (type === 'percentage' && parsed > 100)) return false;
        this.discount = parsed;
        this.discountType = type === 'percentage' ? 'percentage' : 'fixed';
        this._invalidateCache();
        return true;
    }

    /**
     * Remove o desconto do carrinho
     */
    removeDiscount() {
        this.discount = 0;
        this.discountType = 'fixed';
        this._invalidateCache();
    }

    /**
     * Verifica se o carrinho está vazio
     * @returns {boolean}
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Limpa todos os itens do carrinho
     */
    clear() {
        this.items = [];
        this.discount = 0;
        this.discountType = 'fixed';
        this._invalidateCache();
    }

    /**
     * Busca um item no carrinho
     * @param {string} productId - ID do produto
     * @returns {CartItem|null}
     */
    findItem(productId) {
        return this.items.find(item => item.matchesProduct(productId)) || null;
    }

    /**
     * Verifica se existe um item no carrinho
     * @param {string} productId - ID do produto
     * @returns {boolean}
     */
    hasItem(productId) {
        return this.items.some(item => item.matchesProduct(productId));
    }

    /**
     * Valida o carrinho para finalização
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        if (this.isEmpty()) return { isValid: false, errors: ['O carrinho está vazio'] };
        const errors = this.items.flatMap(item => {
            const { isValid, errors } = item.validate();
            return isValid ? [] : errors.map(e => `${item.product?.name}: ${e}`);
        });
        return { isValid: !errors.length, errors };
    }

    /**
     * Retorna os dados para criação de uma venda
     * @returns {Object} { items: Array, total: number, discount: number, discountType: string }
     */
    getSaleData() {
        return {
            items: this.items.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                productPrice: item.product.price,
                quantity: item.quantity,
                subtotal: item.getSubtotal()
            })),
            subtotal: this.getSubtotal(),
            discount: this.getDiscountAmount(),
            discountType: this.discountType,
            total: this.getTotal(),
            totalItems: this.getTotalItems()
        };
    }

    /**
     * Retorna uma cópia simples do objeto para serialização
     * @returns {Object}
     */
    toJSON() {
        return {
            items: this.items.map(item => item.toJSON()),
            discount: this.discount,
            discountType: this.discountType,
            subtotal: this.getSubtotal(),
            total: this.getTotal(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Cria uma instância de Cart a partir de dados JSON
     * @param {Object} json - Dados do carrinho
     * @returns {Cart}
     */
    static fromJSON = (json) => new Cart(json);

    /**
     * Cria uma cópia do carrinho
     * @returns {Cart}
     */
    clone() {
        return new Cart({
            items: this.items.map(item => item.clone()),
            discount: this.discount,
            discountType: this.discountType,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
    }
}

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cart;
}
