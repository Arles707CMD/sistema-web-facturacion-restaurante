const express = require('express');

const { crearVenta } = require('../controllers/ventaController');

const router = express.Router();

router.post('/', crearVenta);

module.exports = router;