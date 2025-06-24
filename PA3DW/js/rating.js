/**
 * Sistema de rating con estrellas para Por Amor
 * Maneja calificaciones interactivas y visualización
 */

class RatingSystem {
    constructor() {
        this.init();
    }

    /**
     * Inicializa el sistema de rating
     */
    init() {
        this.attachEventListeners();
        this.initializeExistingRatings();
    }

    /**
     * Adjunta event listeners para ratings
     */
    attachEventListeners() {
        // Event delegation para ratings dinámicos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('star') && e.target.closest('.star-rating')) {
                this.handleStarClick(e);
            }
        });

        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('star') && e.target.closest('.star-rating')) {
                this.handleStarHover(e);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('star') && e.target.closest('.star-rating')) {
                this.handleStarLeave(e);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('star-rating')) {
                this.resetStarDisplay(e.target);
            }
        });
    }

    /**
     * Inicializa ratings existentes en la página
     */
    initializeExistingRatings() {
        // Inicializar ratings de solo lectura
        document.querySelectorAll('.stars-display').forEach(container => {
            this.renderReadOnlyStars(container);
        });

        // Inicializar ratings interactivos
        document.querySelectorAll('.star-rating').forEach(container => {
            this.initializeInteractiveRating(container);
        });
    }

    /**
     * Maneja clic en estrella
     * @param {Event} e 
     */
    handleStarClick(e) {
        const star = e.target;
        const ratingContainer = star.closest('.star-rating');
        const rating = parseInt(star.getAttribute('data-rating'));
        
        if (!ratingContainer) return;

        // Verificar si es readonly
        if (ratingContainer.hasAttribute('data-readonly')) return;

        this.setRating(ratingContainer, rating);
        this.updateRatingText(ratingContainer, rating);
        
        // Trigger custom event
        const customEvent = new CustomEvent('ratingChanged', {
            detail: { rating, container: ratingContainer }
        });
        ratingContainer.dispatchEvent(customEvent);

        // Efecto visual de confirmación
        this.showRatingConfirmation(ratingContainer, rating);
    }

    /**
     * Maneja hover sobre estrella
     * @param {Event} e 
     */
    handleStarHover(e) {
        const star = e.target;
        const ratingContainer = star.closest('.star-rating');
        const rating = parseInt(star.getAttribute('data-rating'));
        
        if (!ratingContainer || ratingContainer.hasAttribute('data-readonly')) return;

        this.previewRating(ratingContainer, rating);
        this.updateRatingText(ratingContainer, rating, true);
    }

    /**
     * Maneja cuando se sale del hover de una estrella
     * @param {Event} e 
     */
    handleStarLeave(e) {
        const star = e.target;
        const ratingContainer = star.closest('.star-rating');
        
        if (!ratingContainer || ratingContainer.hasAttribute('data-readonly')) return;

        // No hacer nada aquí, el evento mouseleave del container se encarga del reset
    }

    /**
     * Establece un rating específico
     * @param {HTMLElement} container 
     * @param {number} rating 
     */
    setRating(container, rating) {
        container.setAttribute('data-rating', rating);
        
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.classList.remove('empty');
            } else {
                star.classList.remove('active');
                star.classList.add('empty');
            }
        });
    }

    /**
     * Previsualiza un rating (durante hover)
     * @param {HTMLElement} container 
     * @param {number} rating 
     */
    previewRating(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.remove('preview');
            if (index < rating) {
                star.classList.add('preview');
            }
        });
    }

    /**
     * Resetea la visualización de estrellas al estado actual
     * @param {HTMLElement} container 
     */
    resetStarDisplay(container) {
        if (container.hasAttribute('data-readonly')) return;

        const currentRating = parseInt(container.getAttribute('data-rating')) || 0;
        const stars = container.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            star.classList.remove('preview');
            if (index < currentRating) {
                star.classList.add('active');
                star.classList.remove('empty');
            } else {
                star.classList.remove('active');
                star.classList.add('empty');
            }
        });

        this.updateRatingText(container, currentRating);
    }

    /**
     * Actualiza el texto del rating
     * @param {HTMLElement} container 
     * @param {number} rating 
     * @param {boolean} isPreview 
     */
    updateRatingText(container, rating, isPreview = false) {
        const textElement = container.parentElement.querySelector('.rating-text') || 
                           container.querySelector('.rating-text');
        
        if (!textElement) return;

        const ratingTexts = {
            0: 'Selecciona una calificación',
            1: 'Muy malo',
            2: 'Malo',
            3: 'Regular',
            4: 'Bueno',
            5: 'Excelente'
        };

        const text = isPreview ? `${ratingTexts[rating]} (${rating}/5)` : ratingTexts[rating];
        textElement.textContent = text;
        
        if (isPreview) {
            textElement.style.color = 'var(--color-destacado)';
        } else {
            textElement.style.color = '';
        }
    }

    /**
     * Muestra confirmación visual del rating
     * @param {HTMLElement} container 
     * @param {number} rating 
     */
    showRatingConfirmation(container, rating) {
        const stars = container.querySelectorAll('.star.active');
        
        stars.forEach((star, index) => {
            setTimeout(() => {
                star.style.animation = 'starGlow 0.5s ease-out';
                setTimeout(() => {
                    star.style.animation = '';
                }, 500);
            }, index * 100);
        });

        // Efecto de pulso en el container
        container.style.animation = 'ratingPulse 0.3s ease-out';
        setTimeout(() => {
            container.style.animation = '';
        }, 300);
    }

    /**
     * Renderiza estrellas de solo lectura
     * @param {HTMLElement} container 
     */
    renderReadOnlyStars(container) {
        const rating = parseFloat(container.getAttribute('data-rating')) || 0;
        const maxStars = parseInt(container.getAttribute('data-max')) || 5;
        
        let starsHTML = '';
        for (let i = 1; i <= maxStars; i++) {
            let starClass = 'star';
            
            if (i <= Math.floor(rating)) {
                starClass += ' active';
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                starClass += ' half-active';
            } else {
                starClass += ' empty';
            }
            
            starsHTML += `<span class="${starClass}">★</span>`;
        }
        
        container.innerHTML = starsHTML;
        container.setAttribute('data-readonly', 'true');
    }

    /**
     * Inicializa un rating interactivo
     * @param {HTMLElement} container 
     */
    initializeInteractiveRating(container) {
        const currentRating = parseInt(container.getAttribute('data-rating')) || 0;
        const maxStars = parseInt(container.getAttribute('data-max')) || 5;
        
        let starsHTML = '';
        for (let i = 1; i <= maxStars; i++) {
            const starClass = i <= currentRating ? 'star active' : 'star empty';
            starsHTML += `<span class="${starClass}" data-rating="${i}">★</span>`;
        }
        
        container.innerHTML = starsHTML;
        
        // Inicializar texto del rating
        this.updateRatingText(container, currentRating);
    }

    /**
     * Obtiene el rating actual de un container
     * @param {HTMLElement} container 
     * @returns {number}
     */
    getRating(container) {
        return parseInt(container.getAttribute('data-rating')) || 0;
    }

    /**
     * Crea un nuevo sistema de rating
     * @param {HTMLElement} container 
     * @param {Object} options 
     */
    createRating(container, options = {}) {
        const defaultOptions = {
            maxStars: 5,
            initialRating: 0,
            readonly: false,
            size: 'medium',
            showText: true
        };

        const config = { ...defaultOptions, ...options };
        
        container.className = `star-rating star-rating-${config.size}`;
        container.setAttribute('data-rating', config.initialRating);
        container.setAttribute('data-max', config.maxStars);
        
        if (config.readonly) {
            container.setAttribute('data-readonly', 'true');
            this.renderReadOnlyStars(container);
        } else {
            this.initializeInteractiveRating(container);
        }

        if (config.showText) {
            const textElement = document.createElement('span');
            textElement.className = 'rating-text';
            container.parentElement.appendChild(textElement);
            this.updateRatingText(container, config.initialRating);
        }
    }

    /**
     * Actualiza estadísticas de rating en tiempo real
     * @param {string} containerSelector 
     */
    updateRatingStats(containerSelector = '#overall-rating-display') {
        const comments = commentsStorage.getComments();
        const ratings = comments.map(c => c.rating).filter(r => r);
        const stats = Utils.calculateRatingStats(ratings);

        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Actualizar número promedio
        const ratingNumber = container.querySelector('.rating-number');
        if (ratingNumber) {
            ratingNumber.textContent = stats.average.toFixed(1);
        }

        // Actualizar estrellas
        const starsDisplay = container.querySelector('.stars-display');
        if (starsDisplay) {
            starsDisplay.setAttribute('data-rating', stats.average);
            this.renderReadOnlyStars(starsDisplay);
        }

        // Actualizar contador
        const ratingCount = container.querySelector('.rating-count');
        if (ratingCount) {
            ratingCount.textContent = `(${stats.total} opinión${stats.total !== 1 ? 'es' : ''})`;
        }

        return stats;
    }

    /**
     * Anima el cambio de rating
     * @param {HTMLElement} container 
     * @param {number} fromRating 
     * @param {number} toRating 
     * @param {number} duration 
     */
    animateRatingChange(container, fromRating, toRating, duration = 1000) {
        const steps = 20;
        const stepDuration = duration / steps;
        const ratingDiff = toRating - fromRating;
        const stepSize = ratingDiff / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const currentRating = fromRating + (stepSize * currentStep);
            
            if (container.hasAttribute('data-readonly')) {
                container.setAttribute('data-rating', currentRating.toFixed(1));
                this.renderReadOnlyStars(container);
            } else {
                this.setRating(container, Math.round(currentRating));
            }

            if (currentStep >= steps) {
                clearInterval(interval);
                if (container.hasAttribute('data-readonly')) {
                    container.setAttribute('data-rating', toRating);
                    this.renderReadOnlyStars(container);
                } else {
                    this.setRating(container, toRating);
                }
            }
        }, stepDuration);
    }

    /**
     * Valida un rating
     * @param {number} rating 
     * @param {number} min 
     * @param {number} max 
     * @returns {boolean}
     */
    validateRating(rating, min = 1, max = 5) {
        return rating >= min && rating <= max && Number.isInteger(rating);
    }
}

// Agregar estilos CSS para el sistema de rating
const ratingStyles = document.createElement('style');
ratingStyles.textContent = `
    .star-rating {
        display: flex;
        gap: 0.5rem;
        cursor: pointer;
        user-select: none;
    }
    
    .star-rating[data-readonly="true"] {
        cursor: default;
    }
    
    .star-rating .star {
        font-size: 2rem;
        color: #333;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .star-rating .star:hover {
        transform: scale(1.2);
    }
    
    .star-rating[data-readonly="true"] .star:hover {
        transform: none;
    }
    
    .star-rating .star.active {
        color: #ffd700;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
    
    .star-rating .star.preview {
        color: #ffed4e;
        transform: scale(1.1);
    }
    
    .star-rating .star.half-active {
        background: linear-gradient(90deg, #ffd700 50%, #333 50%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .star-rating-small .star {
        font-size: 1rem;
    }
    
    .star-rating-large .star {
        font-size: 3rem;
    }
    
    .stars-display {
        display: flex;
        gap: 0.2rem;
    }
    
    .stars-display .star {
        font-size: 1.5rem;
        color: #ffd700;
    }
    
    .stars-display .star.empty {
        color: #333;
    }
    
    .rating-text {
        display: block;
        margin-top: 0.5rem;
        font-weight: 600;
        color: var(--color-destacado);
        transition: all 0.3s ease;
    }
    
    @keyframes starGlow {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); text-shadow: 0 0 20px rgba(255, 215, 0, 1); }
        100% { transform: scale(1.2); }
    }
    
    @keyframes ratingPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .star-rating .star {
            font-size: 1.8rem;
            gap: 0.3rem;
        }
        
        .star-rating-large .star {
            font-size: 2.5rem;
        }
    }
    
    @media (max-width: 480px) {
        .star-rating .star {
            font-size: 1.5rem;
            gap: 0.2rem;
        }
        
        .star-rating-large .star {
            font-size: 2rem;
        }
    }
`;

document.head.appendChild(ratingStyles);

// Instancia global del sistema de rating
const ratingSystem = new RatingSystem();
window.ratingSystem = ratingSystem;
