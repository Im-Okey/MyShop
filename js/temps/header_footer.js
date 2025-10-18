document.addEventListener('DOMContentLoaded', function() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const root = document.documentElement;
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const cartTrigger = document.getElementById('cartTrigger');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtns = document.querySelectorAll('.logout-btn');
    const mobileProfile = document.querySelector('.mobile-profile');

    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const themeName = this.dataset.theme;
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            applyTheme(themeName);
            localStorage.setItem('selectedTheme', themeName);
        });
    });

    burgerMenu.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    cartTrigger.addEventListener('click', function() {
        cartOverlay.classList.add('active');
        setTimeout(() => {
            cartSidebar.classList.add('active');
            document.body.classList.add('no-scroll');
        }, 50);
    });

    function closeCart() {
        cartSidebar.classList.remove('active');
        setTimeout(() => {
            cartOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }, 400);
    }

    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    mobileNavOverlay.addEventListener('click', function(e) {
        if (e.target === mobileNavOverlay) {
            closeMobileMenu();
        }
    });

    const mobileLinks = document.querySelectorAll('.mobile-nav a, .mobile-themes .theme-option');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    function closeMobileMenu() {
        burgerMenu.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    const quantityBtns = document.querySelectorAll('.quantity-btn');
    quantityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.cart-item');
            const quantityEl = item.querySelector('.quantity');
            let quantity = parseInt(quantityEl.textContent);
            
            if (this.classList.contains('plus')) {
                quantity++;
            } else if (this.classList.contains('minus') && quantity > 1) {
                quantity--;
            }
            
            quantityEl.textContent = quantity;
            updateCartTotal();
        });
    });

    const removeBtns = document.querySelectorAll('.item-remove');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.cart-item');
            item.classList.add('removing');
            setTimeout(() => {
                item.remove();
                updateCartTotal();
                checkEmptyCart();
            }, 300);
        });
    });

    function updateCartTotal() {
        console.log('Обновление суммы корзины');
    }

    function checkEmptyCart() {
        const cartItems = document.querySelectorAll('.cart-item');
        const cartEmpty = document.querySelector('.cart-empty');
        const cartItemsContainer = document.querySelector('.cart-items');
        
        if (cartItems.length === 0) {
            cartEmpty.style.display = 'flex';
            cartItemsContainer.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartItemsContainer.style.display = 'flex';
        }
    }

    function checkAuthStatus() {
        const isAuthorized = Math.random() > 0.5;
        if (isAuthorized) {
            document.body.classList.add('user-authorized');
        } else {
            document.body.classList.remove('user-authorized');
        }
        updateMobileProfile();
        return isAuthorized;
    }

    function updateMobileProfile() {
        if (!mobileProfile) return;
        
        const isAuthorized = document.body.classList.contains('user-authorized');
        const unauthorizedContent = document.querySelector('.dropdown-unauthorized').cloneNode(true);
        const authorizedContent = document.querySelector('.dropdown-authorized').cloneNode(true);
        
        mobileProfile.innerHTML = '';
        mobileProfile.appendChild(isAuthorized ? authorizedContent : unauthorizedContent);
        
        const mobileLogoutBtns = mobileProfile.querySelectorAll('.logout-btn');
        mobileLogoutBtns.forEach(btn => {
            btn.addEventListener('click', handleLogout);
        });
    }

    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                profileDropdown.classList.remove('active');
            }
        });
    }

    function handleLogout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            document.body.classList.remove('user-authorized');
            if (profileDropdown) {
                profileDropdown.classList.remove('active');
            }
            updateMobileProfile();
            alert('Вы вышли из аккаунта');
        }
    }

    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });

    function closeProfileDropdown() {
        if (profileDropdown) {
            profileDropdown.classList.remove('active');
        }
    }

    checkAuthStatus();
});