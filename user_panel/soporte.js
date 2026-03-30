// ========================================
// TARDO - Soporte Usuario
// ========================================

const API_BASE_URL = 'https://admin.tardoar.com';
let currentTicketId = null;
let userToken = null;

// ========================================
// Sistema de tickets leídos (localStorage)
// Guardamos el estado del último mensaje visto para detectar cambios
// ========================================

function getReadTicketsState() {
    const state = localStorage.getItem('tardo_user_read_tickets');
    return state ? JSON.parse(state) : {};
}

function markTicketAsRead(ticketId, lastMessageIsAdmin) {
    const state = getReadTicketsState();
    state[ticketId] = lastMessageIsAdmin;
    localStorage.setItem('tardo_user_read_tickets', JSON.stringify(state));
    console.log(`[USUARIO] ✅ Ticket ${ticketId} marcado como leído con last_message_is_admin=${lastMessageIsAdmin}`);
}

function shouldShowBadge(ticketId, currentLastMessageIsAdmin) {
    const state = getReadTicketsState();
    const savedState = state[ticketId];
    
    // Si no hay respuesta del admin, nunca mostrar badge
    if (currentLastMessageIsAdmin !== 1) {
        console.log(`[USUARIO] Ticket ${ticketId}: last_message_is_admin=${currentLastMessageIsAdmin} → NO badge (no hay respuesta admin)`);
        return false;
    }
    
    // Si nunca fue leído, mostrar badge
    if (savedState === undefined) {
        console.log(`[USUARIO] Ticket ${ticketId}: Nunca leído → SÍ badge`);
        return true;
    }
    
    // Si el estado cambió desde la última lectura, mostrar badge
    if (savedState !== currentLastMessageIsAdmin) {
        console.log(`[USUARIO] Ticket ${ticketId}: Estado cambió ${savedState} → ${currentLastMessageIsAdmin} → SÍ badge`);
        return true;
    }
    
    // Ya fue leído en este estado
    console.log(`[USUARIO] Ticket ${ticketId}: Ya leído con estado ${savedState} → NO badge`);
    return false;
}

// ========================================
// Autenticación
// ========================================

function checkAuth() {
    const token = localStorage.getItem('tardo_token');
    if (!token) {
        window.location.href = '/user_panel/dashboard.html';
        return;
    }
    userToken = token;
}

// ========================================
// Cargar Tickets
// ========================================

async function loadTickets() {
    const loadingEl = document.getElementById('tickets-loading');
    const emptyEl = document.getElementById('tickets-empty');
    const listEl = document.getElementById('tickets-list');

    try {
        loadingEl.classList.remove('hidden');
        emptyEl.classList.add('hidden');
        listEl.classList.add('hidden');

        const response = await fetch(`${API_BASE_URL}/api/user/tickets`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error cargando tickets');
        }

        const data = await response.json();
        
        loadingEl.classList.add('hidden');

        if (data.total === 0) {
            emptyEl.classList.remove('hidden');
            return;
        }

        // Aplicar filtro de estado
        const filterStatus = document.getElementById('filter-status').value;
        let filteredTickets = data.tickets;
        
        if (filterStatus) {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === filterStatus);
        }

        // Verificar si hay tickets después del filtro
        if (filteredTickets.length === 0) {
            emptyEl.classList.remove('hidden');
            return;
        }

        // Ordenar: tickets resueltos al final (crear copia para no mutar el original)
        const sortedTickets = [...filteredTickets].sort((a, b) => {
            if (a.status === 'resuelto' && b.status !== 'resuelto') return 1;
            if (a.status !== 'resuelto' && b.status === 'resuelto') return -1;
            return 0; // Mantener orden original (por updated_at) para el resto
        });

        renderTicketsList(sortedTickets);
        listEl.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        loadingEl.classList.add('hidden');
        showToast('Error al cargar tickets', 'error');
    }
}

function renderTicketsList(tickets) {
    const listEl = document.getElementById('tickets-list');
    
    listEl.innerHTML = tickets.map(ticket => {
        const isActive = ticket.id === currentTicketId;
        const statusInfo = getStatusInfo(ticket.status);
        const priorityInfo = getPriorityInfo(ticket.priority);
        const timeAgo = formatTimeAgo(ticket.created_at);
        const hasAdminReply = shouldShowBadge(ticket.id, ticket.last_message_is_admin);

        return `
            <div 
                onclick="selectTicket(${ticket.id})" 
                class="p-4 border-b border-white/10 ${isActive ? 'bg-white/10 border-l-2 border-l-emerald-500' : 'hover:bg-white/5 border-l-2 border-l-transparent'} cursor-pointer transition-colors group"
            >
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-medium text-neutral-500 group-hover:text-neutral-400 transition-colors">#TRD-${ticket.id}</span>
                        ${hasAdminReply ? '<span class="px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-400 text-xs font-bold animate-pulse">Nueva respuesta</span>' : ''}
                    </div>
                    <span class="text-xs text-neutral-500">${timeAgo}</span>
                </div>
                <h3 class="text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-300'} mb-3 line-clamp-1">${ticket.subject}</h3>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-medium ${statusInfo.textClass}">
                        ${statusInfo.label}
                    </span>
                    <span class="inline-flex items-center gap-1 ${priorityInfo.textClass} text-xs font-medium ml-auto">
                        <iconify-icon icon="${priorityInfo.icon}" width="14"></iconify-icon>
                        ${priorityInfo.label}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// Seleccionar Ticket
// ========================================

async function selectTicket(ticketId) {
    currentTicketId = ticketId;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/tickets/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error cargando ticket');
        }

        const data = await response.json();
        
        // Marcar como visto con el estado actual
        markTicketAsRead(ticketId, data.ticket.last_message_is_admin);
        
        renderTicketDetail(data.ticket);
        
        // Re-render lista para actualizar el activo
        loadTickets();

    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar el ticket', 'error');
    }
}

function renderTicketDetail(ticket) {
    // Mostrar vista de detalle
    document.getElementById('no-ticket-selected').classList.add('hidden');
    document.getElementById('ticket-detail-view').classList.remove('hidden');

    // Actualizar header
    document.getElementById('ticket-subject').textContent = ticket.subject;
    document.getElementById('ticket-category').textContent = getCategoryLabel(ticket.category);
    document.getElementById('ticket-meta').textContent = `Ticket #TRD-${ticket.id} • Creado ${formatDate(ticket.created_at)}`;
    
    const statusInfo = getStatusInfo(ticket.status);
    document.getElementById('ticket-status-badge').innerHTML = `
        <span class="text-xs font-medium ${statusInfo.textClass}">
            ${statusInfo.label}
        </span>
    `;

    // Renderizar mensajes
    renderMessages(ticket.messages || [], ticket.status);

    // Mostrar/ocultar área de input según estado del ticket
    const messageInputArea = document.getElementById('message-input-area');
    
    if (ticket.status === 'resuelto') {
        messageInputArea.classList.add('hidden');
    } else {
        messageInputArea.classList.remove('hidden');
    }
}

function renderMessages(messages, status) {
    const chatEl = document.getElementById('chat-messages');
    
    if (messages.length === 0) {
        chatEl.innerHTML = `
            <div class="flex justify-center">
                <span class="text-xs font-medium text-neutral-600 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    Ticket creado
                </span>
            </div>
        `;
        return;
    }

    // Agrupar por fecha
    const messagesByDate = {};
    messages.forEach(msg => {
        const date = formatDate(msg.created_at);
        if (!messagesByDate[date]) {
            messagesByDate[date] = [];
        }
        messagesByDate[date].push(msg);
    });

    let messagesHTML = Object.entries(messagesByDate).map(([date, msgs]) => {
        return `
            <div class="flex justify-center">
                <span class="text-xs font-medium text-neutral-600 bg-white/5 border border-white/10 px-3 py-1 rounded-full">${date}</span>
            </div>
            ${msgs.map(msg => renderMessage(msg)).join('')}
        `;
    }).join('');

    // Agregar mensaje de ticket resuelto al final
    if (status === 'resuelto') {
        messagesHTML += `
            <div class="flex justify-center mt-6">
                <span class="text-xs font-medium text-neutral-500 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                    Este ticket está resuelto y no puede recibir más mensajes
                </span>
            </div>
        `;
    }

    chatEl.innerHTML = messagesHTML;

    // Scroll al final
    chatEl.scrollTop = chatEl.scrollHeight;
}

function renderMessage(message) {
    const time = formatTime(message.created_at);
    
    if (message.is_admin) {
        // Mensaje de soporte
        return `
            <div class="flex gap-4">
                <div class="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-400/50 ring-1 ring-emerald-400/20 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    T
                </div>
                <div class="flex flex-col items-start gap-1 max-w-[85%] sm:max-w-[75%]">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-xs font-medium text-white tracking-tight">TARDO Soporte</span>
                        <span class="text-xs text-neutral-600">${time}</span>
                    </div>
                    <div class="bg-white/10 border border-white/10 text-neutral-200 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed">
                        ${escapeHtml(message.message).replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Mensaje del usuario
        return `
            <div class="flex gap-4 flex-row-reverse">
                <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-600 border border-neutral-500/30 flex-shrink-0 flex items-center justify-center text-xs text-white font-medium shadow-sm">
                    <iconify-icon icon="solar:user-linear" width="18"></iconify-icon>
                </div>
                <div class="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%]">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-xs font-medium text-neutral-400">Tú</span>
                        <span class="text-xs text-neutral-600">${time}</span>
                    </div>
                    <div class="bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 rounded-2xl rounded-tr-sm p-4 text-sm">
                        ${escapeHtml(message.message).replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;
    }
}

// ========================================
// Enviar Mensaje
// ========================================

async function sendMessage() {
    if (!currentTicketId) return;

    const input = document.getElementById('message-input');
    const content = input.value.trim();

    if (!content) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/tickets/${currentTicketId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: content })
        });

        if (!response.ok) {
            throw new Error('Error enviando mensaje');
        }

        input.value = '';
        input.style.height = 'auto';
        
        // Recargar ticket para ver el nuevo mensaje
        selectTicket(currentTicketId);

    } catch (error) {
        console.error('Error:', error);
        showToast('Error al enviar mensaje', 'error');
    }
}

function handleMessageKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// ========================================
// Crear Ticket
// ========================================

function openCreateTicketModal() {
    document.getElementById('create-ticket-modal').classList.remove('hidden');
    document.getElementById('ticket-subject-input').focus();
}

function closeCreateTicketModal() {
    document.getElementById('create-ticket-modal').classList.add('hidden');
    document.getElementById('create-ticket-form').reset();
}

document.getElementById('create-ticket-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const subject = document.getElementById('ticket-subject-input').value.trim();
    const category = document.getElementById('ticket-category-input').value;
    const priority = document.getElementById('ticket-priority-input').value;
    const description = document.getElementById('ticket-description-input').value.trim();

    if (!subject || !description) {
        showToast('Completá todos los campos requeridos', 'error');
        return;
    }

    const btnText = document.getElementById('create-ticket-btn-text');
    const btnLoading = document.getElementById('create-ticket-btn-loading');

    try {
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');

        const response = await fetch(`${API_BASE_URL}/api/user/tickets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject,
                category,
                priority,
                message: description
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || data.message || 'Error creando ticket');
        }

        const data = await response.json();
        
        closeCreateTicketModal();
        showToast('Ticket creado exitosamente', 'success');
        
        // Recargar tickets y seleccionar el nuevo
        await loadTickets();
        selectTicket(data.ticket_id);

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
    } finally {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
});

// ========================================
// Filtros
// ========================================

function toggleFilters() {
    const filtersEl = document.getElementById('filters-section');
    filtersEl.classList.toggle('hidden');
}

async function applyFilters() {
    // Por ahora solo filtramos localmente
    // En el futuro se puede agregar filtrado en el servidor
    await loadTickets();
}

// ========================================
// Utilidades
// ========================================

function getStatusInfo(status) {
    const statusMap = {
        'abierto': {
            label: 'Abierto',
            textClass: 'text-blue-400'
        },
        'en_progreso': {
            label: 'En Progreso',
            textClass: 'text-emerald-400'
        },
        'resuelto': {
            label: 'Resuelto',
            textClass: 'text-neutral-500'
        }
    };
    return statusMap[status] || statusMap['abierto'];
}

function getPriorityInfo(priority) {
    const priorityMap = {
        'baja': {
            label: 'Baja',
            textClass: 'text-neutral-500',
            icon: 'solar:arrow-down-circle-linear'
        },
        'normal': {
            label: 'Normal',
            textClass: 'text-neutral-500',
            icon: 'solar:minus-circle-linear'
        },
        'alta': {
            label: 'Alta',
            textClass: 'text-neutral-500',
            icon: 'solar:flame-linear'
        }
    };
    return priorityMap[priority] || priorityMap['normal'];
}

function getCategoryLabel(category) {
    const categoryMap = {
        'tecnico': 'Problema técnico',
        'pagos': 'Cargar y retirar de Binance',
        'cuenta': 'Cuenta y verificacion Binance',
        'trading': 'Estrategia / Trading',
        'otro': 'Otro'
    };
    return categoryMap[category] || category;
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    } else if (days > 0) {
        return days === 1 ? 'Ayer' : `Hace ${days} días`;
    } else if (hours > 0) {
        return `Hace ${hours}h`;
    } else if (minutes > 0) {
        return `Hace ${minutes}m`;
    } else {
        return 'Ahora';
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const messageEl = document.getElementById('toast-message');

    messageEl.textContent = message;
    
    if (type === 'error') {
        icon.setAttribute('icon', 'solar:close-circle-linear');
        toast.classList.add('bg-red-500/20', 'border-red-500/30');
        toast.classList.remove('bg-white/10', 'border-white/20');
    } else {
        icon.setAttribute('icon', 'solar:check-circle-linear');
        toast.classList.add('bg-white/10', 'border-white/20');
        toast.classList.remove('bg-red-500/20', 'border-red-500/30');
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function attachFile() {
    showToast('Adjuntar archivos estará disponible próximamente', 'error');
}

function closeTicket() {
    showToast('Cerrar ticket estará disponible próximamente', 'error');
}

// ========================================
// Auto-resize textarea
// ========================================

const textarea = document.getElementById('message-input');
if (textarea) {
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}
