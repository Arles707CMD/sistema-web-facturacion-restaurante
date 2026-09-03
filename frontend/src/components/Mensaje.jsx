// ===========================================
// COMPONENTE MENSAJE
// Muestra mensajes de éxito o error en la
// interfaz, con estilo diferenciado según el tipo.
// ===========================================

function Mensaje({ tipo, texto }) {
    if (!texto) {
        return null;
    }

    const esError = tipo === 'error';

    return (
        <div className={`mensaje-producto ${esError ? 'error' : 'exito'}`} role="alert">
            <i className={`fa-solid ${esError ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
            <span>{texto}</span>
        </div>
    );
}

export default Mensaje;