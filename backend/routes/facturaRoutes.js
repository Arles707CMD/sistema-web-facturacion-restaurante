const express = require('express');

const {
    obtenerFacturas,
    obtenerFacturaPorId,
    eliminarFactura
} = require('../controllers/facturaController');

const router = express.Router();

router.get('/', obtenerFacturas);
router.get('/:id', obtenerFacturaPorId);
router.delete('/:id', eliminarFactura);

module.exports = router;