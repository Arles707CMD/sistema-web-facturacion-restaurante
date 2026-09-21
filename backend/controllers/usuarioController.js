const usuarioService = require('../services/usuarioService');
const { responderError } = require('../services/errors');

// ===========================================
// CONTROLADOR DE USUARIOS
// Solo req/res y códigos HTTP.
// La lógica de negocio vive en usuarioService.
// ===========================================

async function obtenerUsuarios(req, res) {
    try {
        const usuarios = await usuarioService.listarUsuarios();
        res.json(usuarios);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
}

async function obtenerUsuarioPorId(req, res) {
    try {
        const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);
        res.json(usuario);
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al obtener usuario:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener el usuario' });
    }
}

async function crearUsuario(req, res) {
    try {
        const idUsuario = await usuarioService.crearUsuario(req.body);
        res.status(201).json({ mensaje: 'Usuario creado correctamente', idUsuario });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al crear usuario:', error.message);
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
    }
}

async function actualizarUsuario(req, res) {
    try {
        await usuarioService.actualizarUsuario(req.params.id, req.body);
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al actualizar usuario:', error.message);
        res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    }
}

async function eliminarUsuario(req, res) {
    try {
        await usuarioService.eliminarUsuario(req.params.id);
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        if (responderError(res, error)) return;
        console.error('Error al eliminar usuario:', error.message);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
    }
}

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};
