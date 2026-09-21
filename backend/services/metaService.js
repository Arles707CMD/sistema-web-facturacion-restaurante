const metaModel = require('../models/metaModel');
const { ErrorServicio } = require('./errors');

// ===========================================
// SERVICIO DE METAS
// Valida el periodo y orquesta la consulta.
// ===========================================

async function obtenerResumen(periodo) {
    if (!metaModel.PERIODOS_VALIDOS.includes(periodo)) {
        throw new ErrorServicio(400, 'Periodo inválido. Use mes, semana o todo.');
    }

    return metaModel.obtenerResumenMetas(periodo);
}

module.exports = {
    obtenerResumen
};
