// Componentes compartidos - Carga automática de navbar y footer
document.addEventListener('DOMContentLoaded', () => {
    // Cargar navbar
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        fetch('/components/navbar.html')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar navbar');
                return response.text();
            })
            .then(html => {
                navbarPlaceholder.innerHTML = html;
                // Inicializar menú móvil después de cargar navbar
                initMobileMenu();
            })
            .catch(error => console.error('Error cargando navbar:', error));
    }
    
    // Cargar footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('/components/footer.html')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar footer');
                return response.text();
            })
            .then(html => {
                footerPlaceholder.innerHTML = html;
            })
            .catch(error => console.error('Error cargando footer:', error));
    }
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
