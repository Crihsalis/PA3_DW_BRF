/**
 * Sistema de comentarios y reseñas para Por Amor
 * Maneja la funcionalidad completa de la comunidad de fans
 */

class CommentsManager {
    constructor() {
        this.commentsPerPage = 5;
        this.currentPage = 1;
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Inicializa el sistema de comentarios
     */
    init() {
        this.setupEventListeners();
        this.loadCommunityStats();
        this.loadReviews();
        this.initializeRatingSystem();
        this.setupCharacterCount();
        this.setupFormValidation();
        
        console.log('Sistema de comentarios inicializado');
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Filtros de rating
        const ratingFilters = document.getElementById('rating-filters');
        if (ratingFilters) {
            ratingFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    this.handleRatingFilter(e);
                }
            });
        }

        // Ordenamiento
        const sortSelect = document.getElementById('sort-reviews');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }

        // Búsqueda
        const searchInput = document.getElementById('review-search');
        const searchBtn = document.getElementById('review-search-btn');
        
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

        // Botón de cargar más
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreReviews();
            });
        }

        // Modal de confirmación
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideConfirmationModal();
            });
        }

        // Eventos de reseñas
        document.addEventListener('click', (e) => {
            this.handleReviewActions(e);
        });

        // Formulario de reseña
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleReviewSubmission(e.target);
            });
        }
    }

    /**
     * Inicializa el sistema de rating con estrellas
     */
    initializeRatingSystem() {
        const starRating = document.getElementById('star-rating');
        if (!starRating) return;

        starRating.addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) {
                const rating = parseInt(e.target.getAttribute('data-rating'));
                this.setFormRating(rating);
            }
        });

        starRating.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('star')) {
                const rating = parseInt(e.target.getAttribute('data-rating'));
                this.previewFormRating(rating);
            }
        });

        starRating.addEventListener('mouseleave', () => {
            this.resetFormRatingPreview();
        });
    }

    /**
     * Establece el rating en el formulario
     * @param {number} rating 
     */
    setFormRating(rating) {
        const starRating = document.getElementById('star-rating');
        const ratingText = document.getElementById('rating-text');
        
        starRating.setAttribute('data-rating', rating);
        
        const stars = starRating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });

        const ratingTexts = {
            1: 'Muy malo',
            2: 'Malo', 
            3: 'Regular',
            4: 'Bueno',
            5: 'Excelente'
        };

        if (ratingText) {
            ratingText.textContent = ratingTexts[rating];
            ratingText.style.color = 'var(--color-destacado)';
        }

        // Limpiar error de rating si existe
        const ratingSection = starRating.closest('.rating-section');
        if (ratingSection) {
            ratingSection.classList.remove('error');
            const errorElement = ratingSection.querySelector('.error-message');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        }
    }

    /**
     * Previsualiza el rating en el formulario
     * @param {number} rating 
     */
    previewFormRating(rating) {
        const stars = document.querySelectorAll('#star-rating .star');
        stars.forEach((star, index) => {
            star.classList.remove('preview');
            if (index < rating) {
                star.classList.add('preview');
            }
        });
    }

    /**
     * Resetea la previsualización del rating
     */
    resetFormRatingPreview() {
        const starRating = document.getElementById('star-rating');
        const currentRating = parseInt(starRating.getAttribute('data-rating')) || 0;
        
        const stars = starRating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.remove('preview');
            if (index < currentRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    /**
     * Configura el contador de caracteres
     */
    setupCharacterCount() {
        const contentTextarea = document.getElementById('review-content');
        const charCount = document.getElementById('char-count');
        
        if (contentTextarea && charCount) {
            const maxLength = 500;
            
            contentTextarea.addEventListener('input', () => {
                const currentLength = contentTextarea.value.length;
                charCount.textContent = currentLength;
                
                // Cambiar color según el límite
                if (currentLength > maxLength * 0.9) {
                    charCount.parentElement.classList.add('danger');
                    charCount.parentElement.classList.remove('warning');
                } else if (currentLength > maxLength * 0.7) {
                    charCount.parentElement.classList.add('warning');
                    charCount.parentElement.classList.remove('danger');
                } else {
                    charCount.parentElement.classList.remove('warning', 'danger');
                }
            });
        }
    }

    /**
     * Configura la validación del formulario
     */
    setupFormValidation() {
        const form = document.getElementById('review-form');
        if (!form) return;

        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', Utils.debounce(() => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            }, 500));
        });
    }

    /**
     * Valida un campo individual
     * @param {HTMLElement} field 
     * @returns {boolean}
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        switch (field.id) {
            case 'reviewer-name':
                if (!value) {
                    isValid = false;
                    message = 'El nombre es obligatorio';
                } else if (value.length < 2) {
                    isValid = false;
                    message = 'El nombre debe tener al menos 2 caracteres';
                }
                break;

            case 'reviewer-email':
                if (value && !Utils.isValidEmail(value)) {
                    isValid = false;
                    message = 'Ingresa un email válido';
                }
                break;

            case 'review-title':
                if (!value) {
                    isValid = false;
                    message = 'El título es obligatorio';
                } else if (value.length < 5) {
                    isValid = false;
                    message = 'El título debe tener al menos 5 caracteres';
                }
                break;

            case 'review-content':
                if (!value) {
                    isValid = false;
                    message = 'La reseña es obligatoria';
                } else if (value.length < 10) {
                    isValid = false;
                    message = 'La reseña debe tener al menos 10 caracteres';
                } else if (value.length > 500) {
                    isValid = false;
                    message = 'La reseña no puede exceder 500 caracteres';
                }
                break;
        }

        this.showFieldValidation(field, isValid, message);
        return isValid;
    }

    /**
     * Muestra la validación de un campo
     * @param {HTMLElement} field 
     * @param {boolean} isValid 
     * @param {string} message 
     */
    showFieldValidation(field, isValid, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.error-message');

        if (isValid) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
            field.classList.remove('error');
            
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        } else {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
            field.classList.add('error');
            
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        }
    }

    /**
     * Carga las estadísticas de la comunidad
     */
    loadCommunityStats() {
        const stats = commentsStorage.getCommentsStats();
        
        // Actualizar contadores con animación
        this.animateStatCounter('total-comments', stats.totalComments);
        this.animateStatCounter('average-rating', stats.averageRating, 1);
        this.animateStatCounter('active-fans', stats.activeFans);
        
        const favoriteCharElement = document.getElementById('favorite-character');
        if (favoriteCharElement) {
            favoriteCharElement.textContent = this.getCharacterDisplayName(stats.favoriteCharacter);
        }
    }

    /**
     * Anima un contador estadístico
     * @param {string} elementId 
     * @param {number} targetValue 
     * @param {number} decimals 
     */
    animateStatCounter(elementId, targetValue, decimals = 0) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = startValue + (targetValue - startValue) * progress;
            
            element.textContent = currentValue.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        // Observar cuando el elemento sea visible para iniciar la animación
        Utils.observeElements(`#${elementId}`, () => {
            requestAnimationFrame(updateCounter);
        });
    }

    /**
     * Obtiene el nombre de display de un personaje
     * @param {string} characterKey 
     * @returns {string}
     */
    getCharacterDisplayName(characterKey) {
        const characterNames = {
            'dahlia': 'Dahlia',
            'elaine': 'Elaine',
            'evelyn': 'Evelyn',
            'cielo': 'Cielo',
            'liam': 'Liam',
            'arya': 'Arya'
        };

        return characterNames[characterKey] || 'N/A';
    }

    /**
     * Carga las reseñas
     */
    loadReviews() {
        this.isLoading = true;
        this.showLoadingState();

        // Simular delay para mostrar loading
        setTimeout(() => {
            this.renderReviews();
            this.updateReviewsCount();
            this.isLoading = false;
            this.hideLoadingState();
        }, 500);
    }

    /**
     * Renderiza las reseñas
     */
    renderReviews() {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        // Obtener y filtrar comentarios
        let comments = commentsStorage.getComments();
        comments = this.applyFilters(comments);
        comments = commentsStorage.sortComments(comments, this.currentSort);

        // Paginación
        const startIndex = (this.currentPage - 1) * this.commentsPerPage;
        const endIndex = startIndex + this.commentsPerPage;
        const paginatedComments = comments.slice(0, endIndex);

        // Limpiar container solo en la primera página
        if (this.currentPage === 1) {
            container.innerHTML = '';
        }

        // Verificar si hay comentarios
        if (paginatedComments.length === 0) {
            this.showEmptyState(container);
            return;
        }

        // Renderizar comentarios nuevos
        const newComments = comments.slice(
            this.currentPage === 1 ? 0 : (this.currentPage - 1) * this.commentsPerPage,
            endIndex
        );

        newComments.forEach((comment, index) => {
            const commentCard = this.createCommentCard(comment);
            
            // Animación escalonada
            commentCard.style.opacity = '0';
            commentCard.style.transform = 'translateY(30px)';
            
            container.appendChild(commentCard);

            setTimeout(() => {
                commentCard.style.transition = 'all 0.5s ease';
                commentCard.style.opacity = '1';
                commentCard.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Actualizar botón de cargar más
        this.updateLoadMoreButton(comments.length, endIndex);
    }

    /**
     * Aplica filtros a los comentarios
     * @param {Array} comments 
     * @returns {Array}
     */
    applyFilters(comments) {
        let filtered = [...comments];

        // Filtro por rating
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'spoilers') {
                filtered = filtered.filter(c => c.spoilerWarning);
            } else {
                const minRating = parseInt(this.currentFilter);
                filtered = filtered.filter(c => c.rating >= minRating);
            }
        }

        // Filtro por búsqueda
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(c => 
                c.title.toLowerCase().includes(query) ||
                c.content.toLowerCase().includes(query) ||
                c.name.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    /**
     * Crea una tarjeta de comentario
     * @param {Object} comment 
     * @returns {HTMLElement}
     */
    createCommentCard(comment) {
        const card = Utils.createElement('article', {
            className: `review-card ${comment.spoilerWarning ? 'spoiler' : ''}`,
            dataset: { commentId: comment.id }
        });

        const stars = Utils.generateStars(comment.rating);
        const timeAgo = Utils.formatDate(comment.timestamp);
        const moderatedContent = Utils.moderateContent(comment.content);
        
        // Determinar si el contenido necesita ser colapsado
        const isLongContent = moderatedContent.length > 300;
        const displayContent = isLongContent ? 
            Utils.truncateText(moderatedContent, 300) : 
            moderatedContent;

        card.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${comment.name.charAt(0).toUpperCase()}</div>
                    <div class="reviewer-details">
                        <h4>${Utils.sanitizeText(comment.name)}</h4>
                        <span class="review-date">${timeAgo}</span>
                    </div>
                </div>
                <div class="review-rating">
                    <div class="review-stars">${stars}</div>
                    <span class="rating-number">${comment.rating}/5</span>
                </div>
            </div>
            
            <h3 class="review-title">${Utils.sanitizeText(comment.title)}</h3>
            
            <div class="review-content ${isLongContent ? 'collapsed' : ''}" data-full-content="${Utils.sanitizeText(moderatedContent)}">
                ${Utils.sanitizeText(displayContent)}
            </div>
            
            ${isLongContent ? '<button class="expand-btn" data-action="expand">Leer más</button>' : ''}
            
            <div class="review-footer">
                <div class="review-meta">
                    ${comment.favoriteCharacter ? `
                        <span class="favorite-character">
                            ❤️ Personaje favorito: ${this.getCharacterDisplayName(comment.favoriteCharacter)}
                        </span>
                    ` : ''}
                    ${comment.recommend ? '<span class="recommended">👍 Recomendado</span>' : ''}
                </div>
                <div class="review-actions">
                    <button class="helpful-btn" data-action="helpful" data-comment-id="${comment.id}">
                        👍 Útil (${comment.helpful || 0})
                    </button>
                    <button class="reply-btn" data-action="reply" data-comment-id="${comment.id}">
                        💬 Responder
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Muestra estado vacío
     * @param {HTMLElement} container 
     */
    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💭</div>
                <h3>No se encontraron reseñas</h3>
                <p>
                    ${this.searchQuery ? 
                        'No hay reseñas que coincidan con tu búsqueda.' : 
                        'Sé el primero en compartir tu opinión sobre Por Amor.'
                    }
                </p>
                <button class="btn-primary" onclick="document.getElementById('review-form').scrollIntoView()">
                    Escribir Reseña
                </button>
            </div>
        `;
    }

    /**
     * Muestra estado de carga
     */
    showLoadingState() {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        // Solo mostrar loading si es la primera carga
        if (this.currentPage === 1) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Cargando reseñas...</p>
                </div>
            `;
        }

        // Deshabilitar controles
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Cargando...';
        }
    }

    /**
     * Oculta estado de carga
     */
    hideLoadingState() {
        const loadingState = document.querySelector('.loading-state');
        if (loadingState) {
            loadingState.remove();
        }

        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Cargar Más Reseñas';
        }
    }

    /**
     * Actualiza el botón de cargar más
     * @param {number} totalComments 
     * @param {number} loadedComments 
     */
    updateLoadMoreButton(totalComments, loadedComments) {
        const loadMoreContainer = document.getElementById('load-more-container');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        if (!loadMoreContainer || !loadMoreBtn) return;

        if (loadedComments >= totalComments) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
            const remaining = totalComments - loadedComments;
            loadMoreBtn.textContent = `Cargar Más Reseñas (${remaining} restantes)`;
        }
    }

    /**
     * Actualiza el contador de reseñas
     */
    updateReviewsCount() {
        const countElement = document.getElementById('showing-count');
        if (!countElement) return;

        const comments = this.applyFilters(commentsStorage.getComments());
        const loadedCount = Math.min(this.currentPage * this.commentsPerPage, comments.length);
        
        countElement.textContent = `${loadedCount} de ${comments.length}`;
    }

    /**
     * Maneja filtros de rating
     * @param {Event} e 
     */
    handleRatingFilter(e) {
        const button = e.target;
        const filter = button.getAttribute('data-filter');

        // Actualizar UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Aplicar filtro
        this.currentFilter = filter;
        this.currentPage = 1;
        this.loadReviews();
    }

    /**
     * Maneja cambio de ordenamiento
     * @param {string} sortValue 
     */
    handleSortChange(sortValue) {
        this.currentSort = sortValue;
        this.currentPage = 1;
        this.loadReviews();
    }

    /**
     * Maneja búsqueda
     * @param {string} query 
     */
    handleSearch(query) {
        this.searchQuery = query.trim();
        this.currentPage = 1;
        this.loadReviews();
    }

    /**
     * Carga más reseñas
     */
    loadMoreReviews() {
        if (this.isLoading) return;
        
        this.currentPage++;
        this.loadReviews();
    }

    /**
     * Maneja acciones en las reseñas
     * @param {Event} e 
     */
    handleReviewActions(e) {
        const action = e.target.getAttribute('data-action');
        const commentId = e.target.getAttribute('data-comment-id');

        switch (action) {
            case 'expand':
                this.expandReviewContent(e.target);
                break;
            case 'helpful':
                this.markAsHelpful(commentId, e.target);
                break;
            case 'reply':
                this.handleReply(commentId);
                break;
        }
    }

    /**
     * Expande el contenido de una reseña
     * @param {HTMLElement} button 
     */
    expandReviewContent(button) {
        const reviewContent = button.previousElementSibling;
        const fullContent = reviewContent.getAttribute('data-full-content');
        
        reviewContent.innerHTML = fullContent;
        reviewContent.classList.remove('collapsed');
        button.remove();
    }

    /**
     * Marca una reseña como útil
     * @param {string} commentId 
     * @param {HTMLElement} button 
     */
    markAsHelpful(commentId, button) {
        const helpfulComments = storage.get('helpful_comments', []);
        
        if (helpfulComments.includes(commentId)) {
            Utils.showNotification('Ya marcaste esta reseña como útil', 'info');
            return;
        }

        // Actualizar en storage
        const comments = commentsStorage.getComments();
        const comment = comments.find(c => c.id === commentId);
        
        if (comment) {
            comment.helpful = (comment.helpful || 0) + 1;
            commentsStorage.updateComment(commentId, { helpful: comment.helpful });
            
            // Recordar que este usuario ya marcó como útil
            helpfulComments.push(commentId);
            storage.set('helpful_comments', helpfulComments);
            
            // Actualizar UI
            button.innerHTML = `👍 Útil (${comment.helpful})`;
            button.classList.add('helpful');
            button.disabled = true;
            
            Utils.showNotification('¡Gracias por tu feedback!', 'success');
        }
    }

    /**
     * Maneja respuestas a reseñas
     * @param {string} commentId 
     */
    handleReply(commentId) {
        Utils.showNotification('Función de respuestas próximamente disponible', 'info');
    }

    /**
     * Maneja el envío del formulario de reseña
     * @param {HTMLFormElement} form 
     */
    handleReviewSubmission(form) {
        if (!this.validateReviewForm(form)) {
            return;
        }

        const submitBtn = form.querySelector('.btn-submit');
        const originalContent = submitBtn.innerHTML;
        
        // Mostrar estado de carga
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'inline';

        // Procesar después de un breve delay
        setTimeout(() => {
            const success = this.processReviewSubmission(form);
            
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loading').style.display = 'none';
            
            if (success) {
                this.showConfirmationModal();
                this.resetForm(form);
                this.loadCommunityStats();
                this.loadReviews();
            }
        }, 1500);
    }

    /**
     * Valida el formulario de reseña
     * @param {HTMLFormElement} form 
     * @returns {boolean}
     */
    validateReviewForm(form) {
        let isValid = true;

        // Validar campos requeridos
        const requiredFields = ['reviewer-name', 'review-title', 'review-content'];
        requiredFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validar rating
        const rating = document.getElementById('star-rating').getAttribute('data-rating');
        if (!rating || rating === '0') {
            const ratingSection = document.querySelector('.rating-section');
            ratingSection.classList.add('error');
            
            const ratingText = document.getElementById('rating-text');
            ratingText.textContent = 'Por favor selecciona una calificación';
            ratingText.style.color = 'var(--color-acento)';
            
            const errorElement = ratingSection.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = 'La calificación es obligatoria';
                errorElement.classList.add('show');
            }
            
            isValid = false;
        }

        return isValid;
    }

    /**
     * Procesa el envío de la reseña
     * @param {HTMLFormElement} form 
     * @returns {boolean}
     */
    processReviewSubmission(form) {
        try {
            const formData = new FormData(form);
            const rating = document.getElementById('star-rating').getAttribute('data-rating');
            
            const reviewData = {
                name: formData.get('name'),
                email: formData.get('email'),
                title: formData.get('title'),
                content: formData.get('content'),
                rating: parseInt(rating),
                favoriteCharacter: formData.get('favoriteCharacter'),
                spoilerWarning: formData.has('spoilerWarning'),
                recommend: formData.has('recommend'),
                helpful: 0,
                timestamp: Date.now()
            };

            return commentsStorage.saveComment(reviewData);
        } catch (error) {
            Utils.handleError(error, 'Envío de reseña');
            return false;
        }
    }

    /**
     * Muestra el modal de confirmación
     */
    showConfirmationModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
        }
    }

    /**
     * Oculta el modal de confirmación
     */
    hideConfirmationModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('fade-in');
        }
    }

    /**
     * Resetea el formulario
     * @param {HTMLFormElement} form 
     */
    resetForm(form) {
        form.reset();
        
        // Resetear rating
        const starRating = document.getElementById('star-rating');
        starRating.setAttribute('data-rating', '0');
        starRating.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
        
        const ratingText = document.getElementById('rating-text');
        ratingText.textContent = 'Selecciona una calificación';
        ratingText.style.color = '';
        
        // Resetear contador de caracteres
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = '0';
            charCount.parentElement.classList.remove('warning', 'danger');
        }
        
        // Limpiar validaciones
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
        
        form.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
    }

    /**
     * Obtiene estadísticas públicas
     * @returns {Object}
     */
    getStats() {
        return {
            currentFilter: this.currentFilter,
            currentSort: this.currentSort,
            currentPage: this.currentPage,
            searchQuery: this.searchQuery,
            totalComments: commentsStorage.getComments().length
        };
    }
}

// CSS adicional para comentarios
const commentsStyles = document.createElement('style');
commentsStyles.textContent = `
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--color-claro);
    }
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .empty-state h3 {
        color: var(--color-destacado);
        margin-bottom: 1rem;
    }
    
    .loading-state {
        text-align: center;
        padding: 3rem;
        color: var(--color-claro);
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(14, 228, 219, 0.3);
        border-top: 3px solid var(--color-destacado);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem auto;
    }
    
    .expand-btn {
        background: none;
        border: none;
        color: var(--color-destacado);
        cursor: pointer;
        font-weight: 600;
        text-decoration: underline;
        margin-top: 0.5rem;
        padding: 0;
    }
    
    .expand-btn:hover {
        color: var(--color-acento);
    }
    
    .helpful-btn.helpful {
        background: var(--gradiente-3);
        color: white;
        border-color: var(--color-destacado);
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

document.head.appendChild(commentsStyles);

// Inicializar cuando el DOM esté listo
let commentsManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('review-form') || document.getElementById('reviews-list')) {
        commentsManager = new CommentsManager();
        window.commentsManager = commentsManager;
    }
});

// Exportar función para actualizar estadísticas desde main.js
window.updateCommunityStats = () => {
    if (commentsManager) {
        commentsManager.loadCommunityStats();
    }
};
