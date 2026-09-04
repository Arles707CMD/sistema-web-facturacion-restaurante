const database = require('../config/database');

// ===========================================
// MODELO DE CONFIGURACIÓN
// Trabaja siempre con la fila id = 1.
// ===========================================

// Obtiene la configuración actual (fila id = 1).
async function obtenerConfiguracion() {
    const [filas] = await database.query(`
        SELECT id, nombre, meta_mensual, iva
        FROM configuracion
        WHERE id = 1
    `);

    return filas[0] || null;
}

// Actualiza la configuración (fila id = 1).
async function actualizarConfiguracion(datos) {
    const { nombre, meta_mensual, iva } = datos;

    const [resultado] = await database.query(`
        UPDATE configuracion
        SET nombre = ?,
            meta_mensual = ?,
            iva = ?
        WHERE id = 1
    `, [nombre, meta_mensual, iva]);

    return resultado.affectedRows;
}

module.exports = {
    obtenerConfiguracion,
    actualizarConfiguracion
};