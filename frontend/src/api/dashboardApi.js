// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DEL DASHBOARD
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/dashboard/resumen';

// Construye el mensaje de error incluyendo los detalles por campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Obtiene el resumen completo del dashboard desde la API.
async function obtenerResumen() {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener el resumen del dashboard')
        );
    }

    return respuesta.json();
}

export { obtenerResumen };