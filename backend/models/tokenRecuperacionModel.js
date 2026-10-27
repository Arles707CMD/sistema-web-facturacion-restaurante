const database = require('../config/database');

// ===========================================
// MODELO DE TOKENS DE RECUPERACIÓN
// Guarda únicamente el hash SHA-256 del token de
// recuperación (nunca el token en claro), con
// caducidad y uso único. Migración 001.
// ===========================================

// Registra un nuevo token (hash) para un usuario.
async function crearToken({ idUsuario, tokenHash, expiracion }) {
    const [resultado] = await database.query(
        `INSERT INTO tokens_recuperacion
        (id_usuario, token_hash, expiracion)
        VALUES (?, ?, ?)`,
        [idUsuario, tokenHash, expiracion]
    );

    return resultado.insertId;
}

// Busca el registro más reciente de un token por su hash.
// Incluye "usado" y "expiracion" para que el servicio pueda
// diferenciar: inválido / ya utilizado / expirado.
async function obtenerTokenPorHash(tokenHash) {
    const [filas] = await database.query(
        `SELECT
            id_token,
            id_usuario,
            expiracion,
            usado
        FROM tokens_recuperacion
        WHERE token_hash = ?
        ORDER BY id_token DESC
        LIMIT 1`,
        [tokenHash]
    );

    return filas[0] || null;
}

// Invalida el token (un solo uso). Solo afecta si aún no se usó.
async function marcarTokenUsado(idToken) {
    const [resultado] = await database.query(
        `UPDATE tokens_recuperacion
        SET usado = 1
        WHERE id_token = ? AND usado = 0`,
        [idToken]
    );

    return resultado.affectedRows;
}

// Cuenta los tokens creados para un usuario en los últimos N
// minutos (protección anti abuso del endpoint de recuperación).
async function contarTokensRecientes(idUsuario, minutos) {
    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM tokens_recuperacion
        WHERE id_usuario = ? AND fecha_creacion >= NOW() - INTERVAL ? MINUTE`,
        [idUsuario, minutos]
    );

    return filas[0].total;
}

module.exports = {
    crearToken,
    obtenerTokenPorHash,
    marcarTokenUsado,
    contarTokensRecientes
};
