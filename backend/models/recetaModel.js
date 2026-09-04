const database = require('../config/database');

// ===========================================
// MODELO DE RECETAS
// Consultas parametrizadas con mysql2.
// ===========================================

// Obtiene todas las recetas con producto y categoría.
async function obtenerRecetas() {
    const [recetas] = await database.query(`
        SELECT
            r.id_receta,
            r.id_producto,
            p.nombre AS producto,
            c.nombre AS categoria,
            r.porciones,
            r.tiempo,
            r.estado,
            r.descripcion,
            r.fecha_actualizacion
        FROM recetas r
        INNER JOIN productos p
            ON p.id_producto = r.id_producto
        INNER JOIN categorias c
            ON c.id_categoria = p.id_categoria
        ORDER BY r.id_receta DESC
    `);

    return recetas;
}

// Obtiene una receta por su id (con producto y categoría).
async function obtenerRecetaPorId(idReceta) {
    const [receta] = await database.query(`
        SELECT
            r.id_receta,
            r.id_producto,
            p.nombre AS producto,
            c.nombre AS categoria,
            r.porciones,
            r.tiempo,
            r.estado,
            r.descripcion,
            r.fecha_actualizacion
        FROM recetas r
        INNER JOIN productos p
            ON p.id_producto = r.id_producto
        INNER JOIN categorias c
            ON c.id_categoria = p.id_categoria
        WHERE r.id_receta = ?
    `, [idReceta]);

    return receta[0] || null;
}

// Comprueba si un producto existe.
async function existeProducto(idProducto) {
    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM productos
        WHERE id_producto = ?`,
        [idProducto]
    );

    return filas[0].total > 0;
}

// Comprueba si ya existe una receta para un producto.
// Si se indica idExcluido, se ignora esa receta (para la edición).
async function existeRecetaProducto(idProducto, idExcluido = null) {
    if (idExcluido) {
        const [filas] = await database.query(
            `SELECT COUNT(*) AS total
            FROM recetas
            WHERE id_producto = ? AND id_receta <> ?`,
            [idProducto, idExcluido]
        );

        return filas[0].total > 0;
    }

    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM recetas
        WHERE id_producto = ?`,
        [idProducto]
    );

    return filas[0].total > 0;
}

// Crea una receta.
async function crearReceta(datos) {
    const [resultado] = await database.query(`
        INSERT INTO recetas
        (id_producto, porciones, tiempo, estado, descripcion)
        VALUES (?, ?, ?, ?, ?)
    `, [
        datos.id_producto,
        datos.porciones,
        datos.tiempo,
        datos.estado,
        datos.descripcion || null
    ]);

    return resultado.insertId;
}

// Actualiza una receta.
async function actualizarReceta(idReceta, datos) {
    const [resultado] = await database.query(`
        UPDATE recetas
        SET id_producto = ?,
            porciones = ?,
            tiempo = ?,
            estado = ?,
            descripcion = ?
        WHERE id_receta = ?
    `, [
        datos.id_producto,
        datos.porciones,
        datos.tiempo,
        datos.estado,
        datos.descripcion || null,
        idReceta
    ]);

    return resultado.affectedRows;
}

// Elimina una receta.
async function eliminarReceta(idReceta) {
    const [resultado] = await database.query(
        `DELETE FROM recetas WHERE id_receta = ?`,
        [idReceta]
    );

    return resultado.affectedRows;
}

module.exports = {
    obtenerRecetas,
    obtenerRecetaPorId,
    existeProducto,
    existeRecetaProducto,
    crearReceta,
    actualizarReceta,
    eliminarReceta
};