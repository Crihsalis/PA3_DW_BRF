/**
 * Utilidades generales para el sitio web Por Amor
 * Funciones helper y utilidades comunes
 */

// Clase para manejo de utilidades generales
class Utils {
    /**
     * Formatea una fecha para mostrar
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    static formatDate(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffMs = now - dateObj;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        
        return dateObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Formatea un precio en dólares
     * @param {number} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    static formatPrice(price) {
        if (typeof price !== 'number') return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    /**
     * Genera un ID único
     * @returns {string} ID único
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Debounce function para optimizar eventos
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función debounced
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function para optimizar eventos
     * @param {Function} func - Función a ejecutar
     * @param {number} limit - Límite de tiempo en ms
     * @returns {Function} Función throttled
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Sanitiza texto para prevenir XSS
     * @param {string} text - Texto a sanitizar
     * @returns {string} Texto sanitizado
     */
    static sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Trunca texto a una longitud específica
     * @param {string} text - Texto a truncar
     * @param {number} length - Longitud máxima
     * @returns {string} Texto truncado
     */
    static truncateText(text, length = 100) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    }

    /**
     * Capitaliza la primera letra de cada palabra
     * @param {string} text - Texto a capitalizar
     * @returns {string} Texto capitalizado
     */
    static capitalizeWords(text) {
        if (!text) return '';
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    /**
     * Valida si un email es válido
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Genera estrellas para rating
     * @param {number} rating - Rating de 0 a 5
     * @param {boolean} interactive - Si las estrellas son interactivas
     * @returns {string} HTML de las estrellas
     */
    static generateStars(rating, interactive = false) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const className = i <= rating ? 'star' : 'star empty';
            const dataAttr = interactive ? `data-rating="${i}"` : '';
            starsHTML += `<span class="${className}" ${dataAttr}>★</span>`;
        }
        return starsHTML;
    }

    /**
     * Muestra notificación temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     * @param {number} duration - Duración en ms
     */
    static showNotification(message, type = 'info', duration = 3000) {
        // Remover notificaciones existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${this.sanitizeText(message)}</span>
            <button class="notification-close">&times;</button>
        `;

        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Cerrar notificación
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto cerrar
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        // Agregar estilos de animación si no existen
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    margin: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Anima el scroll hacia un elemento
     * @param {Element|string} target - Elemento o selector
     * @param {number} offset - Offset en pixels
     */
    static smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Observa la intersección de elementos para animaciones
     * @param {string} selector - Selector de elementos a observar
     * @param {Function} callback - Callback cuando el elemento es visible
     * @param {Object} options - Opciones del observer
     */
    static observeElements(selector, callback, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            ...options
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, defaultOptions);

        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });

        return observer;
    }

    /**
     * Carga lazy de imágenes
     * @param {string} selector - Selector de imágenes
     */
    static lazyLoadImages(selector = 'img[data-src]') {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll(selector).forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Maneja errores de forma global
     * @param {Error} error - Error a manejar
     * @param {string} context - Contexto donde ocurrió el error
     */
    static handleError(error, context = 'Aplicación') {
        console.error(`Error en ${context}:`, error);
        
        // En producción, podrías enviar esto a un servicio de logging
        const errorMessage = error.message || 'Ha ocurrido un error inesperado';
        this.showNotification(`${context}: ${errorMessage}`, 'error', 5000);
    }

    /**
     * Crea un elemento con atributos y contenido
     * @param {string} tag - Etiqueta del elemento
     * @param {Object} attributes - Atributos del elemento
     * @param {string} content - Contenido del elemento
     * @returns {Element} Elemento creado
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            element.innerHTML = content;
        }

        return element;
    }

    /**
     * Obtiene parámetros de la URL
     * @param {string} param - Nombre del parámetro
     * @returns {string|null} Valor del parámetro
     */
    static getUrlParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Filtra palabras ofensivas del contenido
     * @param {string} text - Texto a filtrar
     * @returns {string} Texto filtrado
     */
    static moderateContent(text) {
        if (!text) return '';
        
        const offensiveWords = [
            'idiota', 'estúpido', 'tonto', 'imbécil', 'estupidez',
            'odio', 'maldito', 'basura', 'porquería'
        ];
        
        let moderatedText = text;
        offensiveWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            moderatedText = moderatedText.replace(regex, '*'.repeat(word.length));
        });
        
        return moderatedText;
    }

    /**
     * Calcula estadísticas de un array de ratings
     * @param {Array} ratings - Array de ratings
     * @returns {Object} Estadísticas calculadas
     */
    static calculateRatingStats(ratings) {
        if (!ratings || ratings.length === 0) {
            return {
                average: 0,
                total: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        const total = ratings.length;
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        const average = sum / total;

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(rating => {
            if (rating >= 1 && rating <= 5) {
                distribution[rating]++;
            }
        });

        return {
            average: Math.round(average * 10) / 10,
            total,
            distribution
        };
    }
}

// Agregar estilos CSS necesarios para las utilidades
const utilsStyles = document.createElement('style');
utilsStyles.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    
    .slide-up {
        animation: slideUp 0.5s ease-out;
    }
    
    .loading {
        position: relative;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid var(--color-destacado);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .loaded {
        opacity: 1;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;

document.head.appendChild(utilsStyles);

// Exportar para uso global
window.Utils = Utils;
