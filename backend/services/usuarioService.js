const usuarioModel = require('../models/usuarioModel');
const { ErrorServicio, esErrorIntegridad } = require('./errors');
const { generarHashContrasena } = require('./passwordService');

// ===========================================
// SERVICIO DE USUARIOS
// Lógica de negocio: validación, hashing y orquestación.
// El hash se comparte con auth vía passwordService.
// ===========================================

const ROLES_VALIDOS = ['Administrador', 'Ventas', 'Inventario'];
const ESTADOS_VALIDOS = ['Activo', 'Inactivo'];

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

async function validarId(id) {
    const idUsuario = Number(id);

    if (!esIdValido(idUsuario)) {
        throw new ErrorServicio(400, 'El id del usuario debe ser un número entero positivo');
    }

    return idUsuario;
}

async function listarUsuarios() {
    return usuarioModel.obtenerUsuarios();
}

async function obtenerUsuarioPorId(id) {
    const idUsuario = await validarId(id);
    const usuario = await usuarioModel.obtenerUsuarioPorId(idUsuario);

    if (!usuario) {
        throw new ErrorServicio(404, 'Usuario no encontrado');
    }

    return usuario;
}

async function crearUsuario(datos) {
    const errores = validarDatosUsuario(datos, true);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos del usuario inválidos', errores);
    }

    const { nombre, correo, contrasena, rol, estado } = datos;

    const correoNormalizado = correo.trim().toLowerCase();

    if (await usuarioModel.existeCorreo(correoNormalizado)) {
        throw new ErrorServicio(400, 'El correo ya está registrado.', ['El correo ya está registrado.']);
    }

    const contrasenaHash = generarHashContrasena(contrasena);

    return usuarioModel.crearUsuario({
        nombre: nombre.trim(),
        correo: correoNormalizado,
        contrasenaHash,
        rol,
        estado
    });
}

async function actualizarUsuario(id, datos) {
    const idUsuario = await validarId(id);
    const errores = validarDatosUsuario(datos, false);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos del usuario inválidos', errores);
    }

    const { nombre, correo, contrasena, rol, estado } = datos;

    const correoNormalizado = correo.trim().toLowerCase();

    if (await usuarioModel.existeCorreo(correoNormalizado, idUsuario)) {
        throw new ErrorServicio(400, 'El correo ya está registrado.', ['El correo ya está registrado.']);
    }

    const contrasenaHash = contrasena && contrasena !== '' ? generarHashContrasena(contrasena) : null;

    const filasActualizadas = await usuarioModel.actualizarUsuario(idUsuario, {
        nombre: nombre.trim(),
        correo: correoNormalizado,
        contrasenaHash,
        rol,
        estado
    });

    if (filasActualizadas === 0) {
        throw new ErrorServicio(404, 'Usuario no encontrado');
    }

    return filasActualizadas;
}

async function eliminarUsuario(id) {
    const idUsuario = await validarId(id);

    let filasEliminadas;

    try {
        filasEliminadas = await usuarioModel.eliminarUsuario(idUsuario);
    } catch (error) {
        if (esErrorIntegridad(error)) {
            throw new ErrorServicio(
                400,
                'No se puede eliminar el usuario porque tiene registros relacionados.'
            );
        }

        throw error;
    }

    if (filasEliminadas === 0) {
        throw new ErrorServicio(404, 'Usuario no encontrado');
    }

    return filasEliminadas;
}

module.exports = {
    listarUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};
