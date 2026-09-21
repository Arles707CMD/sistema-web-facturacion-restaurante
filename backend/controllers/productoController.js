const productoService = require('../services/productoService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE PRODUCTOS
// Solo req/res y códigos HTTP.
// La lógica de negocio vive en productoService.
// ===========================================

async function obtenerProductos(req, res) {
    try {
        const productos = await productoService.listarProductos();
        res.json(productos);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener productos:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
}

async function obtenerProductoPorId(req, res) {
    try {
        const producto = await productoService.obtenerProductoPorId(req.params.id);
        res.json(producto);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener producto:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener el producto' });
    }
}

async function crearProducto(req, res) {
    try {
        const idProducto = await productoService.crearProducto(req.body);
        res.status(201).json({ mensaje: 'Producto creado correctamente', idProducto });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al crear producto:', error.message);
        res.status(500).json({ mensaje: 'Error al crear el producto' });
    }
}

async function actualizarProducto(req, res) {
    try {
        await productoService.actualizarProducto(req.params.id, req.body);
        res.json({ mensaje: 'Producto actualizado correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al actualizar producto:', error.message);
        res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
}

async function eliminarProducto(req, res) {
    try {
        await productoService.eliminarProducto(req.params.id);
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al eliminar producto:', error.message);
        res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};
