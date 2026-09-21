const configuracionModel = require('../models/configuracionModel');
const { ErrorServicio } = require('./errors');

// ===========================================
// SERVICIO DE CONFIGURACIÓN
// Lógica de negocio: validación y orquestación.
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

async function obtenerConfiguracion() {
    const configuracion = await configuracionModel.obtenerConfiguracion();

    if (!configuracion) {
        throw new ErrorServicio(404, 'Configuración no encontrada');
    }

    return configuracion;
}

async function actualizarConfiguracion(datos) {
    const errores = validarConfiguracion(datos);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos de configuración inválidos', errores);
    }

    const { nombre, meta_mensual, iva } = datos;

    await configuracionModel.actualizarConfiguracion({
        nombre: nombre.trim(),
        meta_mensual,
        iva
    });
}

module.exports = {
    obtenerConfiguracion,
    actualizarConfiguracion
};
