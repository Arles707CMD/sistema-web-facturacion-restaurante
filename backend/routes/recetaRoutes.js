const express = require('express');

const {
    obtenerRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
} = require('../controllers/recetaController');

const router = express.Router();

router.get('/', obtenerRecetas);
router.get('/:id', obtenerRecetaPorId);
router.post('/', crearReceta);
router.put('/:id', actualizarReceta);
router.delete('/:id', eliminarReceta);

module.exports = router;