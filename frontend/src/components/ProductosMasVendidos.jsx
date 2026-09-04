// ===========================================
// COMPONENTE PRODUCTOS MÁS VENDIDOS
// Tabla con los productos más vendidos (máximo
// 4) y sus unidades vendidas.
// ===========================================

function ProductosMasVendidos({ productos }) {
    if (productos.length === 0) {
        return <p className="sin-datos">Aún no hay productos vendidos.</p>;
    }

    return (
        <table className="tabla-productos">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Unidades vendidas</th>
                </tr>
            </thead>
            <tbody>
                {productos.map((producto, indice) => (
                    <tr key={indice}>
                        <td>{producto.nombre}</td>
                        <td>{producto.cantidad}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ProductosMasVendidos;