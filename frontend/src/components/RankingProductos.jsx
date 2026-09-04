// ===========================================
// COMPONENTE RANKING PRODUCTOS
// Muestra el top de productos más vendidos.
// ===========================================

function RankingProductos({ ranking }) {
    if (ranking.length === 0) {
        return <p className="sin-datos">Aún no hay productos vendidos.</p>;
    }

    return (
        <ol className="ranking-lista">
            {ranking.map((producto, indice) => (
                <li key={indice}>
                    <span className="puesto">{indice + 1}</span>
                    <span>{producto.nombre}</span>
                    <strong>{producto.cantidad} und.</strong>
                </li>
            ))}
        </ol>
    );
}

export default RankingProductos;