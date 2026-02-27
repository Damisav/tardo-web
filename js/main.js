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
    const tabMonthly = document.getElementById('tab-monthly');
    const tabYearly = document.getElementById('tab-yearly');
    const planCards = document.querySelectorAll('[data-plan-type]');
    const supportToggle = document.getElementById('support-toggle');
    const toggleSwitch = document.getElementById('toggle-switch');
    let supportEnabled = false;

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
        } else {
            tabYearly.classList.add('active', 'bg-emerald-500', 'text-[#030303]');
            tabYearly.classList.remove('bg-white/5', 'text-gray-400', 'border', 'border-white/5');
            
            tabMonthly.classList.remove('active', 'bg-emerald-500', 'text-[#030303]');
            tabMonthly.classList.add('bg-white/5', 'text-gray-400', 'border', 'border-white/5');
        }

        // Update prices and badges based on current support state
        updatePricesAndBadges();
    }

    // Function: Update prices and badges
    function updatePricesAndBadges() {
        const supportCost = 5;

        // Update monthly prices
        ['basic', 'premium', 'enterprise'].forEach(plan => {
            const priceElement = document.getElementById(`price-${plan}-monthly`);
            if (priceElement) {
                const basePrice = basePrices.monthly[plan];
                const finalPrice = supportEnabled ? basePrice + supportCost : basePrice;
                priceElement.textContent = `$${finalPrice.toFixed(2)}`;
            }
        });

        // Update yearly badges (recalculate savings with support included)
        if (supportEnabled) {
            // Basic Yearly: ((15.99+5)×12 - 159) / ((15.99+5)×12)
            const basicMonthlyWithSupport = (basePrices.monthly.basic + supportCost) * 12; // $251.88
            const basicSavings = ((basicMonthlyWithSupport - basePrices.yearly.basic) / basicMonthlyWithSupport * 100).toFixed(1);
            const basicBadge = document.getElementById('badge-basic-yearly');
            if (basicBadge) {
                basicBadge.innerHTML = `AHORRA ${basicSavings}% <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            }

            // Premium Yearly
            const premiumMonthlyWithSupport = (basePrices.monthly.premium + supportCost) * 12; // $539.88
            const premiumSavings = ((premiumMonthlyWithSupport - basePrices.yearly.premium) / premiumMonthlyWithSupport * 100).toFixed(1);
            const premiumBadge = document.getElementById('badge-premium-yearly');
            if (premiumBadge) {
                premiumBadge.innerHTML = `AHORRA ${premiumSavings}% <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            }

            // Enterprise Yearly
            const enterpriseMonthlyWithSupport = (basePrices.monthly.enterprise + supportCost) * 12; // $1259.88
            const enterpriseSavings = ((enterpriseMonthlyWithSupport - basePrices.yearly.enterprise) / enterpriseMonthlyWithSupport * 100).toFixed(1);
            const enterpriseBadge = document.getElementById('badge-enterprise-yearly');
            if (enterpriseBadge) {
                enterpriseBadge.innerHTML = `MEJOR VALOR <span class="ml-1 text-[9px] opacity-80">+ Soporte gratis</span>`;
            }
        } else {
            // Reset to original badges (no support)
            const basicBadge = document.getElementById('badge-basic-yearly');
            if (basicBadge) {
                basicBadge.textContent = 'AHORRA 17%';
            }

            const premiumBadge = document.getElementById('badge-premium-yearly');
            if (premiumBadge) {
                premiumBadge.textContent = 'AHORRA 17%';
            }

            const enterpriseBadge = document.getElementById('badge-enterprise-yearly');
            if (enterpriseBadge) {
                enterpriseBadge.textContent = 'MEJOR VALOR';
            }
        }
    }

    // Function: Toggle switch visual state
    function updateToggleSwitch() {
        if (supportEnabled) {
            toggleSwitch.classList.add('bg-emerald-500');
            toggleSwitch.classList.remove('bg-gray-700');
            toggleSwitch.querySelector('div').classList.add('translate-x-5');
            toggleSwitch.querySelector('div').classList.remove('translate-x-0');
        } else {
            toggleSwitch.classList.remove('bg-emerald-500');
            toggleSwitch.classList.add('bg-gray-700');
            toggleSwitch.querySelector('div').classList.remove('translate-x-5');
            toggleSwitch.querySelector('div').classList.add('translate-x-0');
        }
    }

    // Event Listeners: Tabs
    tabMonthly.addEventListener('click', () => switchTab('monthly'));
    tabYearly.addEventListener('click', () => switchTab('yearly'));

    // Event Listener: Support Toggle
    supportToggle.addEventListener('change', (e) => {
        supportEnabled = e.target.checked;
        updateToggleSwitch();
        updatePricesAndBadges();
    });

    // Initial state: Show monthly plans, support disabled
    switchTab('monthly');
    updateToggleSwitch();
});
