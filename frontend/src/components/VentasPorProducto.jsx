// ===========================================
// COMPONENTE VENTAS POR PRODUCTO
// Tabla con los productos vendidos, unidades
// y ventas totales, ordenada por ventas desc.
// ===========================================

function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO');
}

function VentasPorProducto({ productos }) {
    if (productos.length === 0) {
        return <p className="sin-datos">Aún no hay ventas para generar el reporte.</p>;
    }

    return (
        <div className="tabla-responsive">
            <table className="tabla-productos">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Unidades</th>
                        <th>Ventas</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto, indice) => (
                        <tr key={indice}>
                            <td>{producto.nombre}</td>
                            <td>{producto.cantidad}</td>
                            <td>{formatearMoneda(producto.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default VentasPorProducto;