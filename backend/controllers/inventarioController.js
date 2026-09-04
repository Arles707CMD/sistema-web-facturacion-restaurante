const inventarioModel = require('../models/inventarioModel');

// ===========================================
// OBTENER RESUMEN DE INVENTARIO
// ===========================================

async function obtenerResumen(req, res) {
    try {
        const resumen = await inventarioModel.obtenerResumen();

        res.json(resumen);
    } catch (error) {
        console.error('Error al obtener el resumen de inventario:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener el resumen de inventario'
        });
    }
}

module.exports = {
    obtenerResumen
};