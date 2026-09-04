const database = require('../config/database');

// ===========================================
// MODELO DE INVENTARIO
// Solo consulta del estado actual del stock.
// No modifica datos.
// ===========================================

async function obtenerResumen() {
    const [[totalProductos]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
    `);

    const [[stockTotal]] = await database.query(`
        SELECT COALESCE(SUM(stock), 0) AS total
        FROM productos
    `);

    const [[disponibles]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
        WHERE stock > 0
    `);

    const [[agotados]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
        WHERE stock <= 0
    `);

    const [[stockBajo]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
        WHERE stock > 0 AND stock <= 10
    `);

    const [productos] = await database.query(`
        SELECT
            p.id_producto,
            p.nombre,
            c.nombre AS categoria,
            p.precio,
            p.stock
        FROM productos p
        INNER JOIN categorias c
            ON c.id_categoria = p.id_categoria
        ORDER BY p.nombre ASC
    `);

    return {
        totalProductos: Number(totalProductos.total),
        stockTotal: Number(stockTotal.total),
        disponibles: Number(disponibles.total),
        agotados: Number(agotados.total),
        stockBajo: Number(stockBajo.total),
        productos: productos.map((producto) => ({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            categoria: producto.categoria,
            precio: Number(producto.precio),
            stock: Number(producto.stock)
        }))
    };
}

module.exports = {
    obtenerResumen
};