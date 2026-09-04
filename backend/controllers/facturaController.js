const facturaModel = require('../models/facturaModel');

// ===========================================
// VALIDACIONES
// ===========================================

function esIdValido(id) {
    return Number.isInteger(id) && id > 0;
}

// ===========================================
// OBTENER TODAS LAS FACTURAS
// ===========================================

async function obtenerFacturas(req, res) {
    try {
        const facturas = await facturaModel.obtenerFacturas();

        res.json(facturas);
    } catch (error) {
        console.error('Error al obtener facturas:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener las facturas'
        });
    }
}

// ===========================================
// OBTENER FACTURA POR ID
// ===========================================

async function obtenerFacturaPorId(req, res) {
    try {
        const idFactura = Number(req.params.id);

        if (!esIdValido(idFactura)) {
            return res.status(400).json({
                mensaje: 'El id de la factura debe ser un número entero positivo'
            });
        }

        const factura = await facturaModel.obtenerFacturaPorId(idFactura);

        if (!factura) {
            return res.status(404).json({
                mensaje: 'Factura no encontrada'
            });
        }

        res.json(factura);
    } catch (error) {
        console.error('Error al obtener factura:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener la factura'
        });
    }
}

// ===========================================
// ELIMINAR FACTURA (restaura stock)
// ===========================================

async function eliminarFactura(req, res) {
    try {
        const idFactura = Number(req.params.id);

        if (!esIdValido(idFactura)) {
            return res.status(400).json({
                mensaje: 'El id de la factura debe ser un número entero positivo'
            });
        }

        const filasEliminadas = await facturaModel.eliminarFactura(idFactura);

        if (filasEliminadas === 0) {
            return res.status(404).json({
                mensaje: 'Factura no encontrada'
            });
        }

        res.json({
            mensaje: 'Factura eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar factura:', error.message);

        res.status(500).json({
            mensaje: 'Error al eliminar la factura'
        });
    }
}

module.exports = {
    obtenerFacturas,
    obtenerFacturaPorId,
    eliminarFactura
};