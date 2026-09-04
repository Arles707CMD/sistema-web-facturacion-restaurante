const recetaModel = require('../models/recetaModel');

// ===========================================
// CONSTANTES DE VALIDACIÓN
// ===========================================

const ESTADOS_VALIDOS = ['Activa', 'En revisión', 'Inactiva'];

// ===========================================
// VALIDACIONES
// ===========================================

function esIdValido(id) {
    return Number.isInteger(id) && id > 0;
}

function validarDatosReceta(datos) {
    const errores = [];

    const { id_producto, porciones, tiempo, estado, descripcion } = datos;

    if (!Number.isInteger(id_producto) || id_producto <= 0) {
        errores.push('El producto es obligatorio.');
    }

    if (!Number.isInteger(porciones) || porciones <= 0) {
        errores.push('Las porciones deben ser un número entero mayor a 0.');
    }

    if (!Number.isInteger(tiempo) || tiempo <= 0) {
        errores.push('El tiempo debe ser un número entero mayor a 0.');
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
        errores.push('El estado seleccionado no es válido.');
    }

    if (
        descripcion !== undefined &&
        descripcion !== null &&
        typeof descripcion !== 'string'
    ) {
        errores.push('La descripción debe ser un texto válido.');
    }

    return errores;
}

// ===========================================
// OBTENER TODAS LAS RECETAS
// ===========================================

async function obtenerRecetas(req, res) {
    try {
        const recetas = await recetaModel.obtenerRecetas();

        res.json(recetas);
    } catch (error) {
        console.error('Error al obtener recetas:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener las recetas'
        });
    }
}

// ===========================================
// OBTENER RECETA POR ID
// ===========================================

async function obtenerRecetaPorId(req, res) {
    try {
        const idReceta = Number(req.params.id);

        if (!esIdValido(idReceta)) {
            return res.status(400).json({
                mensaje: 'El id de la receta debe ser un número entero positivo'
            });
        }

        const receta = await recetaModel.obtenerRecetaPorId(idReceta);

        if (!receta) {
            return res.status(404).json({
                mensaje: 'Receta no encontrada'
            });
        }

        res.json(receta);
    } catch (error) {
        console.error('Error al obtener receta:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener la receta'
        });
    }
}

// ===========================================
// CREAR RECETA
// ===========================================

async function crearReceta(req, res) {
    try {
        const errores = validarDatosReceta(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos de la receta inválidos',
                errores
            });
        }

        const { id_producto } = req.body;

        const productoExiste = await recetaModel.existeProducto(id_producto);

        if (!productoExiste) {
            return res.status(400).json({
                mensaje: 'El producto seleccionado no existe.',
                errores: ['El producto seleccionado no existe.']
            });
        }

        const recetaDuplicada = await recetaModel.existeRecetaProducto(id_producto);

        if (recetaDuplicada) {
            return res.status(400).json({
                mensaje: 'Ya existe una receta para este producto.',
                errores: ['Ya existe una receta para este producto.']
            });
        }

        const idReceta = await recetaModel.crearReceta(req.body);

        res.status(201).json({
            mensaje: 'Receta creada correctamente',
            idReceta
        });
    } catch (error) {
        console.error('Error al crear receta:', error.message);

        res.status(500).json({
            mensaje: 'Error al crear la receta'
        });
    }
}
// ===========================================
// ACTUALIZAR RECETA
// ===========================================

async function actualizarReceta(req, res) {
    try {
        const idReceta = Number(req.params.id);

        if (!esIdValido(idReceta)) {
            return res.status(400).json({
                mensaje: 'El id de la receta debe ser un número entero positivo'
            });
        }

        const errores = validarDatosReceta(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos de la receta inválidos',
                errores
            });
        }

        const { id_producto } = req.body;

        const productoExiste = await recetaModel.existeProducto(id_producto);

        if (!productoExiste) {
            return res.status(400).json({
                mensaje: 'El producto seleccionado no existe.',
                errores: ['El producto seleccionado no existe.']
            });
        }

        const recetaDuplicada = await recetaModel.existeRecetaProducto(id_producto, idReceta);

        if (recetaDuplicada) {
            return res.status(400).json({
                mensaje: 'Ya existe una receta para este producto.',
                errores: ['Ya existe una receta para este producto.']
            });
        }

        const filasActualizadas = await recetaModel.actualizarReceta(idReceta, req.body);

        if (filasActualizadas === 0) {
            return res.status(404).json({
                mensaje: 'Receta no encontrada'
            });
        }

        res.json({
            mensaje: 'Receta actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar receta:', error.message);

        res.status(500).json({
            mensaje: 'Error al actualizar la receta'
        });
    }
}

// ===========================================
// ELIMINAR RECETA
// ===========================================

async function eliminarReceta(req, res) {
    try {
        const idReceta = Number(req.params.id);

        if (!esIdValido(idReceta)) {
            return res.status(400).json({
                mensaje: 'El id de la receta debe ser un número entero positivo'
            });
        }

        const filasEliminadas = await recetaModel.eliminarReceta(idReceta);

        if (filasEliminadas === 0) {
            return res.status(404).json({
                mensaje: 'Receta no encontrada'
            });
        }

        res.json({
            mensaje: 'Receta eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar receta:', error.message);

        res.status(500).json({
            mensaje: 'Error al eliminar la receta'
        });
    }
}

module.exports = {
    obtenerRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
};