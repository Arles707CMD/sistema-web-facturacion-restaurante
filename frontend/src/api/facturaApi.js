// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE FACTURAS
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/facturas';

// Construye el mensaje de error incluyendo los detalles por campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Obtiene todas las facturas desde la API.
async function obtenerFacturas() {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener las facturas')
        );
    }

    return respuesta.json();
}

// Obtiene una factura con su detalle desde la API.
async function obtenerFactura(id) {
    const respuesta = await fetch(`${API_URL}/${id}`);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener la factura')
        );
    }

    return respuesta.json();
}

// Elimina una factura y restaura el stock de los productos.
async function eliminarFactura(id) {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            formatearMensajeError(resultado, 'Error al eliminar la factura')
        );
    }

    return resultado;
}

export {
    obtenerFacturas,
    obtenerFactura,
    eliminarFactura
};