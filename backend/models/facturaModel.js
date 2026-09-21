const database = require('../config/database');

// ===========================================
// MODELO DE FACTURAS Y VENTAS
// Acceso a datos: consultas SQL parametrizadas.
// La lógica de negocio (numeración, totales, stock
// y transacciones) vive en ventaService / facturaService.
// ===========================================

// ===========================================
// LECTURA
// ===========================================

// Obtiene todas las facturas para el listado (sin detalle).
async function obtenerFacturas() {
    const [facturas] = await database.query(`
        SELECT
            id_factura,
            numero_factura,
            fecha,
            cliente,
            documento,
            metodo_pago,
            subtotal,
            iva,
            total
        FROM facturas
        ORDER BY id_factura DESC
    `);

    return facturas;
}

// Obtiene una factura junto con su detalle de productos.
async function obtenerFacturaPorId(idFactura) {
    const [factura] = await database.query(`
        SELECT
            id_factura,
            numero_factura,
            fecha,
            cliente,
            documento,
            telefono,
            metodo_pago,
            observaciones,
            subtotal,
            iva,
            total
        FROM facturas
        WHERE id_factura = ?
    `, [idFactura]);

    if (!factura[0]) {
        return null;
    }

    const [detalle] = await database.query(`
        SELECT
            df.id_producto,
            p.nombre,
            df.cantidad,
            df.precio_unitario,
            (df.cantidad * df.precio_unitario) AS subtotal_linea
        FROM detalle_factura df
        INNER JOIN productos p
            ON p.id_producto = df.id_producto
        WHERE df.id_factura = ?
        ORDER BY df.id_detalle ASC
    `, [idFactura]);

    return {
        ...factura[0],
        productos: detalle
    };
}

// ===========================================
// ESCRITURA (funciones granulares que reciben una connection)
// ===========================================

// Obtiene el porcentaje de IVA desde la configuración (id = 1).
// Si no existe, devuelve 19 como fallback.
async function obtenerIva(connection) {
    const [[configuracion]] = await connection.query(`
        SELECT iva
        FROM configuracion
        WHERE id = 1
    `);

    return configuracion ? Number(configuracion.iva) : 19;
}

// Obtiene el último número de factura (para generar el siguiente).
async function obtenerUltimoNumeroFactura(connection) {
    const [filas] = await connection.query(`
        SELECT numero_factura
        FROM facturas
        ORDER BY id_factura DESC
        LIMIT 1
    `);

    return filas[0]?.numero_factura || '';
}

// Bloquea las filas de productos para leer precio/stock actuales.
async function bloquearProductos(connection, ids) {
    const [productos] = await connection.query(`
        SELECT id_producto, nombre, precio, stock
        FROM productos
        WHERE id_producto IN (?)
        FOR UPDATE
    `, [ids]);

    return productos;
}

// Inserta la cabecera de la factura y devuelve su id.
async function insertarFactura(connection, factura) {
    const [resultado] = await connection.query(`
        INSERT INTO facturas
        (numero_factura, cliente, documento, telefono, metodo_pago, observaciones, subtotal, iva, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        factura.numeroFactura,
        factura.cliente,
        factura.documento,
        factura.telefono,
        factura.metodo_pago,
        factura.observaciones,
        factura.subtotal,
        factura.iva,
        factura.total
    ]);

    return resultado.insertId;
}

// Inserta una línea de detalle de la factura.
async function insertarDetalle(connection, detalle) {
    await connection.query(`
        INSERT INTO detalle_factura
        (id_factura, id_producto, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
    `, [detalle.idFactura, detalle.idProducto, detalle.cantidad, detalle.precioUnitario]);
}

// Descuenta stock de forma segura (solo si hay suficiente).
// Devuelve el número de filas afectadas.
async function descontarStock(connection, idProducto, cantidad) {
    const [resultado] = await connection.query(`
        UPDATE productos
        SET stock = stock - ?
        WHERE id_producto = ? AND stock >= ?
    `, [cantidad, idProducto, cantidad]);

    return resultado.affectedRows;
}

// Comprueba si una factura existe.
async function obtenerFacturaExistente(connection, idFactura) {
    const [filas] = await connection.query(`
        SELECT id_factura
        FROM facturas
        WHERE id_factura = ?
    `, [idFactura]);

    return filas;
}

// Obtiene el detalle (producto + cantidad) de una factura.
async function obtenerDetalleFactura(connection, idFactura) {
    const [detalle] = await connection.query(`
        SELECT id_producto, cantidad
        FROM detalle_factura
        WHERE id_factura = ?
    `, [idFactura]);

    return detalle;
}

// Restaura el stock de un producto.
async function restaurarStock(connection, idProducto, cantidad) {
    await connection.query(`
        UPDATE productos
        SET stock = stock + ?
        WHERE id_producto = ?
    `, [cantidad, idProducto]);
}

// Elimina el registro de la factura.
async function eliminarFacturaRegistro(connection, idFactura) {
    const [resultado] = await connection.query(`
        DELETE FROM facturas
        WHERE id_factura = ?
    `, [idFactura]);

    return resultado.affectedRows;
}

module.exports = {
    obtenerFacturas,
    obtenerFacturaPorId,
    obtenerIva,
    obtenerUltimoNumeroFactura,
    bloquearProductos,
    insertarFactura,
    insertarDetalle,
    descontarStock,
    obtenerFacturaExistente,
    obtenerDetalleFactura,
    restaurarStock,
    eliminarFacturaRegistro
};
