// ===========================================
// RESTAURANTE BALUARTE
// CAPA DE COMUNICACIÓN CON LA API DE AUTENTICACIÓN
// Utiliza el proxy de Vite (/api → localhost:3000).
// ===========================================

const API_URL = '/api/auth/login';

// Inicia sesión con correo y contraseña.
// Devuelve { mensaje, usuario } o lanza un Error con el mensaje.
async function iniciarSesion(correo, contrasena) {
    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al iniciar sesión');
    }

    return resultado;
}

export { iniciarSesion };