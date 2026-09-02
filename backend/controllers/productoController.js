const productoModel = require('../models/productoModel');

// ===========================================
// VALIDACIONES
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

// ===========================================
// OBTENER TODOS LOS PRODUCTOS
// ===========================================

async function obtenerProductos(req, res) {
    try {
        const productos = await productoModel.obtenerProductos();

        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener los productos'
        });
    }
}

// ===========================================
// OBTENER PRODUCTO POR ID
// ===========================================

async function obtenerProductoPorId(req, res) {
    try {
        const idProducto = Number(req.params.id);

        if (!esIdValido(idProducto)) {
            return res.status(400).json({
                mensaje: 'El id del producto debe ser un número entero positivo'
            });
        }

        const producto = await productoModel.obtenerProductoPorId(idProducto);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener el producto'
        });
    }
}

// ===========================================
// CREAR PRODUCTO
// ===========================================

async function crearProducto(req, res) {
    try {
        const errores = validarDatosProducto(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos del producto inválidos',
                errores
            });
        }

        const idProducto = await productoModel.crearProducto(req.body);

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            idProducto
        });
    } catch (error) {
        console.error('Error al crear producto:', error.message);

        res.status(500).json({
            mensaje: 'Error al crear el producto'
        });
    }
}

// ===========================================
// ACTUALIZAR PRODUCTO
// ===========================================

async function actualizarProducto(req, res) {
    try {
        const { id } = req.params;

        const idProducto = Number(id);

        if (!esIdValido(idProducto)) {
            return res.status(400).json({
                mensaje: 'El id del producto debe ser un número entero positivo'
            });
        }

        const errores = validarDatosProducto(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos del producto inválidos',
                errores
            });
        }

        const filasActualizadas =
            await productoModel.actualizarProducto(idProducto, req.body);

        if (filasActualizadas === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);

        res.status(500).json({
            mensaje: 'Error al actualizar el producto'
        });
    }
}

// ===========================================
// ELIMINAR PRODUCTO
// ===========================================

async function eliminarProducto(req, res) {
    try {
        const { id } = req.params;

        const idProducto = Number(id);

        if (!esIdValido(idProducto)) {
            return res.status(400).json({
                mensaje: 'El id del producto debe ser un número entero positivo'
            });
        }

        const filasEliminadas =
            await productoModel.eliminarProducto(idProducto);

        if (filasEliminadas === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);

        res.status(500).json({
            mensaje: 'Error al eliminar el producto'
        });
    }
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};