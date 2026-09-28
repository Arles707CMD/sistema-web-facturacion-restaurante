const express = require('express');

const { autenticar, autorizarRol } = require('../middleware/authMiddleware');
const {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuarioController');

const router = express.Router();

// La gestión de usuarios es exclusiva del Administrador.
router.use(autenticar, autorizarRol('Administrador'));

router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;