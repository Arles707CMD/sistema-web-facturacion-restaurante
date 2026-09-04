const database = require('../config/database');

// ===========================================
// MODELO DE FACTURAS Y VENTAS
// Consultas parametrizadas con mysql2.
// Las operaciones que afectan varias tablas
// (crear venta / eliminar factura) son
// transaccionales.
// ===========================================

// Porcentaje de IVA aplicado a las ventas.
const IVA = 0.19;

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
// ESCRITURA TRANSACCIONAL
// ===========================================

// Genera el siguiente número de factura único (FAC-000001...).
async function generarNumeroFactura(connection) {
    const [filas] = await connection.query(`
        SELECT numero_factura
        FROM facturas
        ORDER BY id_factura DESC
        LIMIT 1
    `);

    const ultimo = filas[0]?.numero_factura || '';
    const coincidencia = String(ultimo).match(/(\d+)$/);
    const siguiente = (coincidencia ? Number(coincidencia[1]) : 0) + 1;

    return 'FAC-' + String(siguiente).padStart(6, '0');
}

// Crea una venta completa (factura + detalles + descuento de stock)
// de forma transaccional. Si algo falla, hace ROLLBACK.
async function crearVenta(datosVenta) {
    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        const ids = datosVenta.productos.map((item) => item.id_producto);

        // Bloquea las filas de productos para leer precio/stock actuales.
        const [productos] = await connection.query(`
            SELECT id_producto, nombre, precio, stock
            FROM productos
            WHERE id_producto IN (?)
            FOR UPDATE
        `, [ids]);

        const mapaProductos = new Map(
            productos.map((producto) => [producto.id_producto, producto])
        );

        // Verifica que cada producto exista y tenga stock suficiente.
        for (const item of datosVenta.productos) {
            const producto = mapaProductos.get(item.id_producto);

            if (!producto) {
                const error = new Error('Producto no encontrado');
                error.codigo = 'PRODUCTO_NO_EXISTE';
                throw error;
            }

            if (Number(producto.stock) < item.cantidad) {
                const error = new Error(
                    'Stock insuficiente para el producto "' + producto.nombre + '".'
                );
                error.codigo = 'STOCK_INSUFICIENTE';
                throw error;
            }
        }

        // Calcula subtotal, IVA y total siempre en el backend.
        let subtotal = 0;

        for (const item of datosVenta.productos) {
            const precio = Number(mapaProductos.get(item.id_producto).precio);
            subtotal += precio * item.cantidad;
        }

        const iva = subtotal * IVA;
        const total = subtotal + iva;

        const numeroFactura = await generarNumeroFactura(connection);

        // Inserta la factura.
        const [resultadoFactura] = await connection.query(`
            INSERT INTO facturas
            (numero_factura, cliente, documento, telefono, metodo_pago, observaciones, subtotal, iva, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            numeroFactura,
            datosVenta.cliente,
            datosVenta.documento || null,
            datosVenta.telefono || null,
            datosVenta.metodo_pago,
            datosVenta.observaciones || null,
            subtotal,
            iva,
            total
        ]);

        const idFactura = resultadoFactura.insertId;

        // Inserta cada detalle y descuenta el stock de forma segura.
        for (const item of datosVenta.productos) {
            const producto = mapaProductos.get(item.id_producto);

            await connection.query(`
                INSERT INTO detalle_factura
                (id_factura, id_producto, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            `, [idFactura, item.id_producto, item.cantidad, producto.precio]);

            const [resultadoStock] = await connection.query(`
                UPDATE productos
                SET stock = stock - ?
                WHERE id_producto = ? AND stock >= ?
            `, [item.cantidad, item.id_producto, item.cantidad]);

            if (resultadoStock.affectedRows === 0) {
                const error = new Error('Stock insuficiente');
                error.codigo = 'STOCK_INSUFICIENTE';
                throw error;
            }
        }

        await connection.commit();

        return { idFactura, numeroFactura, total };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Elimina una factura y restaura el stock de los productos asociados,
// de forma transaccional. Devuelve 0 si la factura no existe.
async function eliminarFactura(idFactura) {
    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        const [factura] = await connection.query(`
            SELECT id_factura
            FROM facturas
            WHERE id_factura = ?
        `, [idFactura]);

        if (factura.length === 0) {
            await connection.rollback();
            return 0;
        }

        const [detalle] = await connection.query(`
            SELECT id_producto, cantidad
            FROM detalle_factura
            WHERE id_factura = ?
        `, [idFactura]);

        // Restaura el stock de cada producto vendido.
        for (const item of detalle) {
            await connection.query(`
                UPDATE productos
                SET stock = stock + ?
                WHERE id_producto = ?
            `, [item.cantidad, item.id_producto]);
        }

        // Elimina la factura (ON DELETE CASCADE borra el detalle).
        const [resultado] = await connection.query(`
            DELETE FROM facturas
            WHERE id_factura = ?
        `, [idFactura]);

        await connection.commit();

        return resultado.affectedRows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    obtenerFacturas,
    obtenerFacturaPorId,
    crearVenta,
    eliminarFactura
};