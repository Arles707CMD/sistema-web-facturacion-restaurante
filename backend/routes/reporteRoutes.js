const express = require('express');

const { obtenerResumen } = require('../controllers/reporteController');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de reportes exigen un token JWT válido.
router.use(autenticar);

router.get('/resumen', obtenerResumen);

module.exports = router;