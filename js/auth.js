// Backend API URL (apunta al VPS)
const API_URL = 'https://admin.tardoar.com/api';

// ==================== LOGIN MODAL ====================
let loginCaptchaAnswer = 0;

// Generate random captcha (simple math)
function generateLoginCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Calculate answer
    if (operation === '+') {
        loginCaptchaAnswer = num1 + num2;
    } else if (operation === '-') {
        loginCaptchaAnswer = num1 - num2;
    } else if (operation === '×') {
        loginCaptchaAnswer = num1 * num2;
    }
    
    // Display question
    document.getElementById('login-captcha-question').textContent = `${num1} ${operation} ${num2} = ?`;
    document.getElementById('login-captcha').value = '';
}

// Validate captcha
function validateLoginCaptcha() {
    const userAnswer = parseInt(document.getElementById('login-captcha').value);
    return userAnswer === loginCaptchaAnswer;
}

window.openLoginModal = function() {
    // Cerrar menú móvil si está abierto
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
        mobileMenu.classList.add('translate-x-full');
        mobileMenuOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
    
    document.getElementById('login-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    generateLoginCaptcha();
}

window.closeLoginModal = function() {
    document.getElementById('login-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.getElementById('login-form').reset();
    document.getElementById('login-error').classList.add('hidden');
}

// ==================== REGISTER MODAL ====================

window.openRegisterModal = function() {
    // Cerrar menú móvil si está abierto
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
        mobileMenu.classList.add('translate-x-full');
        mobileMenuOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
    
    document.getElementById('register-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

window.closeRegisterModal = function() {
    document.getElementById('register-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.getElementById('register-form').reset();
    document.getElementById('register-error').classList.add('hidden');
    document.getElementById('register-success').classList.add('hidden');
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

            // Validate captcha first
            if (!validateLoginCaptcha()) {
                document.getElementById('login-error-text').textContent = 'Verificación incorrecta. Por favor, resuelve la operación matemática.';
                document.getElementById('login-error').classList.remove('hidden');
                generateLoginCaptcha();
                return;
            }

            const submitBtn = document.getElementById('login-submit-btn');
            const errorDiv = document.getElementById('login-error');
            const errorText = document.getElementById('login-error-text');

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<iconify-icon icon="solar:refresh-linear" class="text-xl animate-spin"></iconify-icon><span>Verificando...</span>';
            errorDiv.classList.add('hidden');

            try {
                // Enviar como query params (FastAPI espera parámetros en URL)
                const queryParams = new URLSearchParams();
                queryParams.append('email', email);
                queryParams.append('password', password);
                
                const response = await fetch(`${API_URL}/auth/login?${queryParams.toString()}`, {
                    method: 'POST'
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
                generateLoginCaptcha();
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<iconify-icon icon="solar:login-2-linear" class="text-xl"></iconify-icon><span>Iniciar sesión</span>';
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
