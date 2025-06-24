/**
 * Funcionalidad principal del sitio Por Amor
 * Maneja navegación, animaciones y funcionalidades generales
 */

class PorAmorMain {
    constructor() {
        this.isLoaded = false;
        this.currentSection = '';
        this.scrollPosition = 0;
        this.isMobile = window.innerWidth <= 768;
        
        // Datos de personajes para la página principal
        this.charactersData = [
            {
                id: 1,
                name: "Dahlia Coldwell Cythe",
                species: "Híbrida",
                avatar: "DC",
                preview: "Una joven que tuvo que madurar temprano para cuidar a su hermana menor, ocultando secretos sobre su pasado familiar.",
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            {
                id: 2,
                name: "Elaine Namikaze Mirae",
                species: "Ángel Lumerian",
                avatar: "EN",
                preview: "Un ángel huérfano con poderes ancestrales que lucha por proteger a quienes ama mientras descubre su verdadero origen.",
                gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            },
            {
                id: 3,
                name: "Liam Evans Solace",
                species: "Vampiro",
                avatar: "LE",
                preview: "Un vampiro de raza pura que desafía los estereotipos de su especie, convirtiéndose en protector de los más débiles.",
                gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            }
        ];

        // Datos de estadísticas del universo
        this.universeStats = [
            { aspect: "Especies Principales", quantity: "6", description: "Ángeles, Demonios, Vampiros, Licántropos, Hadas, Híbridos", status: "Activo" },
            { aspect: "Territorios", quantity: "5", description: "Reino Celestial, Dimensión Oscura, Reino Nocturno, Bosques Salvajes, Mundo Neutral", status: "Explorable" },
            { aspect: "Personajes Principales", quantity: "8", description: "Protagonistas con historias entrelazadas", status: "En desarrollo" },
            { aspect: "Poderes Únicos", quantity: "15+", description: "Habilidades sobrenaturales específicas por especie", status: "Catalogado" },
            { aspect: "Líneas de Tiempo", quantity: "4", description: "Eras que definen la historia del universo", status: "Documentado" }
        ];

        this.init();
    }

    /**
     * Inicializa la aplicación principal
     */
    init() {
        this.setupEventListeners();
        this.initializeNavigation();
        this.loadCharacters();
        this.loadUniverseStats();
        this.initializeInteractiveMap();
        this.setupScrollAnimations();
        this.loadCommunityPreview();
        this.setupParticles();
        this.handlePageLoad();

        // Marcar como cargado
        this.isLoaded = true;
        console.log('Por Amor - Sistema principal inicializado');
    }

    /**
     * Configura event listeners globales
     */
    setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 16));

        // Resize events
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                this.handleNavigation(e);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'subscription-form') {
                e.preventDefault();
                this.handleSubscriptionForm(e.target);
            }
        });

        // Territory map interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.territory')) {
                this.handleTerritoryClick(e);
            }
        });

        // Character card interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.character-card') || e.target.closest('.character-card')) {
                const card = e.target.closest('.character-card');
                if (card) this.handleCharacterClick(card);
            }
        });

        // Footer links
        document.addEventListener('click', (e) => {
            this.handleFooterLinks(e);
        });
    }

    /**
     * Inicializa la navegación
     */
    initializeNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        // Mobile navigation toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu on link click
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }

        // Highlight active section in navigation
        this.updateActiveNavigation();
    }

    /**
     * Maneja el scroll de la página
     */
    handleScroll() {
        const navbar = document.getElementById('navbar');
        const scrollTop = window.pageYOffset;

        // Navbar scroll effect
        if (navbar) {
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Update current section
        this.updateCurrentSection();
        this.updateActiveNavigation();

        // Parallax effects
        this.updateParallaxEffects(scrollTop);

        this.scrollPosition = scrollTop;
    }

    /**
     * Maneja el redimensionamiento de ventana
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // Reconfigurar elementos si cambió el breakpoint
        if (wasMobile !== this.isMobile) {
            this.setupParticles();
            this.loadCharacters();
        }
    }

    /**
     * Actualiza la navegación activa basada en la sección actual
     */
    updateActiveNavigation() {
        const sections = ['hero', 'about', 'mapa', 'personajes-destacados', 'estadisticas', 'community-preview', 'suscripcion'];
        let currentSection = 'hero';

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = sectionId;
                }
            }
        });

        this.currentSection = currentSection;
    }

    /**
     * Actualiza la sección actual basada en el scroll
     */
    updateCurrentSection() {
        const sections = document.querySelectorAll('section[id], header[id]');
        const scrollTop = window.pageYOffset + 150;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                this.currentSection = section.id;
            }
        });
    }

    /**
     * Carga los personajes destacados
     */
    loadCharacters() {
        const container = document.getElementById('characters-preview');
        if (!container) return;

        container.innerHTML = '';

        this.charactersData.forEach((character, index) => {
            const characterCard = this.createCharacterCard(character, index);
            container.appendChild(characterCard);
        });

        // Animar aparición
        Utils.observeElements('.character-card', (element) => {
            element.classList.add('fade-in');
        });
    }

    /**
     * Crea una tarjeta de personaje
     * @param {Object} character - Datos del personaje
     * @param {number} index - Índice del personaje
     * @returns {HTMLElement}
     */
    createCharacterCard(character, index) {
        const card = Utils.createElement('div', {
            className: 'character-card',
            dataset: { characterId: character.id }
        });

        card.innerHTML = `
            <div class="character-avatar" style="background: ${character.gradient}">
                ${character.avatar}
            </div>
            <h3>${character.name}</h3>
            <span class="character-species">${character.species}</span>
            <p class="character-preview">${character.preview}</p>
        `;

        // Delay de animación para efecto escalonado
        card.style.animationDelay = `${index * 0.2}s`;

        return card;
    }

    /**
     * Carga las estadísticas del universo
     */
    loadUniverseStats() {
        const tbody = document.getElementById('stats-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.universeStats.forEach((stat, index) => {
            const row = Utils.createElement('tr');
            row.innerHTML = `
                <td>${stat.aspect}</td>
                <td>${stat.quantity}</td>
                <td>${stat.description}</td>
                <td><span class="status-badge status-${stat.status.toLowerCase().replace(' ', '-')}">${stat.status}</span></td>
            `;

            // Efecto de aparición escalonado
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 100);

            tbody.appendChild(row);
        });
    }

    /**
     * Inicializa el mapa interactivo
     */
    initializeInteractiveMap() {
        const territoryMap = document.getElementById('territory-map');
        if (!territoryMap) return;

        const territories = territoryMap.querySelectorAll('.territory');
        const infoPanel = document.getElementById('territory-info');

        territories.forEach(territory => {
            territory.addEventListener('mouseenter', () => {
                const territoryType = territory.getAttribute('data-territory');
                territory.style.filter = 'brightness(1.3)';
                this.showTerritoryPreview(territoryType);
            });

            territory.addEventListener('mouseleave', () => {
                territory.style.filter = 'brightness(1)';
                this.hideTerritoryPreview();
            });
        });

        // Efectos de pulsación en las conexiones
        this.animateMapConnections();
    }

    /**
     * Muestra previa del territorio
     * @param {string} territoryType 
     */
    showTerritoryPreview(territoryType) {
        const territoryInfo = {
            angel: {
                title: 'Reino Celestial',
                description: 'Un reino de luz eterna donde residen los ángeles. Las estructuras flotan en el aire y la energía divina impregna cada rincón.'
            },
            demon: {
                title: 'Dimensión Oscura',
                description: 'No es un lugar de maldad, sino de justicia absoluta. Aquí los demonios mantienen el equilibrio cósmico.'
            },
            vampire: {
                title: 'Reino Nocturno',
                description: 'Un territorio de noche perpetua donde los vampiros han creado una sociedad sofisticada.'
            },
            lycan: {
                title: 'Bosques Salvajes',
                description: 'Vastos bosques donde la naturaleza salvaje reina suprema y los licántropos viven en armonía.'
            },
            neutral: {
                title: 'Mundo Neutral',
                description: 'El punto de encuentro entre todas las dimensiones, donde las diferentes especies pueden coexistir.'
            }
        };

        const info = territoryInfo[territoryType];
        if (!info) return;

        const infoPanel = document.getElementById('territory-info');
        if (infoPanel) {
            document.getElementById('territory-title').textContent = info.title;
            document.getElementById('territory-description').textContent = info.description;
            infoPanel.style.display = 'block';
            infoPanel.classList.add('fade-in');
        }
    }

    /**
     * Oculta vista previa del territorio
     */
    hideTerritoryPreview() {
        const infoPanel = document.getElementById('territory-info');
        if (infoPanel) {
            infoPanel.style.display = 'none';
            infoPanel.classList.remove('fade-in');
        }
    }

    /**
     * Anima las conexiones del mapa
     */
    animateMapConnections() {
        const connections = document.querySelectorAll('.realm-connection');
        connections.forEach((connection, index) => {
            connection.style.animationDelay = `${index * 0.5}s`;
        });
    }

    /**
     * Configura animaciones de scroll
     */
    setupScrollAnimations() {
        // Elementos que aparecen al hacer scroll
        Utils.observeElements('.character-card', (element) => {
            element.classList.add('slide-up');
        });

        Utils.observeElements('.stat-card', (element) => {
            element.classList.add('fade-in');
        });

        Utils.observeElements('.feature-img', (element) => {
            element.style.transform = 'scale(1.05) rotate(2deg)';
        });

        // Contador animado para estadísticas
        this.animateCounters();
    }

    /**
     * Anima contadores numéricos
     */
    animateCounters() {
        Utils.observeElements('[data-count]', (element) => {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const start = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(progress * target);
                
                element.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                }
            };

            requestAnimationFrame(updateCount);
        });
    }

    /**
     * Actualiza efectos de paralaje
     * @param {number} scrollTop 
     */
    updateParallaxEffects(scrollTop) {
        // Efecto parallax en el hero
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrollTop * 0.5}px)`;
        }

        // Efecto en las partículas
        const particles = document.querySelector('.particles-bg');
        if (particles) {
            particles.style.transform = `translateY(${scrollTop * 0.3}px)`;
        }
    }

    /**
     * Carga preview de la comunidad
     */
    loadCommunityPreview() {
        const stats = commentsStorage.getCommentsStats();
        
        // Actualizar estadísticas generales
        this.updateCommunityStats(stats);
        
        // Cargar comentarios recientes
        this.loadRecentComments();
    }

    /**
     * Actualiza las estadísticas de la comunidad
     * @param {Object} stats 
     */
    updateCommunityStats(stats) {
        const ratingNumber = document.querySelector('#overall-rating-display .rating-number');
        const starsDisplay = document.querySelector('#overall-stars');
        const ratingCount = document.querySelector('#overall-rating-display .rating-count');

        if (ratingNumber) {
            this.animateNumber(ratingNumber, 0, stats.averageRating, 2000, 1);
        }

        if (starsDisplay) {
            starsDisplay.setAttribute('data-rating', stats.averageRating);
            ratingSystem.renderReadOnlyStars(starsDisplay);
        }

        if (ratingCount) {
            ratingCount.textContent = `(${stats.totalComments} opinión${stats.totalComments !== 1 ? 'es' : ''})`;
        }
    }

    /**
     * Anima un número gradualmente
     * @param {HTMLElement} element 
     * @param {number} start 
     * @param {number} end 
     * @param {number} duration 
     * @param {number} decimals 
     */
    animateNumber(element, start, end, duration, decimals = 0) {
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;
            
            element.textContent = current.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }

    /**
     * Carga comentarios recientes
     */
    loadRecentComments() {
        const container = document.getElementById('recent-comments');
        if (!container) return;

        const comments = commentsStorage.getComments()
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3);

        container.innerHTML = '';

        if (comments.length === 0) {
            container.innerHTML = `
                <div class="comment-preview">
                    <p>Sé el primero en compartir tu opinión sobre Por Amor</p>
                    <a href="comentarios.html" class="btn-secondary">Escribir Reseña</a>
                </div>
            `;
            return;
        }

        comments.forEach(comment => {
            const commentCard = this.createCommentPreview(comment);
            container.appendChild(commentCard);
        });
    }

    /**
     * Crea un preview de comentario
     * @param {Object} comment 
     * @returns {HTMLElement}
     */
    createCommentPreview(comment) {
        const card = Utils.createElement('div', { className: 'comment-preview' });
        
        const stars = Utils.generateStars(comment.rating);
        const timeAgo = Utils.formatDate(comment.timestamp);
        const truncatedContent = Utils.truncateText(comment.content, 120);

        card.innerHTML = `
            <div class="comment-header">
                <strong>${Utils.sanitizeText(comment.name)}</strong>
                <div class="comment-rating">${stars}</div>
            </div>
            <h4>${Utils.sanitizeText(comment.title)}</h4>
            <p>${Utils.sanitizeText(truncatedContent)}</p>
            <div class="comment-meta">
                <span>${timeAgo}</span>
                ${comment.recommend ? '<span class="recommended">✓ Recomendado</span>' : ''}
            </div>
        `;

        return card;
    }

    /**
    *  Configura el sistema de partículas
     */
    setupParticles() {
        const particlesBg = document.getElementById('particles-bg');
        if (!particlesBg) return;

        // En móviles, reducir la cantidad de partículas para mejor rendimiento
        if (this.isMobile) {
            particlesBg.style.opacity = '0.2';
            particlesBg.style.backgroundSize = '300px 150px';
        } else {
            particlesBg.style.opacity = '0.4';
            particlesBg.style.backgroundSize = '200px 100px';
        }
    }

    /**
     * Maneja la carga inicial de la página
     */
    handlePageLoad() {
        // Preload de imágenes críticas
        this.preloadCriticalImages();

        // Configurar lazy loading
        Utils.lazyLoadImages();

        // Configurar service worker si está disponible
        this.registerServiceWorker();

        // Analíticas básicas
        this.trackPageView();
    }

    /**
     * Registra service worker para PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Error registrando Service Worker:', error);
                });
        }
    }

    /**
     * Tracking básico de analytics
     */
    trackPageView() {
        // Implementar tracking básico
        const pageData = {
            page: window.location.pathname,
            title: document.title,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };

        // Guardar en localStorage para análisis básico
        const analytics = storage.get('analytics', []);
        analytics.push(pageData);
        
        // Mantener solo los últimos 50 registros
        if (analytics.length > 50) {
            analytics.splice(0, analytics.length - 50);
        }
        
        storage.set('analytics', analytics, 24); // 24 horas
    }

    /**
     * Maneja clics en navegación
     * @param {Event} e 
     */
    handleNavigation(e) {
        const link = e.target;
        const href = link.getAttribute('href');

        // Si es un enlace interno con anchor
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                Utils.smoothScrollTo(target, 100);
            }
        }
    }

    /**
     * Maneja el formulario de suscripción
     * @param {HTMLFormElement} form 
     */
    handleSubscriptionForm(form) {
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;

        // Mostrar estado de carga
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // El FormValidator se encarga del procesamiento real
        // Aquí solo manejamos el UI feedback adicional
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }, 2000);
    }

    /**
     * Maneja clics en territorios
     * @param {Event} e 
     */
    handleTerritoryClick(e) {
        const territory = e.target;
        const territoryType = territory.getAttribute('data-territory');
        
        // Efecto visual de clic
        territory.style.animation = 'pulse 0.5s ease-out';
        setTimeout(() => {
            territory.style.animation = '';
        }, 500);

        // Mostrar información detallada
        Utils.showNotification(`Explorando ${territoryType}...`, 'info', 2000);
        
        // Redirect a página de universo con filtro
        setTimeout(() => {
            window.location.href = `universo.html#${territoryType}`;
        }, 1000);
    }

    /**
     * Maneja clics en tarjetas de personajes
     * @param {HTMLElement} card 
     */
    handleCharacterClick(card) {
        const characterId = card.getAttribute('data-character-id');
        
        // Efecto visual
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Redirect a página de personajes
        setTimeout(() => {
            window.location.href = `personajes.html#character-${characterId}`;
        }, 200);
    }

    /**
     * Maneja enlaces del footer
     * @param {Event} e 
     */
    handleFooterLinks(e) {
        const link = e.target;
        
        if (link.id === 'newsletter-link') {
            e.preventDefault();
            Utils.smoothScrollTo('#suscripcion', 100);
        } else if (link.id === 'fan-art-link') {
            e.preventDefault();
            Utils.showNotification('Próximamente: Sección de Fan Art', 'info');
        }
    }

    /**
     * Métodos públicos para interactuar con otras partes del sistema
     */

    /**
     * Actualiza las estadísticas de la comunidad
     */
    updateCommunityDisplay() {
        this.loadCommunityPreview();
    }

    /**
     * Recarga los personajes
     */
    refreshCharacters() {
        this.loadCharacters();
    }

    /**
     * Obtiene estadísticas del sitio
     * @returns {Object}
     */
    getSiteStats() {
        return {
            charactersLoaded: this.charactersData.length,
            currentSection: this.currentSection,
            scrollPosition: this.scrollPosition,
            isMobile: this.isMobile,
            isLoaded: this.isLoaded
        };
    }
}

// CSS adicional para efectos específicos
const mainStyles = document.createElement('style');
mainStyles.textContent = `
    .status-badge {
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .status-activo { background: #27ae60; color: white; }
    .status-explorable { background: #3498db; color: white; }
    .status-en-desarrollo { background: #f39c12; color: white; }
    .status-catalogado { background: #9b59b6; color: white; }
    .status-documentado { background: #1abc9c; color: white; }
    
    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .comment-rating {
        display: flex;
        gap: 0.1rem;
    }
    
    .comment-rating .star {
        font-size: 1rem;
        color: #ffd700;
    }
    
    .comment-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        font-size: 0.8rem;
        color: #999;
    }
    
    .recommended {
        color: #27ae60;
        font-weight: bold;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;

document.head.appendChild(mainStyles);

// Inicializar cuando el DOM esté listo
let porAmorMain;

document.addEventListener('DOMContentLoaded', () => {
    porAmorMain = new PorAmorMain();
    
    // Hacer disponible globalmente para debugging
    window.porAmorMain = porAmorMain;
});

// Exportar funciones específicas para uso desde otros módulos
window.updateCommunityStats = () => {
    if (porAmorMain) {
        porAmorMain.updateCommunityDisplay();
    }
};

window.updateCartDisplay = () => {
    // Actualizar contador del carrito si existe
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cartStorage.getCartItemCount();
    }
};
