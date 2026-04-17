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

        // Valida se há itens no carrinho
        if (cartData.isEmpty) {
            window.showToast('Adicione produtos ao carrinho primeiro', 'warning');
            return;
        }

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
        
        // Atualiza display do troco se for dinheiro
        if (this.selectedPaymentMethod === 'cash') {
            this._updateChangeDisplay();
        }
    }

    /**
     * Anexa event listeners
     * @private
     */
    _attachEventListeners() {
        // Voltar
        document.getElementById('back-to-pos')?.addEventListener('click', () => {
            if (this.onCompleteCallback) this.onCompleteCallback('back');
        });

        // Cancelar
        document.getElementById('cancel-checkout')?.addEventListener('click', () => {
            if (this.onCompleteCallback) this.onCompleteCallback('back');
        });

        // Seleção de método de pagamento
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                const selected = e.currentTarget;
                this.selectedPaymentMethod = selected.dataset.method;

                // Atualiza visual
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                selected.classList.add('selected');

                // Mostra/esconde calculadora de troco
                const changeCalculator = document.getElementById('change-calculator');
                const pixInfo = document.getElementById('pix-info');

                if (this.selectedPaymentMethod === 'cash') {
                    changeCalculator?.classList.remove('hidden');
                    pixInfo?.classList.add('hidden');
                    
                    // Foca no input
                    setTimeout(() => document.getElementById('amount-paid')?.focus(), 100);
                } else if (this.selectedPaymentMethod === 'pix') {
                    changeCalculator?.classList.add('hidden');
                    pixInfo?.classList.remove('hidden');
                } else {
                    changeCalculator?.classList.add('hidden');
                    pixInfo?.classList.add('hidden');
                }
            });
        });

        // Calculadora de troco
        const amountInput = document.getElementById('amount-paid');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.amountPaid = parseFloat(amountInput.value) || 0;
                this._updateChangeDisplay();
            });
        }

        // Confirmar venda
        document.getElementById('confirm-sale')?.addEventListener('click', () => this._processSale());
    }

    /**
     * Atualiza display do troco
     * @private
     */
    _updateChangeDisplay() {
        const cartData = this.cartManager.getCartSummary();
        const changeDisplay = document.getElementById('change-display');
        
        if (!changeDisplay) return;

        if (this.amountPaid >= cartData.total) {
            const change = this.amountPaid - cartData.total;
            changeDisplay.innerHTML = `
                <div style="color: var(--color-success);">Troco: <strong>${this._formatCurrency(change)}</strong></div>
            `;
        } else if (this.amountPaid > 0) {
            const remaining = cartData.total - this.amountPaid;
            changeDisplay.innerHTML = `
                <div style="color: var(--color-danger);">Faltam: <strong>${this._formatCurrency(remaining)}</strong></div>
            `;
        } else {
            changeDisplay.innerHTML = '';
        }
    }

    /**
     * Processa a venda
     * @private
     */
    _processSale() {
        const cartData = this.cartManager.getCartSummary();

        // Validação para pagamento em dinheiro
        if (this.selectedPaymentMethod === 'cash') {
            if (this.amountPaid < cartData.total) {
                window.showToast('Valor recebido insuficiente', 'error');
                return;
            }
        }

        // Coleta dados do cliente
        this.customer = {
            name: document.getElementById('customer-name')?.value.trim() || '',
            phone: document.getElementById('customer-phone')?.value.trim() || '',
            email: document.getElementById('customer-email')?.value.trim() || ''
        };

        const notes = document.getElementById('sale-notes')?.value.trim() || '';

        // Processa checkout
        const result = this.cartManager.checkout({
            paymentMethod: this.selectedPaymentMethod,
            customer: this.customer,
            amountPaid: this.amountPaid,
            notes: notes
        });

        if (result.success) {
            this._showReceipt(result.sale);
        } else {
            window.showToast(result.error || 'Erro ao processar venda', 'error');
        }
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
}
