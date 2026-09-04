const database = require('../config/database');

// ===========================================
// MODELO DE REPORTES
// Consultas de agregación (solo lectura) sobre
// facturas, detalle_factura y productos.
// ===========================================

async function obtenerResumen() {
    const [[ventas]] = await database.query(`
        SELECT COALESCE(SUM(total), 0) AS total
        FROM facturas
    `);

    const [[totalFacturas]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM facturas
    `);

    const [[unidadesVendidas]] = await database.query(`
        SELECT COALESCE(SUM(cantidad), 0) AS total
        FROM detalle_factura
    `);

    const [[stockBajo]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
        WHERE stock > 0 AND stock <= 10
    `);

    const [ventasPorProducto] = await database.query(`
        SELECT
            p.nombre,
            SUM(df.cantidad) AS cantidad,
            SUM(df.cantidad * df.precio_unitario) AS total
        FROM detalle_factura df
        INNER JOIN productos p
            ON p.id_producto = df.id_producto
        GROUP BY p.id_producto, p.nombre
        ORDER BY total DESC
    `);

    return {
        ventas: Number(ventas.total),
        totalFacturas: Number(totalFacturas.total),
        unidadesVendidas: Number(unidadesVendidas.total),
        stockBajo: Number(stockBajo.total),
        ventasPorProducto: ventasPorProducto.map((fila) => ({
            nombre: fila.nombre,
            cantidad: Number(fila.cantidad),
            total: Number(fila.total)
        }))
    };
}

module.exports = {
    obtenerResumen
};