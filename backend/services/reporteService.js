const reporteModel = require('../models/reporteModel');

// ===========================================
// SERVICIO DE REPORTES
// Orquesta la consulta de agregación (solo lectura).
// ===========================================

async function obtenerResumen() {
    return reporteModel.obtenerResumen();
}

module.exports = {
    obtenerResumen
};
