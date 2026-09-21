const metaService = require('../services/metaService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE METAS
// Solo req/res y códigos HTTP.
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const periodo = req.query.periodo || 'mes';
        const resumen = await metaService.obtenerResumen(periodo);
        res.json(resumen);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener el resumen de metas:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener el resumen de metas' });
    }
}

module.exports = {
    obtenerResumen
};
