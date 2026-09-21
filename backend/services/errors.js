// ===========================================
// ERROR DE DOMINIO COMPARTIDO
// Permite que los services lancen errores de negocio
// con su código HTTP, mensaje y lista de errores opcional.
// El controller solo traduce a la respuesta HTTP.
// ===========================================

class ErrorServicio extends Error {
    constructor(estado, mensaje, errores = null) {
        super(mensaje);
        this.estado = estado;
        this.mensaje = mensaje;

        if (errores !== null) {
            this.errores = errores;
        }
    }
}

// Envía la respuesta HTTP correspondiente a un ErrorServicio.
// Devuelve true si se envió; false si el error no es de dominio
// (en cuyo caso el controller debe responder 500).
function responderError(res, error) {
    if (!(error instanceof ErrorServicio)) {
        return false;
    }

    const body = { mensaje: error.mensaje };

    if (error.errores) {
        body.errores = error.errores;
    }

    res.status(error.estado).json(body);

    return true;
}

module.exports = {
    ErrorServicio,
    responderError
};
