const recuperacionService = require('../services/recuperacionService');
const { responderError } = require('../services/errors');
const {
    claveIntento,
    claveRestablecer,
    registrarSolicitudRecuperacion,
    registrarIntentoRestablecer
} = require('../middleware/authMiddleware');

// ===========================================
// CONTROLADOR DE RECUPERACIÓN DE CONTRASEÑA
// POST /api/auth/recuperar  → solicita el enlace
// POST /api/auth/restablecer → consume el enlace
// Las respuestas de "recuperar" son SIEMPRE genéricas
// para no revelar si una cuenta existe.
// ===========================================

// POST /api/auth/recuperar
async function solicitarRecuperacion(req, res) {
    // Cada solicitud cuenta para el rate limit por IP + correo.
    registrarSolicitudRecuperacion(claveIntento(req));

    try {
        await recuperacionService.solicitarRecuperacion((req.body || {}).correo);

        // Respuesta genérica idéntica exista o no la cuenta.
        return res.json({
            mensaje:
                'Si el correo está registrado, recibirás un enlace ' +
                'para restablecer tu contraseña.'
        });
    } catch (error) {
        if (responderError(res, error)) return;

        console.error('Error al solicitar la recuperación:', error.message);

        res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
    }
}

// POST /api/auth/restablecer
async function restablecerContrasena(req, res) {
    try {
        await recuperacionService.restablecerContrasena(req.body || {});

        return res.json({
            mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.'
        });
    } catch (error) {
        // Los fallos (token inválido/expirado/usado) cuentan para el
        // rate limit por IP + token.
        registrarIntentoRestablecer(claveRestablecer(req));

        if (responderError(res, error)) return;

        console.error('Error al restablecer la contraseña:', error.message);

        res.status(500).json({ mensaje: 'Error al restablecer la contraseña.' });
    }
}

module.exports = {
    solicitarRecuperacion,
    restablecerContrasena
};
