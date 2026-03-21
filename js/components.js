// Componentes compartidos - Carga automática de navbar, footer y modales
document.addEventListener('DOMContentLoaded', () => {
    // Cargar navbar
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        fetch('components/navbar.html')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar navbar');
                return response.text();
            })
            .then(html => {
                navbarPlaceholder.innerHTML = html;
                // Inicializar menú móvil después de cargar navbar
                initMobileMenu();
                // Verificar estado de autenticación
                checkAuthState();
            })
            .catch(error => console.error('Error cargando navbar:', error));
    }
    
    // Cargar footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('components/footer.html')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar footer');
                return response.text();
            })
            .then(html => {
                footerPlaceholder.innerHTML = html;
            })
            .catch(error => console.error('Error cargando footer:', error));
    }

    // Cargar modales (login y registro)
    const body = document.body;
    fetch('components/modals.html')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar modales');
            return response.text();
        })
        .then(html => {
            // Insertar modales al final del body
            const modalsContainer = document.createElement('div');
            modalsContainer.innerHTML = html;
            body.appendChild(modalsContainer);
            
            // Inicializar autenticación después de cargar modales
            if (typeof initAuth === 'function') {
                initAuth();
            }
            
            // IMPORTANTE: Adjuntar event listener al formulario de checkout
            // DESPUÉS de que los modals estén en el DOM
            const checkoutForm = document.getElementById('checkout-form');
            if (checkoutForm && typeof submitOrder === 'function') {
                checkoutForm.addEventListener('submit', submitOrder);
                console.log('✅ Event listener de checkout adjuntado correctamente');
            } else {
                console.warn('⚠️ No se pudo adjuntar event listener al checkout form');
            }
        })
        .catch(error => console.error('Error cargando modales:', error));
});

// Funcionalidad del menú móvil
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    if (!mobileMenuBtn || !mobileMenu || !mobileMenuOverlay) {
        console.warn('Elementos del menú móvil no encontrados');
        return;
    }
    
    // Abrir menú móvil
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenuOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    });
    
    // Cerrar menú con botón X
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    // Cerrar menú con click en overlay
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    
    // Cerrar menú al hacer click en cualquier link del menú
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    function closeMobileMenu() {
        mobileMenu.classList.add('translate-x-full');
        mobileMenuOverlay.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurar scroll
    }
}

// Authentication state management
window.checkAuthState = function() {
    const token = localStorage.getItem('tardo_token');
    const userStr = localStorage.getItem('tardo_user');
    
    const navGuest = document.getElementById('nav-guest');
    const navUser = document.getElementById('nav-user');
    const mobileNavGuest = document.getElementById('mobile-nav-guest');
    const mobileNavUser = document.getElementById('mobile-nav-user');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            const userName = user.name || user.email || 'Usuario';
            
            // Desktop: Ocultar guest, mostrar user
            if (navGuest) {
                navGuest.classList.add('hidden');
                navGuest.classList.remove('flex');
            }
            if (navUser) {
                navUser.classList.remove('hidden');
                navUser.classList.add('flex');
            }
            
            const navUserNameText = document.getElementById('nav-user-name-text');
            if (navUserNameText) navUserNameText.textContent = userName;
            
            // Mobile: Ocultar guest, mostrar user
            if (mobileNavGuest) mobileNavGuest.classList.add('hidden');
            if (mobileNavUser) {
                mobileNavUser.classList.remove('hidden');
                mobileNavUser.classList.add('flex');
            }
            const mobileUserName = document.getElementById('mobile-user-name');
            if (mobileUserName) mobileUserName.textContent = userName;
            
        } catch (e) {
            console.error('Error parsing user data:', e);
            logout();
        }
    } else {
        // Guest state: Mostrar guest, ocultar user
        if (navGuest) {
            navGuest.classList.remove('hidden');
            navGuest.classList.add('flex');
        }
        if (navUser) {
            navUser.classList.add('hidden');
            navUser.classList.remove('flex');
        }
        if (mobileNavGuest) mobileNavGuest.classList.remove('hidden');
        if (mobileNavUser) mobileNavUser.classList.add('hidden');
    }
}

window.logout = function() {
    localStorage.removeItem('tardo_token');
    localStorage.removeItem('tardo_user');
    window.location.href = '/';
}
