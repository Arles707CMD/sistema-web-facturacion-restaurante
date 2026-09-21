const recetaService = require('../services/recetaService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE RECETAS
// Solo req/res y códigos HTTP.
// La lógica de negocio vive en recetaService.
// ===========================================

async function obtenerRecetas(req, res) {
    try {
        const recetas = await recetaService.listarRecetas();
        res.json(recetas);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener recetas:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener las recetas' });
    }
}

async function obtenerRecetaPorId(req, res) {
    try {
        const receta = await recetaService.obtenerRecetaPorId(req.params.id);
        res.json(receta);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener receta:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener la receta' });
    }
}

async function crearReceta(req, res) {
    try {
        const idReceta = await recetaService.crearReceta(req.body);
        res.status(201).json({ mensaje: 'Receta creada correctamente', idReceta });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al crear receta:', error.message);
        res.status(500).json({ mensaje: 'Error al crear la receta' });
    }
}

async function actualizarReceta(req, res) {
    try {
        await recetaService.actualizarReceta(req.params.id, req.body);
        res.json({ mensaje: 'Receta actualizada correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al actualizar receta:', error.message);
        res.status(500).json({ mensaje: 'Error al actualizar la receta' });
    }
}

async function eliminarReceta(req, res) {
    try {
        await recetaService.eliminarReceta(req.params.id);
        res.json({ mensaje: 'Receta eliminada correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al eliminar receta:', error.message);
        res.status(500).json({ mensaje: 'Error al eliminar la receta' });
    }
}

module.exports = {
    obtenerRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
};
