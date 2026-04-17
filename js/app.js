/**
 * PDV System - Aplicação Principal
 * Sistema de Ponto de Venda Responsivo
 */

// ============================================
// SIDEBAR CONTROLLER (Melhorar Sidebar Rich UI)
// ============================================
class SidebarController {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleBtn = document.getElementById('sidebar-toggle');
        this.mainContent = document.getElementById('main-content');

        this.state = {
            collapsed: false,
            expandedMenus: [],
            lastRoute: 'pos'
        };

        this.STORAGE_KEY = 'pdv_sidebar_state';

        this._init();
    }

    /**
     * Inicializa o controller
     * @private
     */
    _init() {
        this._loadState();
        this._bindEvents();
        this._setupKeyboardShortcut();
        this._setupStorageSync();
        this._applyState();
    }

    /**
     * Carrega estado do localStorage
     * @private
     */
    _loadState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            console.warn('Erro ao carregar estado da sidebar:', e);
        }
    }

    /**
     * Salva estado no localStorage
     * @private
     */
    _saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('Erro ao salvar estado da sidebar:', e);
        }
    }

    /**
     * Aplica estado atual na UI
     * @private
     */
    _applyState() {
        // Aplica estado de colapso
        if (this.state.collapsed) {
            this.sidebar.classList.add('sidebar-collapsed');
        } else {
            this.sidebar.classList.remove('sidebar-collapsed');
        }

        // Atualiza ícone do botão toggle
        const toggleIcon = this.toggleBtn?.querySelector('i');
        if (toggleIcon) {
            const iconName = this.state.collapsed ? 'panel-left-open' : 'panel-left-close';
            toggleIcon.setAttribute('data-lucide', iconName);
            // Re-renderiza ícones lucide
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        // Aplica menus expandidos
        this.state.expandedMenus.forEach(menuId => {
            const menu = document.querySelector(`.nav-parent[data-nav-id="${menuId}"]`);
            if (menu) {
                menu.classList.add('expanded');
                const toggle = menu.querySelector('.nav-parent-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    /**
     * Vincula eventos de clique
     * @private
     */
    _bindEvents() {
        // Toggle de colapso
        this.toggleBtn?.addEventListener('click', () => this.toggle());

        // Toggle de menus pai
        document.querySelectorAll('.nav-parent-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const parent = toggle.closest('.nav-parent');
                const menuId = parent.dataset.navId;
                this.toggleMenu(menuId);
            });
        });

        // Navegação em itens filhos
        document.querySelectorAll('.nav-child').forEach(child => {
            child.addEventListener('click', (e) => {
                const view = child.dataset.view;
                const parent = child.closest('.nav-parent');
                const menuId = parent?.dataset.navId;

                // Marca ativo
                this._setActiveItem(child, menuId);

                // Navega
                if (view && window.router) {
                    window.router.navigate(view);
                    this.state.lastRoute = view;
                    this._saveState();
                }
            });
        });

        // Navegação em itens raiz
        document.querySelectorAll('.nav-item:not(.nav-parent-toggle)').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.dataset.view;
                if (view && window.router) {
                    this._setActiveItem(item);
                    window.router.navigate(view);
                    this.state.lastRoute = view;
                    this._saveState();
                }
            });
        });
    }

    /**
     * Configura atalho de teclado (Ctrl/Cmd+B)
     * @private
     */
    _setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * Sincronização entre abas via storage event
     * @private
     */
    _setupStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY && e.newValue) {
                try {
                    const newState = JSON.parse(e.newValue);
                    this.state = newState;
                    this._applyState();
                } catch (err) {
                    console.warn('Erro ao sincronizar estado:', err);
                }
            }
        });
    }

    /**
     * Alterna entre expandido/colapsado
     */
    toggle() {
        this.state.collapsed = !this.state.collapsed;
        this._applyState();
        this._saveState();
    }

    /**
     * Expande a sidebar
     */
    expand() {
        this.state.collapsed = false;
        this._applyState();
        this._saveState();
    }

    /**
     * Colapsa a sidebar
     */
    collapse() {
        this.state.collapsed = true;
        this._applyState();
        this._saveState();
    }

    /**
     * Expande um menu específico
     * @param {string} menuId - ID do menu
     */
    expandMenu(menuId) {
        const menu = document.querySelector(`.nav-parent[data-nav-id="${menuId}"]`);
        if (!menu) return;

        menu.classList.add('expanded');
        const toggle = menu.querySelector('.nav-parent-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');

        if (!this.state.expandedMenus.includes(menuId)) {
            this.state.expandedMenus.push(menuId);
            this._saveState();
        }
    }

    /**
     * Colapsa um menu específico
     * @param {string} menuId - ID do menu
     */
    collapseMenu(menuId) {
        const menu = document.querySelector(`.nav-parent[data-nav-id="${menuId}"]`);
        if (!menu) return;

        menu.classList.remove('expanded');
        const toggle = menu.querySelector('.nav-parent-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');

        this.state.expandedMenus = this.state.expandedMenus.filter(id => id !== menuId);
        this._saveState();
    }

    /**
     * Alterna estado de um menu
     * @param {string} menuId - ID do menu
     */
    toggleMenu(menuId) {
        const isExpanded = this.state.expandedMenus.includes(menuId);
        if (isExpanded) {
            this.collapseMenu(menuId);
        } else {
            this.expandMenu(menuId);
        }
    }

    /**
     * Define item ativo na navegação
     * @private
     * @param {HTMLElement} item - Elemento ativo
     * @param {string} [parentId] - ID do menu pai (se houver)
     */
    _setActiveItem(item, parentId = null) {
        // Remove ativo anterior
        document.querySelectorAll('.nav-item.active, .nav-child.active').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelectorAll('.nav-item.active-indirect').forEach(el => {
            el.classList.remove('active-indirect');
        });

        // Marca novo ativo
        item.classList.add('active');

        // Marca pai como ativo indireto
        if (parentId) {
            const parent = document.querySelector(`.nav-parent[data-nav-id="${parentId}"] .nav-parent-toggle`);
            if (parent) {
                parent.classList.add('active-indirect');
            }
        }
    }

    /**
     * Atualiza item ativo baseado na rota (usado pelo Router)
     * @private
     * @param {string} routeName
     */
    _updateActiveFromRoute(routeName) {
        // Remove ativo anterior
        document.querySelectorAll('.nav-item.active, .nav-child.active').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelectorAll('.nav-item.active-indirect').forEach(el => {
            el.classList.remove('active-indirect');
        });

        // Encontra item correspondente à rota
        let found = false;

        // Primeiro tenta encontrar item raiz
        const rootItem = document.querySelector(`.nav-item[data-view="${routeName}"]:not(.nav-parent-toggle)`);
        if (rootItem) {
            rootItem.classList.add('active');
            found = true;
        }

        // Se não encontrou, procura em filhos
        if (!found) {
            const childItem = document.querySelector(`.nav-child[data-view="${routeName}"]`);
            if (childItem) {
                childItem.classList.add('active');
                const parent = childItem.closest('.nav-parent');
                const menuId = parent?.dataset.navId;
                if (menuId) {
                    const parentToggle = parent.querySelector('.nav-parent-toggle');
                    if (parentToggle) {
                        parentToggle.classList.add('active-indirect');
                    }
                    // Expande menu se necessário
                    this.expandMenu(menuId);
                }
            }
        }
    }

    /**
     * Retorna estado atual
     * @returns {Object}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Define estado completo
     * @param {Object} newState
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this._applyState();
        this._saveState();
    }
}

// ============================================
// SISTEMA DE ROTEAMENTO (Task 9.1)
// ============================================
class Router {
    constructor() {
        this.routes = {
            'pos': PosView,
            'products': ProductListView,
            'dashboard': DashboardView,
            'history': SaleHistoryView,
            'checkout': CheckoutView
        };
        // PosPremiumView loaded dynamically via _loadPosPremiumView()
        this.currentRoute = null;
        this.currentView = null;
        this.mainContainer = document.getElementById('main-content');
        
        // Inicializa navegação
        this._init();
    }

    /**
     * Inicializa o roteador
     * @private
     */
    _init() {
        // Handler para cliques em links de navegação
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('[data-view]');
            if (navItem) {
                e.preventDefault();
                const view = navItem.dataset.view;
                this.navigate(view);
            }
        });

        // Handler para botões de voltar do navegador
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.slice(1) || 'pos';
            this._loadRoute(hash, false);
        });

        // Carrega rota inicial
        const initialRoute = window.location.hash.slice(1) || 'pos';
        this._loadRoute(initialRoute, false);
    }

    /**
     * Navega para uma rota
     * @param {string} routeName - Nome da rota
     */
    navigate(routeName) {
        if (this.routes[routeName]) {
            window.location.hash = routeName;
            this._loadRoute(routeName, true);
        } else {
            console.error(`Route "${routeName}" not found`);
        }
    }

    /**
     * Carrega uma rota
     * @private
     * @param {string} routeName - Nome da rota
     * @param {boolean} [pushState=true] - Se deve adicionar ao histórico
     */
    _loadRoute(routeName, pushState = true) {
        // Handle PosPremiumView (ES Module) - before checking routes
        if (routeName === 'pos-premium') {
            this._loadPosPremiumView();
            return;
        }
        
        // Verifica se a rota existe
        if (!this.routes[routeName]) {
            routeName = 'pos'; // Rota padrão
        }

        // Não recarrega se for a mesma rota (exceto checkout que pode precisar atualizar)
        if (this.currentRoute === routeName && routeName !== 'checkout') {
            return;
        }

        // Destrói view anterior se necessário
        if (this.currentView && typeof this.currentView.destroy === 'function') {
            this.currentView.destroy();
        }

        // Esconde carrinho mobile
        this._hideMobileCart();

        // Atualiza navegação ativa
        this._updateActiveNav(routeName);

        // Cria e renderiza a nova view
        const ViewClass = this.routes[routeName];
        
        if (routeName === 'checkout') {
            // Checkout tem callback especial
            this.currentView = new ViewClass('main-content', (action) => {
                if (action === 'back') {
                    this.navigate('pos');
                } else if (action === 'complete') {
                    this.navigate('history');
                }
            });
        } else {
            this.currentView = new ViewClass('main-content');
        }

        // Adiciona transição suave
        this.mainContainer.style.opacity = '0';
        
        setTimeout(() => {
            this.currentView.render();
            this.currentRoute = routeName;
            
            // Fade in
            requestAnimationFrame(() => {
                this.mainContainer.style.opacity = '1';
                this.mainContainer.style.transition = 'opacity 0.2s ease';
            });
        }, 50);

        // Fecha menu mobile se estiver aberto
        this._hideMobileMenu();
    }

    /**
     * Atualiza navegação ativa
     * @private
     * @param {string} routeName
     */
    _updateActiveNav(routeName) {
        // Desktop - usa SidebarController se disponível
        if (window.sidebarController) {
            window.sidebarController._updateActiveFromRoute(routeName);
        } else {
            // Fallback para compatibilidade
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === routeName);
            });
        }

        // Mobile
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === routeName);
        });

        // Atualiza título no header mobile
        const titles = {
            'pos': 'Vendas',
            'products': 'Produtos',
            'dashboard': 'Dashboard',
            'history': 'Histórico',
            'checkout': 'Finalizar'
        };

        const headerTitle = document.querySelector('.header-title');
        if (headerTitle && titles[routeName]) {
            headerTitle.textContent = titles[routeName];
        }
    }

    /**
     * Esconde menu mobile
     * @private
     */
    _hideMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('overlay');
        
        if (mobileMenu) mobileMenu.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }

    /**
     * Carrega PosPremiumView (ES Module ou Script regular)
     * @private
     */
    async _loadPosPremiumView() {
        try {
            let PosPremiumView;
            
            // Check if running from file:// protocol
            if (window.location.protocol === 'file:') {
                // Load all dependencies first
                await this._loadPosPremiumViewDependencies();
                PosPremiumView = window.PosPremiumView;
            } else {
                // Dynamic import for ES module (HTTP/HTTPS)
                const module = await import('./views/PosPremiumView.js');
                PosPremiumView = module.PosPremiumView;
            }
            
            if (!PosPremiumView) {
                throw new Error('PosPremiumView not loaded');
            }
            
            this.currentView = new PosPremiumView({
                cartManager: window.cartManager,
                onCheckout: (cart) => {
                    this.navigate('checkout');
                },
                onNavigate: (view) => {
                    this.navigate(view);
                }
            });
            
            await this.currentView.init();
            this.currentRoute = 'pos-premium';
            
            // Atualiza navegação ativa
            this._updateActiveNav('pos-premium');
            
        } catch (error) {
            console.error('Error loading PosPremiumView:', error);
            showToast('Erro ao carregar POS Premium', 'error');
            // Fallback to regular POS
            this.navigate('pos');
        }
    }

    /**
     * Load script dynamically (for file:// protocol support)
     * @private
     */
    _loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Load PosPremiumView and all its dependencies (for file:// protocol)
     * @private
     */
    async _loadPosPremiumViewDependencies() {
        const deps = [
            'js/utils/featureFlags.js',
            'js/components/ui/Button.js',
            'js/components/ui/Card.js',
            'js/components/ui/QuantityControl.js',
            'js/components/ui/ThemeToggle.js',
            'js/components/ui/CartItemRow.js',
            'js/components/ui/EmptyCart.js',
            'js/components/ui/Toast.js',
            'js/components/ui/SkeletonCard.js',
            'js/components/ui/CartBadge.js',
            'js/components/ui/Drawer.js',
            'js/components/ui/BottomSheet.js',
            'js/components/ui/SkipLinks.js',
            'js/views/PosPremiumView.js'
        ];
        
        for (const dep of deps) {
            if (!this._isScriptLoaded(dep)) {
                await this._loadScript(dep);
            }
        }
    }

    /**
     * Check if script is already loaded
     * @private
     */
    _isScriptLoaded(src) {
        const scripts = document.querySelectorAll('script[src]');
        return Array.from(scripts).some(s => s.src.includes(src));
    }

    /**
     * Esconde carrinho mobile
     * @private
     */
    _hideMobileCart() {
        const cartDrawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('overlay');
        
        if (cartDrawer) cartDrawer.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }
}

// ============================================
// UTILITÁRIOS GLOBAIS
// ============================================

/**
 * Mostra uma notificação toast
 * @param {string} message - Mensagem a exibir
 * @param {string} [type='info'] - Tipo: success, error, warning, info
 * @param {number} [duration=3000] - Duração em ms
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    // Use safe DOM methods to prevent XSS
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', icons[type] || 'info');
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);

    container.appendChild(toast);
    lucide.createIcons();

    // Remove após a duração
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Expõe globalmente
window.showToast = showToast;

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa ícones
    lucide.createIcons();

    // Inicializa SidebarController (antes do Router)
    window.sidebarController = new SidebarController();

    // Inicializa roteador
    window.router = new Router();

    // ============================================
    // NAVEGAÇÃO MOBILE E DESKTOP (Tasks 9.2, 9.3, 9.4)
    // ============================================
    
    // Menu hambúrguer mobile (Task 9.3)
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = document.getElementById('close-menu');
    const overlay = document.getElementById('overlay');

    function openMenu() {
        mobileMenu?.classList.add('open');
        overlay?.classList.add('open');
    }

    function closeMenuFn() {
        mobileMenu?.classList.remove('open');
        overlay?.classList.remove('open');
    }

    menuToggle?.addEventListener('click', openMenu);
    closeMenu?.addEventListener('click', closeMenuFn);
    overlay?.addEventListener('click', () => {
        closeMenuFn();
        closeCartFn();
    });

    // Carrinho mobile (Task 9.3)
    const cartToggle = document.getElementById('cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCart = document.getElementById('close-cart');

    function openCart() {
        // Renderiza conteúdo do carrinho
        const cartContent = document.getElementById('cart-drawer-content');
        if (cartContent) {
            const cartView = new CartView('cart-drawer-content');
            cartView.onCheckout(() => {
                closeCartFn();
                window.router.navigate('checkout');
            });
            cartView.render();
        }
        
        cartDrawer?.classList.add('open');
        overlay?.classList.add('open');
    }

    function closeCartFn() {
        cartDrawer?.classList.remove('open');
        overlay?.classList.remove('open');
    }

    cartToggle?.addEventListener('click', openCart);
    closeCart?.addEventListener('click', closeCartFn);

    // ============================================
    // RESPONSIVIDADE E UX (Tasks 10.x)
    // ============================================

    // Atualiza badge do carrinho
    function updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge && window.cartManager) {
            const count = window.cartManager.getItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Registra listener para atualizar badge
    if (window.cartManager) {
        window.cartManager.onChange(updateCartBadge);
        updateCartBadge();
    }

    // ============================================
    // DADOS DE EXEMPLO (Opcional - para demonstração)
    // ============================================
    
    function loadSampleData() {
        const products = window.storageService.getAllProducts();
        
        if (products.length === 0) {
            // Adiciona alguns produtos de exemplo
            const sampleProducts = [
                { name: 'Coca-Cola 350ml', price: 5.99, category: 'Bebidas', stock: 50, description: 'Refrigerante lata' },
                { name: 'Pão de Queijo', price: 3.50, category: 'Alimentos', stock: 30, description: 'Pacote com 10 unidades' },
                { name: 'Café Expresso', price: 4.00, category: 'Bebidas', stock: 100, description: 'Café quente' },
                { name: 'Salgado Assado', price: 6.00, category: 'Alimentos', stock: 20, description: 'Enroladinho de presunto' },
                { name: 'Água Mineral 500ml', price: 3.00, category: 'Bebidas', stock: 80, description: 'Sem gás' },
                { name: 'Bolo de Cenoura', price: 5.50, category: 'Alimentos', stock: 15, description: 'Fatia' },
                { name: 'Suco Natural', price: 7.00, category: 'Bebidas', stock: 25, description: 'Laranja ou maracujá' },
                { name: 'Sanduíche Natural', price: 8.50, category: 'Alimentos', stock: 12, description: 'Frango com salada' },
                { name: 'Chá Gelado', price: 4.50, category: 'Bebidas', stock: 40, description: 'Limão ou pêssego' },
                { name: 'Cookie', price: 2.50, category: 'Alimentos', stock: 60, description: 'Chocolate chip' }
            ];

            sampleProducts.forEach(data => {
                const product = new Product(data);
                window.storageService.createProduct(product);
            });
        }
    }

    // Carrega dados de exemplo se não houver produtos
    // Descomente a linha abaixo se quiser dados de exemplo
    // loadSampleData();

    // ============================================
    // TRATAMENTO DE ERROS (Task 11.5)
    // ============================================
    
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // Em produção, poderia enviar para serviço de logging
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled rejection:', event.reason);
    });

    console.log('PDV System initialized successfully');
});

// ============================================
// SERVICE WORKER (Para PWA - Opcional)
// ============================================

if ('serviceWorker' in navigator) {
    // Descomente para habilitar PWA
    // navigator.serviceWorker.register('/sw.js')
    //     .then(reg => console.log('Service Worker registered'))
    //     .catch(err => console.log('Service Worker registration failed'));
}
