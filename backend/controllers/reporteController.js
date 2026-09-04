const reporteModel = require('../models/reporteModel');

// ===========================================
// OBTENER RESUMEN DE REPORTES
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const resumen = await reporteModel.obtenerResumen();

        res.json(resumen);
    } catch (error) {
        console.error('Error al obtener el resumen de reportes:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener el resumen de reportes'
        });
    }
}

module.exports = {
    obtenerResumen
};