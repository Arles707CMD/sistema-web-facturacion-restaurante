const express = require('express');

const { autenticar, autorizarRol } = require('../middleware/authMiddleware');
const {
    obtenerConfiguracion,
    actualizarConfiguracion
} = require('../controllers/configuracionController');

const router = express.Router();

// La configuración del negocio es exclusiva del Administrador.
router.use(autenticar, autorizarRol('Administrador'));

router.get('/', obtenerConfiguracion);
router.put('/', actualizarConfiguracion);

module.exports = router;