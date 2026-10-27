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

// Solicita el correo de recuperación. La respuesta del backend es
// SIEMPRE genérica (no revela si la cuenta existe).
async function solicitarRecuperacion(correo) {
    const respuesta = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al solicitar la recuperación.');
    }

    return resultado;
}

// Restablece la contraseña usando el token del enlace del correo.
// El backend informa claramente si el enlace expiró o ya se usó.
async function restablecerContrasena(token, contrasena, confirmacion) {
    const respuesta = await fetch('/api/auth/restablecer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, contrasena, confirmacion })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al restablecer la contraseña.');
    }

    return resultado;
}

export { iniciarSesion, registrarUsuario, solicitarRecuperacion, restablecerContrasena };