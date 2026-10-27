// ===========================================
// CLIENTE HTTP COMPARTIDO (apiClient)
// Envuelve fetch para añadir automáticamente el
// token JWT de la sesión en el encabezado
// Authorization y redirige a /login cuando el
// token no es válido o ha expirado (HTTP 401).
//
// GESTIÓN DE LA SESIÓN ("Recordarme"):
// - Con "Recordarme": la sesión se guarda en
//   localStorage y sobrevive al cerrar el
//   navegador (duración TOKEN_EXPIRA_RECUERDA).
// - Sin "Recordarme": la sesión se guarda en
//   sessionStorage y se pierde al cerrar la
//   pestaña o el navegador (TOKEN_EXPIRA).
// Nunca se guarda la contraseña del usuario.
// ===========================================

const CLAVE_SESION = 'sesionBaluarte';
const CLAVE_PREFERENCIA = 'preferenciaSesionBaluarte';

// Lee la sesión guardada (sessionStorage o localStorage).
function obtenerSesion() {
    try {
        const datos =
            sessionStorage.getItem(CLAVE_SESION) ||
            localStorage.getItem(CLAVE_SESION);

        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        return null;
    }
}

// Guarda la sesión en el almacén correspondiente según la
// persistencia elegida. La sesión vive en UN solo almacén para
// evitar copias desincronizadas.
function guardarSesion(sesion, persistente) {
    const datos = JSON.stringify(sesion);

    sessionStorage.removeItem(CLAVE_SESION);
    localStorage.removeItem(CLAVE_SESION);

    if (persistente) {
        localStorage.setItem(CLAVE_SESION, datos);
        localStorage.setItem(CLAVE_PREFERENCIA, 'persistente');
    } else {
        sessionStorage.setItem(CLAVE_SESION, datos);
        localStorage.setItem(CLAVE_PREFERENCIA, 'sesion');
    }
}

// Limpia la sesión por completo (ambos almacenes) junto con la
// preferencia de persistencia. Útil con token vencido o al
// cerrar sesión manualmente. El correo de "Recordarme" (solo el
// correo, nunca la sesión ni la contraseña) se conserva para
// rellenar el login.
function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_SESION);
    localStorage.removeItem(CLAVE_SESION);
    localStorage.removeItem(CLAVE_PREFERENCIA);
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

export { apiFetch, obtenerSesion, guardarSesion, cerrarSesion };