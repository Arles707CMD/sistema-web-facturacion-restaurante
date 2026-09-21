const inventarioService = require('../services/inventarioService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE INVENTARIO
// Solo req/res y códigos HTTP.
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const resumen = await inventarioService.obtenerResumen();
        res.json(resumen);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener el resumen de inventario:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener el resumen de inventario' });
    }
}

module.exports = {
    obtenerResumen
};
