const dashboardModel = require('../models/dashboardModel');

// ===========================================
// SERVICIO DEL DASHBOARD
// Orquesta la consulta de indicadores (solo lectura).
// ===========================================

async function obtenerResumen() {
    return dashboardModel.obtenerResumen();
}

module.exports = {
    obtenerResumen
};
