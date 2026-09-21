const facturaService = require('../services/facturaService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE FACTURAS
// Solo req/res y códigos HTTP.
// La lógica de negocio vive en facturaService.
// ===========================================

async function obtenerFacturas(req, res) {
    try {
        const facturas = await facturaService.listarFacturas();
        res.json(facturas);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener facturas:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener las facturas' });
    }
}

async function obtenerFacturaPorId(req, res) {
    try {
        const factura = await facturaService.obtenerFacturaPorId(req.params.id);
        res.json(factura);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener factura:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener la factura' });
    }
}

async function eliminarFactura(req, res) {
    try {
        await facturaService.eliminarFactura(req.params.id);
        res.json({ mensaje: 'Factura eliminada correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al eliminar factura:', error.message);
        res.status(500).json({ mensaje: 'Error al eliminar la factura' });
    }
}

module.exports = {
    obtenerFacturas,
    obtenerFacturaPorId,
    eliminarFactura
};
