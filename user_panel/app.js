// ========================================
// TARDO - User Panel Authentication
// ========================================

// Backend API URL (cambiar en producción)
const API_URL = 'https://admin.tardoar.com/api';

// ========================================
// JWT Token Management
// ========================================

function getToken() {
    return localStorage.getItem('tardo_token');
}

function getUserData() {
    const data = localStorage.getItem('tardo_user');
    return data ? JSON.parse(data) : null;
}

function saveAuth(token, user) {
    localStorage.setItem('tardo_token', token);
    localStorage.setItem('tardo_user', JSON.stringify(user));
}

function isAuthenticated() {
    return getToken() !== null;
}

// ========================================
// Navigation & Redirects
// ========================================

function redirectToLogin() {
    window.location.href = '/';
}

function requireAuth() {
    if (!isAuthenticated()) {
        redirectToLogin();
    }
}

// ========================================
// API Calls with Authentication
// ========================================

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    // Si token expiró, redirigir a login
    if (response.status === 401) {
        logout();
        return null;
    }

    return response;
}

// ========================================
// User Profile Functions
// ========================================

async function getCurrentUser() {
    try {
        const response = await fetchWithAuth(`${API_URL}/auth/me`);
        if (!response) return null;
        
        const data = await response.json();
        
        if (data.email) {
            // Actualizar datos en localStorage
            saveAuth(getToken(), data);
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

async function updateUserProfile(updates) {
    try {
        const response = await fetchWithAuth(`${API_URL}/user/profile`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });

        if (!response) return { success: false, error: 'No autorizado' };

        const data = await response.json();

        if (response.ok) {
            // Actualizar datos locales
            saveAuth(getToken(), data);
            return { success: true, user: data };
        } else {
            return { success: false, error: data.detail || 'Error al actualizar perfil' };
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

async function getUserOrders() {
    try {
        const response = await fetchWithAuth(`${API_URL}/user/orders`);
        if (!response) return [];

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

// ========================================
// Logout
// ========================================

function logout() {
    localStorage.removeItem('tardo_token');
    localStorage.removeItem('tardo_user');
    redirectToLogin();
}

// ========================================
// Initialize Protected Page
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación en todas las páginas del panel
    requireAuth();
    
    // Cargar datos del usuario en el header
    loadUserHeader();
});

async function loadUserHeader() {
    const user = getUserData();
    
    if (user) {
        // Mostrar nombre del usuario si existe elemento
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user.name || user.email;
        });

        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => {
            el.textContent = user.email;
        });
    }
}

// ========================================
// Utility Functions
// ========================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// ========================================
// Export for global use
// ========================================

window.TardoAuth = {
    getToken,
    getUserData,
    isAuthenticated,
    logout,
    getCurrentUser,
    updateUserProfile,
    getUserOrders,
    formatDate,
    formatCurrency
};
