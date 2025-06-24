/**
 * Sistema de galería para Por Amor
 * Maneja la visualización de imágenes, filtros, búsqueda y presentación
 */

class GalleryManager {
    constructor() {
        this.currentView = 'grid';
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentImageIndex = 0;
        this.filteredImages = [];
        this.isSlideshow = false;
        this.slideshowInterval = null;
        this.slideshowSpeed = 5000; // 5 segundos
        
        // Datos de imágenes de la galería
        this.galleryData = [
            {
                id: 'reino-celestial-1',
                title: 'Reino Celestial - Vista General',
                description: 'Panorámica del Reino Celestial con sus estructuras flotantes y luz divina.',
                category: 'landscapes',
                date: '2025-03-12',
                src: 'img/reinoCeles.jpg',
                thumbnail: 'img/reinoCeles.jpg',
                tags: ['reino', 'celestial', 'paisaje', 'arquitectura']
            },
            {
                id: 'dimension-oscura-1',
                title: 'Dimensión Oscura',
                description: 'El reino de los demonios donde se mantiene el equilibrio cósmico.',
                category: 'landscapes',
                date: '2024-12-03',
                src: 'img/puebloMedi.jpg',
                thumbnail: 'img/puebloMedi.jpg',
                tags: ['dimensión', 'oscura', 'demonios', 'equilibrio']
            },
            {
                id: 'concept-especies-1',
                title: 'Arte Conceptual - Especies',
                description: 'Diseños conceptuales de las diferentes especies del universo Por Amor.',
                category: 'concepts',
                date: '2024-11-28',
                src: 'img/encuentroprsj.jpg',
                thumbnail: 'img/encuentroprsj.jpg',
                tags: ['concepto', 'especies', 'diseño', 'arte']
            },
            {
                id: 'evelyn-daurella-1',
                title: 'Evelyn Daurella',
                description: 'Evelyn normal.',
                category: 'characters',
                date: '2024-11-25',
                src: 'img/evelyn.jpg',
                thumbnail: 'img/evelyn.jpg',
                tags: ['evelyn', 'híbrido', 'poder', 'aegis']
            },
            {
                id: 'bosques-salvajes-1',
                title: 'Bosques Salvajes',
                description: 'El territorio natural de los licántropos, donde la naturaleza reina suprema.',
                category: 'landscapes',
                date: '2024-11-20',
                src: 'img/bosqueEnc.jpg',
                thumbnail: 'img/bosqueEnc.jpg',
                tags: ['bosques', 'naturaleza', 'licántropos', 'salvaje']
            },
            {
                id: 'fan-art-1',
                title: 'Fan Art - Dahlia y Arya',
                description: 'Hermoso fan art creado por la comunidad mostrando a las hermanas Coldwell.',
                category: 'fan-art',
                date: '2024-11-15',
                src: 'img/dahlAndSis.jpg',
                thumbnail: 'img/dahlAndSis.jpg',
                tags: ['fan-art', 'dahlia', 'arya', 'hermanas', 'comunidad']
            },
            {
                id: 'cielo',
                title: 'Cielo Sounssera',
                description: 'Cielo.',
                category: 'characters',
                date: '2024-11-10',
                src: 'img/cielo.jpg',
                thumbnail: 'img/cielo.jpg',
                tags: ['cielo', 'ángel']
            },
            {
                id: 'batalla-epica-1',
                title: 'Batalla Épica',
                description: 'Visualización artística de una batalla entre personajes.',
                category: 'concepts',
                date: '2024-10-30',
                src: 'img/batallaepic.jpg',
                thumbnail: 'img/batallaepic.jpg',
                tags: ['magia', 'poderes', 'visualización']
            }
        ];

        this.init();
    }

    /**
     * Inicializa el sistema de galería
     */
    init() {
        this.setupEventListeners();
        this.loadGallery();
        this.updateImageCount();
        
        console.log('Sistema de galería inicializado');
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Filtros de categoría
        const galleryFilters = document.getElementById('gallery-filters');
        if (galleryFilters) {
            galleryFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    this.handleCategoryFilter(e);
                }
            });
        }

        // Controles de vista
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleViewChange(e);
            });
        });

        // Búsqueda
        const searchInput = document.getElementById('gallery-search');
        const searchBtn = document.getElementById('gallery-search-btn');
        
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

        // Modal de imagen
        this.setupImageModal();
        
        // Slideshow
        this.setupSlideshow();

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Clicks en imágenes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-image')) {
                this.openImageModal(e.target);
            }
        });
    }

    /**
     * Configura el modal de imagen
     */
    setupImageModal() {
        const modal = document.getElementById('image-modal');
        const modalClose = document.getElementById('modal-close');
        const modalPrev = document.getElementById('modal-prev');
        const modalNext = document.getElementById('modal-next');
        const backdrop = document.getElementById('modal-backdrop');

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeImageModal();
            });
        }

        if (modalPrev) {
            modalPrev.addEventListener('click', () => {
                this.showPreviousImage();
            });
        }

        if (modalNext) {
            modalNext.addEventListener('click', () => {
                this.showNextImage();
            });
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => {
                this.closeImageModal();
            });
        }

        // Botones de acción
        const downloadBtn = document.getElementById('download-btn');
        const shareBtn = document.getElementById('share-btn');
        const favoriteBtn = document.getElementById('favorite-btn');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadImage();
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareImage();
            });
        }

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleImageFavorite();
            });
        }
    }

    /**
     * Configura el slideshow
     */
    setupSlideshow() {
        const slideshowBtn = document.querySelector('[data-view="slideshow"]');
        const slideshowModal = document.getElementById('slideshow-modal');
        const slideshowClose = document.getElementById('slideshow-close');
        const slideshowPlay = document.getElementById('slideshow-play');
        const slideshowPause = document.getElementById('slideshow-pause');

        if (slideshowBtn) {
            slideshowBtn.addEventListener('click', () => {
                this.startSlideshow();
            });
        }

        if (slideshowClose) {
            slideshowClose.addEventListener('click', () => {
                this.stopSlideshow();
            });
        }

        if (slideshowPlay) {
            slideshowPlay.addEventListener('click', () => {
                this.resumeSlideshow();
            });
        }

        if (slideshowPause) {
            slideshowPause.addEventListener('click', () => {
                this.pauseSlideshow();
            });
        }
    }

    /**
     * Carga la galería
     */
    loadGallery() {
        this.filteredImages = this.applyFilters([...this.galleryData]);
        this.renderGallery();
    }

    /**
     * Aplica filtros a las imágenes
     * @param {Array} images 
     * @returns {Array}
     */
    applyFilters(images) {
        let filtered = [...images];

        // Filtro por categoría
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(img => img.category === this.currentCategory);
        }

        // Filtro por búsqueda
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(img => 
                img.title.toLowerCase().includes(query) ||
                img.description.toLowerCase().includes(query) ||
                img.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Renderiza la galería
     */
    renderGallery() {
        const container = document.getElementById('gallery-grid');
        if (!container) return;

        // Aplicar clase de vista
        container.className = `gallery-grid ${this.currentView}-view`;
        container.innerHTML = '';

        if (this.filteredImages.length === 0) {
            this.showEmptyGalleryState(container);
            return;
        }

        this.filteredImages.forEach((image, index) => {
            const imageItem = this.createGalleryItem(image, index);
            container.appendChild(imageItem);
        });

        // Configurar lazy loading
        Utils.lazyLoadImages('.gallery-image[data-src]');
    }

    /**
     * Crea un item de galería
     * @param {Object} image 
     * @param {number} index 
     * @returns {HTMLElement}
     */
    createGalleryItem(image, index) {
        const item = Utils.createElement('div', {
            className: `gallery-item ${this.currentView}-view`,
            dataset: { 
                imageId: image.id,
                imageIndex: index
            }
        });

        const isFavorite = this.isImageFavorite(image.id);

        item.innerHTML = `
            <img 
                class="gallery-image" 
                data-src="${image.src}"
                src="${image.thumbnail}" 
                alt="${image.title}"
                loading="lazy"
            >
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>${image.title}</h3>
                    <p>${Utils.truncateText(image.description, 100)}</p>
                    <div class="gallery-metadata">
                        <span class="gallery-category">${this.getCategoryName(image.category)}</span>
                        <span class="gallery-date">${Utils.formatDate(image.date)}</span>
                    </div>
                </div>
                <div class="gallery-actions">
                    <button class="gallery-action-btn" data-action="view" title="Ver imagen">👁️</button>
                    <button class="gallery-action-btn ${isFavorite ? 'favorited' : ''}" data-action="favorite" title="Favorito">
                        ${isFavorite ? '♥' : '♡'}
                    </button>
                    <button class="gallery-action-btn" data-action="share" title="Compartir">📤</button>
                </div>
            </div>
        `;

        // Event listeners para acciones
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-action-btn')) {
                e.stopPropagation();
                this.handleImageAction(e, image, index);
            } else {
                this.openImageModal(item.querySelector('.gallery-image'), index);
            }
        });

        // Animación de entrada
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 50);

        return item;
    }

    /**
     * Obtiene el nombre de la categoría
     * @param {string} category 
     * @returns {string}
     */
    getCategoryName(category) {
        const categories = {
            'characters': 'Personajes',
            'landscapes': 'Paisajes',
            'concepts': 'Arte Conceptual',
            'fan-art': 'Fan Art'
        };
        return categories[category] || category;
    }

    /**
     * Maneja acciones de imagen
     * @param {Event} e 
     * @param {Object} image 
     * @param {number} index 
     */
    handleImageAction(e, image, index) {
        const action = e.target.getAttribute('data-action');

        switch (action) {
            case 'view':
                this.openImageModal(e.target.closest('.gallery-item').querySelector('.gallery-image'), index);
                break;
            case 'favorite':
                this.toggleImageFavorite(image.id, e.target);
                break;
            case 'share':
                this.shareImage(image);
                break;
        }
    }

    /**
     * Abre el modal de imagen
     * @param {HTMLElement} imageElement 
     * @param {number} index 
     */
    openImageModal(imageElement, index = null) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalCategory = document.getElementById('modal-category');
        const modalDate = document.getElementById('modal-date');
        const imageLoader = document.getElementById('image-loader');

        if (!modal) return;

        // Determinar índice si no se proporciona
        if (index === null) {
            const imageId = imageElement.closest('.gallery-item')?.getAttribute('data-image-id');
            index = this.filteredImages.findIndex(img => img.id === imageId);
        }

        this.currentImageIndex = index;
        const image = this.filteredImages[index];

        if (!image) return;

        // Mostrar loader
        if (imageLoader) imageLoader.style.display = 'block';
        if (modalImage) modalImage.style.display = 'none';

        // Cargar imagen
        const img = new Image();
        img.onload = () => {
            if (modalImage) {
                modalImage.src = img.src;
                modalImage.style.display = 'block';
            }
            if (imageLoader) imageLoader.style.display = 'none';
        };
        img.onerror = () => {
            if (imageLoader) {
                imageLoader.textContent = 'Error cargando imagen';
                imageLoader.style.color = 'var(--color-acento)';
            }
        };
        img.src = image.src;

        // Actualizar información
        if (modalTitle) modalTitle.textContent = image.title;
        if (modalDescription) modalDescription.textContent = image.description;
        if (modalCategory) modalCategory.textContent = this.getCategoryName(image.category);
        if (modalDate) modalDate.textContent = Utils.formatDate(image.date);

        // Actualizar botón de favorito
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            const isFavorite = this.isImageFavorite(image.id);
            favoriteBtn.innerHTML = isFavorite ? '♥' : '♡';
            favoriteBtn.classList.toggle('favorited', isFavorite);
        }

        // Mostrar modal
        modal.style.display = 'flex';
        modal.classList.add('fade-in');

        // Actualizar navegación
        this.updateModalNavigation();
    }

    /**
     * Cierra el modal de imagen
     */
    closeImageModal() {
        const modal = document.getElementById('image-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('fade-in');
        }
    }

    /**
     * Muestra la imagen anterior
     */
    showPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateModalImage();
        }
    }

    /**
     * Muestra la imagen siguiente
     */
    showNextImage() {
        if (this.currentImageIndex < this.filteredImages.length - 1) {
            this.currentImageIndex++;
            this.updateModalImage();
        }
    }

    /**
     * Actualiza la imagen del modal
     */
    updateModalImage() {
        const image = this.filteredImages[this.currentImageIndex];
        if (!image) return;

        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalCategory = document.getElementById('modal-category');
        const modalDate = document.getElementById('modal-date');
        const imageLoader = document.getElementById('image-loader');

        // Mostrar loader
        if (imageLoader) imageLoader.style.display = 'block';
        if (modalImage) modalImage.style.display = 'none';

        // Cargar nueva imagen
        const img = new Image();
        img.onload = () => {
            if (modalImage) {
                modalImage.src = img.src;
                modalImage.style.display = 'block';
            }
            if (imageLoader) imageLoader.style.display = 'none';
        };
        img.src = image.src;

        // Actualizar información
        if (modalTitle) modalTitle.textContent = image.title;
        if (modalDescription) modalDescription.textContent = image.description;
        if (modalCategory) modalCategory.textContent = this.getCategoryName(image.category);
        if (modalDate) modalDate.textContent = Utils.formatDate(image.date);

        // Actualizar botón de favorito
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            const isFavorite = this.isImageFavorite(image.id);
            favoriteBtn.innerHTML = isFavorite ? '♥' : '♡';
            favoriteBtn.classList.toggle('favorited', isFavorite);
        }

        this.updateModalNavigation();
    }

    /**
     * Actualiza la navegación del modal
     */
    updateModalNavigation() {
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');

        if (prevBtn) {
            prevBtn.style.display = this.currentImageIndex > 0 ? 'flex' : 'none';
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentImageIndex < this.filteredImages.length - 1 ? 'flex' : 'none';
        }
    }

    /**
     * Descarga la imagen actual
     */
    downloadImage() {
        const image = this.filteredImages[this.currentImageIndex];
        if (!image) return;

        // Simular descarga
        const link = document.createElement('a');
        link.href = image.src;
        link.download = `por-amor-${image.id}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Utils.showNotification('Imagen descargada', 'success');
    }

    /**
     * Comparte la imagen actual
     * @param {Object} image 
     */
    shareImage(image = null) {
        const targetImage = image || this.filteredImages[this.currentImageIndex];
        if (!targetImage) return;

        if (navigator.share) {
            navigator.share({
                title: targetImage.title,
                text: targetImage.description,
                url: targetImage.src
            }).then(() => {
                Utils.showNotification('Imagen compartida', 'success');
            }).catch(() => {
                this.fallbackShare(targetImage);
            });
        } else {
            this.fallbackShare(targetImage);
        }
    }

    /**
     * Compartir fallback
     * @param {Object} image 
     */
    fallbackShare(image) {
        const shareUrl = encodeURIComponent(image.src);
        const shareText = encodeURIComponent(`${image.title} - Por Amor`);
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            whatsapp: `https://wa.me/?text=${shareText} ${shareUrl}`
        };

        // Mostrar opciones de compartir
        const options = Object.entries(shareUrls).map(([platform, url]) => 
            `<a href="${url}" target="_blank" class="share-option">${platform}</a>`
        ).join('');

        const shareModal = Utils.createElement('div', { className: 'share-modal' });
        shareModal.innerHTML = `
            <div class="share-content">
                <h3>Compartir imagen</h3>
                <div class="share-options">${options}</div>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;

        document.body.appendChild(shareModal);
        shareModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;

        setTimeout(() => shareModal.remove(), 10000);
    }

    /**
     * Alterna favorito de imagen
     * @param {string} imageId 
     * @param {HTMLElement} button 
     */
    toggleImageFavorite(imageId = null, button = null) {
        const targetId = imageId || this.filteredImages[this.currentImageIndex]?.id;
        if (!targetId) return;

        const favorites = storage.get('gallery_favorites', []);
        const isFavorite = favorites.includes(targetId);

        if (isFavorite) {
            const index = favorites.indexOf(targetId);
            favorites.splice(index, 1);
        } else {
            favorites.push(targetId);
        }

        storage.set('gallery_favorites', favorites);

        // Actualizar UI
        if (button) {
            button.innerHTML = isFavorite ? '♡' : '♥';
            button.classList.toggle('favorited', !isFavorite);
        }

        // Actualizar modal si está abierto
        const modalFavoriteBtn = document.getElementById('favorite-btn');
        if (modalFavoriteBtn && this.filteredImages[this.currentImageIndex]?.id === targetId) {
            modalFavoriteBtn.innerHTML = isFavorite ? '♡' : '♥';
            modalFavoriteBtn.classList.toggle('favorited', !isFavorite);
        }

        const message = isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos';
        Utils.showNotification(message, 'success');
    }

    /**
     * Verifica si una imagen es favorita
     * @param {string} imageId 
     * @returns {boolean}
     */
    isImageFavorite(imageId) {
        const favorites = storage.get('gallery_favorites', []);
        return favorites.includes(imageId);
    }

    /**
     * Inicia el slideshow
     */
    startSlideshow() {
        if (this.filteredImages.length === 0) {
            Utils.showNotification('No hay imágenes para mostrar', 'error');
            return;
        }

        const slideshowModal = document.getElementById('slideshow-modal');
        if (!slideshowModal) return;

        this.isSlideshow = true;
        this.currentImageIndex = 0;
        
        slideshowModal.style.display = 'flex';
        this.updateSlideshowImage();
        this.resumeSlideshow();
    }

    /**
     * Detiene el slideshow
     */
    stopSlideshow() {
        const slideshowModal = document.getElementById('slideshow-modal');
        if (slideshowModal) {
            slideshowModal.style.display = 'none';
        }

        this.isSlideshow = false;
        this.pauseSlideshow();
    }

    /**
     * Reanuda el slideshow
     */
    resumeSlideshow() {
        if (!this.isSlideshow) return;

        this.pauseSlideshow();
        
        this.slideshowInterval = setInterval(() => {
            this.nextSlideshowImage();
        }, this.slideshowSpeed);

        // Actualizar controles
        const playBtn = document.getElementById('slideshow-play');
        const pauseBtn = document.getElementById('slideshow-pause');
        
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'block';
    }

    /**
     * Pausa el slideshow
     */
    pauseSlideshow() {
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
        }

        // Actualizar controles
        const playBtn = document.getElementById('slideshow-play');
        const pauseBtn = document.getElementById('slideshow-pause');
        
        if (playBtn) playBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
    }

    /**
     * Siguiente imagen del slideshow
     */
    nextSlideshowImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.filteredImages.length;
        this.updateSlideshowImage();
    }

    /**
     * Actualiza la imagen del slideshow
     */
    updateSlideshowImage() {
        const image = this.filteredImages[this.currentImageIndex];
        if (!image) return;

        const slideshowImage = document.getElementById('slideshow-image');
        const slideshowTitle = document.getElementById('slideshow-title');
        const slideshowCounter = document.getElementById('slideshow-counter');

        if (slideshowImage) {
            slideshowImage.style.opacity = '0';
            
            setTimeout(() => {
                slideshowImage.src = image.src;
                slideshowImage.style.opacity = '1';
            }, 300);
        }

        if (slideshowTitle) {
            slideshowTitle.textContent = image.title;
        }

        if (slideshowCounter) {
            slideshowCounter.textContent = `${this.currentImageIndex + 1} / ${this.filteredImages.length}`;
        }
    }

    /**
     * Maneja eventos de teclado
     * @param {KeyboardEvent} e 
     */
    handleKeyboard(e) {
        const modal = document.getElementById('image-modal');
        const slideshow = document.getElementById('slideshow-modal');

        if (modal && modal.style.display === 'flex') {
            switch (e.key) {
                case 'Escape':
                    this.closeImageModal();
                    break;
                case 'ArrowLeft':
                    this.showPreviousImage();
                    break;
                case 'ArrowRight':
                    this.showNextImage();
                    break;
                case ' ':
                    e.preventDefault();
                    this.startSlideshow();
                    break;
            }
        }

        if (slideshow && slideshow.style.display === 'flex') {
            switch (e.key) {
                case 'Escape':
                    this.stopSlideshow();
                    break;
                case ' ':
                    e.preventDefault();
                    if (this.slideshowInterval) {
                        this.pauseSlideshow();
                    } else {
                        this.resumeSlideshow();
                    }
                    break;
            }
        }
    }

    /**
     * Maneja filtro de categoría
     * @param {Event} e 
     */
    handleCategoryFilter(e) {
        const button = e.target;
        const category = button.getAttribute('data-category');

        // Actualizar UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Aplicar filtro
        this.currentCategory = category;
        this.loadGallery();
        this.updateImageCount();
        this.updateCurrentFilter();
    }

    /**
     * Maneja cambio de vista
     * @param {Event} e 
     */
    handleViewChange(e) {
        const button = e.target;
        const view = button.getAttribute('data-view');

        if (view === 'slideshow') {
            this.startSlideshow();
            return;
        }

        // Actualizar UI
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Cambiar vista
        this.currentView = view;
        this.renderGallery();
    }

    /**
     * Maneja búsqueda
     * @param {string} query 
     */
    handleSearch(query) {
        this.searchQuery = query.trim();
        this.loadGallery();
        this.updateImageCount();
    }

    /**
     * Actualiza el contador de imágenes
     */
    updateImageCount() {
        const countElement = document.getElementById('images-count');
        if (countElement) {
            const count = this.filteredImages.length;
            countElement.textContent = `${count} imagen${count !== 1 ? 'es' : ''}`;
        }
    }

    /**
     * Actualiza el filtro actual
     */
    updateCurrentFilter() {
        const filterElement = document.getElementById('current-filter');
        if (filterElement) {
            const filterName = this.currentCategory === 'all' ? 'Todas' : this.getCategoryName(this.currentCategory);
            filterElement.textContent = `Mostrando: ${filterName}`;
        }
    }

    /**
     * Muestra estado vacío de galería
     * @param {HTMLElement} container 
     */
    showEmptyGalleryState(container) {
        container.innerHTML = `
            <div class="empty-gallery-state">
                <div class="empty-icon">🖼️</div>
                <h3>No se encontraron imágenes</h3>
                <p>
                    ${this.searchQuery ? 
                        'No hay imágenes que coincidan con tu búsqueda.' : 
                        'No hay imágenes en esta categoría.'
                    }
                </p>
                <button class="btn-secondary" onclick="location.reload()">
                    Ver Todas las Imágenes
                </button>
            </div>
        `;
    }

    /**
     * Obtiene estadísticas de la galería
     * @returns {Object}
     */
    getGalleryStats() {
        const favorites = storage.get('gallery_favorites', []);
        
        return {
            totalImages: this.galleryData.length,
            filteredImages: this.filteredImages.length,
            currentCategory: this.currentCategory,
            currentView: this.currentView,
            searchQuery: this.searchQuery,
            favoritesCount: favorites.length,
            isSlideshow: this.isSlideshow
        };
    }

    /**
     * Exporta configuración actual
     * @returns {Object}
     */
    exportSettings() {
        return {
            view: this.currentView,
            category: this.currentCategory,
            favorites: storage.get('gallery_favorites', [])
        };
    }

    /**
     * Importa configuración
     * @param {Object} settings 
     */
    importSettings(settings) {
        if (settings.view) this.currentView = settings.view;
        if (settings.category) this.currentCategory = settings.category;
        if (settings.favorites) storage.set('gallery_favorites', settings.favorites);
        
        this.loadGallery();
        this.updateImageCount();
    }
}

// CSS adicional para la galería
const galleryStyles = document.createElement('style');
galleryStyles.textContent = `
    .empty-gallery-state {
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
    
    .empty-gallery-state h3 {
        color: var(--color-destacado);
        margin-bottom: 1rem;
    }
    
    .gallery-action-btn {
        background: rgba(0,0,0,0.7);
        border: none;
        color: white;
        padding: 0.5rem;
        border-radius: 50%;
        cursor: pointer;
        transition: var(--transicion);
        font-size: 1rem;
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .gallery-action-btn:hover {
        background: var(--color-destacado);
        transform: scale(1.1);
    }
    
    .gallery-action-btn.favorited {
        color: #ff6b6b;
    }
    
    .share-modal {
        animation: fadeIn 0.3s ease-out;
    }
    
    .share-content {
        background: var(--color-principal);
        padding: 2rem;
        border-radius: var(--radio-borde);
        text-align: center;
        max-width: 400px;
    }
    
    .share-options {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
        justify-content: center;
    }
    
    .share-option {
        background: var(--gradiente-3);
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        text-decoration: none;
        text-transform: capitalize;
        transition: var(--transicion);
    }
    
    .share-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(14, 228, 219, 0.4);
    }
    
    .gallery-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1rem;
    }
`;

document.head.appendChild(galleryStyles);

// Inicializar cuando el DOM esté listo
let galleryManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('gallery-grid')) {
        galleryManager = new GalleryManager();
        window.galleryManager = galleryManager;
    }
});

