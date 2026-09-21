const inventarioModel = require('../models/inventarioModel');

// ===========================================
// SERVICIO DE INVENTARIO
// Orquesta la consulta del estado de stock (solo lectura).
// ===========================================

async function obtenerResumen() {
    return inventarioModel.obtenerResumen();
}

module.exports = {
    obtenerResumen
};
