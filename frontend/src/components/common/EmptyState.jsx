// ===========================================
// COMPONENTE EMPTY STATE
// Estado vacío reutilizable con icono, título
// y mensaje opcionales.
// ===========================================

function EmptyState({ icono = 'fa-inbox', titulo, mensaje }) {
    return (
        <div className="empty-state">
            <i className={`fa-solid ${icono}`}></i>
            {titulo && <h3>{titulo}</h3>}
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
}

export default EmptyState;