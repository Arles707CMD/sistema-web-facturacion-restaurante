// ===========================================
// COMPONENTE RESUMEN CARDS
// Muestra tarjetas de resumen con el total de
// productos, categorías y productos con bajo stock.
// ===========================================

function ResumenCards({ totalProductos, totalCategorias, bajoStock }) {
    return (
        <section className="cards">
            <div className="card">
                <div className="icon red">
                    <i className="fa-solid fa-box"></i>
                </div>
                <div>
                    <p>Total Productos</p>
                    <h2>{totalProductos}</h2>
                    <span>Registrados</span>
                </div>
            </div>

            <div className="card">
                <div className="icon green">
                    <i className="fa-solid fa-tags"></i>
                </div>
                <div>
                    <p>Categorías</p>
                    <h2>{totalCategorias}</h2>
                    <span>Disponibles</span>
                </div>
            </div>

            <div className="card">
                <div className="icon orange">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                    <p>Bajo Stock</p>
                    <h2>{bajoStock}</h2>
                    <span>Revisar inventario</span>
                </div>
            </div>
        </section>
    );
}

export default ResumenCards;