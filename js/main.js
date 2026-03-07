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
        console.error('❌ Missing required DOM elements for pricing system');
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
                console.warn(`⚠️ Element not found: price-${plan}-monthly`);
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
                console.warn('⚠️ Element not found: badge-basic-yearly');
            }

            // PREMIUM YEARLY
            const premiumMonthlyTotal = (basePrices.monthly.premium + supportCost) * 12; // $539.88
            const premiumYearly = basePrices.yearly.premium; // $399
            const premiumSavings = ((premiumMonthlyTotal - premiumYearly) / premiumMonthlyTotal * 100).toFixed(1);
            
            const premiumBadge = document.getElementById('badge-premium-yearly');
            if (premiumBadge) {
                premiumBadge.innerHTML = `AHORRA ${premiumSavings}% <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            } else {
                console.warn('⚠️ Element not found: badge-premium-yearly');
            }

            // ENTERPRISE YEARLY
            const enterpriseMonthlyTotal = (basePrices.monthly.enterprise + supportCost) * 12; // $1259.88
            const enterpriseYearly = basePrices.yearly.enterprise; // $999
            const enterpriseSavings = ((enterpriseMonthlyTotal - enterpriseYearly) / enterpriseMonthlyTotal * 100).toFixed(1);
            
            const enterpriseBadge = document.getElementById('badge-enterprise-yearly');
            if (enterpriseBadge) {
                enterpriseBadge.innerHTML = `MEJOR VALOR <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            } else {
                console.warn('⚠️ Element not found: badge-enterprise-yearly');
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
            console.error('❌ Toggle switch inner circle not found');
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

    console.log('✅ Pricing system initialized successfully');
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

    // Swipe / Drag Gestures
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, {passive: true});

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, {passive: true});

    track.addEventListener('mousedown', e => {
        touchStartX = e.screenX;
        stopAutoplay();
    });

    track.addEventListener('mouseup', e => {
        touchEndX = e.screenX;
        handleSwipe();
        startAutoplay();
    });

    function handleSwipe() {
        const swipeThreshold = 40;
        const maxIndex = Math.max(0, cards.length - cardsPerView);
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped left -> Next
            if (currentIndex < maxIndex) currentIndex++;
            updateCarousel();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped right -> Prev
            if (currentIndex > 0) currentIndex--;
            updateCarousel();
        }
    }

    // Initialize
    initCarousel();
    console.log('✅ Testimonials carousel initialized successfully');
});
