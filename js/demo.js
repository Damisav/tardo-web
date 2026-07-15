// ==================== DEMO MODAL ====================

const API_URL = 'https://admin.tardoar.com/api';

// Función interna que solo maneja el DOM (sin history)
function _closeDemoModalDOM() {
    document.getElementById('demo-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.getElementById('demo-form').reset();
    document.getElementById('demo-error').classList.add('hidden');
    document.getElementById('demo-success').classList.add('hidden');
    document.getElementById('demo-form-fields').classList.remove('hidden');
    
    // Reset Turnstile widget
    if (window.TardoTurnstile) {
        TardoTurnstile.reset('demo-turnstile');
    }
}

window.openDemoModal = function() {
    // Cerrar menú móvil si está abierto
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
        mobileMenu.classList.add('translate-x-full');
        mobileMenuOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        // Remover silenciosamente del stack si estaba ahí
        if (window.ModalHistory) {
            ModalHistory.removeSilent('mobile-menu');
        }
    }
    
    document.getElementById('demo-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Renderizar Turnstile
    if (window.TardoTurnstile) {
        TardoTurnstile.render('demo-turnstile');
    }
    
    // Registrar en el historial
    if (window.ModalHistory) {
        ModalHistory.push('demo-modal', _closeDemoModalDOM);
    }
}

window.closeDemoModal = function() {
    if (window.ModalHistory) {
        ModalHistory.close(_closeDemoModalDOM);
    } else {
        _closeDemoModalDOM();
    }
}

// Switch desde demo modal al registro
window.switchToRegisterModal = function() {
    // Cerrar DOM del demo sin afectar history
    _closeDemoModalDOM();
    
    // Reemplazar entrada en history (demo → registro, misma profundidad)
    if (window.ModalHistory) {
        ModalHistory.replace('register-modal', window._closeRegisterModalDOM || function() {
            document.getElementById('register-modal').classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        });
    }
    
    // Abrir DOM del registro
    document.getElementById('register-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

// ==================== INITIALIZATION ====================

function initDemo() {
    const demoForm = document.getElementById('demo-form');
    
    if (demoForm) {
        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('demo-submit-btn');
            const errorDiv = document.getElementById('demo-error');
            const errorText = document.getElementById('demo-error-text');
            const successDiv = document.getElementById('demo-success');
            const successText = document.getElementById('demo-success-text');
            const formFields = document.getElementById('demo-form-fields');

            const email = document.getElementById('demo-email').value;

            // Obtener token de Turnstile
            const turnstileToken = window.TardoTurnstile ? TardoTurnstile.getToken('demo-turnstile') : null;
            
            if (!turnstileToken) {
                errorText.textContent = 'Por favor, completá la verificación de seguridad.';
                errorDiv.classList.remove('hidden');
                successDiv.classList.add('hidden');
                return;
            }

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<iconify-icon icon="solar:refresh-linear" class="text-xl animate-spin"></iconify-icon><span>Procesando...</span>';
            errorDiv.classList.add('hidden');
            successDiv.classList.add('hidden');

            try {
                const response = await fetch(`${API_URL}/demo-requests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        turnstile_token: turnstileToken
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    // Manejar errores específicos
                    if (response.status === 404) {
                        throw new Error('Usuario no registrado. Creá tu cuenta y volvé a solicitar la demo.');
                    } else if (response.status === 429) {
                        throw new Error(result.detail || 'Ya solicitaste una demo recientemente. Intentá más tarde.');
                    } else {
                        throw new Error(result.detail || 'Error al procesar tu solicitud');
                    }
                }

                // Success
                successText.textContent = result.message || `Solicitud recibida. Te enviaremos la licencia a ${email} en un plazo de 24 horas.`;
                successDiv.classList.remove('hidden');
                formFields.classList.add('hidden'); // Ocultar formulario tras éxito

            } catch (error) {
                console.error('Error:', error);
                errorText.textContent = error.message;
                errorDiv.classList.remove('hidden');
                
                // Reset Turnstile en caso de error
                if (window.TardoTurnstile) {
                    TardoTurnstile.reset('demo-turnstile');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<iconify-icon icon="solar:rocket-2-linear" class="text-xl"></iconify-icon><span>Solicitar demo</span>';
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
} else {
    initDemo();
}
