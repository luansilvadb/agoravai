/**
 * CartView
 * View para exibição e gerenciamento do carrinho
 */
class CartView {
    constructor(containerId = 'cart-container') {
        this.containerId = containerId;
        this.cartManager = cartManager;
        this.onCheckoutCallback = null;
    }

    /**
     * Renderiza o carrinho
     * @param {string} [targetContainer] - ID alternativo do container
     */
    render(targetContainer = null) {
        const container = document.getElementById(targetContainer || this.containerId);
        if (!container) return;

        const cartData = this.cartManager.getCartSummary();

        if (cartData.isEmpty) {
            container.innerHTML = this._renderEmptyState();
        } else {
            container.innerHTML = this._renderCartWithItems(cartData);
        }

        this._attachEventListeners(container);
        lucide.createIcons();
    }

    /**
     * Renderiza estado vazio
     * @private
     */
    _renderEmptyState() {
        return `
            <div class="cart-empty">
                <i data-lucide="shopping-cart"></i>
                <p>Carrinho vazio</p>
                <small>Adicione produtos para iniciar uma venda</small>
            </div>
        `;
    }

    /**
     * Renderiza carrinho com itens
     * @private
     * @param {Object} cartData
     */
    _renderCartWithItems(cartData) {
        const hasDiscount = cartData.discount > 0;

        return `
            <div class="cart-container">
                <div class="cart-items">
                    ${cartData.items.map(item => this._renderCartItem(item)).join('')}
                </div>
                
                ${hasDiscount ? `
                    <div style="padding: 0.75rem 1rem; background: var(--color-success-light); border-top: 1px solid var(--color-gray-200);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.875rem; color: var(--color-success);">
                                <i data-lucide="tag" style="width: 14px; height: 14px; display: inline; margin-right: 4px;"></i>
                                Desconto ${cartData.discountInfo.type === 'percentage' ? cartData.discountInfo.amount + '%' : ''}
                            </span>
                            <button class="btn btn-sm btn-outline" id="remove-discount-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                Remover
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <div class="cart-footer">
                    <div class="cart-totals">
                        <div class="cart-total-row">
                            <span>Subtotal (${cartData.itemCount} item${cartData.itemCount > 1 ? 's' : ''})</span>
                            <span>${cartData.formattedSubtotal}</span>
                        </div>
                        ${hasDiscount ? `
                            <div class="cart-total-row" style="color: var(--color-success);">
                                <span>Desconto</span>
                                <span>-${cartData.formattedDiscount}</span>
                            </div>
                        ` : ''}
                        <div class="cart-total-row total">
                            <span>Total</span>
                            <span>${cartData.formattedTotal}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <button class="btn btn-outline btn-sm" id="add-discount-btn" style="flex: 1;">
                            <i data-lucide="tag"></i>
                            ${hasDiscount ? 'Alterar' : 'Aplicar'} Desconto
                        </button>
                        <button class="btn btn-outline btn-sm" id="clear-cart-btn" style="flex: 1;">
                            <i data-lucide="trash-2"></i>
                            Limpar
                        </button>
                    </div>
                    
                    <button class="btn btn-success checkout-btn" id="checkout-btn">
                        <i data-lucide="credit-card"></i>
                        <span>Finalizar Venda</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza um item do carrinho
     * @private
     * @param {Object} item
     */
    _renderCartItem(item) {
        return `
            <div class="cart-item" data-product-id="${item.product.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${this._escapeHtml(item.product.name)}</div>
                    <div class="cart-item-price">${item.product.formattedPrice} un</div>
                </div>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-qty" data-id="${item.product.id}">−</button>
                    <span style="min-width: 24px; text-align: center; font-weight: 500;">${item.quantity}</span>
                    <button class="quantity-btn increase-qty" data-id="${item.product.id}">+</button>
                </div>
                
                <div class="cart-item-total">${item.formattedSubtotal}</div>
                
                <button class="remove-item-btn remove-item" data-id="${item.product.id}">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
        `;
    }

    /**
     * Anexa event listeners
     * @private
     * @param {HTMLElement} container
     */
    _attachEventListeners(container) {
        // Diminuir quantidade
        container.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const result = this.cartManager.decreaseQuantity(id);
                if (result.removed) {
                    window.showToast('Item removido do carrinho', 'info');
                }
                this.render();
            });
        });

        // Aumentar quantidade
        container.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const result = this.cartManager.increaseQuantity(id);
                if (!result.success) {
                    window.showToast(result.message, 'warning');
                }
                this.render();
            });
        });

        // Remover item
        container.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.cartManager.removeProduct(id);
                window.showToast('Item removido do carrinho', 'info');
                this.render();
            });
        });

        // Aplicar desconto
        const addDiscountBtn = container.querySelector('#add-discount-btn');
        if (addDiscountBtn) {
            addDiscountBtn.addEventListener('click', () => this._showDiscountModal());
        }

        // Remover desconto
        const removeDiscountBtn = container.querySelector('#remove-discount-btn');
        if (removeDiscountBtn) {
            removeDiscountBtn.addEventListener('click', () => {
                this.cartManager.removeDiscount();
                window.showToast('Desconto removido', 'info');
                this.render();
            });
        }

        // Limpar carrinho
        const clearCartBtn = container.querySelector('#clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                    this.cartManager.clear();
                    window.showToast('Carrinho limpo', 'info');
                    this.render();
                }
            });
        }

        // Checkout
        const checkoutBtn = container.querySelector('#checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.onCheckoutCallback) {
                    this.onCheckoutCallback();
                }
            });
        }
    }

    /**
     * Mostra modal para aplicar desconto
     * @private
     */
    _showDiscountModal() {
        const currentData = this.cartManager.getCartSummary();
        
        const modalHTML = `
            <div class="modal-overlay" id="discount-modal">
                <div class="modal" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>Aplicar Desconto</h3>
                        <button class="close-btn" id="close-discount-modal">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <form id="discount-form">
                        <div class="modal-body">
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                                <button type="button" class="btn ${currentData.discountInfo.type === 'fixed' ? 'btn-primary' : 'btn-outline'}" 
                                        id="discount-type-fixed" style="flex: 1;">Valor (R$)</button>
                                <button type="button" class="btn ${currentData.discountInfo.type === 'percentage' ? 'btn-primary' : 'btn-outline'}" 
                                        id="discount-type-percentage" style="flex: 1;">Percentual (%)</button>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Valor do Desconto</label>
                                <input type="number" 
                                       class="form-input" 
                                       id="discount-value" 
                                       min="0" 
                                       step="${currentData.discountInfo.type === 'percentage' ? '1' : '0.01'}"
                                       max="${currentData.discountInfo.type === 'percentage' ? '100' : currentData.subtotal}"
                                       value="${currentData.discountInfo.amount || ''}"
                                       placeholder="0"
                                       required>
                            </div>
                            
                            <div id="discount-preview" style="background: var(--color-gray-50); padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Subtotal:</span>
                                    <span>${currentData.formattedSubtotal}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; color: var(--color-success); margin-bottom: 0.5rem;">
                                    <span>Desconto:</span>
                                    <span id="preview-discount">-${currentData.formattedDiscount}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.125rem; padding-top: 0.5rem; border-top: 1px solid var(--color-gray-200);">
                                    <span>Total:</span>
                                    <span id="preview-total">${currentData.formattedTotal}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-discount-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Aplicar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        let discountType = currentData.discountInfo.type || 'fixed';

        // Mostra o modal
        setTimeout(() => {
            const modal = document.getElementById('discount-modal');
            modal.classList.add('open');
            lucide.createIcons();
            document.getElementById('discount-value').focus();
        }, 10);

        // Event listeners
        const modal = document.getElementById('discount-modal');
        const form = document.getElementById('discount-form');
        const valueInput = document.getElementById('discount-value');

        // Fecha modal
        const closeModal = () => {
            modal.classList.remove('open');
            setTimeout(() => modalContainer.remove(), 300);
        };

        document.getElementById('close-discount-modal').addEventListener('click', closeModal);
        document.getElementById('cancel-discount-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Toggle tipo de desconto
        document.getElementById('discount-type-fixed').addEventListener('click', function() {
            discountType = 'fixed';
            this.classList.add('btn-primary');
            this.classList.remove('btn-outline');
            document.getElementById('discount-type-percentage').classList.remove('btn-primary');
            document.getElementById('discount-type-percentage').classList.add('btn-outline');
            valueInput.step = '0.01';
            valueInput.max = currentData.subtotal;
        });

        document.getElementById('discount-type-percentage').addEventListener('click', function() {
            discountType = 'percentage';
            this.classList.add('btn-primary');
            this.classList.remove('btn-outline');
            document.getElementById('discount-type-fixed').classList.remove('btn-primary');
            document.getElementById('discount-type-fixed').classList.add('btn-outline');
            valueInput.step = '1';
            valueInput.max = '100';
        });

        // Preview em tempo real
        valueInput.addEventListener('input', () => {
            const value = parseFloat(valueInput.value) || 0;
            const subtotal = currentData.subtotal;
            let discount = 0;
            let total = subtotal;

            if (discountType === 'percentage') {
                discount = subtotal * (Math.min(value, 100) / 100);
            } else {
                discount = Math.min(value, subtotal);
            }

            total = subtotal - discount;

            document.getElementById('preview-discount').textContent = '-' + this._formatCurrency(discount);
            document.getElementById('preview-total').textContent = this._formatCurrency(total);
        });

        // Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = parseFloat(valueInput.value);
            
            if (isNaN(value) || value <= 0) {
                window.showToast('Informe um valor de desconto válido', 'error');
                return;
            }

            const result = this.cartManager.applyDiscount(value, discountType);
            
            if (result.success) {
                window.showToast(result.message, 'success');
                closeModal();
                this.render();
            } else {
                window.showToast(result.message, 'error');
            }
        });
    }

    /**
     * Formata valor como moeda
     * @private
     */
    _formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Escapa HTML
     * @private
     */
    _escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Define callback para checkout
     * @param {Function} callback
     */
    onCheckout(callback) {
        this.onCheckoutCallback = callback;
    }

    /**
     * Atualiza o carrinho (para uso em listeners externos)
     */
    refresh() {
        this.render();
    }
}
