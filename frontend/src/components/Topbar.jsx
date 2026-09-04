// ===========================================
// COMPONENTE TOPBAR
// Encabezado superior reutilizable. Recibe el
// número, título y subtítulo del módulo y usa
// useNavigate para la navegación programática
// del botón de retorno.
// ===========================================

import { useNavigate } from 'react-router-dom';

function Topbar({ numero, titulo, subtitulo, rutaVolver }) {
    const navigate = useNavigate();

    return (
        <header className="topbar">
            <div className="title-box">
                <h1>{titulo}</h1>
                <p>{subtitulo}</p>
            </div>
            <button
                type="button"
                className="btn-back"
                onClick={() => navigate(rutaVolver)}
            >
                <i className="fa-solid fa-arrow-left"></i>
                Dashboard
            </button>
        </header>
    );
}

export default Topbar;