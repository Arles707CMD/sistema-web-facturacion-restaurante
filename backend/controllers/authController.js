const authService = require('../services/authService');

// ===========================================
// CONTROLADOR DE AUTENTICACIÓN
// Recibe la petición HTTP, llama al servicio de
// autenticación y devuelve el código de estado y
// el JSON correspondientes. La lógica de negocio
// (hash, validación, consultas) vive en authService.
// ===========================================

// POST /api/auth/login
async function login(req, res) {
    try {
        const usuario = await authService.iniciarSesion(req.body || {});

        res.json({
            mensaje: 'Inicio de sesión correcto',
            usuario
        });
    } catch (error) {
        if (error instanceof authService.ErrorAutenticacion) {
            return res.status(error.estado).json({ mensaje: error.message });
        }

        console.error('Error al iniciar sesión:', error.message);

        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
}

// POST /api/auth/register
async function registro(req, res) {
    try {
        const usuario = await authService.registrarUsuario(req.body || {});

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente.',
            usuario
        });
    } catch (error) {
        if (error instanceof authService.ErrorAutenticacion) {
            return res.status(error.estado).json({ mensaje: error.message });
        }

        console.error('Error al registrar usuario:', error.message);

        res.status(500).json({ mensaje: 'Error al registrar el usuario' });
    }
}

module.exports = {
    login,
    registro
};