const express = require('express');

const { obtenerResumen } = require('../controllers/inventarioController');

const router = express.Router();

router.get('/resumen', obtenerResumen);

module.exports = router;