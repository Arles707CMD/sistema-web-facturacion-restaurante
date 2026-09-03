// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE PRODUCTOS
// Utiliza el proxy de Vite (vite.config.js) que
// redirige /api hacia http://localhost:3000.
// ===========================================

const API_URL = '/api/productos';

// Obtiene todos los productos desde la API.
async function obtenerProductos() {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        throw new Error('Error al obtener los productos');
    }

    return respuesta.json();
}

// Obtiene un producto por su id desde la API.
async function obtenerProductoPorId(id) {
    const respuesta = await fetch(`${API_URL}/${id}`);

    if (!respuesta.ok) {
        throw new Error('Error al obtener el producto');
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
        throw new Error(resultado.mensaje || 'Error al crear el producto');
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
        throw new Error(resultado.mensaje || 'Error al actualizar el producto');
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
        throw new Error(resultado.mensaje || 'Error al eliminar el producto');
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