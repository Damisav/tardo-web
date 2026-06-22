// ========================================
// TARDO - Reset Password Page
// ========================================

const API_URL = 'https://admin.tardoar.com/api';

// Obtener token del query string
function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

// Estados de la página
function showLoadingState() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('success-state').classList.add('hidden');
    document.getElementById('reset-password-form').classList.add('hidden');
}

function showErrorState(message) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
    document.getElementById('success-state').classList.add('hidden');
    document.getElementById('reset-password-form').classList.add('hidden');
    
    if (message) {
        document.getElementById('error-message').textContent = message;
    }
}

function showFormState() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('success-state').classList.add('hidden');
    document.getElementById('reset-password-form').classList.remove('hidden');
}

function showSuccessState() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('success-state').classList.remove('hidden');
    document.getElementById('reset-password-form').classList.add('hidden');
}

// Toggle password visibility
function setupPasswordToggles() {
    // Toggle nueva contraseña
    const toggleNewPassword = document.getElementById('toggle-new-password');
    const newPasswordInput = document.getElementById('new-password');
    const newEyeIcon = document.getElementById('new-eye-icon');
    
    if (toggleNewPassword) {
        toggleNewPassword.addEventListener('click', () => {
            if (newPasswordInput.type === 'password') {
                newPasswordInput.type = 'text';
                newEyeIcon.setAttribute('icon', 'solar:eye-linear');
            } else {
                newPasswordInput.type = 'password';
                newEyeIcon.setAttribute('icon', 'solar:eye-closed-linear');
            }
        });
    }
    
    // Toggle confirmar contraseña
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmEyeIcon = document.getElementById('confirm-eye-icon');
    
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', () => {
            if (confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                confirmEyeIcon.setAttribute('icon', 'solar:eye-linear');
            } else {
                confirmPasswordInput.type = 'password';
                confirmEyeIcon.setAttribute('icon', 'solar:eye-closed-linear');
            }
        });
    }
}

// Validar contraseñas
function validatePasswords() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('reset-error');
    const errorText = document.getElementById('reset-error-text');
    
    // Validar longitud
    if (newPassword.length < 8) {
        errorText.textContent = 'La contraseña debe tener al menos 8 caracteres';
        errorDiv.classList.remove('hidden');
        return false;
    }
    
    // Validar que coincidan
    if (newPassword !== confirmPassword) {
        errorText.textContent = 'Las contraseñas no coinciden';
        errorDiv.classList.remove('hidden');
        return false;
    }
    
    errorDiv.classList.add('hidden');
    return true;
}

// Resetear contraseña
async function resetPassword(token, newPassword, confirmPassword) {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || 'Error al restablecer contraseña');
        }
        
        return { success: true, message: result.message };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Reset Password - Página cargada');
    
    // Verificar si hay token en la URL
    const token = getTokenFromURL();
    
    if (!token) {
        console.error('❌ No se encontró token en la URL');
        showErrorState('Link de recuperación inválido');
        return;
    }
    
    console.log('✅ Token encontrado, mostrando formulario');
    
    // Mostrar formulario (el token se valida al enviar)
    showFormState();
    
    // Setup password toggles
    setupPasswordToggles();
    
    // Form submit handler
    const form = document.getElementById('reset-password-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('reset-submit-btn');
            const errorDiv = document.getElementById('reset-error');
            const errorText = document.getElementById('reset-error-text');
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validar contraseñas client-side
            if (!validatePasswords()) {
                return;
            }
            
            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<iconify-icon icon="solar:refresh-linear" class="text-xl animate-spin"></iconify-icon><span>Restableciendo...</span>';
            errorDiv.classList.add('hidden');
            
            try {
                const result = await resetPassword(token, newPassword, confirmPassword);
                
                if (!result.success) {
                    throw new Error(result.error);
                }
                
                // Success
                console.log('✅ Contraseña restablecida correctamente');
                showSuccessState();
                
            } catch (error) {
                console.error('❌ Error restableciendo contraseña:', error);
                errorText.textContent = error.message;
                errorDiv.classList.remove('hidden');
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<iconify-icon icon="solar:shield-check-linear" class="text-xl"></iconify-icon><span>Restablecer contraseña</span>';
            }
        });
    }
    
    // Validar en tiempo real cuando el usuario escribe
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
                document.getElementById('reset-error-text').textContent = 'Las contraseñas no coinciden';
                document.getElementById('reset-error').classList.remove('hidden');
            } else {
                document.getElementById('reset-error').classList.add('hidden');
            }
        });
    }
});
