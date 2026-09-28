const express = require('express');

const { obtenerResumen } = require('../controllers/metaController');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de metas exigen un token JWT válido.
router.use(autenticar);

router.get('/resumen', obtenerResumen);

module.exports = router;