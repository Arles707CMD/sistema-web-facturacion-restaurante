const express = require('express');

const { autenticar, autorizarRol } = require('../middleware/authMiddleware');
const {
    obtenerFacturas,
    obtenerFacturaPorId,
    eliminarFactura
} = require('../controllers/facturaController');

const router = express.Router();

// Todas las rutas de facturas exigen un token JWT válido.
router.use(autenticar);

router.get('/', obtenerFacturas);
router.get('/:id', obtenerFacturaPorId);

// Solo el Administrador puede eliminar facturas.
router.delete('/:id', autorizarRol('Administrador'), eliminarFactura);

module.exports = router;