/**
 * PDV System - Aplicação Principal
 * Sistema de Ponto de Venda Responsivo
 */

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
        // Desktop
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === routeName);
        });

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

    toast.innerHTML = `
        <i data-lucide="${icons[type] || 'info'}"></i>
        <span>${message}</span>
    `;

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
