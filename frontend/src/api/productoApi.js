// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE PRODUCTOS
// Utiliza el proxy de Vite (vite.config.js) que
// redirige /api hacia http://localhost:3000.
// ===========================================

const API_URL = '/api/productos';

// Construye el mensaje de error a partir de la respuesta del backend.
// Si la respuesta incluye errores detallados ({ mensaje, errores: [...] }),
// se agregan como líneas para que el usuario identifique cada campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Obtiene todos los productos desde la API.
async function obtenerProductos() {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener los productos')
        );
    }

    return respuesta.json();
}

// Obtiene un producto por su id desde la API.
async function obtenerProductoPorId(id) {
    const respuesta = await fetch(`${API_URL}/${id}`);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener el producto')
        );
    }

    return respuesta.json();
}

// Crea un producto mediante POST.
async function crearProducto(datos) {
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
            formatearMensajeError(resultado, 'Error al crear el producto')
        );
    }

    return resultado;
}

// Actualiza un producto mediante PUT.
async function actualizarProducto(id, datos) {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            formatearMensajeError(resultado, 'Error al actualizar el producto')
        );
    }

    return resultado;
}

// Elimina un producto mediante DELETE.
async function eliminarProducto(id) {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            formatearMensajeError(resultado, 'Error al eliminar el producto')
        );
    }

    return resultado;
}

export {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};