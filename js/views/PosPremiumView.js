/**
 * PosPremiumView
 * Main POS Premium view integrating all components
 * 
 * Features:
 * - Responsive layout (desktop 3-col, tablet sidebar+drawer, mobile bottom sheet)
 * - Category filtering
 * - Product search
 * - Cart management with CartManager integration
 * - Theme toggle
 * - Keyboard shortcuts
 * 
 * @see design.md for specifications
 */

// Support both ES module and regular script loading
const deps = typeof window !== 'undefined' ? window : {};

// ES Module imports (used when loaded as module)
let 
  ThemeToggle, Card, CartItemRow, EmptyCart, Button, CartBadge,
  Drawer, BottomSheet, SkipLinks, toast, SkeletonCard,
  KeyboardShortcuts, announceCartUpdate, announce,
  conditionalAnimation, applyStaggeredAnimation, injectStaggeredAnimationStyles, badgePopAnimation,
  initTheme;

if (typeof window !== 'undefined' && window.ThemeToggle) {
  // Use globals when loaded as regular script
  ThemeToggle = window.ThemeToggle;
  Card = window.Card;
  CartItemRow = window.CartItemRow;
  EmptyCart = window.EmptyCart;
  Button = window.Button;
  CartBadge = window.CartBadge;
  Drawer = window.Drawer;
  BottomSheet = window.BottomSheet;
  SkipLinks = window.SkipLinks;
  toast = window.toast;
  SkeletonCard = window.SkeletonCard;
  KeyboardShortcuts = window.KeyboardShortcuts;
  announceCartUpdate = window.announceCartUpdate;
  announce = window.announce;
  conditionalAnimation = window.conditionalAnimation;
  applyStaggeredAnimation = window.applyStaggeredAnimation;
  injectStaggeredAnimationStyles = window.injectStaggeredAnimationStyles;
  badgePopAnimation = window.badgePopAnimation;
  initTheme = window.initTheme;
}

// ES Module imports (used when loaded as module)
if (typeof importScripts !== 'function' && typeof window === 'undefined' || 
    (typeof document !== 'undefined' && document.currentScript && document.currentScript.type === 'module')) {
  // These will be resolved by the module loader
}

/**
 * PosPremiumView Class
 */
class PosPremiumView {
  /**
   * @param {Object} options
   * @param {CartManager} options.cartManager - Existing CartManager instance
   * @param {Function} options.onCheckout - Checkout callback
   * @param {Function} options.onNavigate - Navigation callback
   */
  constructor(options = {}) {
    this.options = {
      cartManager: null,
      onCheckout: null,
      onNavigate: null,
      ...options
    };

    // State
    this.products = [];
    this.filteredProducts = [];
    this.categories = [];
    this.selectedCategory = null;
    this.searchQuery = '';
    this.isLoading = true;
    this.cart = { items: [], total: 0 };

    // Components
    this.elements = {};
    this.cardComponents = [];
    this.cartItemComponents = [];
    this.drawer = null;
    this.bottomSheet = null;
    this.keyboardShortcuts = new KeyboardShortcuts();
    this.skipLinks = null;

    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleCartUpdate = this.handleCartUpdate.bind(this);
  }

  /**
   * Initialize the view
   */
  async init() {
    // Initialize theme
    initTheme();

    // Inject required styles
    injectStaggeredAnimationStyles();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Setup skip links
    this.skipLinks = new SkipLinks();
    this.skipLinks.render();

    // Load initial data
    await this.loadProducts();

    // Setup CartManager listeners
    if (this.options.cartManager) {
      this.setupCartListeners();
    }

    // Setup window resize listener
    window.addEventListener('resize', this.handleResize);

    // Initial render
    this.render();

    // Initial cart sync
    this.syncCart();
  }

  /**
   * Setup keyboard shortcuts
   * @private
   */
  setupKeyboardShortcuts() {
    // Search focus: /
    this.keyboardShortcuts.register('/', () => {
      const searchInput = this.elements.searchInput;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    });

    // Close modals/drawers: Escape
    this.keyboardShortcuts.register('Escape', () => {
      this.closeCartPanels();
    });

    // Activate
    this.keyboardShortcuts.activate();
  }

  /**
   * Load products data
   * @private
   */
  async loadProducts() {
    this.isLoading = true;
    this.render();

    try {
      // Simulate API call - replace with actual product service
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample products - replace with actual data
      this.products = this.getSampleProducts();
      this.extractCategories();
      this.applyFilters();
    } catch (error) {
      toast.error('Erro ao carregar produtos', 'Erro');
    } finally {
      this.isLoading = false;
      this.render();
      this.animateProductGrid();
    }
  }

  /**
   * Get sample products (replace with actual API)
   * @private
   */
  getSampleProducts() {
    const categories = ['Eletrônicos', 'Roupas', 'Alimentos', 'Casa'];
    return Array.from({ length: 20 }, (_, i) => ({
      id: `prod-${i + 1}`,
      name: `Produto ${i + 1}`,
      description: `Descrição do produto ${i + 1}`,
      price: Math.floor(Math.random() * 500) + 10 + 0.99,
      category: categories[Math.floor(Math.random() * categories.length)],
      image: `/assets/products/product-${(i % 8) + 1}.jpg`
    }));
  }

  /**
   * Extract unique categories from products
   * @private
   */
  extractCategories() {
    const counts = {};
    this.products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    this.categories = Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  /**
   * Apply filters (search + category)
   * @private
   */
  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  /**
   * Setup CartManager event listeners
   * @private
   */
  setupCartListeners() {
    const cm = this.options.cartManager;
    
    // Listen for cart events
    if (cm && cm.events) {
      cm.events.on('item:added', (item) => {
        this.handleCartUpdate();
        announceCartUpdate('add', item.product, item.quantity);
        toast.success(`${item.product.name} adicionado!`);
      });

      cm.events.on('item:removed', (item) => {
        this.handleCartUpdate();
        announceCartUpdate('remove', item.product, 0);
      });

      cm.events.on('cart:updated', () => {
        this.handleCartUpdate();
      });
    }
  }

  /**
   * Handle cart updates
   * @private
   */
  handleCartUpdate() {
    this.syncCart();
    this.renderCartItems();
    this.updateCartBadge();
  }

  /**
   * Sync cart data from CartManager
   * @private
   */
  syncCart() {
    if (this.options.cartManager) {
      this.cart.items = this.options.cartManager.getItems() || [];
      this.cart.total = this.options.cartManager.getTotal() || 0;
    }
  }

  /**
   * Handle window resize
   * @private
   */
  handleResize() {
    // Close cart panels when switching layouts
    const width = window.innerWidth;
    if (width >= 1024) {
      this.closeCartPanels();
    }
  }

  /**
   * Close all cart panels (drawer/sheet)
   * @private
   */
  closeCartPanels() {
    if (this.drawer) this.drawer.close();
    if (this.bottomSheet) this.bottomSheet.close();
  }

  /**
   * Handle add to cart
   * @private
   */
  handleAddToCart(product) {
    if (this.options.cartManager) {
      this.options.cartManager.addItem(product, 1);
    } else {
      // Fallback if no CartManager
      toast.info('CartManager não configurado');
    }
  }

  /**
   * Handle category selection
   * @private
   */
  handleCategorySelect(category) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.applyFilters();
    this.renderCategories();
    this.renderProducts();
    this.animateProductGrid();
  }

  /**
   * Handle search input
   * @private
   */
  handleSearch(query) {
    this.searchQuery = query;
    this.applyFilters();
    this.renderProducts();
  }

  /**
   * Handle cart item quantity change
   * @private
   */
  handleCartQuantityChange(itemId, newQuantity) {
    if (this.options.cartManager) {
      if (newQuantity <= 0) {
        this.options.cartManager.removeItem(itemId);
      } else {
        this.options.cartManager.updateQuantity(itemId, newQuantity);
      }
    }
  }

  /**
   * Handle cart item removal
   * @private
   */
  handleCartRemove(itemId) {
    if (this.options.cartManager) {
      this.options.cartManager.removeItem(itemId);
    }
  }

  /**
   * Animate product grid on render
   * @private
   */
  animateProductGrid() {
    const cards = this.elements.productsGrid?.querySelectorAll('.card');
    if (cards) {
      applyStaggeredAnimation(Array.from(cards), 'stagger-fade-in', 0, 50);
    }
  }

  /**
   * Update cart badge with animation
   * @private
   */
  updateCartBadge() {
    const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (this.elements.cartBadge) {
      this.elements.cartBadge.update(itemCount, this.cart.total);
    }
  }

  /**
   * Open cart drawer (tablet)
   * @private
   */
  openCartDrawer() {
    if (!this.drawer) {
      const cartContent = this.createCartContent();
      this.drawer = new Drawer({
        position: 'right',
        width: '400px',
        content: cartContent,
        title: 'Carrinho',
        onClose: () => {
          // Cleanup
        }
      });
    } else {
      this.drawer.setContent(this.createCartContent());
    }
    this.drawer.open();
  }

  /**
   * Open cart bottom sheet (mobile)
   * @private
   */
  openCartBottomSheet() {
    if (!this.bottomSheet) {
      const cartContent = this.createCartContent();
      this.bottomSheet = new BottomSheet({
        content: cartContent,
        title: 'Carrinho',
        onOpen: () => {
          // Render cart items when opened
          this.renderCartItems();
        }
      });
    } else {
      this.bottomSheet.setContent(this.createCartContent());
    }
    this.bottomSheet.open();
  }

  /**
   * Create cart content container
   * @private
   */
  createCartContent() {
    const container = document.createElement('div');
    container.className = 'cart-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Itens do carrinho');
    container.setAttribute('aria-live', 'polite');
    return container;
  }

  /**
   * Render main layout
   */
  render() {
    const container = this.getOrCreateContainer();
    
    // Detect viewport and apply appropriate layout class
    const width = window.innerWidth;
    let layoutClass = 'pos-premium-layout';
    if (width < 768) {
      layoutClass = 'pos-premium-layout--mobile';
    } else if (width < 1024) {
      layoutClass = 'pos-premium-layout--tablet';
    }

    container.className = layoutClass;
    container.innerHTML = '';

    // Render based on viewport
    if (width >= 1024) {
      this.renderDesktop(container);
    } else if (width >= 768) {
      this.renderTablet(container);
    } else {
      this.renderMobile(container);
    }

    // Store element references
    this.cacheElements(container);
  }

  /**
   * Get or create main container
   * @private
   */
  getOrCreateContainer() {
    let container = document.getElementById('pos-premium-view');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pos-premium-view';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Render desktop layout
   * @private
   */
  renderDesktop(container) {
    container.innerHTML = `
      <header class="pos-premium-layout__header" role="banner">
        <div class="pos-premium-layout__header-left">
          <span class="pos-premium-layout__logo">POS Premium</span>
          <div class="pos-premium-layout__search">
            <svg class="pos-premium-layout__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="search" placeholder="Buscar produtos... (/)" aria-label="Buscar produtos">
          </div>
        </div>
        <div class="pos-premium-layout__header-right">
          <div id="theme-toggle-container"></div>
        </div>
      </header>

      <nav id="categories-section" class="pos-premium-layout__categories" role="navigation" aria-label="Categorias">
        <h2 class="pos-premium-layout__categories-title">Categorias</h2>
        <div class="categories-list"></div>
      </nav>

      <main id="products-section" class="pos-premium-layout__products" role="main">
        <div class="pos-premium-layout__products-header">
          <h1 class="pos-premium-layout__products-title">Produtos</h1>
          <span class="pos-premium-layout__products-count"></span>
        </div>
        <div class="pos-premium-layout__products-grid"></div>
      </main>

      <aside id="cart-section" class="pos-premium-layout__cart" role="complementary" aria-label="Carrinho">
        <div class="pos-premium-layout__cart-header">
          <h2 class="pos-premium-layout__cart-title">
            Carrinho
            <span class="pos-premium-layout__cart-badge">0</span>
          </h2>
        </div>
        <div class="pos-premium-layout__cart-items" role="list"></div>
        <div class="pos-premium-layout__cart-footer">
          <div class="pos-premium-layout__cart-subtotal">
            <span class="pos-premium-layout__cart-subtotal-label">Subtotal</span>
            <span class="pos-premium-layout__cart-subtotal-value">R$ 0,00</span>
          </div>
          <div class="pos-premium-layout__cart-total">
            <span class="pos-premium-layout__cart-total-label">Total</span>
            <span class="pos-premium-layout__cart-total-value">R$ 0,00</span>
          </div>
          <button class="button button--primary button--lg pos-premium-layout__checkout-btn" type="button">
            Finalizar Compra
          </button>
        </div>
      </aside>
    `;

    // Render theme toggle
    const themeToggleContainer = container.querySelector('#theme-toggle-container');
    const themeToggle = new ThemeToggle();
    themeToggleContainer.appendChild(themeToggle.render());

    // Render sub-components
    this.renderCategories(container.querySelector('.categories-list'));
    this.renderProducts(container.querySelector('.pos-premium-layout__products-grid'));
    this.renderCartItems();

    // Setup event listeners
    this.setupEventListeners(container);
  }

  /**
   * Render tablet layout
   * @private
   */
  renderTablet(container) {
    container.innerHTML = `
      <header class="pos-premium-layout__header" role="banner">
        <div class="pos-premium-layout__header-left">
          <span class="pos-premium-layout__logo">POS Premium</span>
        </div>
        <div class="pos-premium-layout__header-right">
          <div class="pos-premium-layout__search">
            <svg class="pos-premium-layout__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="search" placeholder="Buscar..." aria-label="Buscar produtos">
          </div>
          <div id="theme-toggle-container"></div>
        </div>
      </header>

      <div class="pos-premium-layout__sidebar" id="categories-section">
        <button class="pos-premium-layout__sidebar-toggle" aria-label="Colapsar/Expandir categorias">
          <svg class="pos-premium-layout__sidebar-toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="pos-premium-layout__sidebar-content">
          <h2 class="pos-premium-layout__categories-title">Categorias</h2>
          <div class="categories-list"></div>
        </div>
      </div>

      <main id="products-section" class="pos-premium-layout__products" role="main">
        <div class="pos-premium-layout__products-header">
          <h1 class="pos-premium-layout__products-title">Produtos</h1>
          <span class="pos-premium-layout__products-count"></span>
        </div>
        <div class="pos-premium-layout__products-grid"></div>
      </main>

      <button class="pos-premium-layout__cart-toggle" aria-label="Abrir carrinho">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 22a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/>
          <path d="M20 22a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span class="pos-premium-layout__cart-toggle-badge">0</span>
        <span class="pos-premium-layout__cart-toggle-label">Carrinho</span>
      </button>
    `;

    // Render theme toggle
    const themeToggleContainer = container.querySelector('#theme-toggle-container');
    const themeToggle = new ThemeToggle();
    themeToggleContainer.appendChild(themeToggle.render());

    // Render sub-components
    this.renderCategories(container.querySelector('.categories-list'));
    this.renderProducts(container.querySelector('.pos-premium-layout__products-grid'));

    // Setup event listeners
    this.setupEventListeners(container);

    // Cart toggle opens drawer
    const cartToggle = container.querySelector('.pos-premium-layout__cart-toggle');
    cartToggle.addEventListener('click', () => this.openCartDrawer());
  }

  /**
   * Render mobile layout
   * @private
   */
  renderMobile(container) {
    container.innerHTML = `
      <header class="pos-premium-layout__header" role="banner">
        <div class="pos-premium-layout__header-left">
          <span class="pos-premium-layout__logo">POS Premium</span>
          <div id="theme-toggle-container"></div>
        </div>
        <div class="pos-premium-layout__search">
          <svg class="pos-premium-layout__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="search" placeholder="Buscar..." aria-label="Buscar produtos">
        </div>
        <div id="categories-section" class="pos-premium-layout__category-chips" role="navigation" aria-label="Categorias">
          <div class="categories-list"></div>
        </div>
      </header>

      <main id="products-section" class="pos-premium-layout__products" role="main">
        <div class="pos-premium-layout__products-header">
          <h1 class="pos-premium-layout__products-title">Produtos</h1>
          <span class="pos-premium-layout__products-count"></span>
        </div>
        <div class="pos-premium-layout__products-grid"></div>
      </main>

      <nav class="pos-premium-layout__bottom-nav" role="navigation" aria-label="Navegação principal">
        <button class="pos-premium-layout__bottom-nav-btn is-active" aria-label="Produtos">
          <svg class="pos-premium-layout__bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Produtos
        </button>
        <button class="pos-premium-layout__bottom-nav-btn" id="cart-toggle" aria-label="Abrir carrinho">
          <svg class="pos-premium-layout__bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 22a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/>
            <path d="M20 22a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Carrinho
          <span class="pos-premium-layout__bottom-nav-badge" style="display: none;">0</span>
        </button>
      </nav>
    `;

    // Render theme toggle
    const themeToggleContainer = container.querySelector('#theme-toggle-container');
    const themeToggle = new ThemeToggle();
    themeToggleContainer.appendChild(themeToggle.render());

    // Render sub-components
    this.renderCategories(container.querySelector('.categories-list'), true);
    this.renderProducts(container.querySelector('.pos-premium-layout__products-grid'));

    // Setup event listeners
    this.setupEventListeners(container);

    // Cart toggle opens bottom sheet
    const cartToggle = container.querySelector('#cart-toggle');
    cartToggle.addEventListener('click', () => this.openCartBottomSheet());
  }

  /**
   * Render categories
   * @private
   */
  renderCategories(container, isMobile = false) {
    if (!container) return;
    container.innerHTML = '';

    // "All" category
    const allBtn = document.createElement(isMobile ? 'button' : 'button');
    allBtn.className = isMobile 
      ? `pos-premium-layout__category-chip ${!this.selectedCategory ? 'is-active' : ''}`
      : `pos-premium-layout__category-btn ${!this.selectedCategory ? 'is-active' : ''}`;
    allBtn.innerHTML = isMobile
      ? `Todos <span class="pos-premium-layout__category-chip-count">${this.products.length}</span>`
      : `Todos <span class="pos-premium-layout__category-count">${this.products.length}</span>`;
    allBtn.addEventListener('click', () => this.handleCategorySelect(null));
    container.appendChild(allBtn);

    // Category buttons
    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = isMobile
        ? `pos-premium-layout__category-chip ${this.selectedCategory === cat.name ? 'is-active' : ''}`
        : `pos-premium-layout__category-btn ${this.selectedCategory === cat.name ? 'is-active' : ''}`;
      btn.innerHTML = isMobile
        ? `${cat.name} <span class="pos-premium-layout__category-chip-count">${cat.count}</span>`
        : `${cat.name} <span class="pos-premium-layout__category-count">${cat.count}</span>`;
      btn.addEventListener('click', () => this.handleCategorySelect(cat.name));
      container.appendChild(btn);
    });
  }

  /**
   * Render products
   * @private
   */
  renderProducts(container) {
    if (!container) return;
    container.innerHTML = '';
    this.cardComponents = [];

    if (this.isLoading) {
      // Show skeleton loading
      const skeleton = SkeletonCard.createGrid(6, window.innerWidth < 768);
      container.appendChild(skeleton);
      return;
    }

    if (this.filteredProducts.length === 0) {
      // Empty state
      container.innerHTML = `
        <div class="empty-products" style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-8);">
          <p style="color: var(--color-text-secondary);">Nenhum produto encontrado</p>
        </div>
      `;
      return;
    }

    // Render product cards
    this.filteredProducts.forEach(product => {
      const card = new Card({
        product: product,
        onAddToCart: (p) => this.handleAddToCart(p)
      });
      const cardEl = card.render();
      container.appendChild(cardEl);
      this.cardComponents.push(card);
    });

    // Update count
    const countEl = document.querySelector('.pos-premium-layout__products-count');
    if (countEl) {
      countEl.textContent = `${this.filteredProducts.length} produtos`;
    }
  }

  /**
   * Render cart items
   * @private
   */
  renderCartItems() {
    const container = document.querySelector('.pos-premium-layout__cart-items') ||
                      (this.drawer?.element?.querySelector('.drawer__content')) ||
                      (this.bottomSheet?.element?.querySelector('.bottom-sheet__content'));
    
    if (!container) return;
    container.innerHTML = '';
    this.cartItemComponents = [];

    if (this.cart.items.length === 0) {
      // Empty cart
      const emptyCart = new EmptyCart({
        onBrowseProducts: () => {
          this.closeCartPanels();
          document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
      container.appendChild(emptyCart.render());
    } else {
      // Render cart items
      this.cart.items.forEach(item => {
        const cartItem = new CartItemRow({
          item: item,
          compact: window.innerWidth < 1024,
          onQuantityChange: (id, qty) => this.handleCartQuantityChange(id, qty),
          onRemove: (id) => this.handleCartRemove(id)
        });
        const itemEl = cartItem.render();
        container.appendChild(itemEl);
        this.cartItemComponents.push(cartItem);
      });
    }

    // Update totals
    this.updateCartTotals();
  }

  /**
   * Update cart totals in UI
   * @private
   */
  updateCartTotals() {
    const subtotalEl = document.querySelector('.pos-premium-layout__cart-subtotal-value');
    const totalEl = document.querySelector('.pos-premium-layout__cart-total-value');
    const badgeEl = document.querySelector('.pos-premium-layout__cart-badge');

    if (subtotalEl) subtotalEl.textContent = this.formatPrice(this.cart.total);
    if (totalEl) totalEl.textContent = this.formatPrice(this.cart.total);
    
    if (badgeEl) {
      const count = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      badgeEl.textContent = count;
    }
  }

  /**
   * Format price
   * @private
   */
  formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners(container) {
    // Search input
    const searchInput = container.querySelector('input[type="search"]');
    if (searchInput) {
      this.elements.searchInput = searchInput;
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      searchInput.setAttribute('aria-describedby', 'search-hint');
      searchInput.insertAdjacentHTML('afterend', '<span id="search-hint" class="sr-only">Digite para buscar produtos. Pressione / para focar.</span>');
    }

    // Checkout button
    const checkoutBtn = container.querySelector('.pos-premium-layout__checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        if (this.options.onCheckout) {
          this.options.onCheckout(this.cart);
        }
      });
    }

    // Sidebar toggle (tablet)
    const sidebarToggle = container.querySelector('.pos-premium-layout__sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = container.querySelector('.pos-premium-layout__sidebar');
        sidebar.classList.toggle('is-collapsed');
      });
    }
  }

  /**
   * Cache element references
   * @private
   */
  cacheElements(container) {
    this.elements = {
      searchInput: container.querySelector('input[type="search"]'),
      productsGrid: container.querySelector('.pos-premium-layout__products-grid'),
      cartBadge: container.querySelector('.pos-premium-layout__cart-badge') ? 
        new CartBadge({ 
          count: 0, 
          total: 0,
          headerElement: container.querySelector('.pos-premium-layout__cart-header')
        }) : null
    };
  }

  /**
   * Destroy the view
   */
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.keyboardShortcuts.deactivate();
    
    this.cardComponents.forEach(c => c.destroy());
    this.cartItemComponents.forEach(c => c.destroy());
    
    if (this.drawer) this.drawer.destroy();
    if (this.bottomSheet) this.bottomSheet.destroy();
    if (this.skipLinks) this.skipLinks.destroy();
  }
}

// ES Module exports
export { PosPremiumView };
export default PosPremiumView;

// Global export for regular script loading
if (typeof window !== 'undefined') {
  window.PosPremiumView = PosPremiumView;
}
