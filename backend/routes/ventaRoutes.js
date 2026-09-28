const express = require('express');

const { crearVenta } = require('../controllers/ventaController');
const { autenticar, autorizarRol } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de ventas exigen un token JWT válido.
router.use(autenticar);

// Solo Administrador o Ventas pueden registrar ventas.
router.post('/', autorizarRol('Administrador', 'Ventas'), crearVenta);

module.exports = router;