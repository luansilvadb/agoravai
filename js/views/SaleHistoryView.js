/**
 * SaleHistoryView
 * View para histórico de vendas e detalhes
 */
class SaleHistoryView {
    constructor(containerId = 'main-content') {
        this.container = document.getElementById(containerId);
        this.storage = storageService;
        this.filterPeriod = 'today';
        this.filterPayment = '';
    }

    /**
     * Renderiza a view de histórico
     */
    render() {
        const sales = this._getFilteredSales();
        const metrics = this.storage.calculateMetrics(sales);

        this.container.innerHTML = `
            <div class="history-view">
                <div class="products-header">
                    <h1>Histórico de Vendas</h1>
                </div>
                
                <!-- Filtros -->
                <div class="sale-filters">
                    <select class="form-input form-select" id="period-filter" style="width: auto;">
                        <option value="today" ${this.filterPeriod === 'today' ? 'selected' : ''}>Hoje</option>
                        <option value="week" ${this.filterPeriod === 'week' ? 'selected' : ''}>Esta Semana</option>
                        <option value="month" ${this.filterPeriod === 'month' ? 'selected' : ''}>Este Mês</option>
                        <option value="all" ${this.filterPeriod === 'all' ? 'selected' : ''}>Todas</option>
                    </select>
                    
                    <select class="form-input form-select" id="payment-filter" style="width: auto;">
                        <option value="">Todos pagamentos</option>
                        <option value="cash" ${this.filterPayment === 'cash' ? 'selected' : ''}>Dinheiro</option>
                        <option value="credit" ${this.filterPayment === 'credit' ? 'selected' : ''}>Cartão Crédito</option>
                        <option value="debit" ${this.filterPayment === 'debit' ? 'selected' : ''}>Cartão Débito</option>
                        <option value="pix" ${this.filterPayment === 'pix' ? 'selected' : ''}>PIX</option>
                    </select>
                </div>
                
                <!-- Resumo -->
                ${sales.length > 0 ? `
                    <div class="dashboard-stats" style="margin-bottom: 1.5rem;">
                        <div class="stat-card">
                            <div class="stat-value" style="font-size: 1.5rem;">${sales.length}</div>
                            <div class="stat-label">Vendas</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="font-size: 1.5rem;">${this._formatCurrency(metrics.totalRevenue)}</div>
                            <div class="stat-label">Faturamento</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="font-size: 1.5rem;">${metrics.totalItems}</div>
                            <div class="stat-label">Itens</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="font-size: 1.5rem;">${this._formatCurrency(metrics.averageTicket)}</div>
                            <div class="stat-label">Ticket Médio</div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Lista de Vendas -->
                <div id="sales-list">
                    ${this._renderSalesList(sales)}
                </div>
            </div>
        `;

        this._attachEventListeners();
        lucide.createIcons();
    }

    /**
     * Renderiza lista de vendas
     * @private
     */
    _renderSalesList(sales) {
        if (sales.length === 0) {
            return `
                <div class="card">
                    <div class="card-body text-center" style="padding: 3rem;">
                        <i data-lucide="receipt" style="width: 48px; height: 48px; color: var(--color-gray-400); margin-bottom: 1rem;"></i>
                        <p style="color: var(--color-gray-500);">Nenhuma venda encontrada para este período.</p>
                    </div>
                </div>
            `;
        }

        // Ordena por data (mais recente primeiro)
        const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));

        return sortedSales.map(sale => `
            <div class="sale-card" data-sale-id="${sale.id}">
                <div class="sale-header">
                    <div>
                        <div class="sale-id">${sale.id}</div>
                        <div class="sale-date">${sale.getFormattedDate()}</div>
                    </div>
                    <span class="badge ${sale.status === 'completed' ? 'badge-success' : sale.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}">
                        ${sale.getStatusLabel()}
                    </span>
                </div>
                
                <div style="margin-bottom: 0.75rem;">
                    ${sale.items.slice(0, 3).map(item => `
                        <div style="font-size: 0.875rem; color: var(--color-gray-600); margin-bottom: 0.25rem;">
                            ${item.quantity}x ${this._escapeHtml(item.productName)}
                        </div>
                    `).join('')}
                    ${sale.items.length > 3 ? `<div style="font-size: 0.875rem; color: var(--color-gray-400);">+${sale.items.length - 3} itens...</div>` : ''}
                </div>
                
                <div class="sale-footer">
                    <div>
                        <span class="badge badge-info" style="font-size: 0.75rem;">
                            <i data-lucide="credit-card" style="width: 12px; height: 12px; display: inline; margin-right: 4px;"></i>
                            ${sale.getPaymentMethodLabel()}
                        </span>
                        ${sale.customer?.name ? `<span style="font-size: 0.875rem; color: var(--color-gray-500); margin-left: 0.5rem;">${this._escapeHtml(sale.customer.name)}</span>` : ''}
                    </div>
                    <div class="sale-total">${sale.getFormattedTotal()}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Anexa event listeners
     * @private
     */
    _attachEventListeners() {
        // Filtro de período
        document.getElementById('period-filter')?.addEventListener('change', (e) => {
            this.filterPeriod = e.target.value;
            this.render();
        });

        // Filtro de pagamento
        document.getElementById('payment-filter')?.addEventListener('change', (e) => {
            this.filterPayment = e.target.value;
            this.render();
        });

        // Click nas vendas para ver detalhes
        document.querySelectorAll('.sale-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const saleId = e.currentTarget.dataset.saleId;
                this._showSaleDetail(saleId);
            });
        });
    }

    /**
     * Mostra detalhes da venda
     * @private
     * @param {string} saleId
     */
    _showSaleDetail(saleId) {
        const sale = this.storage.getSaleById(saleId);
        if (!sale) return;

        const modalHTML = `
            <div class="modal-overlay" id="sale-detail-modal">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Detalhes da Venda</h3>
                        <button class="close-btn" id="close-detail-modal">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-gray-200);">
                            <div>
                                <div style="font-size: 1.125rem; font-weight: 600;">${sale.id}</div>
                                <div style="color: var(--color-gray-500); font-size: 0.875rem;">${sale.getFormattedDate()}</div>
                            </div>
                            <span class="badge ${sale.status === 'completed' ? 'badge-success' : sale.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}">
                                ${sale.getStatusLabel()}
                            </span>
                        </div>
                        
                        ${sale.customer?.name ? `
                            <div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--color-gray-50); border-radius: 0.5rem;">
                                <div style="font-weight: 500; margin-bottom: 0.25rem;">
                                    <i data-lucide="user" style="width: 16px; height: 16px; display: inline; margin-right: 4px;"></i>
                                    ${this._escapeHtml(sale.customer.name)}
                                </div>
                                ${sale.customer.phone ? `<div style="font-size: 0.875rem; color: var(--color-gray-500);">${this._escapeHtml(sale.customer.phone)}</div>` : ''}
                                ${sale.customer.email ? `<div style="font-size: 0.875rem; color: var(--color-gray-500);">${this._escapeHtml(sale.customer.email)}</div>` : ''}
                            </div>
                        ` : ''}
                        
                        <h4 style="margin-bottom: 0.75rem;">Itens</h4>
                        <div class="sale-detail-items">
                            ${sale.items.map(item => `
                                <div class="sale-detail-item">
                                    <div>
                                        <strong>${this._escapeHtml(item.productName)}</strong>
                                        <div style="font-size: 0.875rem; color: var(--color-gray-500);">
                                            ${item.quantity} x ${this._formatCurrency(item.productPrice)}
                                        </div>
                                    </div>
                                    <div style="font-weight: 500;">${this._formatCurrency(item.subtotal)}</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="sale-detail-totals">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Subtotal</span>
                                <span>${this._formatCurrency(sale.subtotal)}</span>
                            </div>
                            ${sale.discount > 0 ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--color-success);">
                                    <span>Desconto</span>
                                    <span>-${this._formatCurrency(sale.discount)}</span>
                                </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between; font-size: 1.125rem; font-weight: 700; padding-top: 0.5rem; border-top: 2px solid var(--color-gray-200);">
                                <span>Total</span>
                                <span style="color: var(--color-primary);">${sale.getFormattedTotal()}</span>
                            </div>
                        </div>
                        
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-gray-200);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--color-gray-500);">Pagamento</span>
                                <span>${sale.getPaymentMethodLabel()}</span>
                            </div>
                            ${sale.isCashPayment() ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--color-gray-500);">Valor Recebido</span>
                                    <span>${this._formatCurrency(sale.amountPaid)}</span>
                                </div>
                                ${sale.hasChange() ? `
                                    <div style="display: flex; justify-content: space-between; color: var(--color-success);">
                                        <span>Troco</span>
                                        <span style="font-weight: 500;">${sale.getFormattedChange()}</span>
                                    </div>
                                ` : ''}
                            ` : ''}
                        </div>
                        
                        ${sale.notes ? `
                            <div style="margin-top: 1rem; padding: 0.75rem; background: var(--color-gray-50); border-radius: 0.5rem;">
                                <div style="font-size: 0.875rem; color: var(--color-gray-500); margin-bottom: 0.25rem;">Observações:</div>
                                <div>${this._escapeHtml(sale.notes)}</div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="print-sale-btn">
                            <i data-lucide="printer"></i>
                            Imprimir
                        </button>
                        ${sale.status === 'completed' ? `
                            <button class="btn btn-danger" id="cancel-sale-btn">
                                <i data-lucide="x-circle"></i>
                                Cancelar Venda
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        setTimeout(() => {
            const modal = document.getElementById('sale-detail-modal');
            modal.classList.add('open');
            lucide.createIcons();
        }, 10);

        // Event listeners
        const closeModal = () => {
            const modal = document.getElementById('sale-detail-modal');
            modal.classList.remove('open');
            setTimeout(() => modalContainer.remove(), 300);
        };

        document.getElementById('close-detail-modal')?.addEventListener('click', closeModal);
        modalContainer.addEventListener('click', (e) => {
            if (e.target.id === 'sale-detail-modal') closeModal();
        });

        // Imprimir
        document.getElementById('print-sale-btn')?.addEventListener('click', () => {
            window.print();
        });

        // Cancelar venda
        document.getElementById('cancel-sale-btn')?.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja cancelar esta venda? O estoque será restaurado.')) {
                // Restaura estoque
                sale.items.forEach(item => {
                    const product = this.storage.getProductById(item.productId);
                    if (product) {
                        product.increaseStock(item.quantity);
                        this.storage.updateProduct(product.id, { stock: product.stock });
                    }
                });

                // Cancela a venda
                this.storage.updateSale(sale.id, { status: 'cancelled' });
                
                window.showToast('Venda cancelada com sucesso', 'success');
                closeModal();
                this.render();
            }
        });
    }

    /**
     * Obtém vendas filtradas
     * @private
     */
    _getFilteredSales() {
        let sales = [];

        switch (this.filterPeriod) {
            case 'today':
                sales = this.storage.getTodaySales();
                break;
            case 'week':
                sales = this.storage.getThisWeekSales();
                break;
            case 'month':
                sales = this.storage.getThisMonthSales();
                break;
            case 'all':
            default:
                sales = this.storage.getAllSales();
                break;
        }

        // Filtra por método de pagamento
        if (this.filterPayment) {
            sales = sales.filter(s => s.paymentMethod === this.filterPayment);
        }

        return sales;
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
