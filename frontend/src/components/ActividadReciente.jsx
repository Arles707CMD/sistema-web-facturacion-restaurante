// ===========================================
// COMPONENTE ACTIVIDAD RECIENTE
// Lista de las últimas facturas registradas
// con número, cliente, fecha y total.
// ===========================================

function ActividadReciente({ actividad }) {
    if (actividad.length === 0) {
        return <p className="sin-datos">Aún no hay actividad registrada.</p>;
    }

    return (
        <ul className="actividad-lista">
            {actividad.map((factura, indice) => (
                <li key={indice} className="actividad-item">
                    <strong>{factura.numero_factura}</strong>
                    <span>{factura.cliente}</span>
                    <span className="actividad-fecha">
                        {new Date(factura.fecha).toLocaleDateString('es-CO')}
                    </span>
                    <span className="actividad-total">
                        ${Number(factura.total).toLocaleString('es-CO')}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default ActividadReciente;