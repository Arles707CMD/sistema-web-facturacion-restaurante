const express = require('express');

const { login, registro } = require('../controllers/authController');
const {
    solicitarRecuperacion,
    restablecerContrasena
} = require('../controllers/recuperacionController');
const {
    rateLimitLogin,
    rateLimitRecuperacion,
    rateLimitRestablecer
} = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/login (con rate limit: 5 intentos fallidos / 15 min).
// Acepta "recordarme" para usar la expiración de sesión persistente.
router.post('/login', rateLimitLogin, login);
router.post('/register', registro);

// POST /api/auth/recuperar (rate limit: 3 solicitudes / 15 min).
// Respuesta pública genérica: no revela si la cuenta existe.
router.post('/recuperar', rateLimitRecuperacion, solicitarRecuperacion);

// POST /api/auth/restablecer (consume el token del correo).
router.post('/restablecer', rateLimitRestablecer, restablecerContrasena);

module.exports = router;