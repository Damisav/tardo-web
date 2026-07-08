// Backend API URL (apunta al VPS)
const API_URL = 'https://admin.tardoar.com/api';

// ==================== LOGIN MODAL ====================

// Función interna que solo maneja el DOM (sin history)
function _closeLoginModalDOM() {
    document.getElementById('login-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.getElementById('login-form').reset();
    document.getElementById('login-error').classList.add('hidden');
    
    // Reset Turnstile widgets
    if (window.TardoTurnstile) {
        TardoTurnstile.reset('login-turnstile');
        TardoTurnstile.reset('forgot-turnstile');
    }
    
    // Reset forgot password view
    showLoginView();
    document.getElementById('forgot-password-form').reset();
    document.getElementById('forgot-error').classList.add('hidden');
    document.getElementById('forgot-success').classList.add('hidden');
}

window.openLoginModal = function() {
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
    
    document.getElementById('login-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Renderizar Turnstile para login
    if (window.TardoTurnstile) {
        TardoTurnstile.render('login-turnstile');
    }
    
    // Registrar en el historial
    if (window.ModalHistory) {
        ModalHistory.push('login-modal', _closeLoginModalDOM);
    }
}

window.closeLoginModal = function() {
    if (window.ModalHistory) {
        ModalHistory.close(_closeLoginModalDOM);
    } else {
        _closeLoginModalDOM();
    }
}

// ==================== FORGOT PASSWORD VIEW ====================

window.showForgotPasswordView = function() {
    // Ocultar vista de login
    document.getElementById('login-view').classList.add('hidden');
    
    // Mostrar vista de forgot password
    document.getElementById('forgot-password-view').classList.remove('hidden');
    
    // Cambiar título del modal
    document.getElementById('login-modal-title').textContent = 'Recuperar Contraseña';
    
    // Pre-llenar email si existe en el campo de login
    const loginEmail = document.getElementById('login-email').value;
    if (loginEmail) {
        document.getElementById('forgot-email').value = loginEmail;
    }
    
    // Renderizar Turnstile
    if (window.TardoTurnstile) {
        TardoTurnstile.render('forgot-turnstile');
    }
}

window.showLoginView = function() {
    // Mostrar vista de login
    document.getElementById('login-view').classList.remove('hidden');
    
    // Ocultar vista de forgot password
    document.getElementById('forgot-password-view').classList.add('hidden');
    
    // Restaurar título del modal
    document.getElementById('login-modal-title').textContent = 'Iniciar Sesión';
    
    // Reset Turnstile
    if (window.TardoTurnstile) {
        TardoTurnstile.reset('forgot-turnstile');
    }
}

// ==================== REGISTER MODAL ====================

// Función interna que solo maneja el DOM (sin history)
function _closeRegisterModalDOM() {
    document.getElementById('register-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.getElementById('register-form').reset();
    document.getElementById('register-error').classList.add('hidden');
    document.getElementById('register-success').classList.add('hidden');
}

window.openRegisterModal = function() {
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
    
    document.getElementById('register-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Registrar en el historial
    if (window.ModalHistory) {
        ModalHistory.push('register-modal', _closeRegisterModalDOM);
    }
}

window.closeRegisterModal = function() {
    if (window.ModalHistory) {
        ModalHistory.close(_closeRegisterModalDOM);
    } else {
        _closeRegisterModalDOM();
    }
}

// ==================== SWITCH BETWEEN MODALS ====================

window.switchToRegisterModal = function() {
    // Cerrar DOM del login sin afectar history
    _closeLoginModalDOM();
    
    // Reemplazar entrada en history (login → registro, misma profundidad)
    if (window.ModalHistory) {
        ModalHistory.replace('register-modal', _closeRegisterModalDOM);
    }
    
    // Abrir DOM del registro
    document.getElementById('register-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

window.switchToLoginModal = function() {
    // Cerrar DOM del registro sin afectar history
    _closeRegisterModalDOM();
    
    // Reemplazar entrada en history (registro → login, misma profundidad)
    if (window.ModalHistory) {
        ModalHistory.replace('login-modal', _closeLoginModalDOM);
    }
    
    // Abrir DOM del login
    document.getElementById('login-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Renderizar Turnstile para login
    if (window.TardoTurnstile) {
        TardoTurnstile.render('login-turnstile');
    }
}

// ==================== INITIALIZATION ====================

function initAuth() {
    // Toggle password visibility
    const togglePasswordBtn = document.getElementById('toggle-login-password');
    const passwordInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('login-eye-icon');
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.setAttribute('icon', 'solar:eye-linear');
            } else {
                passwordInput.type = 'password';
                eyeIcon.setAttribute('icon', 'solar:eye-closed-linear');
            }
        });
    }

    // Refresh captcha
    const refreshCaptchaBtn = document.getElementById('refresh-login-captcha');
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', () => {
            generateLoginCaptcha();
        });
    }

    // Login form submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('login-submit-btn');
            const errorDiv = document.getElementById('login-error');
            const errorText = document.getElementById('login-error-text');

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Obtener token de Turnstile
            const turnstileToken = window.TardoTurnstile ? TardoTurnstile.getToken('login-turnstile') : null;
            
            if (!turnstileToken) {
                errorText.textContent = 'Por favor, completá la verificación de seguridad.';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<iconify-icon icon="solar:refresh-linear" class="text-xl animate-spin"></iconify-icon><span>Verificando...</span>';
            errorDiv.classList.add('hidden');

            try {
                // Enviar como JSON body con Turnstile token
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        turnstile_token: turnstileToken
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.detail || 'Email o contraseña incorrectos');
                }

                // Success - Save JWT token
                localStorage.setItem('tardo_token', result.token);
                localStorage.setItem('tardo_user', JSON.stringify(result.user));

                // Close modal
                closeLoginModal();

                // Update navbar
                if (typeof checkAuthState === 'function') {
                    checkAuthState();
                }

                // Redirect to dashboard
                window.location.href = '/user_panel/dashboard.html';

            } catch (error) {
                console.error('Error:', error);
                errorText.textContent = error.message;
                errorDiv.classList.remove('hidden');
                
                // Reset Turnstile en caso de error
                if (window.TardoTurnstile) {
                    TardoTurnstile.reset('login-turnstile');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear" class="text-xl"></iconify-icon><span>Iniciar sesión</span>';
            }
        });
    }

    // Forgot password form submit
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('forgot-submit-btn');
            const errorDiv = document.getElementById('forgot-error');
            const errorText = document.getElementById('forgot-error-text');
            const successDiv = document.getElementById('forgot-success');
            const successText = document.getElementById('forgot-success-text');
            const formFields = document.getElementById('forgot-form-fields');

            const email = document.getElementById('forgot-email').value;
            const confirmEmail = document.getElementById('forgot-confirm-email').value;

            // Validar que emails coincidan (client-side)
            if (email !== confirmEmail) {
                errorText.textContent = 'Los emails no coinciden. Verificá que sean idénticos.';
                errorDiv.classList.remove('hidden');
                successDiv.classList.add('hidden');
                return;
            }

            // Obtener token de Turnstile
            const turnstileToken = window.TardoTurnstile ? TardoTurnstile.getToken('forgot-turnstile') : null;
            
            if (!turnstileToken) {
                errorText.textContent = 'Por favor, completá la verificación de seguridad.';
                errorDiv.classList.remove('hidden');
                successDiv.classList.add('hidden');
                return;
            }

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<iconify-icon icon="solar:refresh-linear" class="text-xl animate-spin"></iconify-icon><span>Enviando...</span>';
            errorDiv.classList.add('hidden');
            successDiv.classList.add('hidden');

            try {
                const response = await fetch(`${API_URL}/auth/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        confirm_email: confirmEmail,
                        turnstile_token: turnstileToken
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    // Manejar errores específicos
                    if (response.status === 404) {
                        throw new Error('El email no está registrado. Verificá que sea correcto o registrate.');
                    } else if (response.status === 429) {
                        throw new Error(result.detail || 'Demasiados intentos. Esperá unos minutos e intentá nuevamente.');
                    } else {
                        throw new Error(result.detail || 'Error al procesar tu solicitud');
                    }
                }

                // Success
                successText.textContent = result.message || `Email enviado a ${email}`;
                successDiv.classList.remove('hidden');
                formFields.classList.add('hidden'); // Ocultar formulario tras éxito

            } catch (error) {
                console.error('Error:', error);
                errorText.textContent = error.message;
                errorDiv.classList.remove('hidden');
                
                // Reset Turnstile en caso de error
                if (window.TardoTurnstile) {
                    TardoTurnstile.reset('forgot-turnstile');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<iconify-icon icon="solar:letter-linear" class="text-xl"></iconify-icon><span>Enviar link de recuperación</span>';
            }
        });
    }

    // Register form submit
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('register-submit-btn');
            const errorDiv = document.getElementById('register-error');
            const successDiv = document.getElementById('register-success');

            // Ocultar mensajes previos
            errorDiv.classList.add('hidden');
            successDiv.classList.add('hidden');

            // Obtener datos del formulario
            const formData = new FormData(e.target);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                telegram: formData.get('telegram') || null,
                country: formData.get('country'),
                referral_source: formData.get('referral_source')
            };

            // Validar términos
            if (!formData.get('terms')) {
                errorDiv.textContent = 'Debes aceptar los Términos de servicio';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Deshabilitar botón
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<iconify-icon icon="solar:refresh-linear" class="text-base animate-spin"></iconify-icon><span>Creando cuenta...</span>';

            try {
                // Enviar como query params (FastAPI espera parámetros en URL)
                const queryParams = new URLSearchParams();
                queryParams.append('name', data.name);
                queryParams.append('email', data.email);
                queryParams.append('country', data.country);
                queryParams.append('referral_source', data.referral_source);
                if (data.telegram) {
                    queryParams.append('telegram', data.telegram);
                }
                
                const response = await fetch(`${API_URL}/auth/register?${queryParams.toString()}`, {
                    method: 'POST'
                });

                const result = await response.json();
                console.log('Response status:', response.status);
                console.log('Response data:', result);

                if (!response.ok) {
                    // Intentar obtener el mensaje de error de múltiples fuentes
                    const errorMessage = result.detail || result.message || result.error || 'Error al crear cuenta';
                    console.error('Error del servidor:', errorMessage);
                    throw new Error(errorMessage);
                }

                // Éxito
                successDiv.innerHTML = `
                    <p class="font-semibold mb-1">¡Cuenta creada exitosamente!</p>
                    <p>Hemos enviado tus credenciales de acceso a <strong>${data.email}</strong></p>
                    <p class="mt-2">Revisa tu bandeja de entrada y spam.</p>
                `;
                successDiv.classList.remove('hidden');

                // Resetear formulario
                e.target.reset();

                // Cerrar modal después de 5 segundos
                setTimeout(() => {
                    closeRegisterModal();
                }, 5000);

            } catch (error) {
                console.error('Error completo:', error);
                console.error('Error message:', error.message);
                errorDiv.textContent = error.message || 'Error al crear cuenta';
                errorDiv.classList.remove('hidden');
            } finally {
                // Rehabilitar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Crear cuenta</span>';
            }
        });
    }

    // Cerrar modales con Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const loginModal = document.getElementById('login-modal');
            const registerModal = document.getElementById('register-modal');
            
            if (loginModal && !loginModal.classList.contains('hidden')) {
                closeLoginModal();
            } else if (registerModal && !registerModal.classList.contains('hidden')) {
                closeRegisterModal();
            }
        }
    });
}

// Export initialization function
window.initAuth = initAuth;
