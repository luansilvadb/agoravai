/**
 * StorageService
 * Gerencia a persistência de dados no localStorage
 */
class StorageService {
    constructor() {
        this.STORAGE_KEYS = {
            PRODUCTS: 'pdv_products',
            SALES: 'pdv_sales',
            CART: 'pdv_cart',
            SETTINGS: 'pdv_settings',
            VERSION: 'pdv_version'
        };
        this.CURRENT_VERSION = '1.0.0';
        this._init();
    }

    /**
     * Inicializa o serviço e verifica a versão do storage
     * @private
     */
    _init() {
        const storedVersion = localStorage.getItem(this.STORAGE_KEYS.VERSION);
        
        if (storedVersion !== this.CURRENT_VERSION) {
            // Migração de dados se necessário
            this._migrateData(storedVersion);
            localStorage.setItem(this.STORAGE_KEYS.VERSION, this.CURRENT_VERSION);
        }
    }

    /**
     * Migra dados entre versões
     * @private
     * @param {string} oldVersion - Versão anterior
     */
    _migrateData(oldVersion) {
        // Implementar migrações futuras aqui
        console.log(`Migrating from ${oldVersion} to ${this.CURRENT_VERSION}`);
    }

    /**
     * Verifica se o localStorage está disponível
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Retorna o espaço disponível no localStorage (aproximado)
     * @returns {Object} { used: number, total: number, remaining: number }
     */
    getStorageInfo() {
        let used = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length * 2; // Aproximação em bytes (UTF-16)
            }
        }
        
        // localStorage tem limite aproximado de 5-10MB
        const total = 5 * 1024 * 1024; // 5MB
        
        return {
            used: used,
            total: total,
            remaining: total - used,
            usedPercentage: Math.round((used / total) * 100)
        };
    }

    // ============================================
    // PRODUCTS CRUD (Task 4.2)
    // ============================================

    /**
     * Retorna todos os produtos
     * @returns {Product[]}
     */
    getAllProducts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
            const products = data ? JSON.parse(data) : [];
            return products.map(p => Product.fromJSON(p));
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    /**
     * Retorna um produto pelo ID
     * @param {string} id - ID do produto
     * @returns {Product|null}
     */
    getProductById(id) {
        const products = this.getAllProducts();
        const product = products.find(p => p.id === id);
        return product || null;
    }

    /**
     * Cria um novo produto
     * @param {Product} product - Produto a ser criado
     * @returns {Object} { success: boolean, product: Product|null, error: string|null }
     */
    createProduct(product) {
        try {
            const validation = product.validate();
            if (!validation.isValid) {
                return { success: false, product: null, error: validation.errors.join(', ') };
            }

            const products = this.getAllProducts();
            
            // Verifica se já existe produto com mesmo nome
            const existingByName = products.find(p => 
                p.name.toLowerCase().trim() === product.name.toLowerCase().trim()
            );
            if (existingByName) {
                return { success: false, product: null, error: 'Produto com este nome já existe' };
            }

            products.push(product);
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            
            return { success: true, product: product, error: null };
        } catch (error) {
            console.error('Error creating product:', error);
            return { success: false, product: null, error: 'Erro ao salvar produto' };
        }
    }

    /**
     * Atualiza um produto existente
     * @param {string} id - ID do produto
     * @param {Object} updates - Dados a serem atualizados
     * @returns {Object} { success: boolean, product: Product|null, error: string|null }
     */
    updateProduct(id, updates) {
        try {
            const products = this.getAllProducts();
            const index = products.findIndex(p => p.id === id);
            
            if (index === -1) {
                return { success: false, product: null, error: 'Produto não encontrado' };
            }

            // Mescla os dados
            const updatedProduct = new Product({
                ...products[index].toJSON(),
                ...updates,
                id: id, // Mantém o ID original
                updatedAt: new Date().toISOString()
            });

            const validation = updatedProduct.validate();
            if (!validation.isValid) {
                return { success: false, product: null, error: validation.errors.join(', ') };
            }

            // Verifica nome duplicado (exceto o próprio produto)
            const existingByName = products.find(p => 
                p.id !== id && 
                p.name.toLowerCase().trim() === updatedProduct.name.toLowerCase().trim()
            );
            if (existingByName) {
                return { success: false, product: null, error: 'Produto com este nome já existe' };
            }

            products[index] = updatedProduct;
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            
            return { success: true, product: updatedProduct, error: null };
        } catch (error) {
            console.error('Error updating product:', error);
            return { success: false, product: null, error: 'Erro ao atualizar produto' };
        }
    }

    /**
     * Exclui um produto
     * @param {string} id - ID do produto
     * @returns {Object} { success: boolean, error: string|null }
     */
    deleteProduct(id) {
        try {
            const products = this.getAllProducts();
            const filtered = products.filter(p => p.id !== id);
            
            if (filtered.length === products.length) {
                return { success: false, error: 'Produto não encontrado' };
            }

            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
            return { success: true, error: null };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: 'Erro ao excluir produto' };
        }
    }

    /**
     * Busca produtos por termo
     * @param {string} term - Termo de busca
     * @returns {Product[]}
     */
    searchProducts(term) {
        const products = this.getAllProducts();
        const searchTerm = term.toLowerCase().trim();
        
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Filtra produtos por categoria
     * @param {string} category - Categoria
     * @returns {Product[]}
     */
    getProductsByCategory(category) {
        const products = this.getAllProducts();
        return products.filter(p => p.category === category);
    }

    /**
     * Retorna todas as categorias únicas
     * @returns {string[]}
     */
    getCategories() {
        const products = this.getAllProducts();
        const categories = new Set(products.map(p => p.category).filter(Boolean));
        return Array.from(categories).sort();
    }

    /**
     * Retorna produtos com estoque baixo
     * @param {number} [threshold=5] - Limite para estoque baixo
     * @returns {Product[]}
     */
    getLowStockProducts(threshold = 5) {
        const products = this.getAllProducts();
        return products.filter(p => p.stock <= threshold);
    }

    // ============================================
    // SALES CRUD (Task 4.3)
    // ============================================

    /**
     * Retorna todas as vendas
     * @returns {Sale[]}
     */
    getAllSales() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.SALES);
            const sales = data ? JSON.parse(data) : [];
            return sales.map(s => Sale.fromJSON(s));
        } catch (error) {
            console.error('Error loading sales:', error);
            return [];
        }
    }

    /**
     * Retorna uma venda pelo ID
     * @param {string} id - ID da venda
     * @returns {Sale|null}
     */
    getSaleById(id) {
        const sales = this.getAllSales();
        const sale = sales.find(s => s.id === id);
        return sale || null;
    }

    /**
     * Salva uma nova venda
     * @param {Sale} sale - Venda a ser salva
     * @returns {Object} { success: boolean, sale: Sale|null, error: string|null }
     */
    saveSale(sale) {
        try {
            const validation = sale.validate();
            if (!validation.isValid) {
                return { success: false, sale: null, error: validation.errors.join(', ') };
            }

            const sales = this.getAllSales();
            sales.push(sale);
            localStorage.setItem(this.STORAGE_KEYS.SALES, JSON.stringify(sales));
            
            return { success: true, sale: sale, error: null };
        } catch (error) {
            console.error('Error saving sale:', error);
            return { success: false, sale: null, error: 'Erro ao salvar venda' };
        }
    }

    /**
     * Atualiza uma venda existente
     * @param {string} id - ID da venda
     * @param {Object} updates - Dados a serem atualizados
     * @returns {Object} { success: boolean, sale: Sale|null, error: string|null }
     */
    updateSale(id, updates) {
        try {
            const sales = this.getAllSales();
            const index = sales.findIndex(s => s.id === id);
            
            if (index === -1) {
                return { success: false, sale: null, error: 'Venda não encontrada' };
            }

            const updatedSale = new Sale({
                ...sales[index].toJSON(),
                ...updates,
                id: id,
                updatedAt: new Date().toISOString()
            });

            const validation = updatedSale.validate();
            if (!validation.isValid) {
                return { success: false, sale: null, error: validation.errors.join(', ') };
            }

            sales[index] = updatedSale;
            localStorage.setItem(this.STORAGE_KEYS.SALES, JSON.stringify(sales));
            
            return { success: true, sale: updatedSale, error: null };
        } catch (error) {
            console.error('Error updating sale:', error);
            return { success: false, sale: null, error: 'Erro ao atualizar venda' };
        }
    }

    /**
     * Filtra vendas por período
     * @param {Date|string} startDate - Data inicial
     * @param {Date|string} endDate - Data final
     * @returns {Sale[]}
     */
    getSalesByDateRange(startDate, endDate) {
        const sales = this.getAllSales();
        return sales.filter(s => s.isWithinDateRange(startDate, endDate));
    }

    /**
     * Retorna vendas de hoje
     * @returns {Sale[]}
     */
    getTodaySales() {
        const sales = this.getAllSales();
        return sales.filter(s => s.isToday());
    }

    /**
     * Retorna vendas desta semana
     * @returns {Sale[]}
     */
    getThisWeekSales() {
        const sales = this.getAllSales();
        return sales.filter(s => s.isThisWeek());
    }

    /**
     * Retorna vendas deste mês
     * @returns {Sale[]}
     */
    getThisMonthSales() {
        const sales = this.getAllSales();
        return sales.filter(s => s.isThisMonth());
    }

    /**
     * Calcula métricas de vendas
     * @param {Sale[]} [sales] - Lista de vendas (opcional, usa todas se não fornecido)
     * @returns {Object} Métricas calculadas
     */
    calculateMetrics(sales) {
        const salesList = sales || this.getAllSales();
        const completedSales = salesList.filter(s => s.status === 'completed');
        
        const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);
        const totalSales = completedSales.length;
        const totalItems = completedSales.reduce((sum, s) => sum + s.getTotalItems(), 0);
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Agrupa por método de pagamento
        const byPaymentMethod = completedSales.reduce((acc, s) => {
            acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
            return acc;
        }, {});

        return {
            totalRevenue,
            totalSales,
            totalItems,
            averageTicket,
            byPaymentMethod
        };
    }

    // ============================================
    // CART PERSISTENCE
    // ============================================

    /**
     * Salva o carrinho atual
     * @param {Cart} cart - Carrinho a ser salvo
     * @returns {boolean}
     */
    saveCart(cart) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cart.toJSON()));
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    }

    /**
     * Carrega o carrinho salvo
     * @returns {Cart|null}
     */
    loadCart() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.CART);
            if (!data) return null;
            
            const cartData = JSON.parse(data);
            return Cart.fromJSON(cartData);
        } catch (error) {
            console.error('Error loading cart:', error);
            return null;
        }
    }

    /**
     * Limpa o carrinho salvo
     * @returns {boolean}
     */
    clearCart() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.CART);
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    }

    // ============================================
    // EXPORT/IMPORT (Task 4.4)
    // ============================================

    /**
     * Exporta todos os dados para JSON
     * @returns {Object} Dados completos para exportação
     */
    exportAllData() {
        return {
            version: this.CURRENT_VERSION,
            exportedAt: new Date().toISOString(),
            products: this.getAllProducts().map(p => p.toJSON()),
            sales: this.getAllSales().map(s => s.toJSON()),
            settings: this.getSettings()
        };
    }

    /**
     * Gera arquivo de backup para download
     * @returns {Object} { filename: string, data: string }
     */
    generateBackupFile() {
        const data = this.exportAllData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const filename = `pdv_backup_${new Date().toISOString().slice(0, 10)}.json`;
        
        return { filename, blob };
    }

    /**
     * Importa dados de um arquivo JSON
     * @param {Object} data - Dados a serem importados
     * @param {Object} [options={}] - Opções de importação
     * @param {boolean} [options.merge=false] - Mesclar com dados existentes
     * @param {boolean} [options.skipInvalid=true] - Pular registros inválidos
     * @returns {Object} { success: boolean, imported: Object, errors: string[] }
     */
    importData(data, options = {}) {
        const errors = [];
        const imported = { products: 0, sales: 0 };
        
        try {
            if (!data || typeof data !== 'object') {
                return { success: false, imported, errors: ['Dados inválidos'] };
            }

            // Valida versão
            if (data.version && data.version !== this.CURRENT_VERSION) {
                console.warn(`Importing from different version: ${data.version}`);
            }

            // Limpa dados existentes se não for mesclar
            if (!options.merge) {
                localStorage.removeItem(this.STORAGE_KEYS.PRODUCTS);
                localStorage.removeItem(this.STORAGE_KEYS.SALES);
            }

            // Importa produtos
            if (Array.isArray(data.products)) {
                const existingProducts = options.merge ? this.getAllProducts() : [];
                const existingIds = new Set(existingProducts.map(p => p.id));
                
                for (const productData of data.products) {
                    try {
                        const product = new Product(productData);
                        const validation = product.validate();
                        
                        if (!validation.isValid) {
                            if (!options.skipInvalid) {
                                errors.push(`Produto "${product.name}": ${validation.errors.join(', ')}`);
                            }
                            continue;
                        }

                        // Evita duplicatas se estiver mesclando
                        if (existingIds.has(product.id)) {
                            this.updateProduct(product.id, product.toJSON());
                        } else {
                            this.createProduct(product);
                            existingIds.add(product.id);
                        }
                        imported.products++;
                    } catch (e) {
                        if (!options.skipInvalid) {
                            errors.push(`Erro ao importar produto: ${e.message}`);
                        }
                    }
                }
            }

            // Importa vendas
            if (Array.isArray(data.sales)) {
                const existingSales = options.merge ? this.getAllSales() : [];
                const existingSaleIds = new Set(existingSales.map(s => s.id));
                
                for (const saleData of data.sales) {
                    try {
                        const sale = new Sale(saleData);
                        const validation = sale.validate();
                        
                        if (!validation.isValid) {
                            if (!options.skipInvalid) {
                                errors.push(`Venda ${sale.id}: ${validation.errors.join(', ')}`);
                            }
                            continue;
                        }

                        if (!existingSaleIds.has(sale.id)) {
                            const sales = this.getAllSales();
                            sales.push(sale);
                            localStorage.setItem(this.STORAGE_KEYS.SALES, JSON.stringify(sales));
                            existingSaleIds.add(sale.id);
                            imported.sales++;
                        }
                    } catch (e) {
                        if (!options.skipInvalid) {
                            errors.push(`Erro ao importar venda: ${e.message}`);
                        }
                    }
                }
            }

            // Importa configurações
            if (data.settings && typeof data.settings === 'object') {
                this.saveSettings({ ...this.getSettings(), ...data.settings });
            }

            return {
                success: errors.length === 0 || imported.products > 0 || imported.sales > 0,
                imported,
                errors
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, imported, errors: [error.message] };
        }
    }

    /**
     * Valida dados de importação sem aplicar
     * @param {Object} data - Dados a serem validados
     * @returns {Object} { valid: boolean, summary: Object, errors: string[] }
     */
    validateImportData(data) {
        const errors = [];
        const summary = { products: 0, sales: 0, invalidProducts: 0, invalidSales: 0 };

        if (!data || typeof data !== 'object') {
            return { valid: false, summary, errors: ['Dados inválidos'] };
        }

        // Valida produtos
        if (Array.isArray(data.products)) {
            for (const productData of data.products) {
                try {
                    const product = new Product(productData);
                    const validation = product.validate();
                    if (validation.isValid) {
                        summary.products++;
                    } else {
                        summary.invalidProducts++;
                    }
                } catch (e) {
                    summary.invalidProducts++;
                }
            }
        }

        // Valida vendas
        if (Array.isArray(data.sales)) {
            for (const saleData of data.sales) {
                try {
                    const sale = new Sale(saleData);
                    const validation = sale.validate();
                    if (validation.isValid) {
                        summary.sales++;
                    } else {
                        summary.invalidSales++;
                    }
                } catch (e) {
                    summary.invalidSales++;
                }
            }
        }

        const valid = summary.invalidProducts === 0 && summary.invalidSales === 0;
        
        if (!valid) {
            if (summary.invalidProducts > 0) {
                errors.push(`${summary.invalidProducts} produto(s) inválido(s)`);
            }
            if (summary.invalidSales > 0) {
                errors.push(`${summary.invalidSales} venda(s) inválida(s)`);
            }
        }

        return { valid, summary, errors };
    }

    // ============================================
    // SETTINGS
    // ============================================

    /**
     * Retorna as configurações salvas
     * @returns {Object}
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : this._getDefaultSettings();
        } catch (error) {
            return this._getDefaultSettings();
        }
    }

    /**
     * Retorna configurações padrão
     * @private
     * @returns {Object}
     */
    _getDefaultSettings() {
        return {
            storeName: 'Minha Loja',
            currency: 'BRL',
            locale: 'pt-BR',
            lowStockThreshold: 5,
            autoSaveCart: true
        };
    }

    /**
     * Salva as configurações
     * @param {Object} settings - Configurações a salvar
     * @returns {boolean}
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Limpa todos os dados (USE COM CUIDADO!)
     * @returns {boolean}
     */
    clearAllData() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    /**
     * Retorna estatísticas de uso
     * @returns {Object}
     */
    getStats() {
        const products = this.getAllProducts();
        const sales = this.getAllSales();
        const storage = this.getStorageInfo();

        return {
            products: {
                total: products.length,
                inStock: products.filter(p => p.stock > 0).length,
                lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
                outOfStock: products.filter(p => p.stock <= 0).length
            },
            sales: {
                total: sales.length,
                completed: sales.filter(s => s.status === 'completed').length,
                cancelled: sales.filter(s => s.status === 'cancelled').length,
                today: this.getTodaySales().length,
                thisWeek: this.getThisWeekSales().length,
                thisMonth: this.getThisMonthSales().length
            },
            storage: storage
        };
    }
}

// Cria instância singleton
const storageService = new StorageService();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageService, storageService };
}
