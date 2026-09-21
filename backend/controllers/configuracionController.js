const configuracionService = require('../services/configuracionService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE CONFIGURACIÓN
// Solo req/res y códigos HTTP.
// ===========================================

async function obtenerConfiguracion(req, res) {
    try {
        const configuracion = await configuracionService.obtenerConfiguracion();
        res.json(configuracion);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener configuración:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener la configuración' });
    }
}

async function actualizarConfiguracion(req, res) {
    try {
        await configuracionService.actualizarConfiguracion(req.body);
        res.json({ mensaje: 'Configuración actualizada correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al actualizar configuración:', error.message);
        res.status(500).json({ mensaje: 'Error al actualizar la configuración' });
    }
}

module.exports = {
    obtenerConfiguracion,
    actualizarConfiguracion
};
