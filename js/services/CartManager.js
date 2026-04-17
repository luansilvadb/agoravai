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
        
        // Retorna função de unsubscribe
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
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
        return {
            items: this.cart.items.map(item => ({
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    formattedPrice: item.product.getFormattedPrice()
                },
                quantity: item.quantity,
                subtotal: item.getSubtotal(),
                formattedSubtotal: item.getFormattedSubtotal()
            })),
            itemCount: this.cart.getTotalItems(),
            uniqueItemCount: this.cart.getUniqueItemCount(),
            subtotal: this.cart.getSubtotal(),
            formattedSubtotal: this._formatCurrency(this.cart.getSubtotal()),
            discount: this.cart.getDiscountAmount(),
            formattedDiscount: this._formatCurrency(this.cart.getDiscountAmount()),
            total: this.cart.getTotal(),
            formattedTotal: this._formatCurrency(this.cart.getTotal()),
            isEmpty: this.cart.isEmpty(),
            discountInfo: {
                amount: this.cart.discount,
                type: this.cart.discountType
            }
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
        
        return {
            success: result.success,
            message: result.message,
            item: result.item
        };
    }

    /**
     * Remove um produto do carrinho
     * @param {string} productId - ID do produto
     * @returns {Object} { success: boolean, message: string }
     */
    removeProduct(productId) {
        const removed = this.cart.removeItem(productId);
        
        if (removed) {
            this._saveToStorage();
            this._notifyListeners();
            return { success: true, message: 'Produto removido do carrinho' };
        }
        
        return { success: false, message: 'Produto não encontrado no carrinho' };
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
        const products = this.storage.getAllProducts();
        
        for (const item of this.cart.items) {
            const product = products.find(p => p.id === item.product.id);
            if (!product) {
                errors.push(`Produto ${item.product.name} não encontrado`);
                continue;
            }
            
            if (!product.decreaseStock(item.quantity)) {
                errors.push(`Estoque insuficiente para ${product.name}`);
            } else {
                // Atualiza no storage
                this.storage.updateProduct(product.id, { stock: product.stock });
            }
        }
        
        return {
            success: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Restaura estoque dos produtos no carrinho (para uso em cancelamentos)
     * @returns {Object} { success: boolean }
     */
    _restoreStock() {
        const products = this.storage.getAllProducts();
        
        for (const item of this.cart.items) {
            const product = products.find(p => p.id === item.product.id);
            if (product) {
                product.increaseStock(item.quantity);
                this.storage.updateProduct(product.id, { stock: product.stock });
            }
        }
        
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
        const applied = this.cart.applyDiscount(value, type);
        
        if (applied) {
            this._saveToStorage();
            this._notifyListeners();
            
            const discountAmount = this.cart.getDiscountAmount();
            return {
                success: true,
                message: `Desconto de ${this._formatCurrency(discountAmount)} aplicado`
            };
        }
        
        return {
            success: false,
            message: 'Valor de desconto inválido'
        };
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
    checkout(options) {
        // Valida o carrinho
        const validation = this.validateForCheckout();
        if (!validation.isValid) {
            return { success: false, sale: null, error: validation.errors.join(', ') };
        }

        // Verifica/Reserva estoque
        const stockCheck = this._reserveStock();
        if (!stockCheck.success) {
            return { success: false, sale: null, error: stockCheck.errors.join(', ') };
        }

        try {
            // Cria a venda
            const sale = Sale.fromCart(this.cart, {
                paymentMethod: options.paymentMethod || 'cash',
                customer: options.customer || { name: '', phone: '', email: '' },
                notes: options.notes || '',
                amountPaid: options.amountPaid || this.cart.getTotal()
            });

            // Calcula troco se for pagamento em dinheiro
            if (sale.isCashPayment() && options.amountPaid) {
                const changeResult = sale.calculateChange(options.amountPaid);
                if (!changeResult.success && sale.total > 0) {
                    // Restaura estoque em caso de erro
                    this._restoreStock();
                    return { success: false, sale: null, error: changeResult.message };
                }
            }

            // Salva a venda
            const saveResult = this.storage.saveSale(sale);
            if (!saveResult.success) {
                // Restaura estoque em caso de erro
                this._restoreStock();
                return { success: false, sale: null, error: saveResult.error };
            }

            // Limpa o carrinho
            this.clear();

            return { success: true, sale: sale, error: null };
        } catch (error) {
            // Restaura estoque em caso de erro
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
    hasProduct(productId) {
        return this.cart.hasItem(productId);
    }

    /**
     * Retorna a quantidade de um produto no carrinho
     * @param {string} productId - ID do produto
     * @returns {number}
     */
    getProductQuantity(productId) {
        const item = this.cart.findItem(productId);
        return item ? item.quantity : 0;
    }

    /**
     * Retorna o estoque disponível para um produto
     * @param {string} productId - ID do produto
     * @returns {number}
     */
    getAvailableStock(productId) {
        const product = this.storage.getProductById(productId);
        if (!product) return 0;

        // Considera o que já está no carrinho
        const cartQuantity = this.getProductQuantity(productId);
        return product.stock + cartQuantity;
    }

    /**
     * Sincroniza o carrinho com os produtos atuais (remove itens de produtos que não existem mais)
     * @returns {Object} { removed: number }
     */
    syncWithProducts() {
        const products = this.storage.getAllProducts();
        const productIds = new Set(products.map(p => p.id));
        
        let removed = 0;
        this.cart.items = this.cart.items.filter(item => {
            const exists = productIds.has(item.product.id);
            if (!exists) removed++;
            return exists;
        });

        if (removed > 0) {
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
        const products = this.storage.getAllProducts();
        let updated = 0;

        for (const item of this.cart.items) {
            const currentProduct = products.find(p => p.id === item.product.id);
            if (currentProduct) {
                // Atualiza dados do produto no carrinho
                if (item.product.price !== currentProduct.price ||
                    item.product.name !== currentProduct.name) {
                    item.product = currentProduct.clone();
                    updated++;
                }
            }
        }

        if (updated > 0) {
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
