const express = require('express');

const { autenticar, autorizarRol } = require('../middleware/authMiddleware');
const {
    obtenerRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
} = require('../controllers/recetaController');

const router = express.Router();

// Las recetas solo las gestionan Administrador e Inventario.
router.use(autenticar, autorizarRol('Administrador', 'Inventario'));

router.get('/', obtenerRecetas);
router.get('/:id', obtenerRecetaPorId);
router.post('/', crearReceta);
router.put('/:id', actualizarReceta);
router.delete('/:id', eliminarReceta);

module.exports = router;