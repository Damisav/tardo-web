// ========================================
// TARDO - Debug Module for Chrome DevTools
// ========================================

(function() {
    'use strict';

    // Estado del debug
    let debugEnabled = false;

    // Verificar si debug está activado al cargar
    function checkDebugState() {
        // Verificar localStorage
        if (localStorage.getItem('tardo_debug') === '1') {
            debugEnabled = true;
            return true;
        }

        // Verificar parámetro URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === '1') {
            debugEnabled = true;
            localStorage.setItem('tardo_debug', '1');
            return true;
        }

        return false;
    }

    // ========================================
    // API Pública
    // ========================================

    const TardoDebug = {
        /**
         * Habilitar debug mode
         */
        enable() {
            debugEnabled = true;
            localStorage.setItem('tardo_debug', '1');
            console.log('%c[TardoDebug] ✓ Debug mode ACTIVADO', 'color: #10b981; font-weight: bold');
            console.log('%c[TardoDebug] Recarga la página para ver todos los logs', 'color: #10b981');
        },

        /**
         * Deshabilitar debug mode
         */
        disable() {
            debugEnabled = false;
            localStorage.removeItem('tardo_debug');
            console.log('%c[TardoDebug] ✗ Debug mode DESACTIVADO', 'color: #ef4444; font-weight: bold');
        },

        /**
         * Mostrar estado actual del debug
         */
        status() {
            const token = localStorage.getItem('tardo_token');
            const user = localStorage.getItem('tardo_user');
            
            console.group('%c[TardoDebug] Estado del Sistema', 'color: #3b82f6; font-weight: bold');
            console.log('Debug activo:', debugEnabled ? '✓ SÍ' : '✗ NO');
            console.log('Token presente:', token ? '✓ SÍ' : '✗ NO');
            console.log('Usuario en localStorage:', user ? '✓ SÍ' : '✗ NO');
            
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    console.log('Email:', userData.email);
                    console.log('ID:', userData.id);
                    console.log('Nombre:', userData.name || '(no especificado)');
                } catch (e) {
                    console.log('Error parseando datos de usuario');
                }
            }
            
            console.groupEnd();
        },

        /**
         * Verificar si el debug está activo
         */
        isActive() {
            return debugEnabled;
        },

        /**
         * Log condicional (solo si debug activo)
         */
        log(tag, ...args) {
            if (!debugEnabled) return;

            const timestamp = new Date().toLocaleTimeString('es-AR', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });

            // Enmascarar datos sensibles
            const maskedArgs = args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    return this._maskSensitiveData(arg);
                }
                return arg;
            });

            console.log(
                `%c[TardoDebug:${tag}] %c${timestamp}`,
                'color: #10b981; font-weight: bold',
                'color: #71717a',
                ...maskedArgs
            );
        },

        /**
         * Enmascarar datos sensibles (passwords)
         */
        _maskSensitiveData(obj) {
            if (Array.isArray(obj)) {
                return obj.map(item => this._maskSensitiveData(item));
            }

            if (typeof obj === 'object' && obj !== null) {
                const masked = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        // Enmascarar campos de contraseña
                        if (key.includes('password') || key.includes('Password')) {
                            masked[key] = '********';
                        } else if (typeof obj[key] === 'object') {
                            masked[key] = this._maskSensitiveData(obj[key]);
                        } else {
                            masked[key] = obj[key];
                        }
                    }
                }
                return masked;
            }

            return obj;
        },

        /**
         * Log de error (siempre visible, incluso sin debug)
         */
        error(tag, ...args) {
            console.error(
                `%c[TardoDebug:${tag}] ERROR`,
                'color: #ef4444; font-weight: bold',
                ...args
            );
        },

        /**
         * Log de warning (siempre visible, incluso sin debug)
         */
        warn(tag, ...args) {
            console.warn(
                `%c[TardoDebug:${tag}] WARNING`,
                'color: #f59e0b; font-weight: bold',
                ...args
            );
        }
    };

    // ========================================
    // Inicialización
    // ========================================

    // Verificar estado al cargar
    checkDebugState();

    // Mostrar banner si debug activo
    if (debugEnabled) {
        console.log('%c╔═══════════════════════════════════════════╗', 'color: #10b981');
        console.log('%c║   🐛 TARDO Debug Mode ACTIVO              ║', 'color: #10b981; font-weight: bold');
        console.log('%c╚═══════════════════════════════════════════╝', 'color: #10b981');
        console.log('%c Comandos disponibles:', 'color: #10b981; font-weight: bold');
        console.log('  • TardoDebug.status()   - Ver estado del sistema');
        console.log('  • TardoDebug.disable()  - Desactivar debug');
        console.log('  • TardoDebug.enable()   - Activar debug');
        console.log(' ');
    }

    // Exportar a window
    window.TardoDebug = TardoDebug;

})();
