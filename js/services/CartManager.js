/**
 * CartManager
 * Gerencia o estado do carrinho de compras e sua persistência
 */
class CartManager {
    constructor() {
        this.cart = new Cart();
        this.storage = storageService;
        this.listeners = [];
        this._loadFromStorage();
    }

    /**
     * Carrega o carrinho do localStorage
     * @private
     */
    _loadFromStorage() {
        const savedCart = this.storage.loadCart();
        if (savedCart) {
            this.cart = savedCart;
        }
    }

    /**
     * Salva o carrinho no localStorage
     * @private
     */
    _saveToStorage() {
        const settings = this.storage.getSettings();
        if (settings.autoSaveCart !== false) {
            this.storage.saveCart(this.cart);
        }
    }

    /**
     * Notifica todos os listeners sobre mudanças no carrinho
     * @private
     */
    _notifyListeners() {
        const data = this.getCartSummary();
        this.listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in cart listener:', error);
            }
        });
    }

    /**
     * Registra um listener para mudanças no carrinho
     * @param {Function} callback - Função a ser chamada quando o carrinho mudar
     * @returns {Function} Função para remover o listener
     */
    onChange(callback) {
        this.listeners.push(callback);
        return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
    }

    /**
     * Retorna o carrinho atual
     * @returns {Cart}
     */
    getCart() {
        return this.cart;
    }

    /**
     * Retorna um resumo do carrinho para a UI
     * @returns {Object}
     */
    getCartSummary() {
        const { items, discount, discountType } = this.cart;
        const subtotal = this.cart.getSubtotal();
        const discountAmount = this.cart.getDiscountAmount();
        const total = this.cart.getTotal();
        return {
            items: items.map(({ product, quantity }) => ({
                product: { id: product.id, name: product.name, price: product.price, formattedPrice: product.getFormattedPrice() },
                quantity,
                subtotal: quantity * product.price,
                formattedSubtotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quantity * product.price)
            })),
            itemCount: this.cart.getTotalItems(),
            uniqueItemCount: items.length,
            subtotal,
            formattedSubtotal: this._formatCurrency(subtotal),
            discount: discountAmount,
            formattedDiscount: this._formatCurrency(discountAmount),
            total,
            formattedTotal: this._formatCurrency(total),
            isEmpty: !items.length,
            discountInfo: { amount: discount, type: discountType }
        };
    }

    /**
     * Formata valor como moeda
     * @private
     * @param {number} value
     * @returns {string}
     */
    _formatCurrency(value) {
        const settings = this.storage.getSettings();
        return new Intl.NumberFormat(settings.locale || 'pt-BR', {
            style: 'currency',
            currency: settings.currency || 'BRL'
        }).format(value);
    }

    // ============================================
    // ADICIONAR/REMOVER ITENS
    // ============================================

    /**
     * Adiciona um produto ao carrinho
     * @param {Product} product - Produto a adicionar
     * @param {number} [quantity=1] - Quantidade
     * @returns {Object} { success: boolean, message: string }
     */
    addProduct(product, quantity = 1) {
        const result = this.cart.addItem(product, quantity);
        if (result.success) {
            this._saveToStorage();
            this._notifyListeners();
        }
        return result;
    }

    /**
     * Remove um produto do carrinho
     * @param {string} productId - ID do produto
     * @returns {Object} { success: boolean, message: string }
     */
    removeProduct(productId) {
        const removed = this.cart.removeItem(productId);
        if (!removed) return { success: false, message: 'Produto não encontrado no carrinho' };
        this._saveToStorage();
        this._notifyListeners();
        return { success: true, message: 'Produto removido do carrinho' };
    }

    /**
     * Atualiza a quantidade de um produto
     * @param {string} productId - ID do produto
     * @param {number} quantity - Nova quantidade
     * @returns {Object} { success: boolean, message: string }
     */
    updateQuantity(productId, quantity) {
        const result = this.cart.updateItemQuantity(productId, quantity);
        if (result.success) {
            this._saveToStorage();
            this._notifyListeners();
        }
        return result;
    }

    /**
     * Aumenta a quantidade de um produto
     * @param {string} productId - ID do produto
     * @returns {Object} { success: boolean, message: string }
     */
    increaseQuantity(productId) {
        const result = this.cart.increaseItemQuantity(productId);
        if (result.success) {
            this._saveToStorage();
            this._notifyListeners();
        }
        return result;
    }

    /**
     * Diminui a quantidade de um produto
     * @param {string} productId - ID do produto
     * @returns {Object} { success: boolean, message: string, removed: boolean }
     */
    decreaseQuantity(productId) {
        const result = this.cart.decreaseItemQuantity(productId);
        if (result.success) {
            this._saveToStorage();
            this._notifyListeners();
        }
        return result;
    }

    /**
     * Move estoque dos produtos no carrinho (para uso durante checkout)
     * @returns {Object} { success: boolean, errors: string[] }
     */
    _reserveStock() {
        const errors = [];
        const products = new Map(this.storage.getAllProducts().map(p => [p.id, p]));
        this.cart.items.forEach(item => {
            const product = products.get(item.product?.id);
            if (!product) return errors.push(`Produto ${item.product?.name} não encontrado`);
            if (!product.decreaseStock(item.quantity)) errors.push(`Estoque insuficiente para ${product.name}`);
            else this.storage.updateProduct(product.id, { stock: product.stock });
        });
        return { success: !errors.length, errors };
    }

    /**
     * Restaura estoque dos produtos no carrinho (para uso em cancelamentos)
     * @returns {Object} { success: boolean }
     */
    _restoreStock() {
        const products = new Map(this.storage.getAllProducts().map(p => [p.id, p]));
        this.cart.items.forEach(item => {
            const product = products.get(item.product?.id);
            if (product?.increaseStock(item.quantity)) this.storage.updateProduct(product.id, { stock: product.stock });
        });
        return { success: true };
    }

    // ============================================
    // DESCONTOS
    // ============================================

    /**
     * Aplica um desconto ao carrinho
     * @param {number} value - Valor do desconto
     * @param {string} [type='fixed'] - Tipo: 'fixed' ou 'percentage'
     * @returns {Object} { success: boolean, message: string }
     */
    applyDiscount(value, type = 'fixed') {
        if (!this.cart.applyDiscount(value, type)) return { success: false, message: 'Valor de desconto inválido' };
        this._saveToStorage();
        this._notifyListeners();
        return { success: true, message: `Desconto de ${this._formatCurrency(this.cart.getDiscountAmount())} aplicado` };
    }

    /**
     * Remove o desconto do carrinho
     */
    removeDiscount() {
        this.cart.removeDiscount();
        this._saveToStorage();
        this._notifyListeners();
    }

    // ============================================
    // CHECKOUT
    // ============================================

    /**
     * Valida o carrinho para finalização
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validateForCheckout() {
        return this.cart.validate();
    }

    /**
     * Processa o checkout e cria uma venda
     * @param {Object} options - Opções do checkout
     * @param {string} options.paymentMethod - Método de pagamento
     * @param {Object} [options.customer] - Dados do cliente
     * @param {number} [options.amountPaid] - Valor pago (para troco)
     * @param {string} [options.notes] - Observações
     * @returns {Object} { success: boolean, sale: Sale|null, error: string|null }
     */
    checkout(options = {}) {
        const validation = this.validateForCheckout();
        if (!validation.isValid) return { success: false, sale: null, error: validation.errors.join(', ') };

        const stockCheck = this._reserveStock();
        if (!stockCheck.success) return { success: false, sale: null, error: stockCheck.errors.join(', ') };

        try {
            const sale = Sale.fromCart(this.cart, {
                paymentMethod: options.paymentMethod || 'cash',
                customer: options.customer || { name: '', phone: '', email: '' },
                notes: options.notes || '',
                amountPaid: options.amountPaid || this.cart.getTotal()
            });

            if (sale.isCashPayment() && options.amountPaid) {
                const changeResult = sale.calculateChange(options.amountPaid);
                if (!changeResult.success && sale.total > 0) {
                    this._restoreStock();
                    return { success: false, sale: null, error: changeResult.message };
                }
            }

            const saveResult = this.storage.saveSale(sale);
            if (!saveResult.success) {
                this._restoreStock();
                return { success: false, sale: null, error: saveResult.error };
            }

            this.clear();
            return { success: true, sale, error: null };
        } catch (error) {
            this._restoreStock();
            console.error('Checkout error:', error);
            return { success: false, sale: null, error: 'Erro ao processar venda' };
        }
    }

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Limpa o carrinho
     */
    clear() {
        this.cart.clear();
        this.storage.clearCart();
        this._notifyListeners();
    }

    /**
     * Verifica se o carrinho está vazio
     * @returns {boolean}
     */
    isEmpty() {
        return this.cart.isEmpty();
    }

    /**
     * Retorna o número total de itens
     * @returns {number}
     */
    getItemCount() {
        return this.cart.getTotalItems();
    }

    /**
     * Verifica se um produto está no carrinho
     * @param {string} productId - ID do produto
     * @returns {boolean}
     */
    hasProduct = (productId) => this.cart.hasItem(productId);

    /**
     * Retorna a quantidade de um produto no carrinho
     * @param {string} productId - ID do produto
     * @returns {number}
     */
    getProductQuantity = (productId) => this.cart.findItem(productId)?.quantity || 0;

    /**
     * Retorna o estoque disponível para um produto
     * @param {string} productId - ID do produto
     * @returns {number}
     */
    getAvailableStock = (productId) => {
        const product = this.storage.getProductById(productId);
        return product ? product.stock + this.getProductQuantity(productId) : 0;
    };

    /**
     * Sincroniza o carrinho com os produtos atuais (remove itens de produtos que não existem mais)
     * @returns {Object} { removed: number }
     */
    syncWithProducts() {
        const productIds = new Set(this.storage.getAllProducts().map(p => p.id));
        const originalLength = this.cart.items.length;
        this.cart.items = this.cart.items.filter(item => productIds.has(item.product?.id));
        const removed = originalLength - this.cart.items.length;
        if (removed) {
            this.cart._invalidateCache();
            this._saveToStorage();
            this._notifyListeners();
        }
        return { removed };
    }

    /**
     * Atualiza os dados dos produtos no carrinho (preços, nomes, etc.)
     * @returns {Object} { updated: number }
     */
    refreshProductData() {
        const products = new Map(this.storage.getAllProducts().map(p => [p.id, p]));
        let updated = 0;
        this.cart.items.forEach(item => {
            const current = products.get(item.product?.id);
            if (current && (item.product.price !== current.price || item.product.name !== current.name)) {
                item.product = current.clone();
                updated++;
            }
        });
        if (updated) {
            this.cart._invalidateCache();
            this._saveToStorage();
            this._notifyListeners();
        }
        return { updated };
    }
}

// Cria instância singleton
const cartManager = new CartManager();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CartManager, cartManager };
}
