const crypto = require('crypto');

const { ErrorServicio } = require('./errors');
const { generarHashContrasena } = require('./passwordService');
const usuarioModel = require('../models/usuarioModel');
const tokenRecuperacionModel = require('../models/tokenRecuperacionModel');
const { ErrorCorreo, enviarCorreoRecuperacion } = require('./correoService');

// ===========================================
// SERVICIO DE RECUPERACIÓN DE CONTRASEÑA
// Genera un token aleatorio criptográficamente
// seguro, guarda en la base de datos ÚNICAMENTE
// su hash SHA-256 (nunca el token en claro), con
// caducidad de 15 minutos y uso único. La nueva
// contraseña se guarda con el mecanismo de hash
// existente del proyecto (passwordService, scrypt).
// ===========================================

const MINUTOS_EXPIRACION = 15;
const MAX_TOKENS_POR_HORA = 5;

// Valida el formato básico de un correo electrónico.
function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// Calcula el hash SHA-256 del token (lo que se almacena).
function calcularHashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// ===========================================
// SOLICITAR RECUPERACIÓN
// La respuesta pública SIEMPRE es genérica: nunca
// se revela si la cuenta existe o no. El token nunca
// se devuelve en la respuesta ni se registra en logs.
// ===========================================
async function solicitarRecuperacion(correo) {
    if (!correo || typeof correo !== 'string' || !esCorreoValido(correo.trim())) {
        throw new ErrorServicio(400, 'El correo debe tener un formato válido.');
    }

    const correoNormalizado = correo.trim().toLowerCase();
    const usuario = await usuarioModel.obtenerUsuarioParaAutenticacion(correoNormalizado);

    // Cuenta inexistente: misma respuesta genérica que si existiera.
    if (!usuario) {
        return { enviado: false };
    }

    // Protección anti abuso: máximo de enlaces por usuario y hora.
    const recientes = await tokenRecuperacionModel.contarTokensRecientes(
        usuario.id_usuario,
        60
    );

    if (recientes >= MAX_TOKENS_POR_HORA) {
        console.error('Recuperación: se alcanzó el límite de solicitudes por usuario.');
        return { enviado: false };
    }

    // Token aleatorio de 256 bits. En la base de datos se guarda
    // únicamente su hash: un acceso a la tabla no permite usar
    // los enlaces.
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = calcularHashToken(token);
    const expiracion = new Date(Date.now() + MINUTOS_EXPIRACION * 60 * 1000);

    await tokenRecuperacionModel.crearToken({
        idUsuario: usuario.id_usuario,
        tokenHash,
        expiracion
    });

    const urlBase = process.env.APP_URL || 'http://localhost:5173';
    const enlace = `${urlBase}/restablecer?token=${token}`;

    try {
        await enviarCorreoRecuperacion(usuario.correo, enlace);
    } catch (error) {
        // Nunca se registran el token ni el destinatario del fallo.
        if (error instanceof ErrorCorreo) {
            console.error('Recuperación: SMTP sin configurar, el correo no se pudo enviar.');
        } else {
            console.error('Recuperación: error al enviar el correo de recuperación.');
        }

        return { enviado: false };
    }

    return { enviado: true };
}

// ===========================================
// RESTABLECER CONTRASEÑA
// Consume el token (un solo uso) y guarda la nueva
// contraseña con el hash scrypt existente. Los
// mensajes diferencian claramente: enlace inválido,
// ya utilizado o expirado.
// ===========================================
async function restablecerContrasena({ token, contrasena, confirmacion }) {
    if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new ErrorServicio(400, 'El enlace de recuperación no es válido.');
    }

    if (!contrasena || typeof contrasena !== 'string' || contrasena.length < 6) {
        throw new ErrorServicio(400, 'La contraseña debe tener al menos 6 caracteres.');
    }

    if (contrasena !== confirmacion) {
        throw new ErrorServicio(400, 'Las contraseñas no coinciden.');
    }

    const registro = await tokenRecuperacionModel.obtenerTokenPorHash(
        calcularHashToken(token.trim())
    );

    if (!registro || registro.usado) {
        throw new ErrorServicio(
            400,
            'El enlace de recuperación no es válido o ya fue utilizado. Solicita uno nuevo.'
        );
    }

    if (new Date(registro.expiracion).getTime() < Date.now()) {
        throw new ErrorServicio(
            400,
            'El enlace ha expirado (caduca a los 15 minutos). Solicita uno nuevo.'
        );
    }

    const usuario = await usuarioModel.obtenerUsuarioPorId(registro.id_usuario);

    if (!usuario || usuario.estado !== 'Activo') {
        throw new ErrorServicio(
            400,
            'No se puede restablecer la contraseña de esta cuenta.'
        );
    }

    // Guarda la nueva contraseña con el mecanismo existente (scrypt).
    await usuarioModel.actualizarUsuario(usuario.id_usuario, {
        nombre: usuario.nombre,
        correo: usuario.correo,
        contrasenaHash: generarHashContrasena(contrasena),
        rol: usuario.rol,
        estado: usuario.estado
    });

    // Invalida el token: solo puede usarse una vez.
    await tokenRecuperacionModel.marcarTokenUsado(registro.id_token);

    return true;
}

module.exports = {
    solicitarRecuperacion,
    restablecerContrasena
};
