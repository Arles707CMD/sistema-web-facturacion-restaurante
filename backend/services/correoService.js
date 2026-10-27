const nodemailer = require('nodemailer');

// ===========================================
// SERVICIO DE CORREO (SMTP)
// Envía el enlace de recuperación de contraseña.
// Toda la configuración vive en variables de entorno
// (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER,
// SMTP_PASSWORD, SMTP_FROM, APP_URL). Nunca se
// registran contraseñas ni tokens en los logs.
//
// IMPORTANTE: hasta que las variables SMTP no se configuren
// en el panel de Render, los correos reales NO se envían (el
// servicio lo detecta y lo informa; el resto del flujo sigue
// funcionando y queda documentado).
// ===========================================

// Error de dominio del servicio de correo.
class ErrorCorreo extends Error {
    constructor(codigo, mensaje) {
        super(mensaje);
        this.codigo = codigo;
    }
}

// Indica si la configuración SMTP está completa.
function estaConfigurado() {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD
    );
}

// Crea el transporte a partir de las variables de entorno.
function crearTransporte() {
    const puerto = Number(process.env.SMTP_PORT || 587);
    const seguro = process.env.SMTP_SECURE === 'true' || puerto === 465;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: puerto,
        secure: seguro,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
}

// Envía el correo con el enlace de recuperación.
// El enlace viaja en el cuerpo del mensaje; nunca se registra.
async function enviarCorreoRecuperacion(destinatario, enlace) {
    if (!estaConfigurado()) {
        throw new ErrorCorreo(
            'SMTP_NO_CONFIGURADO',
            'El servicio de correo no está configurado ' +
            '(SMTP_HOST, SMTP_USER y SMTP_PASSWORD).'
        );
    }

    const remitente = process.env.SMTP_FROM || process.env.SMTP_USER;
    const transporte = crearTransporte();

    await transporte.sendMail({
        from: remitente,
        to: destinatario,
        subject: 'Restablecer tu contraseña - Restaurante Baluarte',
        text:
            'Hola:\n\n' +
            'Recibimos una solicitud para restablecer la contraseña de tu cuenta.\n\n' +
            'Abre el siguiente enlace para elegir una contraseña nueva (caduca en 15 minutos y solo puede usarse una vez):\n\n' +
            enlace + '\n\n' +
            'Si no solicitaste este cambio, puedes ignorar este mensaje.\n\n' +
            '— Restaurante Baluarte',
        html:
            '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;">' +
            '<h2 style="color:#dc2626;">Restaurante Baluarte</h2>' +
            '<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>' +
            '<p>Abre el siguiente enlace para elegir una contraseña nueva ' +
            '(caduca en <strong>15 minutos</strong> y solo puede usarse <strong>una vez</strong>):</p>' +
            '<p style="text-align:center;margin:28px 0;">' +
            '<a href="' + enlace + '" style="background:#dc2626;color:#ffffff;padding:12px 24px;' +
            'border-radius:8px;text-decoration:none;font-weight:bold;">Restablecer contraseña</a></p>' +
            '<p style="font-size:12px;color:#6b7280;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>' +
            '</div>'
    });
}

module.exports = {
    ErrorCorreo,
    estaConfigurado,
    enviarCorreoRecuperacion
};
