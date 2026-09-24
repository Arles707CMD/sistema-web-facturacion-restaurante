const recetaModel = require('../models/recetaModel');
const { ErrorServicio, esErrorIntegridad } = require('./errors');

// ===========================================
// SERVICIO DE RECETAS
// Lógica de negocio: validación y orquestación.
// ===========================================

const ESTADOS_VALIDOS = ['Activa', 'En revisión', 'Inactiva'];

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

    if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
        errores.push('La descripción debe ser un texto válido.');
    }

    return errores;
}

async function validarId(id) {
    const idReceta = Number(id);

    if (!esIdValido(idReceta)) {
        throw new ErrorServicio(400, 'El id de la receta debe ser un número entero positivo');
    }

    return idReceta;
}

async function validarProducto(id_producto) {
    const productoExiste = await recetaModel.existeProducto(id_producto);

    if (!productoExiste) {
        throw new ErrorServicio(400, 'El producto seleccionado no existe.', ['El producto seleccionado no existe.']);
    }
}

async function listarRecetas() {
    return recetaModel.obtenerRecetas();
}

async function obtenerRecetaPorId(id) {
    const idReceta = await validarId(id);
    const receta = await recetaModel.obtenerRecetaPorId(idReceta);

    if (!receta) {
        throw new ErrorServicio(404, 'Receta no encontrada');
    }

    return receta;
}

async function crearReceta(datos) {
    const errores = validarDatosReceta(datos);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos de la receta inválidos', errores);
    }

    const { id_producto } = datos;

    await validarProducto(id_producto);

    if (await recetaModel.existeRecetaProducto(id_producto)) {
        throw new ErrorServicio(400, 'Ya existe una receta para este producto.', ['Ya existe una receta para este producto.']);
    }

    return recetaModel.crearReceta(datos);
}

async function actualizarReceta(id, datos) {
    const idReceta = await validarId(id);
    const errores = validarDatosReceta(datos);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos de la receta inválidos', errores);
    }

    const { id_producto } = datos;

    await validarProducto(id_producto);

    if (await recetaModel.existeRecetaProducto(id_producto, idReceta)) {
        throw new ErrorServicio(400, 'Ya existe una receta para este producto.', ['Ya existe una receta para este producto.']);
    }

    const filasActualizadas = await recetaModel.actualizarReceta(idReceta, datos);

    if (filasActualizadas === 0) {
        throw new ErrorServicio(404, 'Receta no encontrada');
    }

    return filasActualizadas;
}

async function eliminarReceta(id) {
    const idReceta = await validarId(id);

    let filasEliminadas;

    try {
        filasEliminadas = await recetaModel.eliminarReceta(idReceta);
    } catch (error) {
        if (esErrorIntegridad(error)) {
            throw new ErrorServicio(
                400,
                'No se puede eliminar la receta porque tiene registros relacionados.'
            );
        }

        throw error;
    }

    if (filasEliminadas === 0) {
        throw new ErrorServicio(404, 'Receta no encontrada');
    }

    return filasEliminadas;
}

module.exports = {
    listarRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
};
