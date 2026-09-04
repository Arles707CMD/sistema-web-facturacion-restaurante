// ===========================================
// COMPONENTE RECETA RESUMEN
// Tarjetas de resumen: total, activas, en
// revisión e inactivas.
// ===========================================

function RecetaResumen({ total, activas, revision, inactivas }) {
    return (
        <section className="cards">
            <div className="card">
                <div className="icon red">
                    <i className="fa-solid fa-book-open"></i>
                </div>
                <div>
                    <p>Total recetas</p>
                    <h2>{total}</h2>
                    <span>Vinculadas a productos</span>
                </div>
            </div>

            <div className="card">
                <div className="icon green">
                    <i className="fa-solid fa-utensils"></i>
                </div>
                <div>
                    <p>Recetas activas</p>
                    <h2>{activas}</h2>
                    <span>Disponibles para venta</span>
                </div>
            </div>

            <div className="card">
                <div className="icon orange">
                    <i className="fa-solid fa-clock"></i>
                </div>
                <div>
                    <p>En revisión</p>
                    <h2>{revision}</h2>
                    <span>Por completar</span>
                </div>
            </div>

            <div className="card">
                <div className="icon blue">
                    <i className="fa-solid fa-box-archive"></i>
                </div>
                <div>
                    <p>Inactivas</p>
                    <h2>{inactivas}</h2>
                    <span>No disponibles</span>
                </div>
            </div>
        </section>
    );
}

export default RecetaResumen;