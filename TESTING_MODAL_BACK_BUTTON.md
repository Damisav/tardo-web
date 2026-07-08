# Guía de Testing: Botón Atrás en Modales

Esta guía te ayudará a verificar que el botón Atrás del navegador (especialmente en móvil) ahora cierra los modales correctamente en lugar de navegar a la página anterior.

## Configuración de Testing

### Opción 1: DevTools Modo Móvil (Recomendado)
1. Abre Chrome DevTools (F12)
2. Activa el modo de dispositivo móvil (Ctrl+Shift+M o icono de dispositivos)
3. Selecciona un dispositivo móvil (ej: iPhone 14, Samsung Galaxy S21)

### Opción 2: Dispositivo Móvil Real
1. Abre el sitio en tu teléfono
2. Usa el navegador Chrome, Safari o Firefox

## Plan de Pruebas

### ✅ Test 1: Lightbox de Imágenes (`index.html`)
1. Navega a `index.html`
2. Haz scroll hasta la galería de resultados (imágenes PNL)
3. Haz clic en una imagen para abrir el lightbox
4. **Presiona el botón Atrás del navegador**
5. ✔️ **Resultado esperado:** El lightbox se cierra, sigues en `index.html`
6. ❌ **Error:** Si navegas a la página anterior, el fix no funcionó

### ✅ Test 2: Modal de Login (`index.html`)
1. Navega a `index.html`
2. Haz clic en "Iniciar Sesión" (navbar o menú móvil)
3. **Presiona el botón Atrás**
4. ✔️ **Resultado esperado:** El modal de login se cierra
5. **Verifica también:**
   - El botón X cierra el modal ✓
   - La tecla Escape cierra el modal ✓
   - Click fuera del modal lo cierra ✓

### ✅ Test 3: Login → "Olvidé mi contraseña" → Atrás
1. Abre el modal de login
2. Haz clic en "¿Olvidaste tu contraseña?"
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** El modal se cierra completamente (v1, comportamiento simple)
5. **Nota:** NO vuelve a la vista de login, cierra todo directamente

### ✅ Test 4: Login → "Regístrate aquí" → Atrás
1. Abre el modal de login
2. Haz clic en "Regístrate aquí" (abajo del formulario)
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** Se cierra el modal de registro (un solo paso en historial)
5. **Verifica:** El cambio de login → registro usó `replace`, no creó entrada extra

### ✅ Test 5: Registro → "Inicia sesión" → Atrás
1. Abre el modal de registro
2. Haz clic en "Inicia sesión" (abajo del formulario)
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** Se cierra el modal de login

### ✅ Test 6: Modal de Checkout (`index.html`)
1. Navega a la sección de planes
2. Haz clic en "Suscribirse" en cualquier plan
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** El modal de checkout se cierra

### ✅ Test 7: Checkout → Confirmar → Pago → Atrás
1. Abre el modal de checkout (plan Premium, por ejemplo)
2. Llena los datos y haz clic en "Confirmar compra"
3. Se abre el modal de pago
4. **Presiona Atrás**
5. ✔️ **Resultado esperado:** El modal de pago se cierra, NO vuelves al checkout
6. **Verifica:** Solo un paso de historial (usó `replace` en la transición)

### ✅ Test 8: Pago → "Ya realicé el pago" → Éxito → Atrás
1. Completa el flujo hasta el modal de pago
2. Ingresa un TX ID de prueba (cualquier texto largo)
3. Haz clic en "Ya realicé el pago"
4. Se muestra el modal de éxito
5. **Presiona Atrás**
6. ✔️ **Resultado esperado:** El modal de éxito se cierra

### ✅ Test 9: Menú Hamburguesa Móvil (`index.html`)
1. En vista móvil, haz clic en el icono de menú (tres líneas)
2. Se abre el menú lateral
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** El menú se cierra
5. **Verifica también:** Click en el overlay cierra el menú ✓

### ✅ Test 10: Menú Móvil → Login
1. Abre el menú móvil
2. Haz clic en "Iniciar Sesión" dentro del menú
3. **Observa:** El menú se cierra automáticamente y abre login
4. **Presiona Atrás**
5. ✔️ **Resultado esperado:** El modal de login se cierra
6. **Verifica:** NO queda una entrada huérfana del menú en el historial

### ✅ Test 11: Modal de Login en `descargas.html`
1. Navega a `descargas.html`
2. Haz clic en "Iniciar Sesión" (navbar)
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** El modal se cierra, sigues en `descargas.html`

### ✅ Test 12: Modal de Login en `terminos.html`
1. Navega a `terminos.html`
2. Haz clic en "Iniciar Sesión" (navbar)
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** El modal se cierra, sigues en `terminos.html`

### ✅ Test 13: Modal Cambiar Contraseña (`user_panel/dashboard.html`)
1. Inicia sesión (necesitas cuenta de prueba)
2. Navega a `user_panel/dashboard.html`
3. En la pestaña "Perfil", haz clic en "Cambiar Contraseña"
4. **Presiona Atrás**
5. ✔️ **Resultado esperado:** El modal se cierra
6. **Verifica también:** X y Escape funcionan ✓

### ✅ Test 14: Navegación Normal sin Modales
1. Navega: `index.html` → `descargas.html` → `terminos.html`
2. **Presiona Atrás varias veces**
3. ✔️ **Resultado esperado:** Navegas atrás por las páginas normalmente
4. **Verifica:** El historial de páginas NO se ve afectado por el fix

### ✅ Test 15: Múltiples Modales en Cadena
1. Abre el modal de checkout
2. Confirma y pasa al modal de pago
3. Confirma pago y pasa al modal de éxito
4. **Presiona Atrás 1 vez:** Cierra éxito
5. **Si vuelves a abrir checkout → pago, presiona Atrás:** Solo cierra el actual
6. ✔️ **Resultado esperado:** Solo el modal activo se cierra cada vez

## Casos Edge a Verificar

### 🔍 Edge Case 1: Recargar Página con Modal Abierto
1. Abre cualquier modal
2. Recarga la página (F5)
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** Navegas a la página anterior (comportamiento normal del navegador)

### 🔍 Edge Case 2: Abrir/Cerrar Rápido
1. Abre un modal
2. Cierra con X o Escape inmediatamente
3. **Presiona Atrás**
4. ✔️ **Resultado esperado:** Navegas a la página anterior (no hay entrada en historial porque cerraste el modal con X)

### 🔍 Edge Case 3: Dos Ventanas/Pestañas
1. Abre el sitio en dos pestañas
2. En pestaña A: abre un modal
3. En pestaña B: navega normalmente
4. **Presiona Atrás en cada una**
5. ✔️ **Resultado esperado:** Cada pestaña maneja su historial independientemente

## Checklist Final

- [ ] Test 1: Lightbox
- [ ] Test 2: Modal Login
- [ ] Test 3: Login → Forgot Password → Atrás
- [ ] Test 4: Login → Registro → Atrás
- [ ] Test 5: Registro → Login → Atrás
- [ ] Test 6: Checkout
- [ ] Test 7: Checkout → Pago → Atrás
- [ ] Test 8: Pago → Éxito → Atrás
- [ ] Test 9: Menú móvil
- [ ] Test 10: Menú → Login (sin entrada huérfana)
- [ ] Test 11: Login en descargas.html
- [ ] Test 12: Login en terminos.html
- [ ] Test 13: Cambiar contraseña en dashboard
- [ ] Test 14: Navegación normal sin modales
- [ ] Test 15: Múltiples modales en cadena
- [ ] Edge Case 1: Recargar página
- [ ] Edge Case 2: Abrir/cerrar rápido
- [ ] Edge Case 3: Múltiples pestañas

## Debugging

Si encuentras un problema:

1. **Abre la consola del navegador** (F12 → Console)
2. **Verifica errores de JavaScript**
3. **Comprueba que `modal-history.js` se cargó:** `console.log(window.ModalHistory)`
4. **Comprueba el stack interno:** Abre un modal, luego en consola: `window.ModalHistory` (debería tener métodos `push`, `close`, `replace`)

### Errores Comunes

| Problema | Posible Causa |
|----------|---------------|
| Atrás navega a página anterior en lugar de cerrar modal | `modal-history.js` no se cargó o se cargó después de otros scripts |
| Modal se cierra pero luego vuelve a abrirse | Loop infinito en `close()`, revisar flag `closingFromHistory` |
| Checkout → Pago → Atrás vuelve a checkout | Se usó `push` en lugar de `replace` en `submitOrder()` |
| Menú móvil + Login crea doble entrada | `removeSilent` no se llamó al abrir login desde menú |

## Notas Técnicas

- **Archivos modificados:** `modal-history.js`, `auth.js`, `main.js`, `components.js`, `index.html`, `descargas.html`, `terminos.html`, `dashboard.html`, `modals.html`
- **API central:** `window.ModalHistory` con `push()`, `close()`, `replace()`, `removeSilent()`
- **Patrón usado:** History API (`pushState`, `popstate`, `replaceState`)
- **Compatibilidad:** Todos los navegadores modernos (Chrome, Firefox, Safari, Edge)
