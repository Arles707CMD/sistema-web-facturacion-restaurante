// ===========================================
// COMPONENTE PRODUCTO VENTA CARD
// Tarjeta de producto para el módulo Ventas.
// Estructura visual uniforme (UX/UI):
//   1. Área del nombre con altura fija (1-2 líneas).
//   2. Fila de detalle: precio (izquierda) y stock (derecha),
//      separados con flexbox para que nunca se junten.
//   3. Botón "Agregar" anclado a la base de la tarjeta.
// La lógica de negocio no cambia: mismo stock, mismo onAgregar.
// ===========================================

function ProductoVentaCard({ producto, onAgregar }) {
    const agotado = Number(producto.stock) <= 0;

    return (
        <article className="producto-card">
            {/* Área 1: nombre con espacio reservado para dos líneas */}
            <h3 className="producto-card-nombre" title={producto.nombre}>
                {producto.nombre}
            </h3>

            {/* Área 2: precio y stock en una fila flexible separada */}
            <div className="producto-card-detalle">
                <span className="producto-card-precio">
                    ${Number(producto.precio).toLocaleString('es-CO')}
                </span>
                <span className={`producto-card-stock ${agotado ? 'agotado' : ''}`}>
                    {agotado ? 'Agotado' : 'Stock: ' + producto.stock}
                </span>
            </div>

            {/* Área 3: botón alineado en la base de todas las tarjetas */}
            <button
                type="button"
                className="btn-agregar"
                disabled={agotado}
                onClick={() => onAgregar(producto)}
            >
                {agotado ? 'Agotado' : 'Agregar'}
            </button>
        </article>
    );
}

export default ProductoVentaCard;