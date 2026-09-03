const database = require('../config/database');

async function obtenerProductos() {
    const [productos] = await database.query(`
        SELECT 
            p.id_producto,
            p.nombre,
            p.descripcion,
            p.precio,
            p.stock,
            p.id_categoria,
            c.nombre AS categoria
        FROM productos p
        INNER JOIN categorias c
            ON p.id_categoria = c.id_categoria
        ORDER BY p.id_producto DESC
    `);

    return productos;
}

async function obtenerProductoPorId(idProducto) {
    const [producto] = await database.query(`
        SELECT 
            p.id_producto,
            p.nombre,
            p.descripcion,
            p.precio,
            p.stock,
            p.id_categoria,
            c.nombre AS categoria
        FROM productos p
        INNER JOIN categorias c
            ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = ?
    `, [idProducto]);

    return producto[0] || null;
}

// Comprueba si una categoría existe en la tabla categorias.
async function existeCategoria(idCategoria) {
    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM categorias
        WHERE id_categoria = ?`,
        [idCategoria]
    );

    return filas[0].total > 0;
}

async function crearProducto(producto) {
    const { nombre, descripcion, precio, stock, idCategoria } = producto;

    const descripcionFinal = descripcion || null;

    const [resultado] = await database.query(
        `INSERT INTO productos
        (nombre, descripcion, precio, stock, id_categoria)
        VALUES (?, ?, ?, ?, ?)`,
        [nombre, descripcionFinal, precio, stock, idCategoria]
    );

    return resultado.insertId;
}

async function actualizarProducto(idProducto, producto) {
    const { nombre, descripcion, precio, stock, idCategoria } = producto;

    const descripcionFinal = descripcion || null;

    const [resultado] = await database.query(
        `UPDATE productos
        SET nombre = ?,
            descripcion = ?,
            precio = ?,
            stock = ?,
            id_categoria = ?
        WHERE id_producto = ?`,
        [nombre, descripcionFinal, precio, stock, idCategoria, idProducto]
    );

    return resultado.affectedRows;
}

async function eliminarProducto(idProducto) {
    const [resultado] = await database.query(
        `DELETE FROM productos
        WHERE id_producto = ?`,
        [idProducto]
    );

    return resultado.affectedRows;
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    existeCategoria,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};