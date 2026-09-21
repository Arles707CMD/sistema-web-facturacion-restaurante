const ventaService = require('../services/ventaService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE VENTAS
// Solo req/res y códigos HTTP.
// La lógica de negocio vive en ventaService.
// ===========================================

async function crearVenta(req, res) {
    try {
        const resultado = await ventaService.crearVenta(req.body);

        res.status(201).json({
            mensaje: 'Venta registrada correctamente',
            idFactura: resultado.idFactura,
            numeroFactura: resultado.numeroFactura,
            total: resultado.total
        });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al crear venta:', error.message);
        res.status(500).json({ mensaje: 'Error al registrar la venta' });
    }
}

module.exports = {
    crearVenta
};
