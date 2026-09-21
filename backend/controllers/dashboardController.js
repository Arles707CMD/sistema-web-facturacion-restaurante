const dashboardService = require('../services/dashboardService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DEL DASHBOARD
// Solo req/res y códigos HTTP.
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const resumen = await dashboardService.obtenerResumen();
        res.json(resumen);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener el resumen del dashboard:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener el resumen del dashboard' });
    }
}

module.exports = {
    obtenerResumen
};
