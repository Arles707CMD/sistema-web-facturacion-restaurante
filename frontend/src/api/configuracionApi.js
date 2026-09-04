// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE CONFIGURACIÓN
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/configuracion';

// Construye el mensaje de error incluyendo los detalles por campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Obtiene la configuración actual desde la API.
async function obtenerConfiguracion() {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener la configuración')
        );
    }

    return respuesta.json();
}

// Actualiza la configuración mediante PUT.
async function actualizarConfiguracion(datos) {
    const respuesta = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            formatearMensajeError(resultado, 'Error al actualizar la configuración')
        );
    }

    return resultado;
}

export { obtenerConfiguracion, actualizarConfiguracion };