/**
 * Sale Model
 * Representa uma venda realizada no sistema
 */
class Sale {
    /**
     * @param {Object} data - Dados da venda
     * @param {string} [data.id] - ID único da venda
     * @param {Array} data.items - Itens vendidos
     * @param {number} data.total - Valor total da venda
     * @param {string} data.paymentMethod - Método de pagamento
     * @param {string} [data.date] - Data da venda (ISO string)
     * @param {Object} [data.customer] - Dados do cliente
     * @param {number} [data.subtotal] - Subtotal antes do desconto
     * @param {number} [data.discount] - Valor do desconto aplicado
     * @param {string} [data.discountType] - Tipo de desconto
     * @param {string} [data.status] - Status da venda
     * @param {string} [data.notes] - Observações
     * @param {number} [data.amountPaid] - Valor pago (para cálculo de troco)
     * @param {number} [data.change] - Troco
     */
    constructor(data = {}) {
        this.id = data.id || this._generateId();
        this.items = Array.isArray(data.items) ? data.items : [];
        this.total = this._parseNumber(data.total, 0);
        this.paymentMethod = data.paymentMethod || 'cash';
        this.date = data.date || new Date().toISOString();
        this.customer = data.customer || { name: '', phone: '', email: '' };
        this.subtotal = this._parseNumber(data.subtotal, this.total);
        this.discount = this._parseNumber(data.discount, 0);
        this.discountType = data.discountType || 'fixed';
        this.status = data.status || 'completed';
        this.notes = data.notes || '';
        this.amountPaid = this._parseNumber(data.amountPaid, 0);
        this.change = this._parseNumber(data.change, 0);
        
        // Metadados
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * Gera um ID único para a venda
     * @private
     * @returns {string} ID único no formato SALE-YYYYMMDD-XXXX
     */
    _generateId() {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `SALE-${date}-${random}`;
    }

    /**
     * Converte um valor para número com segurança
     * @private
     * @param {*} value - Valor a ser convertido
     * @param {number} defaultValue - Valor padrão
     * @returns {number}
     */
    _parseNumber(value, defaultValue = 0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Valida os dados da venda
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.items || this.items.length === 0) {
            errors.push('A venda deve ter pelo menos um item');
        }

        // Valida cada item
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (!item.productId) {
                errors.push(`Item ${i + 1}: ID do produto não informado`);
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Item ${i + 1}: Quantidade inválida`);
            }
            if (item.productPrice === undefined || item.productPrice < 0) {
                errors.push(`Item ${i + 1}: Preço inválido`);
            }
        }

        if (this.total === undefined || this.total === null || isNaN(this.total) || this.total < 0) {
            errors.push('O valor total da venda é obrigatório e deve ser positivo');
        }

        const validPaymentMethods = ['cash', 'credit', 'debit', 'pix', 'other'];
        if (!validPaymentMethods.includes(this.paymentMethod)) {
            errors.push('Método de pagamento inválido');
        }

        // Validação específica para pagamento em dinheiro
        if (this.paymentMethod === 'cash') {
            if (this.amountPaid > 0 && this.amountPaid < this.total) {
                errors.push('Valor pago é menor que o total da venda');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Retorna a data formatada
     * @param {Object} [options] - Opções de formatação
     * @param {string} [options.locale='pt-BR'] - Localização
     * @param {Object} [options.format] - Opções do Intl.DateTimeFormat
     * @returns {string}
     */
    getFormattedDate(options = {}) {
        const locale = options.locale || 'pt-BR';
        const format = options.format || {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat(locale, format).format(new Date(this.date));
    }

    /**
     * Retorna o total formatado como moeda
     * @param {string} [locale='pt-BR'] - Localização
     * @param {string} [currency='BRL'] - Moeda
     * @returns {string}
     */
    getFormattedTotal(locale = 'pt-BR', currency = 'BRL') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(this.total);
    }

    /**
     * Retorna o troco formatado como moeda
     * @param {string} [locale='pt-BR'] - Localização
     * @param {string} [currency='BRL'] - Moeda
     * @returns {string}
     */
    getFormattedChange(locale = 'pt-BR', currency = 'BRL') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(this.change);
    }

    /**
     * Retorna o método de pagamento traduzido
     * @returns {string}
     */
    getPaymentMethodLabel() {
        const labels = {
            cash: 'Dinheiro',
            credit: 'Cartão de Crédito',
            debit: 'Cartão de Débito',
            pix: 'PIX',
            other: 'Outro'
        };
        return labels[this.paymentMethod] || this.paymentMethod;
    }

    /**
     * Retorna o status traduzido
     * @returns {string}
     */
    getStatusLabel() {
        const labels = {
            completed: 'Concluída',
            pending: 'Pendente',
            cancelled: 'Cancelada',
            refunded: 'Reembolsada'
        };
        return labels[this.status] || this.status;
    }

    /**
     * Retorna a quantidade total de itens vendidos
     * @returns {number}
     */
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    }

    /**
     * Verifica se a venda foi paga em dinheiro
     * @returns {boolean}
     */
    isCashPayment() {
        return this.paymentMethod === 'cash';
    }

    /**
     * Verifica se há troco para ser dado
     * @returns {boolean}
     */
    hasChange() {
        return this.change > 0;
    }

    /**
     * Calcula e define o troco baseado no valor pago
     * @param {number} amountPaid - Valor pago pelo cliente
     * @returns {Object} { success: boolean, change: number, message: string }
     */
    calculateChange(amountPaid) {
        const paid = this._parseNumber(amountPaid, 0);
        
        if (paid <= 0) {
            return { success: false, change: 0, message: 'Valor pago inválido' };
        }
        
        if (paid < this.total) {
            const needed = this.total - paid;
            return { 
                success: false, 
                change: 0, 
                message: `Valor insuficiente. Faltam ${this._formatCurrency(needed)}` 
            };
        }
        
        this.amountPaid = paid;
        this.change = paid - this.total;
        this.updatedAt = new Date().toISOString();
        
        return { 
            success: true, 
            change: this.change, 
            message: 'Troco calculado com sucesso' 
        };
    }

    /**
     * Formata valor como moeda (helper interno)
     * @private
     * @param {number} value
     * @returns {string}
     */
    _formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Marca a venda como cancelada
     * @param {string} [reason] - Motivo do cancelamento
     * @returns {boolean}
     */
    cancel(reason) {
        if (this.status === 'cancelled') {
            return false;
        }
        
        this.status = 'cancelled';
        if (reason) {
            this.notes = this.notes ? `${this.notes}\nCancelado: ${reason}` : `Cancelado: ${reason}`;
        }
        this.updatedAt = new Date().toISOString();
        return true;
    }

    /**
     * Verifica se a venda está dentro de um período de datas
     * @param {Date|string} startDate - Data inicial
     * @param {Date|string} endDate - Data final
     * @returns {boolean}
     */
    isWithinDateRange(startDate, endDate) {
        const saleDate = new Date(this.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Ajusta end para incluir o dia inteiro
        end.setHours(23, 59, 59, 999);
        
        return saleDate >= start && saleDate <= end;
    }

    /**
     * Verifica se a venda é do dia atual
     * @returns {boolean}
     */
    isToday() {
        const today = new Date();
        const saleDate = new Date(this.date);
        
        return today.toDateString() === saleDate.toDateString();
    }

    /**
     * Verifica se a venda é desta semana
     * @returns {boolean}
     */
    isThisWeek() {
        const today = new Date();
        const saleDate = new Date(this.date);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return saleDate >= weekAgo && saleDate <= today;
    }

    /**
     * Verifica se a venda é deste mês
     * @returns {boolean}
     */
    isThisMonth() {
        const today = new Date();
        const saleDate = new Date(this.date);
        
        return today.getMonth() === saleDate.getMonth() && 
               today.getFullYear() === saleDate.getFullYear();
    }

    /**
     * Retorna uma cópia simples do objeto para serialização
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            items: this.items,
            total: this.total,
            subtotal: this.subtotal,
            discount: this.discount,
            discountType: this.discountType,
            paymentMethod: this.paymentMethod,
            date: this.date,
            customer: this.customer,
            status: this.status,
            notes: this.notes,
            amountPaid: this.amountPaid,
            change: this.change,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Cria uma instância de Sale a partir de dados JSON
     * @param {Object} json - Dados da venda
     * @returns {Sale}
     */
    static fromJSON(json) {
        return new Sale(json);
    }

    /**
     * Cria uma venda a partir de um carrinho
     * @param {Cart} cart - Carrinho de compras
     * @param {Object} [options={}] - Opções adicionais
     * @returns {Sale}
     */
    static fromCart(cart, options = {}) {
        const cartData = cart.getSaleData();
        
        return new Sale({
            items: cartData.items,
            total: cartData.total,
            subtotal: cartData.subtotal,
            discount: cartData.discount,
            discountType: cartData.discountType,
            paymentMethod: options.paymentMethod || 'cash',
            customer: options.customer || { name: '', phone: '', email: '' },
            notes: options.notes || '',
            amountPaid: options.amountPaid || cartData.total,
            change: options.change || 0,
            status: 'completed'
        });
    }

    /**
     * Cria uma cópia da venda
     * @returns {Sale}
     */
    clone() {
        return new Sale({
            ...this.toJSON(),
            id: null // Nova venda terá novo ID
        });
    }
}

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sale;
}
