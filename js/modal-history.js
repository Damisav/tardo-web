// Modal History Manager
// Maneja el historial del navegador para que el botón Atrás cierre modales/overlays
// en lugar de navegar a la página anterior

(function() {
    'use strict';

    const stack = [];
    let closingFromHistory = false;

    /**
     * Registra un modal/overlay que se acaba de abrir
     * @param {string} id - Identificador del overlay (ej: 'login-modal')
     * @param {Function} closeFn - Función que cierra el overlay (solo DOM, sin history)
     */
    function push(id, closeFn) {
        if (closingFromHistory) return;
        
        // Agregar entrada al historial del navegador
        history.pushState({ modal: id, timestamp: Date.now() }, '', location.href);
        
        // Agregar al stack interno
        stack.push({ id, closeFn });
    }

    /**
     * Cierra un overlay desde botón X, Escape, click en overlay, etc.
     * @param {Function} closeFn - Función que cierra el overlay
     */
    function close(closeFn) {
        if (closingFromHistory) {
            // Estamos siendo llamados desde popstate, ejecutar directamente
            closeFn();
            return;
        }

        // Verificar que el closeFn sea el del tope del stack
        if (stack.length > 0 && stack[stack.length - 1].closeFn === closeFn) {
            // Llamar history.back() que disparará popstate
            history.back();
        } else {
            // Fallback: cerrar directamente si no está en el stack
            closeFn();
        }
    }

    /**
     * Reemplaza el overlay actual sin cambiar la profundidad del historial
     * Usado para transiciones entre modales (ej: checkout → pago, login → registro)
     * @param {string} id - Identificador del nuevo overlay
     * @param {Function} closeFn - Función que cierra el nuevo overlay
     */
    function replace(id, closeFn) {
        if (closingFromHistory) return;

        // Reemplazar la entrada actual del historial
        history.replaceState({ modal: id, timestamp: Date.now() }, '', location.href);

        // Reemplazar el tope del stack
        if (stack.length > 0) {
            stack[stack.length - 1] = { id, closeFn };
        } else {
            // Si el stack está vacío, hacer push
            stack.push({ id, closeFn });
        }
    }

    /**
     * Elimina silenciosamente una entrada del stack sin afectar el historial
     * Útil cuando un overlay se cierra programáticamente antes de abrir otro
     * @param {string} id - Identificador del overlay a eliminar
     */
    function removeSilent(id) {
        const index = stack.findIndex(entry => entry.id === id);
        if (index !== -1) {
            stack.splice(index, 1);
        }
    }

    /**
     * Verifica si hay algún overlay abierto
     * @returns {boolean}
     */
    function hasOpen() {
        return stack.length > 0;
    }

    /**
     * Listener de popstate - se dispara al presionar Atrás
     */
    window.addEventListener('popstate', () => {
        const entry = stack.pop();
        if (!entry) return;

        // Ejecutar la función de cierre sin volver a llamar history.back()
        closingFromHistory = true;
        entry.closeFn();
        closingFromHistory = false;
    });

    // Exponer API pública
    window.ModalHistory = {
        push,
        close,
        replace,
        removeSilent,
        hasOpen
    };
})();
