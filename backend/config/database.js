const mysql = require('mysql2/promise');
require('dotenv').config();

// ===========================================
// CONFIGURACIÓN TLS/SSL OPCIONAL PARA MYSQL
// - DB_SSL ausente o false: conexión local
//   actual (XAMPP/MariaDB) sin cambios.
// - DB_SSL=true: exige DB_CA_CERT_BASE64 con el
//   certificado CA del proveedor (p. ej. Aiven)
//   codificado en Base64. Se valida el servidor
//   con rejectUnauthorized: true (nunca se
//   deshabilita la validación del certificado).
// - Los errores solo mencionan nombres de
//   variables: nunca se registran contraseñas,
//   certificados ni secretos en los logs.
// ===========================================
function obtenerConfiguracionSsl() {
    const sslActivo = String(process.env.DB_SSL || '').trim().toLowerCase() === 'true';

    if (!sslActivo) {
        return null;
    }

    const certificadoBase64 = String(process.env.DB_CA_CERT_BASE64 || '').trim();

    if (!certificadoBase64) {
        throw new Error(
            'Configuración incompleta: DB_SSL=true pero falta definir ' +
            'DB_CA_CERT_BASE64 con el certificado CA del proveedor ' +
            'codificado en Base64.'
        );
    }

    let certificadoCa;

    try {
        certificadoCa = Buffer.from(certificadoBase64, 'base64').toString('utf8');
    } catch (error) {
        throw new Error(
            'Configuración inválida: DB_CA_CERT_BASE64 no es un valor Base64 válido.'
        );
    }

    if (!certificadoCa.includes('BEGIN CERTIFICATE')) {
        throw new Error(
            'Configuración inválida: DB_CA_CERT_BASE64 decodificado no es un ' +
            'certificado PEM válido.'
        );
    }

    // Validación del certificado del servidor: SIEMPRE activa.
    return { rejectUnauthorized: true, ca: certificadoCa };
}

const opcionesSsl = obtenerConfiguracionSsl();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    ...(opcionesSsl ? { ssl: opcionesSsl } : {})
});

module.exports = connection;