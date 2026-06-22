// ========================================
// TARDO - Cloudflare Turnstile Module
// ========================================

const TardoTurnstile = (function() {
    'use strict';
    
    // Estado del módulo
    let siteKey = null;
    let scriptLoaded = false;
    let scriptLoading = false;
    let widgets = {}; // Almacena widgets por ID de contenedor
    
    /**
     * Inicializa el módulo obteniendo la site key desde el backend
     * @returns {Promise<boolean>} True si se inicializó correctamente
     */
    async function init() {
        if (siteKey) {
            console.log('✅ Turnstile ya inicializado');
            return true;
        }
        
        try {
            const response = await fetch('https://admin.tardoar.com/api/auth/config');
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const config = await response.json();
            siteKey = config.turnstile_site_key;
            
            if (!siteKey) {
                console.error('❌ Site key de Turnstile no configurada en el servidor');
                return false;
            }
            
            console.log('✅ Turnstile inicializado con site key');
            return true;
            
        } catch (error) {
            console.error('❌ Error obteniendo config de Turnstile:', error);
            return false;
        }
    }
    
    /**
     * Carga el script de Turnstile de Cloudflare
     * @returns {Promise<boolean>} True cuando el script esté cargado
     */
    function loadScript() {
        return new Promise((resolve, reject) => {
            // Si ya está cargado
            if (scriptLoaded) {
                resolve(true);
                return;
            }
            
            // Si ya está cargando, esperar
            if (scriptLoading) {
                const checkInterval = setInterval(() => {
                    if (scriptLoaded) {
                        clearInterval(checkInterval);
                        resolve(true);
                    }
                }, 100);
                return;
            }
            
            scriptLoading = true;
            
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                scriptLoaded = true;
                scriptLoading = false;
                console.log('✅ Script de Turnstile cargado');
                resolve(true);
            };
            
            script.onerror = () => {
                scriptLoading = false;
                console.error('❌ Error cargando script de Turnstile');
                reject(new Error('No se pudo cargar Turnstile'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Renderiza un widget de Turnstile en un contenedor
     * @param {string} containerId - ID del elemento donde renderizar
     * @param {function} [callback] - Función a llamar cuando se complete el desafío
     * @returns {Promise<string|null>} Widget ID o null si falla
     */
    async function render(containerId, callback) {
        try {
            // 1. Inicializar si no está hecho
            if (!siteKey) {
                const initialized = await init();
                if (!initialized) {
                    throw new Error('No se pudo inicializar Turnstile');
                }
            }
            
            // 2. Cargar script si no está cargado
            if (!scriptLoaded) {
                await loadScript();
            }
            
            // 3. Verificar que el contenedor existe
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Contenedor #${containerId} no encontrado`);
            }
            
            // 4. Limpiar contenedor si ya tiene un widget
            if (widgets[containerId]) {
                reset(containerId);
            }
            
            // 5. Renderizar widget
            const widgetId = window.turnstile.render(`#${containerId}`, {
                sitekey: siteKey,
                theme: 'dark',
                size: 'normal',
                callback: function(token) {
                    console.log('✅ Turnstile completado');
                    if (callback) callback(token);
                },
                'error-callback': function() {
                    console.error('❌ Error en Turnstile');
                    if (callback) callback(null);
                }
            });
            
            widgets[containerId] = widgetId;
            console.log(`✅ Widget Turnstile renderizado en #${containerId}`);
            
            return widgetId;
            
        } catch (error) {
            console.error('❌ Error renderizando Turnstile:', error);
            return null;
        }
    }
    
    /**
     * Resetea un widget de Turnstile
     * @param {string} containerId - ID del contenedor
     */
    function reset(containerId) {
        const widgetId = widgets[containerId];
        
        if (widgetId !== undefined && window.turnstile) {
            try {
                window.turnstile.reset(widgetId);
                console.log(`🔄 Widget Turnstile reseteado en #${containerId}`);
            } catch (error) {
                console.error(`❌ Error reseteando Turnstile en #${containerId}:`, error);
            }
        }
    }
    
    /**
     * Obtiene el token del widget
     * @param {string} containerId - ID del contenedor
     * @returns {string|null} Token o null si no está disponible
     */
    function getToken(containerId) {
        const widgetId = widgets[containerId];
        
        if (widgetId !== undefined && window.turnstile) {
            try {
                return window.turnstile.getResponse(widgetId);
            } catch (error) {
                console.error(`❌ Error obteniendo token de #${containerId}:`, error);
                return null;
            }
        }
        
        return null;
    }
    
    /**
     * Remueve un widget completamente
     * @param {string} containerId - ID del contenedor
     */
    function remove(containerId) {
        const widgetId = widgets[containerId];
        
        if (widgetId !== undefined && window.turnstile) {
            try {
                window.turnstile.remove(widgetId);
                delete widgets[containerId];
                console.log(`🗑️ Widget Turnstile removido de #${containerId}`);
            } catch (error) {
                console.error(`❌ Error removiendo Turnstile de #${containerId}:`, error);
            }
        }
    }
    
    // API pública
    return {
        init,
        render,
        reset,
        getToken,
        remove
    };
})();

// Exponer globalmente
window.TardoTurnstile = TardoTurnstile;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TardoTurnstile.init();
    });
} else {
    TardoTurnstile.init();
}
