const express = require('express');

const { obtenerResumen } = require('../controllers/metaController');

const router = express.Router();

router.get('/resumen', obtenerResumen);

module.exports = router;