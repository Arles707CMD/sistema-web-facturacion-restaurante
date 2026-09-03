// ===========================================
// COMPONENTE MENSAJE
// Muestra mensajes de éxito o error en la
// interfaz. Si el texto contiene varias líneas
// separadas por \n, la primera es el mensaje
// general y el resto se muestran como lista de
// detalles (errores por campo).
// ===========================================

function Mensaje({ tipo, texto }) {
    if (!texto) {
        return null;
    }

    const esError = tipo === 'error';

    const lineas = texto
        .split('\n')
        .map((linea) => linea.trim())
        .filter(Boolean);

    const mensajePrincipal = lineas[0] || '';
    const detalles = lineas.slice(1);

    return (
        <div className={`mensaje-producto ${esError ? 'error' : 'exito'}`} role="alert">
            <i className={`fa-solid ${esError ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
            <div>
                <span>{mensajePrincipal}</span>
                {detalles.length > 0 && (
                    <ul className="mensaje-detalles">
                        {detalles.map((detalle, indice) => (
                            <li key={indice}>{detalle}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Mensaje;