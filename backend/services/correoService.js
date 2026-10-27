const https = require('https');

// ===========================================
// SERVICIO DE CORREO (API HTTPS DE BREVO)
// Envía el enlace de recuperación mediante la
// API oficial POST https://api.brevo.com/v3/smtp/email
// usando SOLO el módulo nativo https de Node.js
// (sin dependencias nuevas; Render gratuito
// bloquea el SMTP saliente, por lo que se dejó
// de usar SMTP/nodemailer).
// Configuración por variables de entorno:
//   BREVO_API_KEY, BREVO_FROM_EMAIL,
//   BREVO_FROM_NAME y APP_URL (enlace).
// Nunca se registran la clave API, el
// destinatario, el token ni el enlace en logs.
// ===========================================

// Tiempo máximo de espera de la petición HTTP (ms).
const TIEMPO_ESPERA_MS = 10000;

// Error de dominio del servicio de correo. "detalle"
// solo contiene datos no sensibles (estado HTTP,
// código de Brevo, error de red).
class ErrorCorreo extends Error {
    constructor(codigo, mensaje, detalle = null) {
        super(mensaje);
        this.codigo = codigo;
        this.detalle = detalle || {};
    }
}

// Indica si la configuración de Brevo está completa.
function estaConfigurado() {
    return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL);
}

// Cuerpo en texto plano del correo de recuperación.
function crearTextContent(enlace) {
    return (
        'Hola:\n\n' +
        'Recibimos una solicitud para restablecer la contraseña de tu cuenta.\n\n' +
        'Abre el siguiente enlace para elegir una contraseña nueva ' +
        '(caduca en 15 minutos y solo puede usarse una vez):\n\n' +
        enlace + '\n\n' +
        'Si no solicitaste este cambio, puedes ignorar este mensaje.\n\n' +
        '— Restaurante Baluarte'
    );
}

// Cuerpo en HTML del correo de recuperación.
function crearHtmlContent(enlace) {
    return (
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
    );
}

// Construye la petición HTTP a Brevo (función pura,
// reutilizable en pruebas sin enviar nada).
function construirSolicitudBrevo({ destino, enlace }) {
    const cuerpo = JSON.stringify({
        sender: {
            email: process.env.BREVO_FROM_EMAIL,
            name: process.env.BREVO_FROM_NAME || 'Restaurante Baluarte'
        },
        to: [{ email: destino }],
        subject: 'Restablecer tu contraseña - Restaurante Baluarte',
        textContent: crearTextContent(enlace),
        htmlContent: crearHtmlContent(enlace)
    });

    const opciones = {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(cuerpo)
        }
    };

    return { opciones, cuerpo };
}

// Realiza la petición HTTPS con límite de tiempo.
// Devuelve { estado, cuerpo } o rechaza con el error de red.
function realizarSolicitudHttps(opciones, cuerpo) {
    return new Promise((resolver, rechazar) => {
        const peticion = https.request(opciones, (respuesta) => {
            let datos = '';

            respuesta.setEncoding('utf8');
            respuesta.on('data', (fragmento) => {
                datos += fragmento;
            });
            respuesta.on('end', () => {
                resolver({ estado: respuesta.statusCode, cuerpo: datos });
            });
        });

        // Límite de tiempo: destruye la petición (el evento
        // "error" rechaza la promesa con TIEMPO_EXCEDIDO).
        peticion.setTimeout(TIEMPO_ESPERA_MS, () => {
            peticion.destroy(new Error('TIEMPO_EXCEDIDO'));
        });

        peticion.on('error', rechazar);

        peticion.write(cuerpo);
        peticion.end();
    });
}

// Clasifica el estado HTTP de error de Brevo en un código de
// dominio interno. Los mensajes son SOLO para el log; el
// usuario siempre recibe un mensaje genérico.
function clasificarEstadoBrevo(estado) {
    if (estado === 400) {
        return ['BREVO_SOLICITUD_INVALIDA', 'Brevo rechazó la solicitud (p. ej. remitente no verificado o datos inválidos).'];
    }
    if (estado === 401) {
        return ['BREVO_NO_AUTORIZADO', 'La clave API de Brevo no es válida.'];
    }
    if (estado === 403) {
        return ['BREVO_SIN_PERMISOS', 'La clave API de Brevo no tiene permisos para enviar correos.'];
    }
    if (estado === 404) {
        return ['BREVO_RUTA_INVALIDA', 'La ruta de la API de Brevo no existe.'];
    }
    if (estado === 429) {
        return ['BREVO_LIMITE_ALCANZADO', 'Se alcanzó el límite de envíos de Brevo.'];
    }
    if (estado >= 500) {
        return ['BREVO_ERROR_SERVIDOR', 'La API de Brevo devolvió un error del servidor.'];
    }
    return ['BREVO_ERROR_HTTP', `La API de Brevo devolvió el estado ${estado}.`];
}

// Envía el correo con el enlace de recuperación mediante la API
// HTTPS de Brevo. El enlace viaja en el cuerpo del mensaje; nunca
// se registra. El tercer parámetro permite inyectar la función de
// red en las pruebas (por defecto usa https nativo).
async function enviarCorreoRecuperacion(
    destinatario,
    enlace,
    realizarSolicitud = realizarSolicitudHttps
) {
    if (!estaConfigurado()) {
        throw new ErrorCorreo(
            'CORREO_NO_CONFIGURADO',
            'El envío por Brevo no está configurado (BREVO_API_KEY y BREVO_FROM_EMAIL).'
        );
    }

    const { opciones, cuerpo } = construirSolicitudBrevo({
        destino: destinatario,
        enlace
    });

    let respuesta;

    try {
        respuesta = await realizarSolicitud(opciones, cuerpo);
    } catch (error) {
        const descripcion = String((error && (error.code || error.message)) || '');

        if (descripcion === 'TIEMPO_EXCEDIDO') {
            throw new ErrorCorreo(
                'BREVO_TIEMPO_EXCEDIDO',
                'La petición a Brevo superó el tiempo de espera.'
            );
        }

        throw new ErrorCorreo(
            'BREVO_FALLO_RED',
            'No se pudo conectar con la API de Brevo.',
            { errorRed: descripcion }
        );
    }

    // Estados 2xx: envío aceptado por Brevo.
    if (respuesta.estado >= 200 && respuesta.estado < 300) {
        return true;
    }

    // Error de la API: extrae el código y mensaje de Brevo del
    // cuerpo de la respuesta (si es JSON).
    let codigoBrevo = '';
    let textoBrevo = '';

    try {
        const analizado = JSON.parse(respuesta.cuerpo || '{}');

        codigoBrevo = String(analizado.code || '');
        textoBrevo = String(analizado.message || '');
    } catch {
        // Cuerpo no JSON: se queda vacío.
    }

    const [codigo, mensaje] = clasificarEstadoBrevo(respuesta.estado);

    throw new ErrorCorreo(codigo, mensaje, {
        httpStatus: respuesta.estado,
        codigoBrevo,
        textoBrevo
    });
}

module.exports = {
    ErrorCorreo,
    estaConfigurado,
    construirSolicitudBrevo,
    clasificarEstadoBrevo,
    enviarCorreoRecuperacion
};
