const productoModel = require('../models/productoModel');
const { ErrorServicio } = require('./errors');

// ===========================================
// SERVICIO DE PRODUCTOS
// Lógica de negocio: validación y orquestación.
// ===========================================

function esIdValido(id) {
    return Number.isInteger(id) && id > 0;
}

function validarDatosProducto(producto) {
    const errores = [];

    const { nombre, descripcion, precio, stock, idCategoria } = producto;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        errores.push('El nombre del producto es obligatorio.');
    }

    if (descripcion !== undefined && typeof descripcion !== 'string') {
        errores.push('La descripción debe ser un texto válido.');
    }

    if (!Number.isFinite(precio) || precio < 0) {
        errores.push('El precio debe ser un número mayor o igual a 0.');
    }

    if (!Number.isInteger(stock) || stock < 0) {
        errores.push('El stock debe ser un número entero mayor o igual a 0.');
    }

    if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
        errores.push('La categoría es obligatoria.');
    }

    return errores;
}

async function validarId(id) {
    const idProducto = Number(id);

    if (!esIdValido(idProducto)) {
        throw new ErrorServicio(400, 'El id del producto debe ser un número entero positivo');
    }

    return idProducto;
}

async function validarCategoria(idCategoria) {
    const categoriaExiste = await productoModel.existeCategoria(idCategoria);

    if (!categoriaExiste) {
        throw new ErrorServicio(400, 'La categoría seleccionada no existe.', ['La categoría seleccionada no existe.']);
    }
}

async function listarProductos() {
    return productoModel.obtenerProductos();
}

async function obtenerProductoPorId(id) {
    const idProducto = await validarId(id);
    const producto = await productoModel.obtenerProductoPorId(idProducto);

    if (!producto) {
        throw new ErrorServicio(404, 'Producto no encontrado');
    }

    return producto;
}

async function crearProducto(datos) {
    const errores = validarDatosProducto(datos);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos del producto inválidos', errores);
    }

    await validarCategoria(datos.idCategoria);

    return productoModel.crearProducto(datos);
}

async function actualizarProducto(id, datos) {
    const idProducto = await validarId(id);
    const errores = validarDatosProducto(datos);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos del producto inválidos', errores);
    }

    await validarCategoria(datos.idCategoria);

    const filasActualizadas = await productoModel.actualizarProducto(idProducto, datos);

    if (filasActualizadas === 0) {
        throw new ErrorServicio(404, 'Producto no encontrado');
    }

    return filasActualizadas;
}

async function eliminarProducto(id) {
    const idProducto = await validarId(id);
    const filasEliminadas = await productoModel.eliminarProducto(idProducto);

    if (filasEliminadas === 0) {
        throw new ErrorServicio(404, 'Producto no encontrado');
    }

    return filasEliminadas;
}

module.exports = {
    listarProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};
