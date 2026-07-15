// ==================== DEMO MODAL ====================
// NOTA: No se declara API_URL aquí, ya está declarado en auth.js
// Se usa la variable DEMO_API_URL propia para evitar conflicto

const DEMO_API_URL = 'https://admin.tardoar.com/api';

console.log('[DEMO] demo.js cargado correctamente');

// Función interna que solo maneja el DOM (sin history)
function _closeDemoModalDOM() {
    const modal = document.getElementById('demo-modal');
    if (!modal) {
        console.warn('[DEMO] _closeDemoModalDOM: demo-modal no encontrado en DOM');
        return;
    }
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');

    const form = document.getElementById('demo-form');
    if (form) form.reset();

    const errorDiv = document.getElementById('demo-error');
    if (errorDiv) errorDiv.classList.add('hidden');

    const successDiv = document.getElementById('demo-success');
    if (successDiv) successDiv.classList.add('hidden');

    const formFields = document.getElementById('demo-form-fields');
    if (formFields) formFields.classList.remove('hidden');

    // Reset Turnstile widget
    if (window.TardoTurnstile) {
        TardoTurnstile.reset('demo-turnstile');
    }

    console.log('[DEMO] Modal cerrado');
}

window.openDemoModal = function() {
    console.log('[DEMO] openDemoModal() llamado');

    const modal = document.getElementById('demo-modal');
    if (!modal) {
        console.error('[DEMO] openDemoModal: demo-modal no existe en DOM. ¿Los modales se cargaron?');
        return;
    }

    // Cerrar menú móvil si está abierto
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
        mobileMenu.classList.add('translate-x-full');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        if (window.ModalHistory) ModalHistory.removeSilent('mobile-menu');
    }

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    // Renderizar Turnstile
    if (window.TardoTurnstile) {
        TardoTurnstile.render('demo-turnstile');
        console.log('[DEMO] Turnstile renderizado');
    } else {
        console.warn('[DEMO] TardoTurnstile no disponible al abrir modal');
    }

    // Registrar en el historial
    if (window.ModalHistory) {
        ModalHistory.push('demo-modal', _closeDemoModalDOM);
        console.log('[DEMO] Modal registrado en ModalHistory');
    }
}

window.closeDemoModal = function() {
    console.log('[DEMO] closeDemoModal() llamado');
    if (window.ModalHistory) {
        ModalHistory.close(_closeDemoModalDOM);
    } else {
        _closeDemoModalDOM();
    }
}

// Switch desde demo modal al modal de registro
// NOMBRE DIFERENTE al de auth.js para no pisar su función
window.openRegisterFromDemo = function() {
    console.log('[DEMO] openRegisterFromDemo() llamado');

    // Cerrar demo sin afectar history
    _closeDemoModalDOM();

    // Abrir modal de registro usando la función que expone auth.js
    if (typeof window.openRegisterModal === 'function') {
        // Reemplazar en el stack para que Atrás vuelva a la página (no reabre demo)
        if (window.ModalHistory) {
            ModalHistory.replace('register-modal', function() {
                const reg = document.getElementById('register-modal');
                if (reg) reg.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            });
        }
        const regModal = document.getElementById('register-modal');
        if (regModal) {
            regModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            console.log('[DEMO] Modal de registro abierto desde demo');
        } else {
            console.error('[DEMO] register-modal no encontrado en DOM');
        }
    } else {
        console.error('[DEMO] openRegisterModal no está definida. ¿auth.js cargó correctamente?');
    }
}

// ==================== INITIALIZATION ====================
// Llamada desde components.js DESPUÉS de que los modales están en DOM

window.initDemo = function() {
    console.log('[DEMO] initDemo() ejecutado');

    const demoForm = document.getElementById('demo-form');
    if (!demoForm) {
        console.error('[DEMO] initDemo: demo-form no encontrado. El modal de demo puede no haberse cargado.');
        return;
    }

    console.log('[DEMO] demo-form encontrado, adjuntando submit listener');

    demoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('[DEMO] Formulario enviado');

        const submitBtn   = document.getElementById('demo-submit-btn');
        const errorDiv    = document.getElementById('demo-error');
        const errorText   = document.getElementById('demo-error-text');
        const successDiv  = document.getElementById('demo-success');
        const successText = document.getElementById('demo-success-text');
        const formFields  = document.getElementById('demo-form-fields');
        const email       = document.getElementById('demo-email').value.trim();

        console.log('[DEMO] Email ingresado:', email);

        // Validar Turnstile
        const turnstileToken = window.TardoTurnstile ? TardoTurnstile.getToken('demo-turnstile') : null;
        console.log('[DEMO] Turnstile token:', turnstileToken ? 'obtenido' : 'null');

        if (!turnstileToken) {
            if (errorText) errorText.textContent = 'Por favor, completá la verificación de seguridad.';
            if (errorDiv) errorDiv.classList.remove('hidden');
            if (successDiv) successDiv.classList.add('hidden');
            return;
        }

        // Deshabilitar botón durante el request
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<iconify-icon icon="solar:refresh-linear" class="text-xl animate-spin"></iconify-icon><span>Procesando...</span>';
        }
        if (errorDiv) errorDiv.classList.add('hidden');
        if (successDiv) successDiv.classList.add('hidden');

        try {
            console.log('[DEMO] Enviando POST a /api/demo-requests...');

            const response = await fetch(`${DEMO_API_URL}/demo-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, turnstile_token: turnstileToken })
            });

            console.log('[DEMO] Response status:', response.status);

            const result = await response.json();
            console.log('[DEMO] Response body:', result);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Usuario no registrado. Creá tu cuenta y volvé a solicitar la demo.');
                } else if (response.status === 429) {
                    throw new Error(result.detail || 'Ya solicitaste una demo recientemente. Intentá más tarde.');
                } else {
                    throw new Error(result.detail || 'Error al procesar tu solicitud');
                }
            }

            // Éxito
            console.log('[DEMO] Solicitud exitosa');
            if (successText) successText.textContent = result.message || `Solicitud recibida. Te enviaremos la licencia a ${email} en un plazo de 24 horas.`;
            if (successDiv) successDiv.classList.remove('hidden');
            if (formFields) formFields.classList.add('hidden');

        } catch (error) {
            console.error('[DEMO] Error en solicitud:', error.message);
            if (errorText) errorText.textContent = error.message;
            if (errorDiv) errorDiv.classList.remove('hidden');

            // Reset Turnstile para que pueda reintentar
            if (window.TardoTurnstile) TardoTurnstile.reset('demo-turnstile');

        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<iconify-icon icon="solar:rocket-2-linear" class="text-xl"></iconify-icon><span>Solicitar demo</span>';
            }
        }
    });
}
