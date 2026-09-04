// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE METAS
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/metas/resumen';

// Construye el mensaje de error incluyendo los detalles por campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Obtiene el resumen de metas para un periodo dado.
async function obtenerResumenMetas(periodo) {
    const respuesta = await fetch(`${API_URL}?periodo=${periodo}`);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener el resumen de metas')
        );
    }

    return respuesta.json();
}

export { obtenerResumenMetas };