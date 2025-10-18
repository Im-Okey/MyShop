// СКРИПТ СЛАЙДЕРА
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) next = 0;
        showSlide(next);
    }
    
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            showSlide(parseInt(this.dataset.slide));
        });
    });
    
    setInterval(nextSlide, 5000);
});







































// СКРИПТ БЛОКА ХИТОВ
document.addEventListener('DOMContentLoaded', function() {
    function getStoriesDataFromHTML() {
        const storiesData = {};
        const storyElements = document.querySelectorAll('.story-data');
        
        storyElements.forEach(element => {
            const storyId = element.dataset.storyId;
            storiesData[storyId] = {
                title: element.dataset.title,
                avatar: element.dataset.avatar,
                slides: JSON.parse(element.dataset.slides)
            };
        });
        
        return storiesData;
    }

    const storiesOverlay = document.getElementById('storiesOverlay');
    const storiesContainer = document.querySelector('.stories-container');
    const storiesContent = document.getElementById('storiesContent');
    const progressTrack = document.getElementById('progressTrack');
    const storyAvatar = document.getElementById('storyAvatar');
    const storyName = document.getElementById('storyName');
    const storyClose = document.querySelector('.story-close');
    const storyPrev = document.querySelector('.story-prev');
    const storyNext = document.querySelector('.story-next');
    const storyPauseBtn = document.getElementById('storyPauseBtn');
    
    let currentStory = null;
    let currentSlideIndex = 0;
    let progressTimeout = null;
    let isPaused = false;
    let progressFillElements = [];
    let storyItems = [];
    let holdTimeout = null;
    let isHolding = false;
    let wasPausedBeforeHold = false;

    function initStories() {
        storyItems = Array.from(document.querySelectorAll('.story-item'));
        
        storyItems.forEach(item => {
            item.addEventListener('click', function() {
                const storyId = this.dataset.storyId;
                openStory(storyId);
            });
        });
        
        storiesOverlay.addEventListener('click', function(e) {
            if (e.target === storiesOverlay) {
                closeStory();
            }
        });
        
        storyClose.addEventListener('click', closeStory);
        storyPrev.addEventListener('click', goToPrevSlide);
        storyNext.addEventListener('click', goToNextSlide);
        storyPauseBtn.addEventListener('click', togglePause);
        
        storiesContent.addEventListener('mousedown', startHold);
        storiesContent.addEventListener('touchstart', startHold);
        storiesContent.addEventListener('mouseup', endHold);
        storiesContent.addEventListener('touchend', endHold);
        storiesContent.addEventListener('mouseleave', endHold);
        
        document.addEventListener('keydown', handleKeyPress);
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        storiesOverlay.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        storiesOverlay.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function startHold(e) {
        if (e.target.closest('.story-action-btn')) return;
        
        isHolding = true;
        wasPausedBeforeHold = isPaused;
        
        holdTimeout = setTimeout(() => {
            if (isHolding && !isPaused) {
                togglePause();
            }
        }, 100);
    }
    
    function endHold() {
        if (!isHolding) return;
        
        isHolding = false;
        clearTimeout(holdTimeout);
        
        if (isPaused && !wasPausedBeforeHold) {
            togglePause();
        }
    }
    
    function openStory(storyId) {
        const storiesData = getStoriesDataFromHTML();
        const storyData = storiesData[storyId];
        if (!storyData) return;
        
        currentStory = storyId;
        currentSlideIndex = 0;
        isPaused = false;
        updatePauseButton();
        
        storiesOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        loadStoryContent(storyData);
        startAutoProgress();
        markStoryAsViewed(storyId);
    }
    
    function closeStory() {
        storiesOverlay.classList.remove('active');
        document.body.style.overflow = '';
        clearTimeout(progressTimeout);
        clearTimeout(holdTimeout);
        currentStory = null;
        currentSlideIndex = 0;
        isPaused = false;
        isHolding = false;
        updatePauseButton();
        progressFillElements = [];
    }
    
    function updatePauseButton() {
        if (isPaused) {
            storyPauseBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        } else {
            storyPauseBtn.innerHTML = '<span class="material-icons">pause</span>';
        }
    }
    
    function loadStoryContent(storyData) {
        progressTrack.innerHTML = '';
        progressFillElements = [];
        
        storyAvatar.style.backgroundImage = `url('${storyData.avatar}')`;
        storyName.textContent = storyData.title;
        
        storyData.slides.forEach((slideIndex, index) => {
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = '0%';
            progressFill.style.transition = 'none';
            progressItem.appendChild(progressFill);
            progressTrack.appendChild(progressItem);
            
            progressFillElements.push(progressFill);
        });
        
        updateActiveSlide();
    }
    
    function startAutoProgress() {
        clearTimeout(progressTimeout);
        
        if (isPaused) return;
        
        progressFillElements.forEach((fill, index) => {
            if (fill) {
                fill.style.width = '0%';
                fill.style.transition = 'none';
            }
        });
        
        const currentProgressItem = progressTrack.children[currentSlideIndex];
        if (currentProgressItem) {
            currentProgressItem.classList.add('active');
            const currentProgressFill = progressFillElements[currentSlideIndex];
            if (currentProgressFill) {
                setTimeout(() => {
                    currentProgressFill.style.transition = 'width 5s linear';
                    currentProgressFill.style.width = '100%';
                }, 50);
            }
        }
        
        progressTimeout = setTimeout(() => {
            if (!isPaused) {
                goToNextSlide();
            }
        }, 5000);
    }
    
    function goToNextSlide() {
        const storiesData = getStoriesDataFromHTML();
        const storyData = storiesData[currentStory];
        if (!storyData) return;
        
        if (currentSlideIndex < storyData.slides.length - 1) {
            currentSlideIndex++;
            updateActiveSlide();
            startAutoProgress();
        } else {
            goToNextStory();
        }
    }
    
    function goToNextStory() {
        const currentIndex = storyItems.findIndex(item => item.dataset.storyId === currentStory);
        if (currentIndex !== -1 && currentIndex < storyItems.length - 1) {
            const nextStoryId = storyItems[currentIndex + 1].dataset.storyId;
            openStory(nextStoryId);
        } else {
            closeStory();
        }
    }
    
    function goToPrevSlide() {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateActiveSlide();
            startAutoProgress();
        } else {
            goToPrevStory();
        }
    }
    
    function goToPrevStory() {
        const currentIndex = storyItems.findIndex(item => item.dataset.storyId === currentStory);
        if (currentIndex > 0) {
            const prevStoryId = storyItems[currentIndex - 1].dataset.storyId;
            openStory(prevStoryId);
        }
    }
    
    function updateActiveSlide() {
        const allSlides = document.querySelectorAll('.story-slide');
        const progressItems = document.querySelectorAll('.progress-item');
        
        allSlides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        const storiesData = getStoriesDataFromHTML();
        const storyData = storiesData[currentStory];
        if (storyData) {
            storyData.slides.forEach((slideIndex, index) => {
                const slide = document.querySelector(`.story-slide[data-story="${currentStory}"][data-slide="${slideIndex}"]`);
                if (slide && index === currentSlideIndex) {
                    slide.classList.add('active');
                }
            });
        }
        
        progressItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentSlideIndex);
            item.classList.toggle('completed', index < currentSlideIndex);
            
            const fill = progressFillElements[index];
            if (fill) {
                if (index < currentSlideIndex) {
                    fill.style.width = '100%';
                    fill.style.transition = 'none';
                } else if (index === currentSlideIndex) {
                    fill.style.width = '0%';
                    fill.style.transition = 'none';
                } else {
                    fill.style.width = '0%';
                    fill.style.transition = 'none';
                }
            }
        });
    }
    
    function togglePause() {
        isPaused = !isPaused;
        
        if (isPaused) {
            clearTimeout(progressTimeout);
            const currentProgressFill = progressFillElements[currentSlideIndex];
            if (currentProgressFill) {
                const computedStyle = window.getComputedStyle(currentProgressFill);
                const currentWidth = computedStyle.width;
                currentProgressFill.style.transition = 'none';
                currentProgressFill.style.width = currentWidth;
            }
        } else {
            const currentProgressFill = progressFillElements[currentSlideIndex];
            if (currentProgressFill) {
                const computedStyle = window.getComputedStyle(currentProgressFill);
                const currentWidth = parseFloat(computedStyle.width);
                const containerWidth = currentProgressFill.parentElement.offsetWidth;
                const remainingPercentage = ((containerWidth - currentWidth) / containerWidth) * 100;
                const remainingTime = (remainingPercentage / 100) * 5000;
                
                currentProgressFill.style.transition = `width ${remainingTime}ms linear`;
                currentProgressFill.style.width = '100%';
                
                progressTimeout = setTimeout(() => {
                    if (!isPaused) {
                        goToNextSlide();
                    }
                }, remainingTime);
            }
        }
        
        updatePauseButton();
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                goToNextSlide();
            } else {
                goToPrevSlide();
            }
        }
    }
    
    function handleKeyPress(e) {
        if (!storiesOverlay.classList.contains('active')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                goToPrevSlide();
                break;
            case 'ArrowRight':
            case ' ':
                goToNextSlide();
                break;
            case 'Escape':
                closeStory();
                break;
        }
    }
    
    function initProductsSlider() {
        const hitsProductsContainer = document.querySelector('.hits-products-container');
        const hitsPrevBtn = document.querySelector('.hits-slider-prev');
        const hitsNextBtn = document.querySelector('.hits-slider-next');
        
        function scrollHitsProducts(direction) {
            if (!hitsProductsContainer) return;
            
            const cards = document.querySelectorAll('.hits-product-wrapper');
            if (cards.length === 0) return;
            
            const cardWidth = cards[0].offsetWidth + 20;
            const scrollAmount = cardWidth * direction;
            
            hitsProductsContainer.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
        
        if (hitsPrevBtn) {
            hitsPrevBtn.onclick = () => scrollHitsProducts(-1);
        }
        if (hitsNextBtn) {
            hitsNextBtn.onclick = () => scrollHitsProducts(1);
        }
    }
    
    function initProductCards() {
        const productWrappers = document.querySelectorAll('.hits-product-wrapper');
        
        productWrappers.forEach(wrapper => {
            wrapper.addEventListener('click', function(e) {
                if (!e.target.closest('.hits-btn-add-to-cart') && 
                    !e.target.closest('.hits-btn-favorite')) {
                    const productLink = this.getAttribute('data-product-link');
                    if (productLink) {
                        window.location.href = productLink;
                    }
                }
            });
        });
    }
    
    function initFavoriteButtons() {
        const hitsFavoriteBtns = document.querySelectorAll('.hits-btn-favorite');
        hitsFavoriteBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const icon = this.querySelector('.material-icons');
                if (icon.textContent === 'favorite_border') {
                    icon.textContent = 'favorite';
                    icon.style.color = '#689550';
                } else {
                    icon.textContent = 'favorite_border';
                    icon.style.color = '#666';
                }
            });
        });
    }
    
    function initCartButtons() {
        const hitsCartBtns = document.querySelectorAll('.hits-btn-add-to-cart');
        hitsCartBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productId = this.getAttribute('data-product-id');
                addToCartHits(productId, this);
            });
        });
    }
    
    function addToCartHits(productId, button) {
        console.log(`Товар добавлен в корзину: ${productId}`);
        
        const originalHTML = button.innerHTML;
        
        button.classList.add('added');
        button.innerHTML = '<span class="material-icons">check</span><span>Добавлено</span>';
        
        setTimeout(() => {
            button.classList.remove('added');
            button.innerHTML = originalHTML;
        }, 2000);
    }
    
    function markStoryAsViewed(storyId) {
        const storyItem = document.querySelector(`.story-item[data-story-id="${storyId}"]`);
        if (storyItem) {
            storyItem.classList.add('viewed');
        }
    }
    
    initStories();
    initProductsSlider();
    initProductCards();
    initFavoriteButtons();
    initCartButtons();
});






































































// СКРИПТ БЛОКА ПАКЕТНЫХ РЕШЕНИЙ
function addToCartKit(kitId) {
    console.log(`Добавлен набор в корзину: ${kitId}`);
    
    const button = event.target.closest('.btn-kit');
    const originalHTML = button.innerHTML;
    
    button.style.backgroundColor = 'var(--success-color)';
    button.innerHTML = '<span class="material-icons">check</span><span class="btn-text">Добавлено</span>';
    
    setTimeout(() => {
        button.style.backgroundColor = '';
        button.innerHTML = originalHTML;
    }, 2000);
    
    event.stopPropagation();
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    const kitButtons = document.querySelectorAll('.btn-kit');
    kitButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const kitCard = this.closest('.kit-card-link');
            const kitId = kitCard.getAttribute('href').split('/').pop();
            addToCartKit(kitId);
        });
    });
});










































































// СКРИПТ БЛОКА АКЦИЙ
document.addEventListener('DOMContentLoaded', function() {
    const promoContainer = document.querySelector('.promo-slider-container');
    const prevBtn = document.querySelector('.promo-arrow-left');
    const nextBtn = document.querySelector('.promo-arrow-right');
    const banners = document.querySelectorAll('.promo-banner');
    
    let currentIndex = 0;
    
    function scrollToSlide(index) {
        if (index < 0) index = 0;
        if (index >= banners.length) index = banners.length - 1;
        
        currentIndex = index;
        
        if (window.innerWidth > 1024) {
            const slidePosition = banners[index].offsetLeft;
            promoContainer.scrollTo({
                left: slidePosition,
                behavior: 'smooth'
            });
        } else {
            const bannerWidth = banners[0].offsetWidth + 20;
            const scrollAmount = bannerWidth * index;
            promoContainer.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => scrollToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => scrollToSlide(currentIndex + 1));
    }

    promoContainer.addEventListener('scroll', function() {
        if (window.innerWidth > 1024) {
            const scrollPosition = promoContainer.scrollLeft;
            const containerWidth = promoContainer.offsetWidth;
            
            for (let i = 0; i < banners.length; i++) {
                const slidePosition = banners[i].offsetLeft;
                if (scrollPosition >= slidePosition - containerWidth / 2) {
                    currentIndex = i;
                }
            }
        }
    });

    function handleResize() {
        const controlsWrapper = document.querySelector('.promo-controls-wrapper');
        if (window.innerWidth <= 1024) {
            if (controlsWrapper) controlsWrapper.style.display = 'none';
        } else {
            if (controlsWrapper) controlsWrapper.style.display = 'flex';
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
});




































































// СКРИПТ БЛОКА НОВИНКИ
document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.querySelector('.products-container');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    function scrollProducts(direction) {
        if (!productsContainer) return;
        
        const cards = document.querySelectorAll('.product-card');
        if (cards.length === 0) return;
        
        const cardWidth = cards[0].offsetWidth + 20;
        const scrollAmount = cardWidth * direction;
        
        productsContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
    
    function initSlider() {
        if (window.innerWidth > 969) {
            if (prevBtn) {
                prevBtn.addEventListener('click', () => scrollProducts(-1));
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => scrollProducts(1));
            }
        } else {
            if (prevBtn) {
                prevBtn.replaceWith(prevBtn.cloneNode(true));
            }
            if (nextBtn) {
                nextBtn.replaceWith(nextBtn.cloneNode(true));
            }
        }
    }
    
    function handleVisibility() {
        const sectionHeaderNav = document.querySelector('.section-header-nav');
        const viewAllCard = document.querySelector('.view-all-card');
        
        if (window.innerWidth <= 969) {
            if (sectionHeaderNav) sectionHeaderNav.style.display = 'none';
            if (viewAllCard) viewAllCard.style.display = 'none';
        } else {
            if (sectionHeaderNav) sectionHeaderNav.style.display = 'flex';
            if (viewAllCard) viewAllCard.style.display = 'flex';
        }
    }
    
    const productCards = document.querySelectorAll('.favourite-products-section .product-card:not(.view-all-card)');
    
    productCards.forEach(card => {
        const productLink = card.querySelector('.product-link');
        
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn-add-to-cart') || e.target.closest('.btn-favorite')) {
                return;
            }
            
            if (productLink && productLink.href) {
                window.location.href = productLink.href;
            }
        });
    });

    const newProductsFavoriteBtns = document.querySelectorAll('.favourite-products-section .btn-favorite');
    newProductsFavoriteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const icon = this.querySelector('.material-icons');
            if (icon.textContent === 'favorite_border') {
                icon.textContent = 'favorite';
                icon.style.color = '#689550';
                this.classList.add('active');
            } else {
                icon.textContent = 'favorite_border';
                icon.style.color = '';
                this.classList.remove('active');
            }
        });
    });

    const addToCartBtns = document.querySelectorAll('.favourite-products-section .btn-add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Товар добавлен в корзину');
            
            const originalIcon = this.innerHTML;
            
            this.innerHTML = '<span class="material-icons">check</span><span>Добавлено</span>';
            this.style.background = 'var(--primary-color)';
            
            setTimeout(() => {
                this.innerHTML = originalIcon;
                this.style.background = 'var(--primary-color)';
            }, 2000);
        });
    });
    
    initSlider();
    handleVisibility();
    window.addEventListener('resize', () => {
        initSlider();
        handleVisibility();
    });
});