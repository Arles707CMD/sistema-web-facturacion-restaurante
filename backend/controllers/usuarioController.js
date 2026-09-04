const crypto = require('crypto');

const usuarioModel = require('../models/usuarioModel');

// ===========================================
// CONSTANTES DE VALIDACIÓN
// ===========================================

const ROLES_VALIDOS = ['Administrador', 'Ventas', 'Inventario'];
const ESTADOS_VALIDOS = ['Activo', 'Inactivo'];

// ===========================================
// VALIDACIONES
// ===========================================

// Genera un hash seguro de contraseña con scrypt.
// El resultado se guarda como "sal:hash" (hexadecimal).
function generarHashContrasena(contrasena) {
    const sal = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(contrasena, sal, 64).toString('hex');

    return `${sal}:${hash}`;
}

function esIdValido(id) {
    return Number.isInteger(id) && id > 0;
}

function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarDatosUsuario(usuario, esCreacion) {
    const errores = [];

    const { nombre, correo, contrasena, rol, estado } = usuario;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        errores.push('El nombre es obligatorio.');
    }

    if (!correo || typeof correo !== 'string' || correo.trim() === '') {
        errores.push('El correo es obligatorio.');
    } else if (!esCorreoValido(correo.trim())) {
        errores.push('El correo debe tener un formato válido.');
    }

    if (esCreacion) {
        if (!contrasena || typeof contrasena !== 'string' || contrasena.length < 6) {
            errores.push('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
        }
    } else if (
        contrasena !== undefined &&
        contrasena !== '' &&
        (typeof contrasena !== 'string' || contrasena.length < 6)
    ) {
        errores.push('La contraseña debe tener al menos 6 caracteres.');
    }

    if (!ROLES_VALIDOS.includes(rol)) {
        errores.push('El rol seleccionado no es válido.');
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
        errores.push('El estado seleccionado no es válido.');
    }

    return errores;
}

// ===========================================
// OBTENER TODOS LOS USUARIOS
// ===========================================

async function obtenerUsuarios(req, res) {
    try {
        const usuarios = await usuarioModel.obtenerUsuarios();

        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener los usuarios'
        });
    }
}

// ===========================================
// OBTENER USUARIO POR ID
// ===========================================

async function obtenerUsuarioPorId(req, res) {
    try {
        const idUsuario = Number(req.params.id);

        if (!esIdValido(idUsuario)) {
            return res.status(400).json({
                mensaje: 'El id del usuario debe ser un número entero positivo'
            });
        }

        const usuario = await usuarioModel.obtenerUsuarioPorId(idUsuario);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener el usuario'
        });
    }
}
// ===========================================
// CREAR USUARIO
// ===========================================

async function crearUsuario(req, res) {
    try {
        const errores = validarDatosUsuario(req.body, true);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos del usuario inválidos',
                errores
            });
        }

        const { nombre, correo, contrasena, rol, estado } = req.body;

        const correoNormalizado = correo.trim().toLowerCase();

        const correoExiste = await usuarioModel.existeCorreo(correoNormalizado);

        if (correoExiste) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado.',
                errores: ['El correo ya está registrado.']
            });
        }

        const contrasenaHash = generarHashContrasena(contrasena);

        const idUsuario = await usuarioModel.crearUsuario({
            nombre: nombre.trim(),
            correo: correoNormalizado,
            contrasenaHash,
            rol,
            estado
        });

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            idUsuario
        });
    } catch (error) {
        console.error('Error al crear usuario:', error.message);

        res.status(500).json({
            mensaje: 'Error al crear el usuario'
        });
    }
}

// ===========================================
// ACTUALIZAR USUARIO
// ===========================================

async function actualizarUsuario(req, res) {
    try {
        const idUsuario = Number(req.params.id);

        if (!esIdValido(idUsuario)) {
            return res.status(400).json({
                mensaje: 'El id del usuario debe ser un número entero positivo'
            });
        }

        const errores = validarDatosUsuario(req.body, false);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos del usuario inválidos',
                errores
            });
        }

        const { nombre, correo, contrasena, rol, estado } = req.body;

        const correoNormalizado = correo.trim().toLowerCase();

        const correoExiste = await usuarioModel.existeCorreo(correoNormalizado, idUsuario);

        if (correoExiste) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado.',
                errores: ['El correo ya está registrado.']
            });
        }

        const contrasenaHash =
            contrasena && contrasena !== ''
                ? generarHashContrasena(contrasena)
                : null;

        const filasActualizadas = await usuarioModel.actualizarUsuario(idUsuario, {
            nombre: nombre.trim(),
            correo: correoNormalizado,
            contrasenaHash,
            rol,
            estado
        });

        if (filasActualizadas === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error.message);

        res.status(500).json({
            mensaje: 'Error al actualizar el usuario'
        });
    }
}

// ===========================================
// ELIMINAR USUARIO
// ===========================================

async function eliminarUsuario(req, res) {
    try {
        const idUsuario = Number(req.params.id);

        if (!esIdValido(idUsuario)) {
            return res.status(400).json({
                mensaje: 'El id del usuario debe ser un número entero positivo'
            });
        }

        const filasEliminadas = await usuarioModel.eliminarUsuario(idUsuario);

        if (filasEliminadas === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error.message);

        res.status(500).json({
            mensaje: 'Error al eliminar el usuario'
        });
    }
}

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};