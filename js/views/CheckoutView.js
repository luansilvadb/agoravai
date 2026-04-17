/**
 * CheckoutView
 * View para finalização de vendas e pagamento
 */
class CheckoutView {
    constructor(containerId = 'main-content', onCompleteCallback = null) {
        this.container = document.getElementById(containerId);
        this.cartManager = cartManager;
        this.storage = storageService;
        this.onCompleteCallback = onCompleteCallback;
        this.selectedPaymentMethod = 'cash';
        this.amountPaid = 0;
        this.customer = { name: '', phone: '', email: '' };
    }

    /**
     * Renderiza a view de checkout
     */
    render() {
        const cartData = this.cartManager.getCartSummary();
        if (cartData.isEmpty) return window.showToast('Adicione produtos ao carrinho primeiro', 'warning');
        this.container.innerHTML = `
            <div class="checkout-view">
                <div class="products-header">
                    <h1>Finalizar Venda</h1>
                    <button class="btn btn-secondary" id="back-to-pos">
                        <i data-lucide="arrow-left"></i>
                        <span>Voltar</span>
                    </button>
                </div>
                
                <div class="checkout-container">
                    <!-- Método de Pagamento -->
                    <div class="checkout-section card">
                        <div class="card-header">
                            <h3><i data-lucide="credit-card"></i> Forma de Pagamento</h3>
                        </div>
                        <div class="card-body">
                            <div class="payment-methods">
                                <div class="payment-method ${this.selectedPaymentMethod === 'cash' ? 'selected' : ''}" data-method="cash">
                                    <i data-lucide="banknote"></i>
                                    <span>Dinheiro</span>
                                </div>
                                <div class="payment-method ${this.selectedPaymentMethod === 'credit' ? 'selected' : ''}" data-method="credit">
                                    <i data-lucide="credit-card"></i>
                                    <span>Cartão Crédito</span>
                                </div>
                                <div class="payment-method ${this.selectedPaymentMethod === 'debit' ? 'selected' : ''}" data-method="debit">
                                    <i data-lucide="credit-card"></i>
                                    <span>Cartão Débito</span>
                                </div>
                                <div class="payment-method ${this.selectedPaymentMethod === 'pix' ? 'selected' : ''}" data-method="pix">
                                    <i data-lucide="smartphone"></i>
                                    <span>PIX</span>
                                </div>
                            </div>
                            
                            <!-- Calculadora de Troco (apenas para dinheiro) -->
                            <div id="change-calculator" class="change-calculator ${this.selectedPaymentMethod === 'cash' ? '' : 'hidden'}">
                                <div class="form-group">
                                    <label class="form-label">Valor Recebido</label>
                                    <input type="number" 
                                           class="form-input" 
                                           id="amount-paid"
                                           step="0.01" 
                                           min="${cartData.total}"
                                           placeholder="0,00"
                                           value="${this.amountPaid > 0 ? this.amountPaid : cartData.total}">
                                </div>
                                <div id="change-display" class="change-amount"></div>
                            </div>
                            
                            <!-- Info PIX -->
                            <div id="pix-info" class="alert alert-info ${this.selectedPaymentMethod === 'pix' ? '' : 'hidden'}">
                                <i data-lucide="info"></i>
                                <span>Use o app do seu banco para escanear o QR Code ou copiar a chave PIX.</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dados do Cliente -->
                    <div class="checkout-section card">
                        <div class="card-header">
                            <h3><i data-lucide="user"></i> Dados do Cliente (Opcional)</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label">Nome</label>
                                <input type="text" 
                                       class="form-input" 
                                       id="customer-name"
                                       value="${this._escapeHtml(this.customer.name)}"
                                       placeholder="Nome do cliente">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Telefone</label>
                                    <input type="tel" 
                                           class="form-input" 
                                           id="customer-phone"
                                           value="${this._escapeHtml(this.customer.phone)}"
                                           placeholder="(00) 00000-0000">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" 
                                           class="form-input" 
                                           id="customer-email"
                                           value="${this._escapeHtml(this.customer.email)}"
                                           placeholder="email@exemplo.com">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Observações -->
                    <div class="checkout-section card">
                        <div class="card-header">
                            <h3><i data-lucide="file-text"></i> Observações</h3>
                        </div>
                        <div class="card-body">
                            <textarea class="form-input" 
                                      id="sale-notes" 
                                      rows="2"
                                      placeholder="Observações sobre a venda..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Resumo da Venda -->
                    <div class="checkout-section card">
                        <div class="card-header">
                            <h3><i data-lucide="receipt"></i> Resumo</h3>
                        </div>
                        <div class="card-body">
                            <div style="margin-bottom: 1rem;">
                                ${cartData.items.map(item => `
                                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--color-gray-100);">
                                        <span>${item.quantity}x ${this._escapeHtml(item.product.name)}</span>
                                        <span>${item.formattedSubtotal}</span>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div style="background: var(--color-gray-50); padding: 1rem; border-radius: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Subtotal</span>
                                    <span>${cartData.formattedSubtotal}</span>
                                </div>
                                ${cartData.discount > 0 ? `
                                    <div style="display: flex; justify-content: space-between; color: var(--color-success); margin-bottom: 0.5rem;">
                                        <span>Desconto</span>
                                        <span>-${cartData.formattedDiscount}</span>
                                    </div>
                                ` : ''}
                                <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; padding-top: 0.5rem; border-top: 2px solid var(--color-gray-200);">
                                    <span>Total a Pagar</span>
                                    <span style="color: var(--color-primary);">${cartData.formattedTotal}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer" style="display: flex; gap: 0.75rem;">
                            <button class="btn btn-secondary" id="cancel-checkout" style="flex: 1;">
                                Cancelar
                            </button>
                            <button class="btn btn-success" id="confirm-sale" style="flex: 2;">
                                <i data-lucide="check-circle"></i>
                                <span>Confirmar Venda</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._attachEventListeners();
        lucide.createIcons();
        if (this.selectedPaymentMethod === 'cash') this._updateChangeDisplay();
    }

    /**
     * Anexa event listeners
     * @private
     */
    _attachEventListeners() {
        const goBack = () => this.onCompleteCallback?.('back');
        document.getElementById('back-to-pos')?.addEventListener('click', goBack);
        document.getElementById('cancel-checkout')?.addEventListener('click', goBack);

        document.querySelectorAll('.payment-method').forEach(method =>
            method.addEventListener('click', (e) => {
                const selected = e.currentTarget;
                this.selectedPaymentMethod = selected.dataset.method;
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                selected.classList.add('selected');

                const isCash = this.selectedPaymentMethod === 'cash';
                const isPix = this.selectedPaymentMethod === 'pix';
                document.getElementById('change-calculator')?.classList.toggle('hidden', !isCash);
                document.getElementById('pix-info')?.classList.toggle('hidden', !isPix);
                if (isCash) setTimeout(() => document.getElementById('amount-paid')?.focus(), 100);
            }));

        document.getElementById('amount-paid')?.addEventListener('input', (e) => {
            this.amountPaid = parseFloat(e.target.value) || 0;
            this._updateChangeDisplay();
        });

        document.getElementById('confirm-sale')?.addEventListener('click', () => this._processSale());
    }

    /**
     * Atualiza display do troco
     * @private
     */
    _updateChangeDisplay() {
        const { total } = this.cartManager.getCartSummary();
        const display = document.getElementById('change-display');
        if (!display) return;

        if (this.amountPaid >= total) {
            display.innerHTML = `<div style="color: var(--color-success);">Troco: <strong>${this._formatCurrency(this.amountPaid - total)}</strong></div>`;
        } else if (this.amountPaid > 0) {
            display.innerHTML = `<div style="color: var(--color-danger);">Faltam: <strong>${this._formatCurrency(total - this.amountPaid)}</strong></div>`;
        } else {
            display.innerHTML = '';
        }
    }

    /**
     * Processa a venda
     * @private
     */
    _processSale() {
        const { total } = this.cartManager.getCartSummary();
        if (this.selectedPaymentMethod === 'cash' && this.amountPaid < total) return window.showToast('Valor recebido insuficiente', 'error');

        this.customer = {
            name: document.getElementById('customer-name')?.value.trim() || '',
            phone: document.getElementById('customer-phone')?.value.trim() || '',
            email: document.getElementById('customer-email')?.value.trim() || ''
        };
        const notes = document.getElementById('sale-notes')?.value.trim() || '';

        const result = this.cartManager.checkout({ paymentMethod: this.selectedPaymentMethod, customer: this.customer, amountPaid: this.amountPaid, notes });
        result.success ? this._showReceipt(result.sale) : window.showToast(result.error || 'Erro ao processar venda', 'error');
    }

    /**
     * Mostra comprovante da venda
     * @private
     * @param {Sale} sale
     */
    _showReceipt(sale) {
        const modalHTML = `
            <div class="modal-overlay" id="receipt-modal">
                <div class="modal" style="max-width: 400px;">
                    <div class="modal-body" style="text-align: center; padding: 2rem;">
                        <div style="width: 64px; height: 64px; background: var(--color-success-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i data-lucide="check" style="width: 32px; height: 32px; color: var(--color-success);"></i>
                        </div>
                        <h3 style="margin-bottom: 0.5rem;">Venda Concluída!</h3>
                        <p style="color: var(--color-gray-500); margin-bottom: 1.5rem;">
                            Venda #${sale.id} registrada com sucesso.
                        </p>
                        
                        <div style="background: var(--color-gray-50); padding: 1rem; border-radius: 0.5rem; text-align: left; margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--color-gray-500);">Total:</span>
                                <span style="font-weight: 600;">${sale.getFormattedTotal()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--color-gray-500);">Pagamento:</span>
                                <span>${sale.getPaymentMethodLabel()}</span>
                            </div>
                            ${sale.hasChange() ? `
                                <div style="display: flex; justify-content: space-between; color: var(--color-success);">
                                    <span>Troco:</span>
                                    <span style="font-weight: 600;">${sale.getFormattedChange()}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <button class="btn btn-primary" id="close-receipt" style="width: 100%;">
                            Nova Venda
                        </button>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        setTimeout(() => {
            const modal = document.getElementById('receipt-modal');
            modal.classList.add('open');
            lucide.createIcons();
        }, 10);

        document.getElementById('close-receipt')?.addEventListener('click', () => {
            if (this.onCompleteCallback) this.onCompleteCallback('complete');
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
}
