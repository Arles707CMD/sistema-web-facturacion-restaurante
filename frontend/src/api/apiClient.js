// ===========================================
// CLIENTE HTTP COMPARTIDO (apiClient)
// Envuelve fetch para añadir automáticamente el
// token JWT de la sesión en el encabezado
// Authorization y redirige a /login cuando el
// token no es válido o ha expirado (HTTP 401).
// ===========================================

const CLAVE_SESION = 'sesionBaluarte';

// Lee la sesión guardada en localStorage.
function obtenerSesion() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_SESION)) || null;
    } catch (error) {
        return null;
    }
}

// Limpia la sesión (útil en token vencido o al cerrar sesión).
function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    localStorage.removeItem('recordarCorreo');
}

// fetch con autenticación: añade el Bearer token,
// fuerza Content-Type JSON y redirige a /login en 401.
async function apiFetch(ruta, opciones = {}) {
    const sesion = obtenerSesion();
    const headers = { ...(opciones.headers || {}) };

    if (sesion && sesion.token) {
        headers['Authorization'] = 'Bearer ' + sesion.token;
    }

    const respuesta = await fetch(ruta, { ...opciones, headers });

    if (respuesta.status === 401) {
        // El token no es válido o expiró: se limpia la sesión y se vuelve al login.
        cerrarSesion();

        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }

        throw new Error('La sesión ha expirado. Vuelve a iniciar sesión.');
    }

    return respuesta;
}

export { apiFetch, obtenerSesion, cerrarSesion };