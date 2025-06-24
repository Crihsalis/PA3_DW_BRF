/**
 * Sistema de e-commerce para Por Amor
 * Maneja productos, carrito, checkout y funcionalidades de tienda
 */

class ShopManager {
    constructor() {
        this.productsPerPage = 9;
        this.currentPage = 1;
        this.currentCategory = 'all';
        this.currentSort = 'name';
        this.searchQuery = '';
        this.isLoading = false;
        
        // Datos de productos (simulando una base de datos)
        this.productsData = [
            {
                id: 'tshirt-dahlia',
                name: 'Camiseta de la Serie',
                category: 'clothing',
                price: 25.99,
                originalPrice: 29.99,
                discount: 13,
                description: 'Camiseta oficial con el diseño único. Material 100% algodón orgánico.',
                rating: 4.8,
                reviews: 127,
                stock: 15,
                featured: true,
                src:'img/TpoloS.jpg',
                thumbnail: 'img/TPoloS.jpg',
                tags: ['personaje','algodón']
            },
            {
                id: 'mug-universe',
                name: 'Taza de personaje de la serie',
                category: 'accessories',
                price: 12.99,
                description: 'Taza de cerámica con el mapa completo del universo de Por Amor. Apta para microondas.',
                rating: 4.6,
                reviews: 89,
                stock: 32,
                featured: true,
                src: 'img/TtazaS.jpg',
                tags: ['taza', 'universo', 'cerámica']
            },
            {
                id: 'book-vol 1',
                name: 'Por Amor - Volumen 1',
                category: 'books',
                price: 18.99,
                description: 'Primera entrega de la serie Por Amor en formato físico. Incluye arte conceptual exclusivo.',
                rating: 4.9,
                reviews: 234,
                stock: 8,
                featured: true,
                image: 'img/volumenSerie.jpg',
                tags: ['libro', 'volumen', 'físico']
            },
            {
                id: 'poster-elaine',
                name: 'Póster Elaine Namikaze',
                category: 'collectibles',
                price: 8.99,
                description: 'Póster de alta calidad (30x45cm) del ángel Lumerian Elaine Namikaze.',
                rating: 4.5,
                reviews: 76,
                stock: 45,
                image: 'img/Tposter.jpg',
                tags: ['elaine', 'poster', 'ángel']
            },
            {
                id: 'hoodie-logo',
                name: 'Sudadera personaje de la serie',
                category: 'clothing',
                price: 39.99,
                originalPrice: 45.99,
                discount: 13,
                description: 'Sudadera con capucha. 70% algodón, 30% poliéster.',
                rating: 4.7,
                reviews: 145,
                stock: 0,
                image: 'TpoleraS.jpg',
                tags: ['sudadera', 'logo', 'oficial']
            },
            {
                id: 'soundtrack-digital',
                name: 'Banda Sonora Digital',
                category: 'digital',
                price: 9.99,
                description: 'Banda sonora completa de Por Amor en formato digital de alta calidad (FLAC/MP3).',
                rating: 4.8,
                reviews: 198,
                stock: 999,
                image: 'img/TsongS.jpg',
                tags: ['música', 'digital', 'banda sonora']
            },
            {
                id: 'figure',
                name: 'Figura Coleccionable Personaje',
                category: 'collectibles',
                price: 49.99,
                description: 'Figura de 15cm de la serie con accesorios intercambiables.',
                rating: 4.9,
                reviews: 67,
                stock: 12,
                featured: true,
                image: 'img/TfiguraS.',
                tags: ['figura', 'dahlia', 'coleccionable']
            },
            {
                id: 'notebook-symbols',
                name: 'Libreta Símbolos Mágicos',
                category: 'accessories',
                price: 14.99,
                description: 'Libreta con diseños de los símbolos mágicos de cada especie. 120 páginas.',
                rating: 4.4,
                reviews: 91,
                stock: 28,
                image: 'img/Tlibrohechizos.jpg',
                tags: ['libreta', 'símbolos', 'magia']
            }
        ];

        this.init();
    }

    /**
     * Inicializa la tienda
     */
    init() {
        this.setupEventListeners();
        this.loadFeaturedProducts();
        this.loadProducts();
        this.initializeCart();
        this.updateCartDisplay();
        
        console.log('Sistema de tienda inicializado');
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Filtros de categoría
        const categoryFilters = document.getElementById('category-filters');
        if (categoryFilters) {
            categoryFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    this.handleCategoryFilter(e);
                }
            });
        }

        // Ordenamiento
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }

        // Búsqueda
        const searchInput = document.getElementById('product-search');
        const searchBtn = document.getElementById('product-search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
        }

        // Carrito
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        const cartClose = document.getElementById('cart-close');
        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.closeCart();
            });
        }

        // Checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.openCheckout();
            });
        }

        // Event delegation para acciones dinámicas
        document.addEventListener('click', (e) => {
            this.handleDynamicActions(e);
        });

        // Formulario de checkout
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processCheckout(e.target);
            });
        }

        // Cerrar modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.closeModals();
            }
        });
    }

    /**
     * Carga productos destacados
     */
    loadFeaturedProducts() {
        const container = document.getElementById('featured-grid');
        if (!container) return;

        const featuredProducts = this.productsData.filter(p => p.featured);
        container.innerHTML = '';

        featuredProducts.forEach((product, index) => {
            const productCard = this.createFeaturedProductCard(product);
            productCard.style.animationDelay = `${index * 0.2}s`;
            container.appendChild(productCard);
        });
    }

    /**
     * Crea tarjeta de producto destacado
     * @param {Object} product 
     * @returns {HTMLElement}
     */
    createFeaturedProductCard(product) {
        const card = Utils.createElement('div', {
            className: 'featured-product',
            dataset: { productId: product.id }
        });

        const stars = Utils.generateStars(Math.round(product.rating));
        const stockStatus = this.getStockStatus(product.stock);

        card.innerHTML = `
            <div class="product-image">
                ${product.image}
                ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                <div class="stock-badge ${stockStatus.class}">${stockStatus.text}</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-category">${this.getCategoryName(product.category)}</div>
                <div class="product-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${Utils.formatPrice(product.price)}</span>
                    ${product.originalPrice ? `<span class="original-price">${Utils.formatPrice(product.originalPrice)}</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <button class="add-to-cart" data-action="add-to-cart" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                    <button class="view-details" data-action="view-details" data-product-id="${product.id}">
                        Ver Detalles
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Carga productos del catálogo
     */
    loadProducts() {
        this.isLoading = true;
        this.showLoadingState();

        setTimeout(() => {
            this.renderProducts();
            this.updateProductsCount();
            this.isLoading = false;
            this.hideLoadingState();
        }, 500);
    }

    /**
     * Renderiza productos
     */
    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        // Aplicar filtros y ordenamiento
        let products = this.applyFilters([...this.productsData]);
        products = this.sortProducts(products, this.currentSort);

        // Paginación
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const paginatedProducts = products.slice(startIndex, endIndex);

        container.innerHTML = '';

        if (paginatedProducts.length === 0) {
            this.showEmptyProductsState(container);
            return;
        }

        paginatedProducts.forEach((product, index) => {
            const productCard = this.createProductCard(product);
            productCard.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(productCard);
        });

        this.updatePagination(products.length);
    }

    /**
     * Aplica filtros a productos
     * @param {Array} products 
     * @returns {Array}
     */
    applyFilters(products) {
        let filtered = [...products];

        // Filtro por categoría
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.currentCategory);
        }

        // Filtro por búsqueda
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return filtered;
    }

    /**
     * Ordena productos
     * @param {Array} products 
     * @param {string} sortBy 
     * @returns {Array}
     */
    sortProducts(products, sortBy) {
        const sorted = [...products];

        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'newest':
                return sorted.sort((a, b) => b.id.localeCompare(a.id));
            default:
                return sorted;
        }
    }

    /**
     * Crea tarjeta de producto
     * @param {Object} product 
     * @returns {HTMLElement}
     */
    createProductCard(product) {
        const card = Utils.createElement('div', {
            className: `product-card ${product.stock === 0 ? 'out-of-stock' : ''}`,
            dataset: { productId: product.id }
        });

        const stars = Utils.generateStars(Math.round(product.rating));
        const stockStatus = this.getStockStatus(product.stock);

        card.innerHTML = `
            <div class="product-image">
                ${product.image}
                ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                <div class="stock-badge ${stockStatus.class}">${stockStatus.text}</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-category">${this.getCategoryName(product.category)}</div>
                <p class="product-description">${Utils.truncateText(product.description, 80)}</p>
                <div class="product-price">
                    <span class="current-price">${Utils.formatPrice(product.price)}</span>
                    ${product.originalPrice ? `
                        <span class="original-price">${Utils.formatPrice(product.originalPrice)}</span>
                        <span class="discount">-${product.discount}%</span>
                    ` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-action="add-to-cart" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Agotado' : 'Agregar'}
                    </button>
                    <button class="view-details" data-action="view-details" data-product-id="${product.id}">
                        Detalles
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Obtiene el estado del stock
     * @param {number} stock 
     * @returns {Object}
     */
    getStockStatus(stock) {
        if (stock === 0) {
            return { class: 'out-of-stock', text: 'Agotado' };
        } else if (stock <= 5) {
            return { class: 'low-stock', text: `Últimas ${stock}` };
        } else {
            return { class: 'in-stock', text: 'Disponible' };
        }
    }

    /**
     * Obtiene el nombre de la categoría
     * @param {string} category 
     * @returns {string}
     */
    getCategoryName(category) {
        const categories = {
            'clothing': 'Ropa',
            'accessories': 'Accesorios',
            'books': 'Libros',
            'collectibles': 'Coleccionables',
            'digital': 'Digital'
        };
        return categories[category] || category;
    }

    /**
     * Inicializa el carrito
     */
    initializeCart() {
        this.updateCartDisplay();
        this.loadCartItems();
    }

    /**
     * Actualiza la visualización del carrito
     */
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        
        if (cartCount) {
            cartCount.textContent = cartStorage.getCartItemCount();
        }
        
        if (cartTotal) {
            cartTotal.textContent = Utils.formatPrice(cartStorage.getCartTotal());
        }

        this.toggleCartFooter();
    }

    /**
     * Carga items del carrito
     */
    loadCartItems() {
        const container = document.getElementById('cart-items');
        const emptyState = document.getElementById('cart-empty');
        
        if (!container) return;

        const cartItems = cartStorage.getCart();

        if (cartItems.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = '';

        cartItems.forEach(item => {
            const cartItem = this.createCartItem(item);
            container.appendChild(cartItem);
        });
    }

    /**
     * Crea un item del carrito
     * @param {Object} item 
     * @returns {HTMLElement}
     */
    createCartItem(item) {
        const itemElement = Utils.createElement('div', {
            className: 'cart-item',
            dataset: { productId: item.id }
        });

        itemElement.innerHTML = `
            <div class="item-image">${item.image}</div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${Utils.formatPrice(item.price)} c/u</div>
                <div class="item-controls">
                    <button class="quantity-btn" data-action="decrease-qty" data-product-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase-qty" data-product-id="${item.id}">+</button>
                    <button class="remove-item" data-action="remove-item" data-product-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `;

        return itemElement;
    }

    /**
     * Alterna el footer del carrito
     */
    toggleCartFooter() {
        const footer = document.getElementById('cart-footer');
        const cartItems = cartStorage.getCart();
        
        if (footer) {
            footer.style.display = cartItems.length > 0 ? 'block' : 'none';
        }
    }

    /**
     * Maneja acciones dinámicas
     * @param {Event} e 
     */
    handleDynamicActions(e) {
        const action = e.target.getAttribute('data-action');
        const productId = e.target.getAttribute('data-product-id');

        switch (action) {
            case 'add-to-cart':
                this.addToCart(productId, e.target);
                break;
            case 'view-details':
                this.showProductDetails(productId);
                break;
            case 'increase-qty':
                this.updateCartQuantity(productId, 1);
                break;
            case 'decrease-qty':
                this.updateCartQuantity(productId, -1);
                break;
            case 'remove-item':
                this.removeFromCart(productId);
                break;
            case 'toggle-favorite':
                this.toggleFavorite(productId, e.target);
                break;
        }
    }

    /**
     * Agrega producto al carrito
     * @param {string} productId 
     * @param {HTMLElement} button 
     */
    addToCart(productId, button) {
        const product = this.productsData.find(p => p.id === productId);
        if (!product || product.stock === 0) return;

        const originalText = button.textContent;
        button.classList.add('success');
        button.textContent = 'Agregado!';
        button.disabled = true;

        setTimeout(() => {
            button.classList.remove('success');
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);

        if (cartStorage.addToCart(product, 1)) {
            this.updateCartDisplay();
            this.loadCartItems();
            Utils.showNotification(`${product.name} agregado al carrito`, 'success');
            
            // Abrir carrito brevemente para mostrar el item
            this.openCart();
            setTimeout(() => {
                if (!this.isCartPinned()) {
                    this.closeCart();
                }
            }, 3000);
        }
    }

    /**
     * Actualiza cantidad en el carrito
     * @param {string} productId 
     * @param {number} change 
     */
    updateCartQuantity(productId, change) {
        const cartItems = cartStorage.getCart();
        const item = cartItems.find(item => item.id === productId);
        
        if (item) {
            const newQuantity = item.quantity + change;
            
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                cartStorage.updateCartQuantity(productId, newQuantity);
                this.updateCartDisplay();
                this.loadCartItems();
            }
        }
    }

    /**
     * Remueve item del carrito
     * @param {string} productId 
     */
    removeFromCart(productId) {
        const product = this.productsData.find(p => p.id === productId);
        
        if (cartStorage.removeFromCart(productId)) {
            this.updateCartDisplay();
            this.loadCartItems();
            
            if (product) {
                Utils.showNotification(`${product.name} eliminado del carrito`, 'info');
            }
        }
    }

    /**
     * Alterna favorito
     * @param {string} productId 
     * @param {HTMLElement} button 
     */
    toggleFavorite(productId, button) {
        const isFavorite = cartStorage.toggleFavorite(productId);
        
        button.classList.toggle('favorited', isFavorite);
        button.innerHTML = isFavorite ? '♥' : '♡';
        
        const product = this.productsData.find(p => p.id === productId);
        if (product) {
            const message = isFavorite ? 
                `${product.name} agregado a favoritos` : 
                `${product.name} eliminado de favoritos`;
            Utils.showNotification(message, 'info');
        }
    }

    /**
     * Muestra detalles del producto
     * @param {string} productId 
     */
    showProductDetails(productId) {
        const product = this.productsData.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) return;

        const stars = Utils.generateStars(Math.round(product.rating));
        const stockStatus = this.getStockStatus(product.stock);

        modalBody.innerHTML = `
            <div class="modal-product">
                <div class="modal-product-image">
                    ${product.image}
                    ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                </div>
                <div class="modal-product-info">
                    <h2>${product.name}</h2>
                    <div class="modal-product-category">${this.getCategoryName(product.category)}</div>
                    <div class="modal-product-rating">
                        <div class="stars">${stars}</div>
                        <span>${product.rating}/5 (${product.reviews} reseñas)</span>
                    </div>
                    <div class="modal-product-price">
                        <span class="current-price">${Utils.formatPrice(product.price)}</span>
                        ${product.originalPrice ? `
                            <span class="original-price">${Utils.formatPrice(product.originalPrice)}</span>
                            <span class="discount">-${product.discount}%</span>
                        ` : ''}
                    </div>
                    <p class="modal-product-description">${product.description}</p>
                    <div class="stock-status ${stockStatus.class}">
                        Estado: ${stockStatus.text}
                    </div>
                    ${product.stock > 0 ? `
                        <div class="quantity-selector">
                            <label for="quantity-input">Cantidad:</label>
                            <input type="number" id="quantity-input" min="1" max="${product.stock}" value="1" class="quantity-input">
                        </div>
                    ` : ''}
                    <div class="modal-product-actions">
                        <button class="add-to-cart" data-action="add-to-cart-modal" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                        </button>
                        <button class="action-btn" data-action="toggle-favorite" data-product-id="${product.id}" title="Agregar a favoritos">
                            ${cartStorage.isFavorite(product.id) ? '♥' : '♡'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        // Event listener para agregar desde modal
        const addToCartModal = modalBody.querySelector('[data-action="add-to-cart-modal"]');
        if (addToCartModal) {
            addToCartModal.addEventListener('click', () => {
                const quantityInput = modalBody.querySelector('#quantity-input');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                
                for (let i = 0; i < quantity; i++) {
                    this.addToCart(productId, addToCartModal);
                }
                
                modal.style.display = 'none';
            });
        }
    }

    /**
     * Abre el carrito
     */
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
        }
    }

    /**
     * Cierra el carrito
     */
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    }

    /**
     * Alterna el carrito
     */
    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
        }
    }

    /**
     * Verifica si el carrito está fijado
     * @returns {boolean}
     */
    isCartPinned() {
        // Lógica para determinar si el usuario ha interactuado con el carrito
        return document.getElementById('cart-sidebar').classList.contains('open');
    }

    /**
     * Abre el checkout
     */
    openCheckout() {
        const cartItems = cartStorage.getCart();
        if (cartItems.length === 0) {
            Utils.showNotification('El carrito está vacío', 'error');
            return;
        }

        const modal = document.getElementById('checkout-modal');
        if (modal) {
            this.loadOrderSummary();
            modal.style.display = 'flex';
        }
    }

    /**
     * Carga el resumen de la orden
     */
    loadOrderSummary() {
        const container = document.getElementById('order-summary');
        if (!container) return;

        const cartItems = cartStorage.getCart();
        const total = cartStorage.getCartTotal();

        let summaryHTML = '';
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summaryHTML += `
                <div class="order-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>${Utils.formatPrice(itemTotal)}</span>
                </div>
            `;
        });

        summaryHTML += `
            <div class="order-item">
                <span>Total</span>
                <span>${Utils.formatPrice(total)}</span>
            </div>
        `;

        container.innerHTML = summaryHTML;
    }

    /**
     * Procesa el checkout
     * @param {HTMLFormElement} form 
     */
    processCheckout(form) {
        if (!formValidator.validateForm(form)) {
            return;
        }

        const submitBtn = form.querySelector('.checkout-submit');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';

        // Simular procesamiento
        setTimeout(() => {
            const formData = new FormData(form);
            const orderData = {
                customer: {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    address: formData.get('address'),
                    city: formData.get('city'),
                    country: formData.get('country')
                },
                items: cartStorage.getCart(),
                total: cartStorage.getCartTotal(),
                timestamp: Date.now(),
                status: 'confirmed'
            };

            if (cartStorage.saveOrder(orderData)) {
                Utils.showNotification('¡Pedido confirmado! Recibirás un email de confirmación.', 'success');
                this.closeModals();
                this.closeCart();
                this.updateCartDisplay();
                form.reset();
            } else {
                Utils.showNotification('Error al procesar el pedido. Intenta nuevamente.', 'error');
            }

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 2000);
    }

    /**
     * Cierra todos los modales
     */
    closeModals() {
        const modals = document.querySelectorAll('.product-modal, .checkout-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Maneja filtro de categoría
     * @param {Event} e 
     */
    handleCategoryFilter(e) {
        const button = e.target;
        const category = button.getAttribute('data-category');

        // Actualizar UI
        document.querySelectorAll('#category-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Aplicar filtro
        this.currentCategory = category;
        this.currentPage = 1;
        this.loadProducts();
    }

    /**
     * Maneja cambio de ordenamiento
     * @param {string} sortValue 
     */
    handleSortChange(sortValue) {
        this.currentSort = sortValue;
        this.currentPage = 1;
        this.loadProducts();
    }

    /**
     * Maneja búsqueda
     * @param {string} query 
     */
    handleSearch(query) {
        this.searchQuery = query.trim();
        this.currentPage = 1;
        this.loadProducts();
    }

    /**
     * Actualiza el conteo de productos
     */
    updateProductsCount() {
        const countElement = document.getElementById('product-count');
        if (!countElement) return;

        const filteredProducts = this.applyFilters([...this.productsData]);
        countElement.textContent = `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`;
    }

    /**
     * Actualiza la paginación
     * @param {number} totalProducts 
     */
    updatePagination(totalProducts) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(totalProducts / this.productsPerPage);
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageNumbers = document.getElementById('page-numbers');

        // Actualizar botones
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadProducts();
                }
            };
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
            nextBtn.onclick = () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadProducts();
                }
            };
        }

        // Actualizar números de página
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = Utils.createElement('button', {
                    className: `page-btn ${i === this.currentPage ? 'active' : ''}`,
                });
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.loadProducts();
                });
                pageNumbers.appendChild(pageBtn);
            }
        }
    }

    /**
     * Muestra estado de carga
     */
    showLoadingState() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        container.innerHTML = Array(6).fill().map(() => `
            <div class="product-card loading">
                <div class="product-image"></div>
                <div class="product-info">
                    <div class="product-name"></div>
                    <div class="product-category"></div>
                    <div class="product-price"></div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Oculta estado de carga
     */
    hideLoadingState() {
        // El renderProducts() limpia el loading state
    }

    /**
     * Muestra estado vacío de productos
     * @param {HTMLElement} container 
     */
    showEmptyProductsState(container) {
        container.innerHTML = `
            <div class="empty-products-state">
                <div class="empty-icon">🛍️</div>
                <h3>No se encontraron productos</h3>
                <p>
                    ${this.searchQuery ? 
                        'No hay productos que coincidan con tu búsqueda.' : 
                        'No hay productos en esta categoría.'
                    }
                </p>
                <button class="btn-secondary" onclick="location.reload()">
                    Ver Todos los Productos
                </button>
            </div>
        `;
    }

    /**
     * Obtiene estadísticas de la tienda
     * @returns {Object}
     */
    getShopStats() {
        return {
            totalProducts: this.productsData.length,
            currentCategory: this.currentCategory,
            currentSort: this.currentSort,
            cartItems: cartStorage.getCartItemCount(),
            cartTotal: cartStorage.getCartTotal(),
            searchQuery: this.searchQuery
        };
    }
}

// CSS adicional para la tienda
const shopStyles = document.createElement('style');
shopStyles.textContent = `
    .empty-products-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: var(--color-claro);
    }
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .empty-products-state h3 {
        color: var(--color-destacado);
        margin-bottom: 1rem;
    }
    
    .add-to-cart.success {
        background: #27ae60 !important;
        transform: scale(0.95);
    }
    
    .discount-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--color-acento);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        z-index: 5;
    }
    
    .quantity-input {
        width: 80px;
        padding: 0.5rem;
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 5px;
        background: rgba(255,255,255,0.1);
        color: var(--color-claro);
        text-align: center;
    }
    
    .stock-status {
        padding: 0.5rem 1rem;
        border-radius: 10px;
        margin: 1rem 0;
        font-weight: 600;
    }
    
    .stock-status.in-stock {
        background: rgba(39, 174, 96, 0.2);
        color: #27ae60;
    }
    
    .stock-status.low-stock {
        background: rgba(243, 156, 18, 0.2);
        color: #f39c12;
    }
    
    .stock-status.out-of-stock {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
    }
`;

document.head.appendChild(shopStyles);

// Inicializar cuando el DOM esté listo
let shopManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-grid') || document.getElementById('featured-grid')) {
        shopManager = new ShopManager();
        window.shopManager = shopManager;
    }
});

// Exportar función para actualizar carrito desde otros módulos
window.updateCartDisplay = () => {
    if (shopManager) {
        shopManager.updateCartDisplay();
    }
};
