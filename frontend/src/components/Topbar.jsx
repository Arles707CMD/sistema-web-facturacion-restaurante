// ===========================================
// COMPONENTE TOPBAR
// Encabezado superior del módulo Productos con
// el título y una acción de retorno al dashboard.
// ===========================================

function Topbar() {
    return (
        <header className="topbar">
            <div className="title-box">
                <span className="number">05</span>
                <div>
                    <h1>Productos</h1>
                    <p>Administración de productos del restaurante</p>
                </div>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="btn-back">
                <i className="fa-solid fa-arrow-left"></i>
                Dashboard
            </a>
        </header>
    );
}

export default Topbar;