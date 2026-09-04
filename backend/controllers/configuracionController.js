const configuracionModel = require('../models/configuracionModel');

// ===========================================
// VALIDACIONES
// ===========================================

function validarConfiguracion(datos) {
    const errores = [];

    const { nombre, meta_mensual, iva } = datos;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        errores.push('El nombre es obligatorio.');
    }

    if (!Number.isFinite(meta_mensual) || meta_mensual < 0) {
        errores.push('La meta mensual debe ser un número mayor o igual a 0.');
    }

    if (!Number.isFinite(iva) || iva < 0 || iva > 100) {
        errores.push('El IVA debe ser un número entre 0 y 100.');
    }

    return errores;
}

// ===========================================
// OBTENER CONFIGURACIÓN
// ===========================================

async function obtenerConfiguracion(req, res) {
    try {
        const configuracion = await configuracionModel.obtenerConfiguracion();

        if (!configuracion) {
            return res.status(404).json({
                mensaje: 'Configuración no encontrada'
            });
        }

        res.json(configuracion);
    } catch (error) {
        console.error('Error al obtener configuración:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener la configuración'
        });
    }
}

// ===========================================
// ACTUALIZAR CONFIGURACIÓN
// ===========================================

async function actualizarConfiguracion(req, res) {
    try {
        const errores = validarConfiguracion(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos de configuración inválidos',
                errores
            });
        }

        const { nombre, meta_mensual, iva } = req.body;

        await configuracionModel.actualizarConfiguracion({
            nombre: nombre.trim(),
            meta_mensual,
            iva
        });

        res.json({
            mensaje: 'Configuración actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar configuración:', error.message);

        res.status(500).json({
            mensaje: 'Error al actualizar la configuración'
        });
    }
}

module.exports = {
    obtenerConfiguracion,
    actualizarConfiguracion
};