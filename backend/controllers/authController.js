const crypto = require('crypto');

const usuarioModel = require('../models/usuarioModel');

// ===========================================
// AUTENTICACIÓN
// ===========================================

// Verifica la contraseña contra el hash almacenado ("sal:hash").
// Usa timingSafeEqual para evitar ataques de tiempo.
function verificarContrasena(contrasena, hashAlmacenado) {
    const partes = String(hashAlmacenado).split(':');

    if (partes.length !== 2) {
        return false;
    }

    const [sal, hash] = partes;

    try {
        const hashCalculado = crypto.scryptSync(contrasena, sal, 64);
        const hashEsperado = Buffer.from(hash, 'hex');

        return (
            hashCalculado.length === hashEsperado.length &&
            crypto.timingSafeEqual(hashCalculado, hashEsperado)
        );
    } catch (error) {
        return false;
    }
}

// Inicia sesión con correo y contraseña.
async function login(req, res) {
    try {
        const { correo, contrasena } = req.body || {};

        if (!correo || typeof correo !== 'string' || correo.trim() === '') {
            return res.status(400).json({
                mensaje: 'El correo es obligatorio.'
            });
        }

        if (!contrasena || typeof contrasena !== 'string' || contrasena === '') {
            return res.status(400).json({
                mensaje: 'La contraseña es obligatoria.'
            });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        const usuario =
            await usuarioModel.obtenerUsuarioParaAutenticacion(correoNormalizado);

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        if (usuario.estado !== 'Activo') {
            return res.status(403).json({
                mensaje: 'El usuario está inactivo. Contacta al administrador.'
            });
        }

        if (!verificarContrasena(contrasena, usuario.contrasena_hash)) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        res.json({
            mensaje: 'Inicio de sesión correcto',
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
                estado: usuario.estado
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);

        res.status(500).json({
            mensaje: 'Error al iniciar sesión'
        });
    }
}

// ===========================================
// REGISTRO (crear cuenta)
// ===========================================

// Genera el hash seguro de la contraseña (scrypt, "sal:hash").
function generarHashContrasena(contrasena) {
    const sal = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(contrasena, sal, 64).toString('hex');

    return `${sal}:${hash}`;
}

// Valida el formato de un correo electrónico.
function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// Crea una cuenta nueva con rol "Ventas" y estado "Activo".
async function registro(req, res) {
    try {
        const { nombre, correo, contrasena } = req.body || {};

        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({
                mensaje: 'El nombre es obligatorio.'
            });
        }

        if (!correo || typeof correo !== 'string' || !esCorreoValido(correo.trim())) {
            return res.status(400).json({
                mensaje: 'El correo debe tener un formato válido.'
            });
        }

        if (!contrasena || typeof contrasena !== 'string' || contrasena.length < 6) {
            return res.status(400).json({
                mensaje: 'La contraseña debe tener al menos 6 caracteres.'
            });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        const correoExiste = await usuarioModel.existeCorreo(correoNormalizado);

        if (correoExiste) {
            return res.status(409).json({
                mensaje: 'El correo ya está registrado.'
            });
        }

        const idUsuario = await usuarioModel.crearUsuario({
            nombre: nombre.trim(),
            correo: correoNormalizado,
            contrasenaHash: generarHashContrasena(contrasena),
            rol: 'Ventas',
            estado: 'Activo'
        });

        res.status(201).json({
            mensaje: 'Cuenta creada correctamente',
            idUsuario
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);

        res.status(500).json({
            mensaje: 'Error al registrar el usuario'
        });
    }
}

module.exports = {
    login,
    registro
};