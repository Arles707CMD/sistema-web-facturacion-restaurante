// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE USUARIOS
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/usuarios';

// Construye el mensaje de error incluyendo los detalles por campo.
function formatearMensajeError(resultado, mensajePorDefecto) {
    const mensajeBase = resultado?.mensaje || mensajePorDefecto;

    if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
        const detalles = resultado.errores.map((error) => '• ' + error);

        return [mensajeBase, ...detalles].join('\n');
    }

    return mensajeBase;
}

// Obtiene todos los usuarios desde la API.
async function obtenerUsuarios() {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener los usuarios')
        );
    }

    return respuesta.json();
}

// Obtiene un usuario por su id desde la API.
async function obtenerUsuarioPorId(id) {
    const respuesta = await fetch(`${API_URL}/${id}`);

    if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);

        throw new Error(
            formatearMensajeError(resultado, 'Error al obtener el usuario')
        );
    }

    return respuesta.json();
}

// Crea un usuario mediante POST.
async function crearUsuario(datos) {
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
            formatearMensajeError(resultado, 'Error al crear el usuario')
        );
    }

    return resultado;
}

// Actualiza un usuario mediante PUT.
async function actualizarUsuario(id, datos) {
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
            formatearMensajeError(resultado, 'Error al actualizar el usuario')
        );
    }

    return resultado;
}

// Elimina un usuario mediante DELETE.
async function eliminarUsuario(id) {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            formatearMensajeError(resultado, 'Error al eliminar el usuario')
        );
    }

    return resultado;
}

export {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};