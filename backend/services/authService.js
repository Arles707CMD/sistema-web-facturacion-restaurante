const { generarHashContrasena, verificarContrasena } = require('./passwordService');

const usuarioModel = require('../models/usuarioModel');

// ===========================================
// SERVICIO DE AUTENTICACIÓN
// Contiene la lógica de negocio de registro e
// inicio de sesión: validación, generación y
// verificación de hash, y orquestación con el
// modelo. El controller solo traduce los
// resultados a respuestas HTTP/JSON.
// ===========================================

// Error de dominio. Lleva el código HTTP para que el
// controller no tenga que interpretar la lógica.
class ErrorAutenticacion extends Error {
    constructor(codigo, mensaje, estado = 400) {
        super(mensaje);
        this.codigo = codigo;
        this.estado = estado;
    }
}

// Las funciones de hash/verificación de contraseñas se reutilizan
// desde passwordService para no duplicar la lógica criptográfica.

// Valida el formato básico de un correo electrónico.
function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// ===========================================
// RESULTADO SEGURO
// Nunca se devuelven hash, salt ni contraseña.
// ===========================================

function aUsuarioSeguro(usuario) {
    return {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        estado: usuario.estado
    };
}

// ===========================================
// REGISTRO
// ===========================================

// Crea una cuenta. El rol y el estado se fijan en el
// servicio (Ventas / Activo) para evitar que un registro
// público escale privilegios eligiendo Administrador.
async function registrarUsuario({ nombre, correo, contrasena }) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        throw new ErrorAutenticacion('NOMBRE_REQUERIDO', 'El nombre es obligatorio.');
    }

    if (!correo || typeof correo !== 'string' || correo.trim() === '') {
        throw new ErrorAutenticacion('CORREO_REQUERIDO', 'El correo es obligatorio.');
    }

    if (!esCorreoValido(correo.trim())) {
        throw new ErrorAutenticacion('CORREO_INVALIDO', 'El correo debe tener un formato válido.');
    }

    if (!contrasena || typeof contrasena !== 'string' || contrasena.length < 6) {
        throw new ErrorAutenticacion('CONTRASENA_CORTA', 'La contraseña debe tener al menos 6 caracteres.');
    }

    const correoNormalizado = correo.trim().toLowerCase();

    if (await usuarioModel.existeCorreo(correoNormalizado)) {
        throw new ErrorAutenticacion('CORREO_DUPLICADO', 'El correo ya está registrado.');
    }

    const idUsuario = await usuarioModel.crearUsuario({
        nombre: nombre.trim(),
        correo: correoNormalizado,
        contrasenaHash: generarHashContrasena(contrasena),
        rol: 'Ventas',
        estado: 'Activo'
    });

    return {
        id_usuario: idUsuario,
        nombre: nombre.trim(),
        correo: correoNormalizado,
        rol: 'Ventas',
        estado: 'Activo'
    };
}

// ===========================================
// LOGIN
// ===========================================

// Inicia sesión. Ante credenciales inválidas se devuelve un
// mensaje genérico para no revelar si el correo existe o no.
async function iniciarSesion({ correo, contrasena }) {
    if (!correo || typeof correo !== 'string' || correo.trim() === '') {
        throw new ErrorAutenticacion('CORREO_REQUERIDO', 'El correo es obligatorio.');
    }

    if (!contrasena || typeof contrasena !== 'string' || contrasena === '') {
        throw new ErrorAutenticacion('CONTRASENA_REQUERIDA', 'La contraseña es obligatoria.');
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const usuario = await usuarioModel.obtenerUsuarioParaAutenticacion(correoNormalizado);

    if (!usuario) {
        throw new ErrorAutenticacion('CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.', 401);
    }

    if (usuario.estado !== 'Activo') {
        throw new ErrorAutenticacion('USUARIO_INACTIVO', 'El usuario está inactivo. Contacta al administrador.', 403);
    }

    if (!verificarContrasena(contrasena, usuario.contrasena_hash)) {
        throw new ErrorAutenticacion('CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.', 401);
    }

    return aUsuarioSeguro(usuario);
}

module.exports = {
    ErrorAutenticacion,
    registrarUsuario,
    iniciarSesion
};