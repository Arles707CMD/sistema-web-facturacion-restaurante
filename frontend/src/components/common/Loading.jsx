// ===========================================
// COMPONENTE LOADING
// Indicador de carga reutilizable.
// ===========================================

function Loading({ texto = 'Cargando...' }) {
    return (
        <div className="loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>{texto}</span>
        </div>
    );
}

export default Loading;