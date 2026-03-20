// Tardo Bot - Main JavaScript

// Tailwind CSS Configuration
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                emerald: {
                    450: '#10b981',
                    950: '#022c22',
                },
                neutral: {
                    850: '#1f1f1f',
                    950: '#0a0a0a',
                }
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'blob': 'blob 10s infinite',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'scanline': 'scanline 8s linear infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' }
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                scanline: {
                    '0%': { top: '-100%' },
                    '100%': { top: '100%' }
                }
            }
        }
    }
};

// Scrollytelling Effect
document.addEventListener('DOMContentLoaded', () => {
    const textElements = document.querySelectorAll('.scrolly-text');

    // 1. Prepare text: split into words and wrap in spans
    textElements.forEach(elem => {
        const words = elem.innerHTML.trim().split(/\s+/);
        elem.innerHTML = '';
        
        words.forEach(word => {
            const span = document.createElement('span');
            span.innerHTML = word + '&nbsp;';
            span.className = 'scrolly-word';
            elem.appendChild(span);
        });
    });

    // 2. Update scroll function
    const updateScroll = () => {
        const spans = document.querySelectorAll('.scrolly-word');
        const triggerBottom = window.innerHeight * 0.8;

        spans.forEach(span => {
            const box = span.getBoundingClientRect();
            
            if (box.top < triggerBottom) {
                span.classList.add('active');
            } else {
                span.classList.remove('active');
            }
        });
    };

    // 3. Optimized listeners
    window.addEventListener('scroll', updateScroll);
    window.addEventListener('resize', updateScroll);
    updateScroll(); // Run on init
});

// ============================================
// Interactive Pricing System
// ============================================

// Base Prices (without support)
const basePrices = {
    monthly: {
        basic: 15.99,
        premium: 39.99,
        enterprise: 99.99
    },
    yearly: {
        basic: 159,
        premium: 399,
        enterprise: 999
    }
};

// Tab Switching Logic
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabMonthly = document.getElementById('tab-monthly');
    const tabYearly = document.getElementById('tab-yearly');
    const planCards = document.querySelectorAll('[data-plan-type]');
    const supportToggle = document.getElementById('support-toggle');
    const toggleSwitch = document.getElementById('toggle-switch');
    
    // State
    let supportEnabled = false;

    // Verify all elements exist
    if (!tabMonthly || !tabYearly || !supportToggle || !toggleSwitch) {
        console.error('Missing required DOM elements for pricing system');
        return;
    }

    // Function: Switch tabs
    function switchTab(tabType) {
        planCards.forEach(card => {
            if (card.dataset.planType === tabType) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Update tab button styles
        if (tabType === 'monthly') {
            tabMonthly.classList.add('active', 'bg-emerald-500', 'text-[#030303]');
            tabMonthly.classList.remove('bg-white/5', 'text-gray-400', 'border', 'border-white/5');
            
            tabYearly.classList.remove('active', 'bg-emerald-500', 'text-[#030303]');
            tabYearly.classList.add('bg-white/5', 'text-gray-400', 'border', 'border-white/5');

            // Restore toggle to interactive
            supportToggle.disabled = false;
            supportToggle.parentElement.classList.remove('opacity-75', 'cursor-not-allowed');
            supportToggle.parentElement.classList.add('cursor-pointer');

            // Remove "incluido" badge if exists
            const includedBadge = document.getElementById('support-included-badge');
            if (includedBadge) includedBadge.remove();

        } else {
            tabYearly.classList.add('active', 'bg-emerald-500', 'text-[#030303]');
            tabYearly.classList.remove('bg-white/5', 'text-gray-400', 'border', 'border-white/5');
            
            tabMonthly.classList.remove('active', 'bg-emerald-500', 'text-[#030303]');
            tabMonthly.classList.add('bg-white/5', 'text-gray-400', 'border', 'border-white/5');

            // Auto-activate support toggle and lock it
            supportEnabled = true;
            supportToggle.checked = true;
            supportToggle.disabled = true;
            supportToggle.parentElement.classList.add('opacity-75', 'cursor-not-allowed');
            supportToggle.parentElement.classList.remove('cursor-pointer');
            updateToggleSwitch();

            // Add "incluido" badge if not already present
            if (!document.getElementById('support-included-badge')) {
                const badge = document.createElement('span');
                badge.id = 'support-included-badge';
                badge.className = 'text-emerald-400 font-medium text-xs bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 ml-1';
                badge.textContent = 'Incluido';
                const priceSpan = supportToggle.parentElement.querySelector('.text-emerald-500');
                if (priceSpan) priceSpan.insertAdjacentElement('afterend', badge);
            }
        }

        // Update prices and badges based on current support state
        updatePricesAndBadges();
    }

    // Function: Update all prices and badges
    function updatePricesAndBadges() {
        const supportCost = 5;

        // ===================================
        // Update Monthly Prices (all 3 plans)
        // ===================================
        const plans = ['basic', 'premium', 'enterprise'];
        
        plans.forEach(plan => {
            const priceElement = document.getElementById(`price-${plan}-monthly`);
            if (priceElement) {
                const basePrice = basePrices.monthly[plan];
                const finalPrice = supportEnabled ? basePrice + supportCost : basePrice;
                priceElement.textContent = `$${finalPrice.toFixed(2)}`;
            } else {
                console.warn(`Element not found: price-${plan}-monthly`);
            }
        });

        // ===================================
        // Update Yearly Badges (all 3 plans)
        // ===================================
        if (supportEnabled) {
            // BASIC YEARLY
            const basicMonthlyTotal = (basePrices.monthly.basic + supportCost) * 12; // $251.88
            const basicYearly = basePrices.yearly.basic; // $159
            const basicSavings = ((basicMonthlyTotal - basicYearly) / basicMonthlyTotal * 100).toFixed(1);
            
            const basicBadge = document.getElementById('badge-basic-yearly');
            if (basicBadge) {
                basicBadge.innerHTML = `AHORRA ${basicSavings}% <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            } else {
                console.warn('Element not found: badge-basic-yearly');
            }

            // PREMIUM YEARLY
            const premiumMonthlyTotal = (basePrices.monthly.premium + supportCost) * 12; // $539.88
            const premiumYearly = basePrices.yearly.premium; // $399
            const premiumSavings = ((premiumMonthlyTotal - premiumYearly) / premiumMonthlyTotal * 100).toFixed(1);
            
            const premiumBadge = document.getElementById('badge-premium-yearly');
            if (premiumBadge) {
                premiumBadge.innerHTML = `AHORRA ${premiumSavings}% <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            } else {
                console.warn('Element not found: badge-premium-yearly');
            }

            // ENTERPRISE YEARLY
            const enterpriseMonthlyTotal = (basePrices.monthly.enterprise + supportCost) * 12; // $1259.88
            const enterpriseYearly = basePrices.yearly.enterprise; // $999
            const enterpriseSavings = ((enterpriseMonthlyTotal - enterpriseYearly) / enterpriseMonthlyTotal * 100).toFixed(1);
            
            const enterpriseBadge = document.getElementById('badge-enterprise-yearly');
            if (enterpriseBadge) {
                enterpriseBadge.innerHTML = `MEJOR VALOR <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            } else {
                console.warn('Element not found: badge-enterprise-yearly');
            }
        } else {
            // Reset to original badges (support disabled)
            const basicBadge = document.getElementById('badge-basic-yearly');
            if (basicBadge) basicBadge.textContent = 'AHORRA 17%';

            const premiumBadge = document.getElementById('badge-premium-yearly');
            if (premiumBadge) premiumBadge.textContent = 'AHORRA 17%';

            const enterpriseBadge = document.getElementById('badge-enterprise-yearly');
            if (enterpriseBadge) enterpriseBadge.textContent = 'MEJOR VALOR';
        }
    }

    // Function: Update toggle switch visual state
    function updateToggleSwitch() {
        const innerCircle = toggleSwitch.querySelector('div');
        
        if (!innerCircle) {
            console.error('Toggle switch inner circle not found');
            return;
        }

        if (supportEnabled) {
            toggleSwitch.classList.add('bg-emerald-500');
            toggleSwitch.classList.remove('bg-gray-700');
            innerCircle.classList.add('translate-x-5');
            innerCircle.classList.remove('translate-x-0');
        } else {
            toggleSwitch.classList.remove('bg-emerald-500');
            toggleSwitch.classList.add('bg-gray-700');
            innerCircle.classList.remove('translate-x-5');
            innerCircle.classList.add('translate-x-0');
        }
    }

    // ===================================
    // Event Listeners
    // ===================================
    
    // Tabs
    tabMonthly.addEventListener('click', () => switchTab('monthly'));
    tabYearly.addEventListener('click', () => switchTab('yearly'));

    // Support Toggle
    supportToggle.addEventListener('change', (e) => {
        supportEnabled = e.target.checked;
        updateToggleSwitch();
        updatePricesAndBadges();
    });

    // ===================================
    // Initialize
    // ===================================
    switchTab('monthly');
    updateToggleSwitch();
    updatePricesAndBadges();

    console.log('Pricing system initialized successfully');
});

// ============================================
// Testimonials Carousel
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    const cards = document.querySelectorAll('.carousel-card');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('pagination-dots');
    const carouselWrapper = document.getElementById('carousel-wrapper');

    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    let autoplayInterval;

    function getCardsPerView() {
        if (window.innerWidth >= 1024) return 3; // lg
        if (window.innerWidth >= 768) return 2;  // md
        return 1;                                // sm
    }

    function initCarousel() {
        cardsPerView = getCardsPerView();
        
        // Adjust index if window resize cuts off cards
        const maxIndex = Math.max(0, cards.length - cardsPerView);
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        createDots();
        updateCarousel();
        startAutoplay();
    }

    function createDots() {
        dotsContainer.innerHTML = '';
        const maxIndex = Math.max(0, cards.length - cardsPerView);
        
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.className = `h-1.5 rounded-full transition-all duration-300 ease-out ${
                i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`;
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateCarousel() {
        const maxIndex = Math.max(0, cards.length - cardsPerView);
        
        // Calculate transform percentage
        const slidePercentage = 100 / cardsPerView;
        const translateValue = currentIndex * -slidePercentage;
        track.style.transform = `translateX(${translateValue}%)`;

        // Update dots styling
        Array.from(dotsContainer.children).forEach((dot, index) => {
            dot.className = `h-1.5 rounded-full transition-all duration-300 ease-out ${
                index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`;
        });

        // Update button states
        if (prevBtn && nextBtn) {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === maxIndex;
        }
    }

    // Arrow Listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
                resetAutoplay();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxIndex = Math.max(0, cards.length - cardsPerView);
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
                resetAutoplay();
            }
        });
    }

    // Autoplay Functionality
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            const maxIndex = Math.max(0, cards.length - cardsPerView);
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // Loop to start
            }
            updateCarousel();
        }, 5000);
    }

    function stopAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Pause on hover
    carouselWrapper.addEventListener('mouseenter', stopAutoplay);
    carouselWrapper.addEventListener('mouseleave', startAutoplay);

    // Responsive Handling
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newCardsPerView = getCardsPerView();
            if (newCardsPerView !== cardsPerView) {
                initCarousel();
            }
        }, 100);
    });

    // Swipe / Drag Gestures (if needed)
    // Code here...

    // Initialize on load
    if (cards.length > 0) {
        initCarousel();
    }
});

// ==============================
// PURCHASE FLOW - CHECKOUT & PAYMENT MODALS
// ==============================

// API endpoint
const API_BASE_URL = 'https://admin.tardoar.com';

// Global variable to store current order data
let currentOrderData = null;

/**
 * Opens the checkout modal with plan details
 * @param {string} planName - Name of the plan (e.g., "Premium")
 * @param {string} period - Billing period ("monthly" or "yearly")
 * @param {number} basePrice - Base price without support
 * @param {boolean} ignored - Ignored parameter (kept for compatibility)
 */
function openCheckoutModal(planName, period, basePrice, ignored) {
    const modal = document.getElementById('checkout-modal');
    if (!modal) {
        console.error('Checkout modal not found');
        return;
    }

    // Calculate final price considering support toggle
    const supportToggle = document.getElementById('support-toggle');
    const supportEnabled = supportToggle ? supportToggle.checked : false;
    const supportCost = (period === 'monthly' && supportEnabled) ? 5 : 0;
    const finalPrice = basePrice + supportCost;

    // Set plan details
    const planTitle = document.getElementById('checkout-plan-name');
    const planDescription = document.getElementById('checkout-plan-description');
    const priceDisplay = document.getElementById('checkout-price');

    if (planTitle) {
        const periodText = period === 'monthly' ? 'Mensual' : 'Anual';
        planTitle.textContent = `Plan ${planName} ${periodText}`;
    }

    if (planDescription) {
        let desc = '';
        
        // Solo mostrar info del soporte
        if (period === 'yearly') {
            // Planes anuales: soporte incluido gratis
            desc = 'Soporte Premium incluido';
        } else if (supportEnabled) {
            // Planes mensuales CON soporte adicional
            desc = 'Soporte Premium adicional';
        }
        // Si es mensual SIN soporte: desc queda vacío ""
        
        planDescription.textContent = desc;
    }

    if (priceDisplay) {
        priceDisplay.textContent = `$${finalPrice.toFixed(2)}`;
    }

    // Check if user is logged in
    const token = localStorage.getItem('tardo_token');
    const userData = localStorage.getItem('tardo_user');

    if (token && userData) {
        // User logged in - pre-fill form
        try {
            const user = JSON.parse(userData);
            const emailField = document.getElementById('checkout-email');
            const nameField = document.getElementById('checkout-name');
            const telegramField = document.getElementById('checkout-telegram');

            if (emailField) emailField.value = user.email || '';
            // Use 'name' field (consistent with backend)
            if (nameField) nameField.value = user.name || user.full_name || '';
            if (telegramField) telegramField.value = user.telegram || '';

            // Hide conditional fields for existing users
            const countryWrapper = document.getElementById('checkout-country-wrapper');
            const referralWrapper = document.getElementById('checkout-referral-wrapper');
            const termsWrapper = document.getElementById('checkout-terms-wrapper');

            if (countryWrapper) countryWrapper.classList.add('hidden');
            if (referralWrapper) referralWrapper.classList.add('hidden');
            if (termsWrapper) termsWrapper.classList.add('hidden');

        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    } else {
        // New user - show all fields
        const countryWrapper = document.getElementById('checkout-country-wrapper');
        const referralWrapper = document.getElementById('checkout-referral-wrapper');
        const termsWrapper = document.getElementById('checkout-terms-wrapper');

        if (countryWrapper) countryWrapper.classList.remove('hidden');
        if (referralWrapper) referralWrapper.classList.remove('hidden');
        if (termsWrapper) termsWrapper.classList.remove('hidden');

        // Clear pre-filled values
        const emailField = document.getElementById('checkout-email');
        const nameField = document.getElementById('checkout-name');
        const telegramField = document.getElementById('checkout-telegram');

        if (emailField) emailField.value = '';
        if (nameField) nameField.value = '';
        if (telegramField) telegramField.value = '';
    }

    // Clear error messages
    const errorDiv = document.getElementById('checkout-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }

    // Store plan data for form submission
    window.checkoutPlanData = {
        planName,
        period,
        price: finalPrice,
        supportEnabled
    };

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

/**
 * Closes the checkout modal
 */
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scroll
    }
}

/**
 * Handles checkout form submission
 * @param {Event} e - Form submit event
 */
async function submitOrder(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('checkout-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';
    }

    try {
        // Get form data
        const email = document.getElementById('checkout-email').value.trim();
        const name = document.getElementById('checkout-name').value.trim();
        const telegram = document.getElementById('checkout-telegram').value.trim();
        
        // Check if new user (conditional fields visible)
        const countryWrapper = document.getElementById('checkout-country-wrapper');
        const isNewUser = countryWrapper && !countryWrapper.classList.contains('hidden');

        let country = '';
        let referralSource = '';
        let termsAccepted = false;

        if (isNewUser) {
            // New user: get from form fields
            const countrySelect = document.getElementById('checkout-country');
            const referralSelect = document.getElementById('checkout-referral');
            const termsCheckbox = document.getElementById('checkout-terms');

            if (countrySelect) country = countrySelect.value;
            if (referralSelect) referralSource = referralSelect.value;
            if (termsCheckbox) termsAccepted = termsCheckbox.checked;

            // Validate terms
            if (!termsAccepted) {
                throw new Error('Debes aceptar los términos y condiciones');
            }
        } else {
            // Existing user: get from localStorage
            const userData = localStorage.getItem('tardo_user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    country = user.country || 'Otro';
                    referralSource = user.referral_source || 'other';
                    termsAccepted = true; // Already accepted when registered
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    // Fallback values
                    country = 'Otro';
                    referralSource = 'other';
                    termsAccepted = true;
                }
            } else {
                // Fallback if no user data
                country = 'Otro';
                referralSource = 'other';
                termsAccepted = true;
            }
        }

        // Get plan data
        const planData = window.checkoutPlanData;
        const plan = `${planData.planName.toLowerCase()}_${planData.period}`;
        const premiumSupport = planData.supportEnabled || false;

        // Build request body (match backend OrderRequest model)
        const requestBody = {
            email,
            name,  // Changed from full_name to name
            telegram: telegram || null,
            plan,
            country,  // Required string, not null
            referral_source: referralSource,  // Required string, not null
            premium_support: premiumSupport,
            accept_terms: termsAccepted
        };

        console.log('� Datos de orden preparados (sin crear aún):', requestBody);

        // ⚠️ NO CREAR LA ORDEN TODAVÍA
        // La orden se creará cuando el usuario haga clic en "Ya realicé el pago"
        // Guardar datos temporalmente
        window.pendingOrderData = requestBody;

        // Calcular precio para mostrar en modal de pago
        const planName = planData.planName.toLowerCase();
        const period = planData.period; // 'monthly' o 'yearly'
        const basePrice = basePrices[period][planName];
        const supportCost = premiumSupport ? 5 : 0;
        const totalPrice = basePrice + supportCost;

        // Crear objeto temporal para mostrar en el modal
        const tempOrderData = {
            order_id: 'PENDING', // Se generará al crear la orden
            email: email,
            price: totalPrice,
            plan: plan,
            payment_method: 'usdt_bep20' // Default
        };

        console.log('💰 Precio calculado:', totalPrice);

        // Store temporary order data
        currentOrderData = tempOrderData;

        // Close checkout modal
        closeCheckoutModal();

        // Show payment modal
        showPaymentModal(tempOrderData);

    } catch (error) {
        console.error('Error creating order:', error);
        
        if (errorDiv) {
            errorDiv.classList.remove('hidden');
            errorDiv.textContent = error.message || 'Error al procesar la compra. Intenta de nuevo.';
        }
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar compra';
        }
    }
}

/**
 * Shows the payment modal with order details
 * @param {Object} orderData - Order data from backend
 */
function showPaymentModal(orderData) {
    const modal = document.getElementById('payment-modal');
    if (!modal) {
        console.error('Payment modal not found');
        return;
    }

    // Set order ID
    const orderIdSpan = document.getElementById('payment-order-id');
    if (orderIdSpan) {
        orderIdSpan.textContent = orderData.order_id || 'LOADING...';
    }

    // Set plan info (sutilmente debajo del precio)
    const planInfo = document.getElementById('payment-plan-info');
    if (planInfo && orderData.plan_description) {
        planInfo.textContent = orderData.plan_description;
    }

    // Set price (use price_unique for uniqueness)
    const priceAmount = document.getElementById('payment-amount');
    const priceAmountQr = document.getElementById('payment-amount-qr');
    const priceAmountUsdt = document.getElementById('payment-amount-usdt');

    const uniquePrice = orderData.price_unique || orderData.amount || 0;

    if (priceAmount) priceAmount.textContent = uniquePrice.toFixed(2);
    if (priceAmountQr) priceAmountQr.textContent = `${uniquePrice.toFixed(2)} USDT`;
    if (priceAmountUsdt) priceAmountUsdt.value = `$${uniquePrice.toFixed(2)} USDT`;

    // Set QR code (Binance Pay)
    const qrImage = document.getElementById('payment-qr');
    if (qrImage && orderData.payment_methods?.binance_pay?.qr_url) {
        qrImage.src = orderData.payment_methods.binance_pay.qr_url;
        qrImage.alt = 'Binance Pay QR Code';
    } else if (qrImage) {
        qrImage.src = 'https://via.placeholder.com/200x200?text=QR+Not+Available';
        qrImage.alt = 'QR no disponible';
    }

    // Set USDT wallet address
    const walletInput = document.getElementById('payment-wallet');
    if (walletInput && orderData.payment_methods?.usdt_bep20?.wallet) {
        walletInput.value = orderData.payment_methods.usdt_bep20.wallet;
    } else if (walletInput) {
        walletInput.value = 'Wallet no disponible';
    }

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Select Binance Pay by default
    selectPaymentMethod('binance');
}

// Variable global para guardar el método de pago seleccionado
let selectedPaymentMethod = 'binance_pay'; // Default: Binance Pay

/**
 * Selects a payment method and shows its details
 * @param {string} method - 'binance' or 'usdt'
 */
function selectPaymentMethod(method) {
    // Get buttons
    const binanceBtn = document.getElementById('method-binance');
    const usdtBtn = document.getElementById('method-usdt');
    
    // Get detail sections
    const binanceDetails = document.getElementById('binance-details');
    const usdtDetails = document.getElementById('usdt-details');
    
    if (method === 'binance') {
        // Activate Binance Pay
        binanceBtn.classList.add('bg-emerald-500', 'border-emerald-500');
        binanceBtn.classList.remove('bg-white/5', 'border-white/10');
        
        usdtBtn.classList.remove('bg-emerald-500', 'border-emerald-500');
        usdtBtn.classList.add('bg-white/5', 'border-white/10');
        
        binanceDetails.classList.remove('hidden');
        usdtDetails.classList.add('hidden');
        
        // Guardar método seleccionado
        selectedPaymentMethod = 'binance_pay';
    } else {
        // Activate USDT
        usdtBtn.classList.add('bg-emerald-500', 'border-emerald-500');
        usdtBtn.classList.remove('bg-white/5', 'border-white/10');
        
        binanceBtn.classList.remove('bg-emerald-500', 'border-emerald-500');
        binanceBtn.classList.add('bg-white/5', 'border-white/10');
        
        usdtDetails.classList.remove('hidden');
        binanceDetails.classList.add('hidden');
        
        // Guardar método seleccionado
        selectedPaymentMethod = 'usdt_bep20';
    }
}

/**
 * Closes the payment modal
 */
function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Shows success modal after payment confirmation
 */
function showPaymentSuccessModal() {
    // Create modal overlay
    const modalHTML = `
        <div id="payment-success-modal" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div class="bg-[#0a0a0a] border border-emerald-500/30 rounded-2xl max-w-md w-full shadow-2xl animate-fadeIn">
                <!-- Icon -->
                <div class="flex justify-center pt-8 pb-4">
                    <div class="bg-emerald-500/20 rounded-full p-4">
                        <iconify-icon icon="solar:check-circle-bold" class="text-emerald-400 text-6xl"></iconify-icon>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="px-8 pb-8 text-center">
                    <h3 class="text-2xl font-bold text-white mb-3">¡Pago Registrado!</h3>
                    <p class="text-neutral-300 text-sm leading-relaxed mb-6">
                        Tu pago será verificado y recibirás tu licencia por email en breve.
                    </p>
                    
                    <!-- Actions -->
                    <div>
                        <button onclick="closePaymentSuccessModal()" class="w-full px-6 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('payment-success-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Closes payment success modal
 */
function closePaymentSuccessModal() {
    const modal = document.getElementById('payment-success-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Redirects user after payment based on login state
 */
function redirectAfterPayment() {
    closePaymentSuccessModal();
    
    const token = localStorage.getItem('tardo_token');
    if (token) {
        window.location.href = '/user_panel/dashboard.html';
    } else {
        // Show email check message
        showToast('Revisa tu email - Te hemos enviado las instrucciones de acceso', 'success');
    }
}

/**
 * Shows toast notification
 * @param {string} message - Toast message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showToast(message, type = 'info') {
    const icons = {
        success: 'solar:check-circle-bold',
        error: 'solar:danger-circle-bold',
        warning: 'solar:danger-triangle-bold',
        info: 'solar:info-circle-bold'
    };
    
    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const toastHTML = `
        <div id="toast-notification" class="fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-[200] flex items-center gap-3 animate-slideInRight">
            <iconify-icon icon="${icons[type]}" class="text-2xl"></iconify-icon>
            <p class="text-sm font-medium">${message}</p>
        </div>
    `;
    
    // Remove existing toast
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Add toast
    document.body.insertAdjacentHTML('beforeend', toastHTML);
    
    // Auto remove after 5s
    setTimeout(() => {
        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.style.animation = 'slideOutRight 0.3s ease-in-out';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/**
 * Copies wallet address to clipboard
 */
function copyWallet(event) {
    const walletInput = document.getElementById('payment-wallet');
    if (!walletInput) return;

    walletInput.select();
    navigator.clipboard.writeText(walletInput.value)
        .then(() => {
            // Show temporary success feedback
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<iconify-icon icon="solar:check-circle-linear" class="text-lg"></iconify-icon>';
            btn.classList.remove('bg-emerald-500/20', 'hover:bg-emerald-500/30', 'text-emerald-400');
            btn.classList.add('bg-emerald-600', 'text-white');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-emerald-600', 'text-white');
                btn.classList.add('bg-emerald-500/20', 'hover:bg-emerald-500/30', 'text-emerald-400');
            }, 2000);
        })
        .catch(err => {
            console.error('Error copying wallet:', err);
            showToast('Error al copiar. Copia manualmente.', 'error');
        });
}

/**
 * Copies exact payment amount to clipboard
 */
function copyAmount(event) {
    const amountInput = document.getElementById('payment-amount-usdt');
    if (!amountInput) return;

    // Extract numeric value (remove $ and USDT)
    const numericAmount = amountInput.value.replace(/[$\s]/g, '').replace('USDT', '').trim();

    navigator.clipboard.writeText(numericAmount)
        .then(() => {
            // Show temporary success feedback
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<iconify-icon icon="solar:check-circle-linear" class="text-lg"></iconify-icon>';
            btn.classList.remove('bg-emerald-500/20', 'hover:bg-emerald-500/30', 'text-emerald-400');
            btn.classList.add('bg-emerald-600', 'text-white');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-emerald-600', 'text-white');
                btn.classList.add('bg-emerald-500/20', 'hover:bg-emerald-500/30', 'text-emerald-400');
            }, 2000);
        })
        .catch(err => {
            console.error('Error copying amount:', err);
            showToast('Error al copiar. Copia manualmente.', 'error');
        });
}

/**
 * Confirms payment was made and closes modals
 */
async function confirmPaymentDone() {
    try {
        // Obtener el payment ID del input field (OBLIGATORIO)
        const paymentIdInput = document.getElementById('payment-tx-id');
        const paymentId = paymentIdInput ? paymentIdInput.value.trim() : '';
        
        // Validar que el payment ID no esté vacío
        if (!paymentId || paymentId.length < 10) {
            showToast('Debes proporcionar el ID de transacción o Payment ID para confirmar el pago', 'error');
            paymentIdInput.focus();
            paymentIdInput.classList.add('border-red-500');
            return;
        }
        
        // ✨ CREAR LA ORDEN AHORA (con payment_id incluido)
        if (window.pendingOrderData) {
            console.log('📤 Creando orden con payment_id:', paymentId);
            
            // Agregar payment_id y payment_method a los datos de la orden
            const orderData = {
                ...window.pendingOrderData,
                payment_id: paymentId,
                payment_method: selectedPaymentMethod
            };
            
            // Crear la orden en el backend
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle 422 validation errors from FastAPI/Pydantic
                if (response.status === 422 && Array.isArray(data.detail)) {
                    const errors = data.detail.map(err => {
                        const field = err.loc ? err.loc.join('.') : 'unknown';
                        return `${field}: ${err.msg}`;
                    }).join(', ');
                    throw new Error(`Validación: ${errors}`);
                }
                throw new Error(data.detail || data.message || 'Error al crear la orden');
            }
            
            console.log('✅ Orden creada exitosamente:', data);
            
            // Actualizar currentOrderData con la orden real
            currentOrderData = data;
            
            // Limpiar datos pendientes
            delete window.pendingOrderData;
        } else {
            console.warn('⚠️ No hay datos de orden pendientes');
        }
    } catch (error) {
        console.error('Error creando orden:', error);
        showToast(error.message || 'Error al procesar el pago. Contacta con soporte.', 'error');
        return; // No cerrar modal si hay error
    }
    
    // Close payment modal
    closePaymentModal();

    // Show success modal with payment confirmation
    showPaymentSuccessModal();
}

// ==============================
// FORM EVENT LISTENERS MOVED TO components.js
// ==============================

// El event listener del checkout form ahora se adjunta
// en components.js DESPUÉS de cargar modals.html dinámicamente
// para asegurar que el formulario existe en el DOM

