/**
 * Sistema de validación para formulario de Por Amor
 * Validaciones en tiempo real con retroalimentación visual
 */

class FormValidator {
    constructor() {
        this.rules = {
            required: (value) => value && value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            minLength: (value, min) => value && value.length >= min,
            maxLength: (value, max) => value && value.length <= max,
            numeric: (value) => /^\d+$/.test(value),
            alphanumeric: (value) => /^[a-zA-Z0-9]+$/.test(value),
            phone: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, '')),
            url: (value) => {
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            }
        };

        this.messages = {
            required: 'Este campo es obligatorio',
            email: 'Ingresa un email válido',
            minLength: 'Mínimo {min} caracteres',
            maxLength: 'Máximo {max} caracteres',
            numeric: 'Solo se permiten números',
            alphanumeric: 'Solo se permiten letras y números',
            phone: 'Ingresa un número de teléfono válido',
            url: 'Ingresa una URL válida',
            custom: 'Valor no válido'
        };

        this.init();
    }

    /**
     * Inicializa el validador
     */
    init() {
        this.attachGlobalListeners();
    }

    /**
     * Adjunta listeners globales para validación automática
     */
    attachGlobalListeners() {
        document.addEventListener('input', (e) => {
            if (e.target.hasAttribute('data-validate')) {
                this.validateField(e.target);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.hasAttribute('data-validate')) {
                this.validateField(e.target);
            }
        });

        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.hasAttribute('data-validate-form')) {
                e.preventDefault();
                this.validateForm(form);
            }
        });
    }

    /**
     * Valida un campo individual
     * @param {HTMLElement} field - Campo a validar
     * @returns {boolean} - Es válido
     */
    validateField(field) {
        const validationRules = field.getAttribute('data-validate').split('|');
        const fieldName = field.getAttribute('name') || field.getAttribute('id');
        const value = field.value;

        // Limpiar errores previos
        this.clearFieldError(field);

        for (const rule of validationRules) {
            const [ruleName, ...params] = rule.split(':');
            const param = params.join(':');

            let isValid = false;
            let message = '';

            if (this.rules[ruleName]) {
                if (params.length > 0) {
                    isValid = this.rules[ruleName](value, param);
                    message = this.messages[ruleName].replace(`{${ruleName.replace(/[A-Z]/g, letter => letter.toLowerCase())}}`, param);
                } else {
                    isValid = this.rules[ruleName](value);
                    message = this.messages[ruleName];
                }
            } else {
                // Regla personalizada
                const customRule = field.getAttribute(`data-${ruleName}`);
                if (customRule) {
                    try {
                        isValid = eval(customRule);
                        message = this.messages.custom;
                    } catch (error) {
                        console.error('Error en regla personalizada:', error);
                        isValid = true;
                    }
                }
            }

            if (!isValid) {
                this.showFieldError(field, message);
                return false;
            }
        }

        this.showFieldSuccess(field);
        return true;
    }

    /**
     * Valida un formulario completo
     * @param {HTMLFormElement} form - Formulario a validar
     * @returns {boolean} - Es válido
     */
    validateForm(form) {
        const fields = form.querySelectorAll('[data-validate]');
        let isFormValid = true;

        fields.forEach(field => {
            const isFieldValid = this.validateField(field);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

        // Validaciones personalizadas del formulario
        const customValidations = this.getCustomFormValidations(form);
        customValidations.forEach(validation => {
            if (!validation.isValid) {
                this.showFormError(form, validation.message);
                isFormValid = false;
            }
        });

        if (isFormValid) {
            this.handleFormSuccess(form);
        }

        return isFormValid;
    }

    /**
     * Obtiene validaciones personalizadas específicas por formulario
     * @param {HTMLFormElement} form 
     * @returns {Array}
     */
    getCustomFormValidations(form) {
        const validations = [];
        const formId = form.id;

        switch (formId) {
            case 'review-form':
                validations.push(this.validateReviewForm(form));
                break;
            case 'subscription-form':
                validations.push(this.validateSubscriptionForm(form));
                break;
            case 'checkout-form':
                validations.push(this.validateCheckoutForm(form));
                break;
        }

        return validations.filter(v => v !== null);
    }

    /**
     * Validación específica para formulario de reseñas
     * @param {HTMLFormElement} form 
     * @returns {Object|null}
     */
    validateReviewForm(form) {
        const rating = form.querySelector('.star-rating')?.getAttribute('data-rating');
        
        if (!rating || rating === '0') {
            return {
                isValid: false,
                message: 'Por favor selecciona una calificación con estrellas'
            };
        }

        const content = form.querySelector('#review-content')?.value;
        if (content && content.length > 500) {
            return {
                isValid: false,
                message: 'La reseña no puede exceder 500 caracteres'
            };
        }

        // Verificar contenido moderado
        const moderatedContent = Utils.moderateContent(content);
        if (moderatedContent !== content) {
            return {
                isValid: false,
                message: 'Tu reseña contiene contenido inapropiado. Por favor revísala.'
            };
        }

        return { isValid: true };
    }

    /**
     * Validación específica para formulario de suscripción
     * @param {HTMLFormElement} form 
     * @returns {Object|null}
     */
    validateSubscriptionForm(form) {
        const termsCheckbox = form.querySelector('#acepto-terminos');
        
        if (!termsCheckbox?.checked) {
            return {
                isValid: false,
                message: 'Debes aceptar los términos y condiciones'
            };
        }

        return { isValid: true };
    }

    /**
     * Validación específica para formulario de checkout
     * @param {HTMLFormElement} form 
     * @returns {Object|null}
     */
    validateCheckoutForm(form) {
        const cart = cartStorage.getCart();
        
        if (cart.length === 0) {
            return {
                isValid: false,
                message: 'No hay productos en el carrito'
            };
        }

        return { isValid: true };
    }

    /**
     * Muestra error en un campo
     * @param {HTMLElement} field 
     * @param {string} message 
     */
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Agregar clase de error
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        field.classList.add('error');

        // Mostrar mensaje de error
        let errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }

        // Efecto visual en el campo
        field.style.animation = 'shake 0.5s';
        setTimeout(() => {
            field.style.animation = '';
        }, 500);
    }

    /**
     * Muestra éxito en un campo
     * @param {HTMLElement} field 
     */
    showFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('success');
        formGroup.classList.remove('error');
        field.classList.remove('error');

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    /**
     * Limpia errores de un campo
     * @param {HTMLElement} field 
     */
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error', 'success');
        field.classList.remove('error');

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    /**
     * Muestra error general del formulario
     * @param {HTMLFormElement} form 
     * @param {string} message 
     */
    showFormError(form, message) {
        Utils.showNotification(message, 'error');
    }

    /**
     * Maneja el éxito del formulario
     * @param {HTMLFormElement} form 
     */
    handleFormSuccess(form) {
        const formId = form.id;

        switch (formId) {
            case 'review-form':
                this.handleReviewSubmission(form);
                break;
            case 'subscription-form':
                this.handleSubscriptionSubmission(form);
                break;
            case 'checkout-form':
                this.handleCheckoutSubmission(form);
                break;
            default:
                Utils.showNotification('Formulario enviado correctamente', 'success');
        }
    }

    /**
     * Maneja envío de reseña
     * @param {HTMLFormElement} form 
     */
    handleReviewSubmission(form) {
        const formData = new FormData(form);
        const rating = form.querySelector('.star-rating').getAttribute('data-rating');
        
        const reviewData = {
            name: formData.get('name'),
            email: formData.get('email'),
            title: formData.get('title'),
            content: formData.get('content'),
            rating: parseInt(rating),
            favoriteCharacter: formData.get('favoriteCharacter'),
            spoilerWarning: formData.has('spoilerWarning'),
            recommend: formData.has('recommend'),
            timestamp: Date.now()
        };

        if (commentsStorage.saveComment(reviewData)) {
            Utils.showNotification('¡Tu reseña ha sido publicada!', 'success');
            form.reset();
            this.resetStarRating(form);
            
            // Mostrar modal de confirmación si existe
            const modal = document.getElementById('confirmation-modal');
            if (modal) {
                modal.style.display = 'flex';
            }

            // Actualizar estadísticas si estamos en la página de comentarios
            if (typeof updateCommunityStats === 'function') {
                updateCommunityStats();
            }
        } else {
            Utils.showNotification('Error al publicar la reseña. Intenta nuevamente.', 'error');
        }
    }

    /**
     * Maneja envío de suscripción
     * @param {HTMLFormElement} form 
     */
    handleSubscriptionSubmission(form) {
        const formData = new FormData(form);
        
        const subscriptionData = {
            name: formData.get('nombre'),
            email: formData.get('email'),
            favoriteSpecies: formData.get('especie-favorita'),
            message: formData.get('mensaje'),
            acceptsMarketing: formData.has('acepto-marketing'),
            timestamp: Date.now()
        };

        if (userStorage.saveSubscription(subscriptionData)) {
            Utils.showNotification('¡Te has suscrito exitosamente!', 'success');
            form.reset();
            
            // Animar el botón de envío
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.textContent = '¡Suscrito!';
                submitBtn.style.background = '#27ae60';
                setTimeout(() => {
                    submitBtn.innerHTML = '<span class="btn-text">Unirse a la Comunidad</span>';
                    submitBtn.style.background = '';
                }, 3000);
            }
        } else {
            Utils.showNotification('Error al procesar la suscripción. Intenta nuevamente.', 'error');
        }
    }

    /**
     * Maneja envío de checkout
     * @param {HTMLFormElement} form 
     */
    handleCheckoutSubmission(form) {
        const formData = new FormData(form);
        const cart = cartStorage.getCart();
        
        const orderData = {
            customer: {
                name: formData.get('name'),
                email: formData.get('email'),
                address: formData.get('address'),
                city: formData.get('city'),
                country: formData.get('country')
            },
            items: cart,
            total: cartStorage.getCartTotal(),
            timestamp: Date.now(),
            status: 'confirmed'
        };

        if (cartStorage.saveOrder(orderData)) {
            Utils.showNotification('¡Pedido confirmado! Recibirás un email de confirmación.', 'success');
            
            // Cerrar modales
            document.getElementById('checkout-modal').style.display = 'none';
            document.getElementById('cart-sidebar').classList.remove('open');
            
            // Actualizar contador del carrito
            if (typeof updateCartDisplay === 'function') {
                updateCartDisplay();
            }
        } else {
            Utils.showNotification('Error al procesar el pedido. Intenta nuevamente.', 'error');
        }
    }

    /**
     * Resetea el rating de estrellas
     * @param {HTMLFormElement} form 
     */
    resetStarRating(form) {
        const starRating = form.querySelector('.star-rating');
        if (starRating) {
            starRating.setAttribute('data-rating', '0');
            starRating.querySelectorAll('.star').forEach(star => {
                star.classList.remove('active');
            });
            
            const ratingText = form.querySelector('.rating-text');
            if (ratingText) {
                ratingText.textContent = 'Selecciona una calificación';
            }
        }
    }

    /**
     * Agrega regla de validación personalizada
     * @param {string} name 
     * @param {Function} rule 
     * @param {string} message 
     */
    addCustomRule(name, rule, message) {
        this.rules[name] = rule;
        this.messages[name] = message;
    }

    /**
     * Valida un valor específico con reglas
     * @param {string} value 
     * @param {string} rules 
     * @returns {Object}
     */
    validateValue(value, rules) {
        const validationRules = rules.split('|');
        
        for (const rule of validationRules) {
            const [ruleName, ...params] = rule.split(':');
            const param = params.join(':');

            if (this.rules[ruleName]) {
                let isValid = false;
                
                if (params.length > 0) {
                    isValid = this.rules[ruleName](value, param);
                } else {
                    isValid = this.rules[ruleName](value);
                }

                if (!isValid) {
                    return {
                        isValid: false,
                        message: this.messages[ruleName].replace(`{${ruleName}}`, param)
                    };
                }
            }
        }

        return { isValid: true };
    }
}

// Agregar estilos CSS para validación
const validationStyles = document.createElement('style');
validationStyles.textContent = `
    .form-group.error input,
    .form-group.error textarea,
    .form-group.error select {
        border-color: var(--color-acento) !important;
        box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.2) !important;
    }
    
    .form-group.success input,
    .form-group.success textarea,
    .form-group.success select {
        border-color: #27ae60 !important;
        box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2) !important;
    }
    
    .error-message {
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        color: var(--color-acento);
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: block;
    }
    
    .error-message.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

document.head.appendChild(validationStyles);

// Instancia global del validador
const formValidator = new FormValidator();
window.formValidator = formValidator;
