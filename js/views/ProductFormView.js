/**
 * ProductFormView
 * View para formulário de cadastro/edição de produtos
 */
class ProductFormView {
    constructor(productId = null, onSaveCallback = null) {
        this.productId = productId;
        this.onSaveCallback = onSaveCallback;
        this.storage = storageService;
        this.product = productId ? this.storage.getProductById(productId) : null;
        this.isEdit = !!this.product;
    }

    /**
     * Renderiza o modal do formulário
     */
    render() {
        const modalHTML = `
            <div class="modal-overlay" id="product-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${this.isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
                        <button class="close-btn" id="close-modal">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <form id="product-form">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label" for="product-name">Nome *</label>
                                <input type="text" 
                                       class="form-input" 
                                       id="product-name" 
                                       name="name"
                                       value="${this.isEdit ? this._escapeHtml(this.product.name) : ''}"
                                       required
                                       maxlength="100"
                                       placeholder="Nome do produto">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="product-description">Descrição</label>
                                <textarea class="form-input" 
                                          id="product-description" 
                                          name="description"
                                          rows="2"
                                          maxlength="500"
                                          placeholder="Descrição opcional">${this.isEdit ? this._escapeHtml(this.product.description) : ''}</textarea>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label" for="product-price">Preço *</label>
                                    <input type="number" 
                                           class="form-input" 
                                           id="product-price" 
                                           name="price"
                                           value="${this.isEdit ? this.product.price : ''}"
                                           required
                                           min="0"
                                           step="0.01"
                                           placeholder="0,00">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="product-stock">Estoque *</label>
                                    <input type="number" 
                                           class="form-input" 
                                           id="product-stock" 
                                           name="stock"
                                           value="${this.isEdit ? this.product.stock : '0'}"
                                           required
                                           min="0"
                                           step="1"
                                           placeholder="0">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="product-category">Categoria</label>
                                <input type="text" 
                                       class="form-input" 
                                       id="product-category" 
                                       name="category"
                                       value="${this.isEdit ? this._escapeHtml(this.product.category) : ''}"
                                       maxlength="50"
                                       placeholder="Categoria do produto"
                                       list="category-suggestions">
                                <datalist id="category-suggestions">
                                    ${this._renderCategorySuggestions()}
                                </datalist>
                            </div>
                            
                            <div id="form-errors" class="alert alert-danger hidden"></div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                ${this.isEdit ? 'Salvar Alterações' : 'Criar Produto'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Adiciona modal ao body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Mostra o modal
        setTimeout(() => {
            const modal = document.getElementById('product-modal');
            modal.classList.add('open');
            lucide.createIcons();
            
            // Foca no primeiro campo
            document.getElementById('product-name').focus();
        }, 10);

        this._attachEventListeners(modalContainer);
    }

    /**
     * Renderiza sugestões de categorias
     * @private
     */
    _renderCategorySuggestions() {
        const categories = this.storage.getCategories();
        return categories.map(cat => `<option value="${this._escapeHtml(cat)}">`).join('');
    }

    /**
     * Anexa event listeners
     * @private
     * @param {HTMLElement} container
     */
    _attachEventListeners(container) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');

        // Fecha modal
        const closeModal = () => {
            modal.classList.remove('open');
            setTimeout(() => container.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Fecha ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Submissão do formulário
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit(form, closeModal);
        });
    }

    /**
     * Processa a submissão do formulário
     * @private
     * @param {HTMLFormElement} form
     * @param {Function} closeModal
     */
    _handleSubmit(form, closeModal) {
        const formData = new FormData(form);
        const errorsDiv = document.getElementById('form-errors');

        // Coleta dados
        const data = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock'), 10),
            category: formData.get('category').trim()
        };

        // Cria instância do produto
        const product = this.isEdit 
            ? new Product({ ...this.product.toJSON(), ...data })
            : new Product(data);

        // Valida
        const validation = product.validate();
        
        if (!validation.isValid) {
            errorsDiv.innerHTML = validation.errors.map(e => `<div>${e}</div>`).join('');
            errorsDiv.classList.remove('hidden');
            return;
        }

        // Salva
        const result = this.isEdit
            ? this.storage.updateProduct(this.productId, product.toJSON())
            : this.storage.createProduct(product);

        if (result.success) {
            window.showToast(
                this.isEdit ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso',
                'success'
            );
            closeModal();
            if (this.onSaveCallback) this.onSaveCallback();
        } else {
            errorsDiv.innerHTML = `<div>${result.error}</div>`;
            errorsDiv.classList.remove('hidden');
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
