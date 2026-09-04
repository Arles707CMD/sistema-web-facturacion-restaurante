// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE RECETAS
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/recetas';

// Construye el mensaje de error incluyendo los detalles por campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Obtiene todas las recetas desde la API.
async function obtenerRecetas() {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener las recetas')
        );
    }

    return respuesta.json();
}

// Obtiene una receta por su id desde la API.
async function obtenerReceta(id) {
    const respuesta = await fetch(`${API_URL}/${id}`);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener la receta')
        );
    }

    return respuesta.json();
}

// Crea una receta mediante POST.
async function crearReceta(datos) {
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
            formatearMensajeError(resultado, 'Error al crear la receta')
        );
    }

    return resultado;
}

// Actualiza una receta mediante PUT.
async function actualizarReceta(id, datos) {
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
            formatearMensajeError(resultado, 'Error al actualizar la receta')
        );
    }

    return resultado;
}

// Elimina una receta mediante DELETE.
async function eliminarReceta(id) {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            formatearMensajeError(resultado, 'Error al eliminar la receta')
        );
    }

    return resultado;
}

export {
    obtenerRecetas,
    obtenerReceta,
    crearReceta,
    actualizarReceta,
    eliminarReceta
};