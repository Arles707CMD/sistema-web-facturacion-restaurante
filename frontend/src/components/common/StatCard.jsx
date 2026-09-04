// ===========================================
// COMPONENTE STAT CARD
// Tarjeta de métrica reutilizable con icono,
// título, valor y subtítulo opcional.
// ===========================================

function StatCard({ icono, titulo, valor, subtitulo, color = 'red' }) {
    return (
        <div className="card">
            <div className={`icon ${color}`}>
                <i className={`fa-solid ${icono}`}></i>
            </div>
            <div>
                <p>{titulo}</p>
                <h2>{valor}</h2>
                {subtitulo && <span>{subtitulo}</span>}
            </div>
        </div>
    );
}

export default StatCard;