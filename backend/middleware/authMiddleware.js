// ===========================================
// MIDDLEWARES DE SEGURIDAD Y AUTORIZACIÓN
// - Cabeceras de caché (no-cache)
// - Cabeceras de seguridad básicas
// - Autenticación con JWT (Bearer)
// - Autorización por roles (RBAC)
// - Rate limiting del login
// ===========================================

const jwt = require('jsonwebtoken');

const MAX_INTENTOS_LOGIN = 5;
const VENTANA_LOGIN_MS = 15 * 60 * 1000;
const intentosFallidos = new Map();

// Clave única por IP + correo.
function claveIntento(req) {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'local';
    const correo =
        req.body && req.body.correo
            ? String(req.body.correo).trim().toLowerCase()
            : '';

    return ip + '|' + correo;
}

// Cabeceras anti-caché en todas las respuestas de la API.
function noCache(req, res, next) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
}

// Cabeceras de seguridad básicas (compatibles con React/Vite).
function seguridadHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
}

// Autenticación JWT: valida el token Bearer y adjunta req.usuario.
function autenticar(req, res, next) {
    const cabecera = req.headers.authorization || '';

    if (!cabecera.startsWith('Bearer ')) {
        return res.status(401).json({
            mensaje: 'No se proporcionó un token de autenticación.'
        });
    }

    const token = cabecera.slice('Bearer '.length).trim();
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        return res.status(500).json({
            mensaje: 'JWT_SECRET no configurado en el servidor.'
        });
    }

    try {
        const payload = jwt.verify(token, secreto);
        req.usuario = { id_usuario: payload.id_usuario, rol: payload.rol };
        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: 'El token no es válido o ha expirado.'
        });
    }
}

// Autorización por roles. Uso: autorizarRol('Administrador', 'Inventario').
function autorizarRol(...rolesPermitidos) {
    return function (req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({ mensaje: 'No autenticado.' });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: 'No tiene permisos para realizar esta operación.'
            });
        }

        next();
    };
}

// Registra un intento de login fallido (por IP + correo).
function registrarIntentoFallido(key) {
    const ahora = Date.now();
    const actual = intentosFallidos.get(key);

    if (!actual || ahora - actual.primero > VENTANA_LOGIN_MS) {
        intentosFallidos.set(key, { count: 1, primero: ahora });
    } else {
        actual.count += 1;
    }
}

// Reinicia los intentos de una clave (login correcto).
function limpiarIntentos(key) {
    intentosFallidos.delete(key);
}

// Rate limit del login: bloquea tras 5 intentos fallidos en 15 minutos.
function rateLimitLogin(req, res, next) {
    const key = claveIntento(req);
    const actual = intentosFallidos.get(key);

    if (actual && actual.count >= MAX_INTENTOS_LOGIN) {
        if (Date.now() - actual.primero <= VENTANA_LOGIN_MS) {
            return res.status(429).json({
                mensaje: 'Demasiados intentos de inicio de sesión. Inténtalo más tarde.'
            });
        }

        intentosFallidos.delete(key);
    }

    next();
}

module.exports = {
    claveIntento,
    noCache,
    seguridadHeaders,
    autenticar,
    autorizarRol,
    registrarIntentoFallido,
    limpiarIntentos,
    rateLimitLogin
};