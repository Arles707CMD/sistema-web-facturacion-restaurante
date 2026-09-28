const express = require('express');

const { autenticar, autorizarRol } = require('../middleware/authMiddleware');
const {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController');

const router = express.Router();

// Todas las rutas de productos exigen un token JWT válido.
router.use(autenticar);

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Solo Administrador o Inventario pueden crear, editar o eliminar productos.
router.post('/', autorizarRol('Administrador', 'Inventario'), crearProducto);
router.put('/:id', autorizarRol('Administrador', 'Inventario'), actualizarProducto);
router.delete('/:id', autorizarRol('Administrador', 'Inventario'), eliminarProducto);

module.exports = router;