// ===========================================
// COMPONENTE PAGE PLACEHOLDER
// Página reutilizable para módulos que aún
// no tienen backend. Muestra el nombre del
// módulo y un mensaje de "en construcción".
// ===========================================

function PagePlaceholder({ titulo, subtitulo, icono }) {
    return (
        <section className="panel placeholder">
            <div className="placeholder-content">
                <i className={`fa-solid ${icono}`}></i>
                <h2>{titulo}</h2>
                <p>{subtitulo}</p>
                <span className="placeholder-badge">Módulo en construcción</span>
            </div>
        </section>
    );
}

export default PagePlaceholder;