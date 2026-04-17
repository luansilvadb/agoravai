/**
 * PosView
 * View para o ponto de venda (interface principal de vendas)
 */
class PosView {
    constructor(containerId = 'main-content') {
        this.container = document.getElementById(containerId);
        this.storage = storageService;
        this.cartManager = cartManager;
        this.cartView = null;
        this.searchTerm = '';
        this.selectedCategory = '';
    }

    /**
     * Renderiza a view do PDV
     */
    render() {
        // Sincroniza o carrinho com produtos atualizados
        this.cartManager.syncWithProducts();
        this.cartManager.refreshProductData();

        this.container.innerHTML = `
            <div class="pos-container">
                <!-- Lado Esquerdo: Produtos -->
                <div class="products-section">
                    <h2>Produtos</h2>
                    
                    <div class="search-bar">
                        <input type="text" 
                               class="form-input" 
                               id="pos-search" 
                               placeholder="Buscar produtos..."
                               value="${this.searchTerm}">
                        <select class="form-input form-select" id="pos-category-filter" style="width: 150px;">
                            <option value="">Todas</option>
                            ${this._renderCategoryOptions()}
                        </select>
                    </div>
                    
                    <div class="products-grid" id="products-grid">
                        ${this._renderProducts()}
                    </div>
                </div>
                
                <!-- Lado Direito: Carrinho -->
                <div class="cart-section">
                    <h2>Carrinho</h2>
                    <div id="cart-container">
                        <!-- CartView renderiza aqui -->
                    </div>
                </div>
            </div>
        `;

        // Renderiza o carrinho
        this.cartView = new CartView('cart-container');
        this.cartView.onCheckout(() => this._goToCheckout());
        this.cartView.render();

        // Registra listener para atualizações do carrinho
        this._unsubscribeCart = this.cartManager.onChange(() => {
            this._updateCartBadge();
        });

        this._attachEventListeners();
        this._updateCartBadge();
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
     * Renderiza os produtos
     * @private
     */
    _renderProducts() {
        let products = this.storage.getAllProducts();

        // Filtra produtos sem estoque se não estiver buscando
        if (!this.searchTerm) {
            products = products.filter(p => p.stock > 0);
        }

        // Aplica busca
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(term) ||
                (p.category && p.category.toLowerCase().includes(term))
            );
        }

        // Aplica filtro de categoria
        if (this.selectedCategory) {
            products = products.filter(p => p.category === this.selectedCategory);
        }

        // Ordena: primeiro com estoque, depois por nome
        products.sort((a, b) => {
            if (a.stock === 0 && b.stock > 0) return 1;
            if (a.stock > 0 && b.stock === 0) return -1;
            return a.name.localeCompare(b.name);
        });

        if (products.length === 0) {
            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-gray-500);">
                    <i data-lucide="package-x" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                    <p>${this.searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto disponível.'}</p>
                </div>
            `;
        }

        return products.map(product => {
            const inCart = this.cartManager.hasProduct(product.id);
            const cartQuantity = inCart ? this.cartManager.getProductQuantity(product.id) : 0;
            const availableStock = product.stock + cartQuantity;
            const isOutOfStock = availableStock === 0;

            return `
                <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-product-id="${product.id}">
                    <div class="product-card-header">
                        <span class="product-category">${product.category || 'Sem categoria'}</span>
                        ${inCart ? `<span class="badge badge-info">${cartQuantity} no carrinho</span>` : ''}
                    </div>
                    <div class="product-name">${this._escapeHtml(product.name)}</div>
                    <div class="product-price">${product.getFormattedPrice()}</div>
                    <div class="product-stock">
                        <i data-lucide="package" style="width: 14px; height: 14px;"></i>
                        <span class="${availableStock <= 5 && availableStock > 0 ? 'stock-low' : ''} ${availableStock === 0 ? 'stock-critical' : ''}">
                            ${availableStock} em estoque
                        </span>
                    </div>
                    <button class="btn btn-primary ${isOutOfStock ? 'disabled' : ''}" 
                            data-product-id="${product.id}"
                            ${isOutOfStock ? 'disabled' : ''}>
                        <i data-lucide="plus"></i>
                        <span>${inCart ? 'Adicionar +' : 'Adicionar'}</span>
                    </button>
                </div>
            `;
        }).join('');
    }

    /**
     * Anexa event listeners
     * @private
     */
    _attachEventListeners() {
        // Busca
        const searchInput = document.getElementById('pos-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this._debouncedSearch();
            });
            searchInput.focus();
        }

        // Filtro de categoria
        const categoryFilter = document.getElementById('pos-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this._renderProductsGrid();
            });
        }

        // Botões de adicionar produto
        document.querySelectorAll('.product-card .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this._addProductToCart(productId);
            });
        });

        // Click no card para adicionar (exceto no botão)
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn')) return; // Ignora se clicou no botão
                
                const productId = card.dataset.productId;
                if (!card.classList.contains('out-of-stock')) {
                    this._addProductToCart(productId);
                }
            });
        });
    }

    /**
     * Adiciona produto ao carrinho
     * @private
     */
    _addProductToCart(productId) {
        const product = this.storage.getProductById(productId);
        if (!product) return;

        const result = this.cartManager.addProduct(product);

        if (result.success) {
            // Feedback visual
            const card = document.querySelector(`[data-product-id="${productId}"]`);
            if (card) {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => card.style.transform = '', 150);
            }

            window.showToast(`${product.name} adicionado`, 'success');
            this.cartView.render();
            this._renderProductsGrid(); // Atualiza para mostrar quantidade no carrinho
        } else {
            window.showToast(result.message, 'warning');
        }
    }

    /**
     * Atualiza apenas o grid de produtos
     * @private
     */
    _renderProductsGrid() {
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = this._renderProducts();
            lucide.createIcons();
            
            // Re-anexa event listeners
            document.querySelectorAll('.product-card .btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.currentTarget.dataset.productId;
                    this._addProductToCart(productId);
                });
            });

            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.btn')) return;
                    const productId = card.dataset.productId;
                    if (!card.classList.contains('out-of-stock')) {
                        this._addProductToCart(productId);
                    }
                });
            });
        }
    }

    /**
     * Debounce para busca
     * @private
     */
    _debouncedSearch() {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => this._renderProductsGrid(), 300);
    }

    /**
     * Navega para o checkout
     * @private
     */
    _goToCheckout() {
        const validation = this.cartManager.validateForCheckout();
        if (!validation.isValid) {
            window.showToast(validation.errors[0], 'warning');
            return;
        }
        
        if (window.router) {
            window.router.navigate('checkout');
        }
    }

    /**
     * Atualiza badge do carrinho no header mobile
     * @private
     */
    _updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = this.cartManager.getItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
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
     * Limpa listeners ao destruir
     */
    destroy() {
        if (this._unsubscribeCart) {
            this._unsubscribeCart();
        }
    }
}
