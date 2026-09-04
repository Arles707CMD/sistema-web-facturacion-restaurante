// ===========================================
// COMPONENTE INVENTARIO TABLE
// Tabla del inventario con producto, categoría,
// precio, stock y estado visual.
// ===========================================

function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO');
}

// Determina el estado y su clase visual según el stock.
function obtenerEstado(stock) {
    if (stock <= 0) {
        return { texto: 'Agotado', clase: 'agotado' };
    }
    if (stock <= 10) {
        return { texto: 'Bajo stock', clase: 'bajo' };
    }
    return { texto: 'Disponible', clase: 'disponible' };
}

function InventarioTable({ productos }) {
    if (productos.length === 0) {
        return <p className="sin-datos">No hay productos en el inventario.</p>;
    }

    return (
        <div className="tabla-responsive">
            <table className="tabla-productos">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => {
                        const estado = obtenerEstado(producto.stock);

                        return (
                            <tr key={producto.id_producto}>
                                <td>{producto.nombre}</td>
                                <td>{producto.categoria}</td>
                                <td>{formatearMoneda(producto.precio)}</td>
                                <td>{producto.stock}</td>
                                <td>
                                    <span className={`estado ${estado.clase}`}>
                                        {estado.texto}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default InventarioTable;