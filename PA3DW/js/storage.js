/**
 * Sistema de almacenamiento local para Por Amor
 * Maneja localStorage con funciones de seguridad y validación
 */

class StorageManager {
    constructor() {
        this.prefix = 'porAmor_';
        this.version = '1.0';
        this.init();
    }

    /**
     * Inicializa el sistema de storage
     */
    init() {
        try {
            // Verificar si localStorage está disponible
            if (!this.isStorageAvailable()) {
                console.warn('localStorage no está disponible');
                return;
            }

            // Verificar versión y migrar si es necesario
            this.checkVersion();
            
            // Limpiar datos expirados
            this.cleanExpiredData();
        } catch (error) {
            console.error('Error inicializando StorageManager:', error);
        }
    }

    /**
     * Verifica si localStorage está disponible
     * @returns {boolean}
     */
    isStorageAvailable() {
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
     * Verifica la versión del storage
     */
    checkVersion() {
        const storedVersion = localStorage.getItem(this.prefix + 'version');
        if (storedVersion !== this.version) {
            // En caso de cambio de versión, limpiar datos antiguos
            this.clearAll();
            localStorage.setItem(this.prefix + 'version', this.version);
        }
    }

    /**
     * Limpia datos expirados
     */
    cleanExpiredData() {
        const now = Date.now();
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.expires && data.expires < now) {
                        keysToRemove.push(key);
                    }
                } catch (error) {
                    // Si hay error parseando, remover la clave
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    /**
     * Genera clave con prefijo
     * @param {string} key 
     * @returns {string}
     */
    getKey(key) {
        return this.prefix + key;
    }

    /**
     * Guarda datos en localStorage
     * @param {string} key - Clave
     * @param {*} data - Datos a guardar
     * @param {number} expirationHours - Horas hasta expiración (opcional)
     * @returns {boolean} - Success status
     */
    set(key, data, expirationHours = null) {
        try {
            if (!this.isStorageAvailable()) return false;

            const storageData = {
                data: data,
                timestamp: Date.now(),
                expires: expirationHours ? Date.now() + (expirationHours * 60 * 60 * 1000) : null
            };

            localStorage.setItem(this.getKey(key), JSON.stringify(storageData));
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    }

    /**
     * Obtiene datos de localStorage
     * @param {string} key - Clave
     * @param {*} defaultValue - Valor por defecto
     * @returns {*} - Datos guardados o valor por defecto
     */
    get(key, defaultValue = null) {
        try {
            if (!this.isStorageAvailable()) return defaultValue;

            const stored = localStorage.getItem(this.getKey(key));
            if (!stored) return defaultValue;

            const parsedData = JSON.parse(stored);
            
            // Verificar expiración
            if (parsedData.expires && Date.now() > parsedData.expires) {
                this.remove(key);
                return defaultValue;
            }

            return parsedData.data;
        } catch (error) {
            console.error('Error obteniendo de localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remueve un elemento del localStorage
     * @param {string} key 
     * @returns {boolean}
     */
    remove(key) {
        try {
            if (!this.isStorageAvailable()) return false;
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error('Error removiendo de localStorage:', error);
            return false;
        }
    }

    /**
     * Verifica si existe una clave
     * @param {string} key 
     * @returns {boolean}
     */
    exists(key) {
        return this.get(key) !== null;
    }

    /**
     * Limpia todos los datos de la aplicación
     */
    clearAll() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
        }
    }

    /**
     * Obtiene estadísticas de uso del storage
     * @returns {Object}
     */
    getStorageStats() {
        let totalSize = 0;
        let itemCount = 0;
        const categories = {};

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    totalSize += size;
                    itemCount++;

                    // Categorizar por tipo de dato
                    const category = key.split('_')[1] || 'unknown';
                    categories[category] = (categories[category] || 0) + size;
                }
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
        }

        return {
            totalSize,
            itemCount,
            categories,
            maxSize: 5 * 1024 * 1024, // 5MB aprox límite de localStorage
            usagePercentage: Math.round((totalSize / (5 * 1024 * 1024)) * 100)
        };
    }
}

// Funciones específicas para diferentes tipos de datos
class CommentsStorage extends StorageManager {
    constructor() {
        super();
        this.commentsKey = 'comments';
        this.ratingsKey = 'ratings';
    }

    /**
     * Guarda un comentario
     * @param {Object} comment - Comentario a guardar
     * @returns {boolean}
     */
    saveComment(comment) {
        const comments = this.getComments();
        comment.id = comment.id || Utils.generateId();
        comment.timestamp = comment.timestamp || Date.now();
        comment.helpful = comment.helpful || 0;
        
        comments.push(comment);
        return this.set(this.commentsKey, comments);
    }

    /**
     * Obtiene todos los comentarios
     * @returns {Array}
     */
    getComments() {
        return this.get(this.commentsKey, []);
    }

    /**
     * Actualiza un comentario existente
     * @param {string} commentId 
     * @param {Object} updates 
     * @returns {boolean}
     */
    updateComment(commentId, updates) {
        const comments = this.getComments();
        const index = comments.findIndex(c => c.id === commentId);
        
        if (index !== -1) {
            comments[index] = { ...comments[index], ...updates };
            return this.set(this.commentsKey, comments);
        }
        return false;
    }

    /**
     * Elimina un comentario
     * @param {string} commentId 
     * @returns {boolean}
     */
    deleteComment(commentId) {
        const comments = this.getComments();
        const filteredComments = comments.filter(c => c.id !== commentId);
        return this.set(this.commentsKey, filteredComments);
    }

    /**
     * Obtiene comentarios filtrados
     * @param {Object} filters 
     * @returns {Array}
     */
    getFilteredComments(filters = {}) {
        let comments = this.getComments();

        if (filters.rating) {
            const minRating = parseInt(filters.rating);
            comments = comments.filter(c => c.rating >= minRating);
        }

        if (filters.spoilers === 'true') {
            comments = comments.filter(c => c.spoilerWarning);
        } else if (filters.spoilers === 'false') {
            comments = comments.filter(c => !c.spoilerWarning);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            comments = comments.filter(c => 
                c.title.toLowerCase().includes(searchTerm) ||
                c.content.toLowerCase().includes(searchTerm) ||
                c.name.toLowerCase().includes(searchTerm)
            );
        }

        return comments;
    }

    /**
     * Ordena comentarios
     * @param {Array} comments 
     * @param {string} sortBy 
     * @returns {Array}
     */
    sortComments(comments, sortBy = 'newest') {
        const sorted = [...comments];

        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => b.timestamp - a.timestamp);
            case 'oldest':
                return sorted.sort((a, b) => a.timestamp - b.timestamp);
            case 'highest':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return sorted.sort((a, b) => a.rating - b.rating);
            case 'helpful':
                return sorted.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
            default:
                return sorted;
        }
    }

    /**
     * Obtiene estadísticas de comentarios
     * @returns {Object}
     */
    getCommentsStats() {
        const comments = this.getComments();
        const ratings = comments.map(c => c.rating).filter(r => r);
        
        const stats = Utils.calculateRatingStats(ratings);
        
        const favoriteCharacters = {};
        comments.forEach(comment => {
            if (comment.favoriteCharacter) {
                favoriteCharacters[comment.favoriteCharacter] = 
                    (favoriteCharacters[comment.favoriteCharacter] || 0) + 1;
            }
        });

        const mostFavoriteCharacter = Object.entries(favoriteCharacters)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            totalComments: comments.length,
            averageRating: stats.average,
            ratingDistribution: stats.distribution,
            activeFans: new Set(comments.map(c => c.name)).size,
            favoriteCharacter: mostFavoriteCharacter ? mostFavoriteCharacter[0] : 'N/A'
        };
    }
}

class CartStorage extends StorageManager {
    constructor() {
        super();
        this.cartKey = 'cart';
        this.ordersKey = 'orders';
        this.favoritesKey = 'favorites';
    }

    /**
     * Agrega un producto al carrito
     * @param {Object} product 
     * @param {number} quantity 
     * @returns {boolean}
     */
    addToCart(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity,
                addedAt: Date.now()
            });
        }

        return this.set(this.cartKey, cart);
    }

    /**
     * Obtiene el carrito
     * @returns {Array}
     */
    getCart() {
        return this.get(this.cartKey, []);
    }

    /**
     * Actualiza cantidad de un producto
     * @param {string} productId 
     * @param {number} quantity 
     * @returns {boolean}
     */
    updateCartQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            }
            item.quantity = quantity;
            return this.set(this.cartKey, cart);
        }
        return false;
    }

    /**
     * Remueve un producto del carrito
     * @param {string} productId 
     * @returns {boolean}
     */
    removeFromCart(productId) {
        const cart = this.getCart();
        const filteredCart = cart.filter(item => item.id !== productId);
        return this.set(this.cartKey, filteredCart);
    }

    /**
     * Limpia el carrito
     * @returns {boolean}
     */
    clearCart() {
        return this.set(this.cartKey, []);
    }

    /**
     * Obtiene el total del carrito
     * @returns {number}
     */
    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Obtiene la cantidad total de items
     * @returns {number}
     */
    getCartItemCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Guarda una orden
     * @param {Object} order 
     * @returns {boolean}
     */
    saveOrder(order) {
        const orders = this.getOrders();
        order.id = order.id || Utils.generateId();
        order.timestamp = order.timestamp || Date.now();
        order.status = order.status || 'pending';
        
        orders.push(order);
        
        // Limpiar carrito después de la orden
        this.clearCart();
        
        return this.set(this.ordersKey, orders);
    }

    /**
     * Obtiene las órdenes
     * @returns {Array}
     */
    getOrders() {
        return this.get(this.ordersKey, []);
    }

    /**
     * Agrega/remueve de favoritos
     * @param {string} productId 
     * @returns {boolean}
     */
    toggleFavorite(productId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(productId);
        
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(productId);
        }
        
        return this.set(this.favoritesKey, favorites);
    }

    /**
     * Obtiene favoritos
     * @returns {Array}
     */
    getFavorites() {
        return this.get(this.favoritesKey, []);
    }

    /**
     * Verifica si un producto es favorito
     * @param {string} productId 
     * @returns {boolean}
     */
    isFavorite(productId) {
        return this.getFavorites().includes(productId);
    }
}

class UserStorage extends StorageManager {
    constructor() {
        super();
        this.userKey = 'user';
        this.preferencesKey = 'preferences';
        this.subscriptionKey = 'subscription';
    }

    /**
     * Guarda datos del usuario
     * @param {Object} userData 
     * @returns {boolean}
     */
    saveUser(userData) {
        return this.set(this.userKey, userData);
    }

    /**
     * Obtiene datos del usuario
     * @returns {Object|null}
     */
    getUser() {
        return this.get(this.userKey, null);
    }

    /**
     * Guarda preferencias del usuario
     * @param {Object} preferences 
     * @returns {boolean}
     */
    savePreferences(preferences) {
        const currentPrefs = this.getPreferences();
        const updatedPrefs = { ...currentPrefs, ...preferences };
        return this.set(this.preferencesKey, updatedPrefs);
    }

    /**
     * Obtiene preferencias del usuario
     * @returns {Object}
     */
    getPreferences() {
        return this.get(this.preferencesKey, {
            theme: 'dark',
            notifications: true,
            autoplay: false,
            language: 'es'
        });
    }

    /**
     * Guarda suscripción
     * @param {Object} subscriptionData 
     * @returns {boolean}
     */
    saveSubscription(subscriptionData) {
        subscriptionData.timestamp = Date.now();
        return this.set(this.subscriptionKey, subscriptionData);
    }

    /**
     * Obtiene datos de suscripción
     * @returns {Object|null}
     */
    getSubscription() {
        return this.get(this.subscriptionKey, null);
    }

    /**
     * Verifica si el usuario está suscrito
     * @returns {boolean}
     */
    isSubscribed() {
        return this.getSubscription() !== null;
    }
}

// Instancias globales
const storage = new StorageManager();
const commentsStorage = new CommentsStorage();
const cartStorage = new CartStorage();
const userStorage = new UserStorage();

// Exportar para uso global
window.storage = storage;
window.commentsStorage = commentsStorage;
window.cartStorage = cartStorage;
window.userStorage = userStorage;
