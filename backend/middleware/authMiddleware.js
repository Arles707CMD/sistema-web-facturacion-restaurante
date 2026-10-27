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

// ===========================================
// RATE LIMIT DE RECUPERACIÓN DE CONTRASEÑA
// En memoria, igual que el del login (adecuado para
// un solo servidor; para varias instancias, Redis).
// ===========================================

const MAX_SOLICITUDES_RECUPERACION = 3;
const VENTANA_RECUPERACION_MS = 15 * 60 * 1000;
const solicitudesRecuperacion = new Map();

// Clave por IP + token (para el endpoint de restablecer).
function claveRestablecer(req) {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'local';
    const token =
        req.body && req.body.token ? String(req.body.token).slice(0, 12) : '';

    return ip + '|' + token;
}

// Registra una solicitud de recuperación (cada envío cuenta).
function registrarSolicitudRecuperacion(key) {
    const ahora = Date.now();
    const actual = solicitudesRecuperacion.get(key);

    if (!actual || ahora - actual.primero > VENTANA_RECUPERACION_MS) {
        solicitudesRecuperacion.set(key, { count: 1, primero: ahora });
    } else {
        actual.count += 1;
    }
}

// Registra un intento fallido de restablecer (token inválido, etc.).
function registrarIntentoRestablecer(key) {
    registrarSolicitudRecuperacion(key);
}

// Rate limit de "recuperar": 3 solicitudes por IP + correo / 15 min.
function rateLimitRecuperacion(req, res, next) {
    const key = claveIntento(req);
    const actual = solicitudesRecuperacion.get(key);

    if (actual && actual.count >= MAX_SOLICITUDES_RECUPERACION) {
        if (Date.now() - actual.primero <= VENTANA_RECUPERACION_MS) {
            return res.status(429).json({
                mensaje:
                    'Demasiadas solicitudes de recuperación. ' +
                    'Espera unos minutos e inténtalo de nuevo.'
            });
        }

        solicitudesRecuperacion.delete(key);
    }

    next();
}

// Rate limit de "restablecer": bloquea abuso con tokens inválidos.
function rateLimitRestablecer(req, res, next) {
    const key = claveRestablecer(req);
    const actual = solicitudesRecuperacion.get(key);

    if (actual && actual.count >= MAX_SOLICITUDES_RECUPERACION * 3) {
        if (Date.now() - actual.primero <= VENTANA_RECUPERACION_MS) {
            return res.status(429).json({
                mensaje: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
            });
        }

        solicitudesRecuperacion.delete(key);
    }

    next();
}

module.exports = {
    claveIntento,
    claveRestablecer,
    noCache,
    seguridadHeaders,
    autenticar,
    autorizarRol,
    registrarIntentoFallido,
    limpiarIntentos,
    rateLimitLogin,
    registrarSolicitudRecuperacion,
    registrarIntentoRestablecer,
    rateLimitRecuperacion,
    rateLimitRestablecer
};