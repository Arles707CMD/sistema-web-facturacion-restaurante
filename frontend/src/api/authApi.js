// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE AUTENTICACIÓN
// Utiliza el proxy de Vite (/api → localhost:3000).
// (fetch directo: login/registro/recuperación son
// públicos y no usan el token de la sesión).
// ===========================================

const API_URL = '/api/auth/login';

// Inicia sesión con correo y contraseña.
// "recordarme" (opcional) solicita al backend un token con la
// expiración de sesión persistente (TOKEN_EXPIRA_RECUERDA).
// Devuelve { mensaje, usuario, token, expiraEn } o lanza un Error.
async function iniciarSesion(correo, contrasena, recordarme = false) {
    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena, recordarme })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al iniciar sesión');
    }

    return resultado;
}

// Crea una cuenta nueva (registro).
async function registrarUsuario(nombre, correo, contrasena) {
    const respuesta = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, correo, contrasena })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al registrar el usuario');
    }

    return resultado;
}

// ===========================================
// LECTURA SEGURA DE RESPUESTAS HTTP
// Evita el error críptico "Unexpected end of
// JSON input" cuando el cuerpo está vacío o
// no es JSON (p. ej. HTML de un 404/502 del
// servidor mientras arranca o se redespliega).
// ===========================================

// Mensaje claro y seguro según el estado HTTP (sin detalles internos).
function mensajeErrorPorEstado(estado, mensajePorDefecto) {
    if (estado === 429) {
        return 'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.';
    }

    if (estado === 502 || estado === 503 || estado === 504) {
        return 'El servicio no está disponible en este momento. Inténtalo de nuevo en unos minutos.';
    }

    return mensajePorDefecto;
}

// Devuelve el JSON de la respuesta o null si el cuerpo está vacío
// o no es JSON válido. Nunca lanza "Unexpected end of JSON input".
async function leerRespuestaSegura(respuesta) {
    let texto = '';

    try {
        texto = await respuesta.text();
    } catch {
        return null;
    }

    if (!texto) {
        return null;
    }

    try {
        return JSON.parse(texto);
    } catch {
        return null;
    }
}

// Solicita el correo de recuperación. La respuesta del backend es
// SIEMPRE genérica (no revela si la cuenta existe).
async function solicitarRecuperacion(correo) {
    let respuesta;

    try {
        respuesta = await fetch('/api/auth/recuperar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo })
        });
    } catch {
        // Fallo de red al contactar el servidor.
        throw new Error(
            'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
        );
    }

    const resultado = await leerRespuestaSegura(respuesta);

    // Comprueba el estado HTTP ANTES de tratar la operación como exitosa.
    if (!respuesta.ok) {
        throw new Error(
            (resultado && resultado.mensaje) ||
            mensajeErrorPorEstado(respuesta.status, 'Error al solicitar la recuperación.')
        );
    }

    // Estado 2xx pero cuerpo vacío o no JSON: el servicio no está disponible.
    if (!resultado) {
        throw new Error(
            'El servicio no está disponible en este momento. Inténtalo de nuevo en unos minutos.'
        );
    }

    return resultado;
}

// Restablece la contraseña usando el token del enlace del correo.
// El backend informa claramente si el enlace expiró o ya se usó.
async function restablecerContrasena(token, contrasena, confirmacion) {
    let respuesta;

    try {
        respuesta = await fetch('/api/auth/restablecer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, contrasena, confirmacion })
        });
    } catch {
        // Fallo de red al contactar el servidor.
        throw new Error(
            'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
        );
    }

    const resultado = await leerRespuestaSegura(respuesta);

    // Comprueba el estado HTTP ANTES de tratar la operación como exitosa.
    if (!respuesta.ok) {
        throw new Error(
            (resultado && resultado.mensaje) ||
            mensajeErrorPorEstado(respuesta.status, 'Error al restablecer la contraseña.')
        );
    }

    // Estado 2xx pero cuerpo vacío o no JSON: el servicio no está disponible.
    if (!resultado) {
        throw new Error(
            'El servicio no está disponible en este momento. Inténtalo de nuevo en unos minutos.'
        );
    }

    return resultado;
}

export { iniciarSesion, registrarUsuario, solicitarRecuperacion, restablecerContrasena };