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
        container.innerHTML = cartData.isEmpty ? this._renderEmptyState() : this._renderCartWithItems(cartData);
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
        const onQtyChange = (id, result, removedMsg) => {
            if (removedMsg && result.removed) window.showToast(removedMsg, 'info');
            if (!result.success && result.message) window.showToast(result.message, 'warning');
            this.render();
        };

        container.querySelectorAll('.decrease-qty').forEach(btn =>
            btn.addEventListener('click', (e) => onQtyChange(e.currentTarget.dataset.id, this.cartManager.decreaseQuantity(e.currentTarget.dataset.id), 'Item removido do carrinho')));

        container.querySelectorAll('.increase-qty').forEach(btn =>
            btn.addEventListener('click', (e) => onQtyChange(e.currentTarget.dataset.id, this.cartManager.increaseQuantity(e.currentTarget.dataset.id))));

        container.querySelectorAll('.remove-item').forEach(btn =>
            btn.addEventListener('click', (e) => {
                this.cartManager.removeProduct(e.currentTarget.dataset.id);
                window.showToast('Item removido do carrinho', 'info');
                this.render();
            }));

        container.querySelector('#add-discount-btn')?.addEventListener('click', () => this._showDiscountModal());

        container.querySelector('#remove-discount-btn')?.addEventListener('click', () => {
            this.cartManager.removeDiscount();
            window.showToast('Desconto removido', 'info');
            this.render();
        });

        container.querySelector('#clear-cart-btn')?.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                this.cartManager.clear();
                window.showToast('Carrinho limpo', 'info');
                this.render();
            }
        });

        container.querySelector('#checkout-btn')?.addEventListener('click', () => this.onCheckoutCallback?.());
    }

    /**
     * Mostra modal para aplicar desconto
     * @private
     */
    _showDiscountModal() {
        const current = this.cartManager.getCartSummary();
        const isFixed = current.discountInfo.type === 'fixed';

        const modalHTML = `
            <div class="modal-overlay" id="discount-modal">
                <div class="modal" style="max-width: 400px;">
                    <div class="modal-header"><h3>Aplicar Desconto</h3><button class="close-btn" id="close-discount-modal"><i data-lucide="x"></i></button></div>
                    <form id="discount-form">
                        <div class="modal-body">
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                                <button type="button" class="btn ${isFixed ? 'btn-primary' : 'btn-outline'}" id="discount-type-fixed" style="flex: 1;">Valor (R$)</button>
                                <button type="button" class="btn ${!isFixed ? 'btn-primary' : 'btn-outline'}" id="discount-type-percentage" style="flex: 1;">Percentual (%)</button>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Valor do Desconto</label>
                                <input type="number" class="form-input" id="discount-value" min="0" step="${isFixed ? '0.01' : '1'}"
                                    max="${isFixed ? current.subtotal : '100'}" value="${current.discountInfo.amount || ''}" placeholder="0" required>
                            </div>
                            <div id="discount-preview" style="background: var(--color-gray-50); padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Subtotal:</span><span>${current.formattedSubtotal}</span></div>
                                <div style="display: flex; justify-content: space-between; color: var(--color-success); margin-bottom: 0.5rem;"><span>Desconto:</span><span id="preview-discount">-${current.formattedDiscount}</span></div>
                                <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.125rem; padding-top: 0.5rem; border-top: 1px solid var(--color-gray-200);"><span>Total:</span><span id="preview-total">${current.formattedTotal}</span></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-discount-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Aplicar</button>
                        </div>
                    </form>
                </div>
            </div>`;

        const container = document.createElement('div');
        container.innerHTML = modalHTML;
        document.body.appendChild(container);

        let discountType = current.discountInfo.type || 'fixed';
        const modal = document.getElementById('discount-modal');
        const valueInput = document.getElementById('discount-value');

        const closeModal = () => { modal.classList.remove('open'); setTimeout(() => container.remove(), 300); };

        setTimeout(() => { modal.classList.add('open'); lucide.createIcons(); valueInput.focus(); }, 10);

        document.getElementById('close-discount-modal')?.addEventListener('click', closeModal);
        document.getElementById('cancel-discount-btn')?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        const toggleType = (type, step, max) => {
            discountType = type;
            document.getElementById('discount-type-fixed').className = `btn ${type === 'fixed' ? 'btn-primary' : 'btn-outline'}`;
            document.getElementById('discount-type-percentage').className = `btn ${type === 'percentage' ? 'btn-primary' : 'btn-outline'}`;
            valueInput.step = step;
            valueInput.max = max;
        };

        document.getElementById('discount-type-fixed').addEventListener('click', () => toggleType('fixed', '0.01', current.subtotal));
        document.getElementById('discount-type-percentage').addEventListener('click', () => toggleType('percentage', '1', '100'));

        valueInput.addEventListener('input', () => {
            const value = parseFloat(valueInput.value) || 0;
            const discount = discountType === 'percentage' ? current.subtotal * (Math.min(value, 100) / 100) : Math.min(value, current.subtotal);
            document.getElementById('preview-discount').textContent = '-' + this._formatCurrency(discount);
            document.getElementById('preview-total').textContent = this._formatCurrency(current.subtotal - discount);
        });

        document.getElementById('discount-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const value = parseFloat(valueInput.value);
            if (!value || value <= 0) return window.showToast('Informe um valor de desconto válido', 'error');
            const result = this.cartManager.applyDiscount(value, discountType);
            window.showToast(result.message, result.success ? 'success' : 'error');
            if (result.success) { closeModal(); this.render(); }
        });
    }

    /**
     * Formata valor como moeda
     * @private
     */
    _formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    /**
     * Escapa HTML
     * @private
     */
    _escapeHtml = (text) => text ? Object.assign(document.createElement('div'), { textContent: text }).innerHTML : '';

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
