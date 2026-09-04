const metaModel = require('../models/metaModel');

// ===========================================
// OBTENER RESUMEN DE METAS
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const periodo = req.query.periodo || 'mes';

        if (!metaModel.PERIODOS_VALIDOS.includes(periodo)) {
            return res.status(400).json({
                mensaje: 'Periodo inválido. Use mes, semana o todo.'
            });
        }

        const resumen = await metaModel.obtenerResumenMetas(periodo);

        res.json(resumen);
    } catch (error) {
        console.error('Error al obtener el resumen de metas:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener el resumen de metas'
        });
    }
}

module.exports = {
    obtenerResumen
};