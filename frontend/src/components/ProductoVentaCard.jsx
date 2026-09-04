// ===========================================
// COMPONENTE PRODUCTO VENTA CARD
// Tarjeta de producto para el módulo Ventas,
// con nombre, precio, stock y botón Agregar.
// ===========================================

function ProductoVentaCard({ producto, onAgregar }) {
    const agotado = Number(producto.stock) <= 0;

    return (
        <div className="producto-card">
            <div className="producto-card-info">
                <h3>{producto.nombre}</h3>
                <span className="producto-card-precio">
                    ${Number(producto.precio).toLocaleString('es-CO')}
                </span>
                <span className={`producto-card-stock ${agotado ? 'agotado' : ''}`}>
                    {agotado ? 'Agotado' : 'Stock: ' + producto.stock}
                </span>
            </div>
            <button
                type="button"
                className="btn-agregar"
                disabled={agotado}
                onClick={() => onAgregar(producto)}
            >
                {agotado ? 'Agotado' : 'Agregar'}
            </button>
        </div>
    );
}

export default ProductoVentaCard;