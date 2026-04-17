/**
 * DashboardView
 * View para painel administrativo com métricas e estatísticas
 */
class DashboardView {
    constructor(containerId = 'main-content') {
        this.container = document.getElementById(containerId);
        this.storage = storageService;
        this.filterPeriod = 'today'; // today, week, month, all
    }

    /**
     * Renderiza a view do dashboard
     */
    render() {
        const stats = this._getStats();
        const lowStockProducts = this.storage.getLowStockProducts();

        this.container.innerHTML = `
            <div class="dashboard-view">
                <div class="products-header">
                    <h1>Dashboard</h1>
                    <div class="dashboard-filters">
                        <button class="btn ${this.filterPeriod === 'today' ? 'btn-primary' : 'btn-outline'} btn-sm" data-period="today">
                            Hoje
                        </button>
                        <button class="btn ${this.filterPeriod === 'week' ? 'btn-primary' : 'btn-outline'} btn-sm" data-period="week">
                            Semana
                        </button>
                        <button class="btn ${this.filterPeriod === 'month' ? 'btn-primary' : 'btn-outline'} btn-sm" data-period="month">
                            Mês
                        </button>
                        <button class="btn ${this.filterPeriod === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm" data-period="all">
                            Tudo
                        </button>
                    </div>
                </div>
                
                <!-- Cards de Métricas -->
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon sales">
                            <i data-lucide="shopping-bag"></i>
                        </div>
                        <div class="stat-value">${stats.totalSales}</div>
                        <div class="stat-label">Vendas ${this._getPeriodLabel()}</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon revenue">
                            <i data-lucide="dollar-sign"></i>
                        </div>
                        <div class="stat-value">${this._formatCurrency(stats.totalRevenue)}</div>
                        <div class="stat-label">Faturamento</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon ticket">
                            <i data-lucide="receipt"></i>
                        </div>
                        <div class="stat-value">${this._formatCurrency(stats.averageTicket)}</div>
                        <div class="stat-label">Ticket Médio</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon products">
                            <i data-lucide="package"></i>
                        </div>
                        <div class="stat-value">${stats.totalItems}</div>
                        <div class="stat-label">Itens Vendidos</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <!-- Vendas por Forma de Pagamento -->
                    <div class="card">
                        <div class="card-header">
                            <h3><i data-lucide="credit-card"></i> Vendas por Pagamento</h3>
                        </div>
                        <div class="card-body">
                            ${this._renderPaymentMethods(stats.byPaymentMethod)}
                        </div>
                    </div>
                    
                    <!-- Alertas de Estoque -->
                    <div class="card">
                        <div class="card-header">
                            <h3>
                                <i data-lucide="alert-triangle"></i> 
                                Estoque Baixo
                                ${lowStockProducts.length > 0 ? `<span class="badge badge-warning" style="margin-left: 0.5rem;">${lowStockProducts.length}</span>` : ''}
                            </h3>
                        </div>
                        <div class="card-body">
                            ${this._renderLowStock(lowStockProducts)}
                        </div>
                    </div>
                </div>
                
                <!-- Ações Rápidas -->
                <div class="card" style="margin-top: 1.5rem;">
                    <div class="card-header">
                        <h3><i data-lucide="zap"></i> Ações Rápidas</h3>
                    </div>
                    <div class="card-body" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button class="btn btn-outline" id="export-data-btn">
                            <i data-lucide="download"></i>
                            <span>Exportar Dados</span>
                        </button>
                        <button class="btn btn-outline" id="import-data-btn">
                            <i data-lucide="upload"></i>
                            <span>Importar Dados</span>
                        </button>
                        <button class="btn btn-outline" id="view-history-btn">
                            <i data-lucide="history"></i>
                            <span>Histórico Completo</span>
                        </button>
                    </div>
                </div>
                
                <!-- Status do Sistema -->
                <div class="card" style="margin-top: 1.5rem;">
                    <div class="card-header">
                        <h3><i data-lucide="server"></i> Status do Sistema</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                            <div style="text-align: center; padding: 1rem; background: var(--color-gray-50); border-radius: 0.5rem;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${stats.systemStats.products.total}</div>
                                <div style="font-size: 0.875rem; color: var(--color-gray-500);">Produtos Totais</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--color-success-light); border-radius: 0.5rem;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);">${stats.systemStats.products.inStock}</div>
                                <div style="font-size: 0.875rem; color: var(--color-gray-500);">Em Estoque</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--color-warning-light); border-radius: 0.5rem;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-warning);">${stats.systemStats.products.lowStock}</div>
                                <div style="font-size: 0.875rem; color: var(--color-gray-500);">Estoque Baixo</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--color-danger-light); border-radius: 0.5rem;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-danger);">${stats.systemStats.products.outOfStock}</div>
                                <div style="font-size: 0.875rem; color: var(--color-gray-500);">Esgotados</div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-gray-200);">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
                                <span style="color: var(--color-gray-500);">Uso do armazenamento:</span>
                                <span>${stats.systemStats.storage.usedPercentage}%</span>
                            </div>
                            <div style="height: 8px; background: var(--color-gray-200); border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                                <div style="height: 100%; width: ${stats.systemStats.storage.usedPercentage}%; background: ${stats.systemStats.storage.usedPercentage > 80 ? 'var(--color-danger)' : 'var(--color-primary)'}; border-radius: 4px; transition: width 0.3s;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._attachEventListeners();
        lucide.createIcons();
    }

    /**
     * Renderiza métodos de pagamento
     * @private
     */
    _renderPaymentMethods(byPaymentMethod) {
        const methods = [
            { key: 'cash', label: 'Dinheiro', icon: 'banknote' },
            { key: 'credit', label: 'Cartão Crédito', icon: 'credit-card' },
            { key: 'debit', label: 'Cartão Débito', icon: 'credit-card' },
            { key: 'pix', label: 'PIX', icon: 'smartphone' },
            { key: 'other', label: 'Outro', icon: 'help-circle' }
        ];

        const hasData = Object.keys(byPaymentMethod).length > 0;
        
        if (!hasData) {
            return `<p style="color: var(--color-gray-500); text-align: center; padding: 2rem;">Nenhuma venda registrada no período</p>`;
        }

        const total = Object.values(byPaymentMethod).reduce((sum, val) => sum + val, 0);

        return methods.map(method => {
            const value = byPaymentMethod[method.key] || 0;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            
            if (value === 0) return '';
            
            return `
                <div style="display: flex; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--color-gray-100);">
                    <i data-lucide="${method.icon}" style="width: 20px; height: 20px; margin-right: 0.75rem; color: var(--color-gray-500);"></i>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>${method.label}</span>
                            <span style="font-weight: 500;">${this._formatCurrency(value)}</span>
                        </div>
                        <div style="height: 4px; background: var(--color-gray-200); border-radius: 2px; overflow: hidden;">
                            <div style="height: 100%; width: ${percentage}%; background: var(--color-primary); border-radius: 2px;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Renderiza produtos com estoque baixo
     * @private
     */
    _renderLowStock(products) {
        if (products.length === 0) {
            return `
                <div style="text-align: center; padding: 2rem; color: var(--color-gray-500);">
                    <i data-lucide="check-circle" style="width: 48px; height: 48px; margin-bottom: 0.5rem; color: var(--color-success);"></i>
                    <p>Todos os produtos estão com estoque adequado</p>
                </div>
            `;
        }

        return products.slice(0, 5).map(product => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: ${product.stock === 0 ? 'var(--color-danger-light)' : 'var(--color-warning-light)'}; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <div>
                    <div style="font-weight: 500;">${this._escapeHtml(product.name)}</div>
                    <div style="font-size: 0.875rem; color: var(--color-gray-500);">${product.category || 'Sem categoria'}</div>
                </div>
                <div style="text-align: right;">
                    <span class="badge ${product.stock === 0 ? 'badge-danger' : 'badge-warning'}">
                        ${product.stock === 0 ? 'Esgotado' : product.stock + ' un'}
                    </span>
                </div>
            </div>
        `).join('') + (products.length > 5 ? `<p style="text-align: center; color: var(--color-gray-500); font-size: 0.875rem; margin-top: 0.5rem;">+${products.length - 5} produtos...</p>` : '');
    }

    /**
     * Anexa event listeners
     * @private
     */
    _attachEventListeners() {
        document.querySelectorAll('[data-period]').forEach(btn =>
            btn.addEventListener('click', (e) => { this.filterPeriod = e.target.dataset.period; this.render(); }));
        document.getElementById('export-data-btn')?.addEventListener('click', () => this._exportData());
        document.getElementById('import-data-btn')?.addEventListener('click', () => this._showImportModal());
        document.getElementById('view-history-btn')?.addEventListener('click', () => window.router?.navigate?.('history'));
    }

    /**
     * Exporta dados para arquivo JSON
     * @private
     */
    _exportData() {
        const { filename, blob } = this.storage.generateBackupFile();
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.showToast('Dados exportados com sucesso', 'success');
    }

    /**
     * Mostra modal para importação
     * @private
     */
    _showImportModal() {
        const modalHTML = `
            <div class="modal-overlay" id="import-modal">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i data-lucide="upload"></i> Importar Dados</h3>
                        <button class="close-btn" id="close-import-modal">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning" style="margin-bottom: 1rem;">
                            <i data-lucide="alert-triangle"></i>
                            <span>Atenção: A importação pode substituir dados existentes. Faça um backup antes.</span>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Arquivo JSON</label>
                            <input type="file" 
                                   class="form-input" 
                                   id="import-file"
                                   accept=".json"
                                   style="padding: 0.5rem;">
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="merge-data" checked>
                                <span>Mesclar com dados existentes (não substituir)</span>
                            </label>
                        </div>
                        
                        <div id="import-preview" style="margin-top: 1rem;"></div>
                        <div id="import-errors" class="alert alert-danger hidden" style="margin-top: 1rem;"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-import">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirm-import" disabled>Importar</button>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        let validatedData = null;

        setTimeout(() => {
            const modal = document.getElementById('import-modal');
            modal.classList.add('open');
            lucide.createIcons();
        }, 10);

        const closeModal = () => {
            const modal = document.getElementById('import-modal');
            modal.classList.remove('open');
            setTimeout(() => modalContainer.remove(), 300);
        };

        document.getElementById('close-import-modal')?.addEventListener('click', closeModal);
        document.getElementById('cancel-import')?.addEventListener('click', closeModal);
        document.getElementById('import-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'import-modal') closeModal();
        });

        // Preview do arquivo
        document.getElementById('import-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    validatedData = data;
                    
                    const validation = this.storage.validateImportData(data);
                    const previewDiv = document.getElementById('import-preview');
                    const confirmBtn = document.getElementById('confirm-import');
                    const errorsDiv = document.getElementById('import-errors');

                    if (validation.valid) {
                        previewDiv.innerHTML = `
                            <div class="alert alert-success">
                                <i data-lucide="check-circle"></i>
                                <span>Dados válidos: ${validation.summary.products} produtos, ${validation.summary.sales} vendas</span>
                            </div>
                        `;
                        confirmBtn.disabled = false;
                        errorsDiv.classList.add('hidden');
                    } else {
                        previewDiv.innerHTML = `
                            <div class="alert alert-warning">
                                <i data-lucide="alert-triangle"></i>
                                <span>Dados parcialmente válidos: ${validation.summary.products} produtos, ${validation.summary.sales} vendas</span>
                            </div>
                        `;
                        if (validation.errors.length > 0) {
                            errorsDiv.innerHTML = validation.errors.map(e => `<div>${e}</div>`).join('');
                            errorsDiv.classList.remove('hidden');
                        }
                        confirmBtn.disabled = false;
                    }
                    lucide.createIcons();
                } catch (error) {
                    document.getElementById('import-preview').innerHTML = `
                        <div class="alert alert-danger">
                            <i data-lucide="x-circle"></i>
                            <span>Arquivo JSON inválido</span>
                        </div>
                    `;
                    document.getElementById('confirm-import').disabled = true;
                    lucide.createIcons();
                }
            };
            reader.readAsText(file);
        });

        // Confirmar importação
        document.getElementById('confirm-import')?.addEventListener('click', () => {
            if (!validatedData) return;

            const merge = document.getElementById('merge-data')?.checked || false;
            const result = this.storage.importData(validatedData, { merge, skipInvalid: true });

            if (result.success) {
                window.showToast(`Importação concluída: ${result.imported.products} produtos, ${result.imported.sales} vendas`, 'success');
                closeModal();
                this.render();
            } else {
                window.showToast('Erro na importação: ' + result.errors.join(', '), 'error');
            }
        });
    }

    /**
     * Obtém estatísticas baseadas no período selecionado
     * @private
     */
    _getStats() {
        const periodMethods = { today: 'getTodaySales', week: 'getThisWeekSales', month: 'getThisMonthSales', all: 'getAllSales' };
        const sales = this.storage[periodMethods[this.filterPeriod] || 'getAllSales']();
        return { ...this.storage.calculateMetrics(sales), systemStats: this.storage.getStats() };
    }

    /**
     * Retorna label do período
     * @private
     */
    _getPeriodLabel = () => ({ today: 'Hoje', week: 'Esta Semana', month: 'Este Mês', all: 'Total' }[this.filterPeriod] || '');

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
