// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE VENTAS
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/ventas';

// Construye el mensaje de error incluyendo los detalles por campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Crea una venta (factura + detalle + descuento de stock).
async function crearVenta(datos) {
    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            formatearMensajeError(resultado, 'Error al registrar la venta')
        );
    }

    return resultado;
}

export { crearVenta };