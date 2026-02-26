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
