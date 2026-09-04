const dashboardModel = require('../models/dashboardModel');

// ===========================================
// OBTENER RESUMEN DEL DASHBOARD
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const resumen = await dashboardModel.obtenerResumen();

        res.json(resumen);
    } catch (error) {
        console.error('Error al obtener el resumen del dashboard:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener el resumen del dashboard'
        });
    }
}

module.exports = {
    obtenerResumen
};