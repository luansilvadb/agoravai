/**
 * ProductListView
 * View para listagem e gerenciamento de produtos
 */
class ProductListView {
    constructor(containerId = 'main-content') {
        this.container = document.getElementById(containerId);
        this.storage = storageService;
        this.products = [];
        this.searchTerm = '';
        this.selectedCategory = '';
    }

    /**
     * Renderiza a view completa
     */
    render() {
        this.container.innerHTML = `
            <div class="products-view">
                <div class="products-header">
                    <h1>Gerenciamento de Produtos</h1>
                    <button class="btn btn-primary" id="add-product-btn">
                        <i data-lucide="plus"></i>
                        <span>Novo Produto</span>
                    </button>
                </div>
                
                <div class="products-filters">
                    <div class="search-bar">
                        <input type="text" 
                               class="form-input" 
                               id="product-search" 
                               placeholder="Buscar produtos..."
                               value="${this.searchTerm}">
                        <button class="btn btn-secondary" id="search-btn">
                            <i data-lucide="search"></i>
                        </button>
                    </div>
                    <select class="form-input form-select" id="category-filter">
                        <option value="">Todas as categorias</option>
                        ${this._renderCategoryOptions()}
                    </select>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table class="table" id="products-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Categoria</th>
                                    <th>Preço</th>
                                    <th>Estoque</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="products-tbody">
                                ${this._renderTableRows()}
                            </tbody>
                        </table>
                    </div>
                    ${this.products.length === 0 ? this._renderEmptyState() : ''}
                </div>
            </div>
        `;

        this._attachEventListeners();
        lucide.createIcons();
    }

    /**
     * Renderiza as opções de categoria
     * @private
     */
    _renderCategoryOptions() {
        const categories = this.storage.getCategories();
        return categories.map(cat => 
            `<option value="${cat}" ${this.selectedCategory === cat ? 'selected' : ''}>${cat}</option>`
        ).join('');
    }

    /**
     * Renderiza as linhas da tabela
     * @private
     */
    _renderTableRows() {
        this._loadProducts();
        
        if (this.products.length === 0) {
            return '';
        }

        return this.products.map(product => {
            const stockStatus = product.getStockStatus();
            const stockClass = stockStatus === 'out' ? 'stock-critical' : 
                              stockStatus === 'low' ? 'stock-low' : '';
            const stockBadge = stockStatus === 'low' ? ' <span class="badge badge-warning">Baixo</span>' :
                              stockStatus === 'out' ? ' <span class="badge badge-danger">Esgotado</span>' : '';

            return `
                <tr data-product-id="${product.id}">
                    <td>
                        <strong>${this._escapeHtml(product.name)}</strong>
                        ${product.description ? `<br><small class="text-muted">${this._escapeHtml(product.description)}</small>` : ''}
                    </td>
                    <td>${this._escapeHtml(product.category) || '-'}</td>
                    <td>${product.getFormattedPrice()}</td>
                    <td class="${stockClass}">${product.stock}${stockBadge}</td>
                    <td>
                        <div class="products-table-actions">
                            <button class="btn btn-sm btn-secondary edit-btn" data-id="${product.id}" title="Editar">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}" title="Excluir">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Renderiza estado vazio
     * @private
     */
    _renderEmptyState() {
        return `
            <div class="card-body text-center" style="padding: 3rem;">
                <i data-lucide="package-x" style="width: 48px; height: 48px; color: var(--color-gray-400); margin-bottom: 1rem;"></i>
                <p style="color: var(--color-gray-500);">
                    ${this.searchTerm ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado.'}
                </p>
                ${!this.searchTerm ? '<button class="btn btn-primary" id="empty-add-btn">Adicionar primeiro produto</button>' : ''}
            </div>
        `;
    }

    /**
     * Carrega produtos do storage com filtros
     * @private
     */
    _loadProducts() {
        let products = this.storage.getAllProducts();

        // Aplica filtro de busca
        if (this.searchTerm) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                (p.category && p.category.toLowerCase().includes(this.searchTerm.toLowerCase()))
            );
        }

        // Aplica filtro de categoria
        if (this.selectedCategory) {
            products = products.filter(p => p.category === this.selectedCategory);
        }

        // Ordena por nome
        products.sort((a, b) => a.name.localeCompare(b.name));

        this.products = products;
    }

    /**
     * Anexa event listeners
     * @private
     */
    _attachEventListeners() {
        // Botão adicionar produto
        const addBtn = document.getElementById('add-product-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this._openProductForm());
        }

        // Botão adicionar do estado vazio
        const emptyAddBtn = document.getElementById('empty-add-btn');
        if (emptyAddBtn) {
            emptyAddBtn.addEventListener('click', () => this._openProductForm());
        }

        // Busca
        const searchInput = document.getElementById('product-search');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this._debouncedSearch();
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.render());
        }

        // Filtro de categoria
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.render();
            });
        }

        // Botões de editar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this._openProductForm(id);
            });
        });

        // Botões de excluir
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this._confirmDelete(id);
            });
        });
    }

    /**
     * Debounce para busca
     * @private
     */
    _debouncedSearch() {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => this.render(), 300);
    }

    /**
     * Abre formulário de produto (criação ou edição)
     * @private
     * @param {string} [productId] - ID do produto para edição
     */
    _openProductForm(productId = null) {
        const formView = new ProductFormView(productId, () => this.render());
        formView.render();
    }

    /**
     * Confirma exclusão de produto
     * @private
     * @param {string} productId - ID do produto
     */
    _confirmDelete(productId) {
        const product = this.storage.getProductById(productId);
        if (!product) return;

        if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
            const result = this.storage.deleteProduct(productId);
            
            if (result.success) {
                window.showToast('Produto excluído com sucesso', 'success');
                this.render();
            } else {
                window.showToast(result.error || 'Erro ao excluir produto', 'error');
            }
        }
    }

    /**
     * Escapa HTML para prevenir XSS
     * @private
     * @param {string} text
     * @returns {string}
     */
    _escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
