const reporteService = require('../services/reporteService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE REPORTES
// Solo req/res y códigos HTTP.
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const resumen = await reporteService.obtenerResumen();
        res.json(resumen);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener el resumen de reportes:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener el resumen de reportes' });
    }
}

module.exports = {
    obtenerResumen
};
