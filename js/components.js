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
