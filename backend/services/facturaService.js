const database = require('../config/database');
const facturaModel = require('../models/facturaModel');
const { ErrorServicio } = require('./errors');

// ===========================================
// SERVICIO DE FACTURAS
// Lógica de negocio y orquestación: validación,
// consulta y eliminación (con restauración de stock).
// ===========================================

function esIdValido(id) {
    return Number.isInteger(id) && id > 0;
}

async function validarId(id) {
    const idFactura = Number(id);

    if (!esIdValido(idFactura)) {
        throw new ErrorServicio(400, 'El id de la factura debe ser un número entero positivo');
    }

    return idFactura;
}

async function listarFacturas() {
    return facturaModel.obtenerFacturas();
}

async function obtenerFacturaPorId(id) {
    const idFactura = await validarId(id);
    const factura = await facturaModel.obtenerFacturaPorId(idFactura);

    if (!factura) {
        throw new ErrorServicio(404, 'Factura no encontrada');
    }

    return factura;
}

// Elimina una factura y restaura el stock de los productos asociados,
// de forma transaccional.
async function eliminarFactura(id) {
    const idFactura = await validarId(id);

    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        const factura = await facturaModel.obtenerFacturaExistente(connection, idFactura);

        if (factura.length === 0) {
            await connection.rollback();
            throw new ErrorServicio(404, 'Factura no encontrada');
        }

        const detalle = await facturaModel.obtenerDetalleFactura(connection, idFactura);

        // Restaura el stock de cada producto vendido.
        for (const item of detalle) {
            await facturaModel.restaurarStock(connection, item.id_producto, item.cantidad);
        }

        // Elimina la factura (ON DELETE CASCADE borra el detalle).
        await facturaModel.eliminarFacturaRegistro(connection, idFactura);

        await connection.commit();

        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    listarFacturas,
    obtenerFacturaPorId,
    eliminarFactura
};
