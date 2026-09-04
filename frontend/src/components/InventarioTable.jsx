// ===========================================
// COMPONENTE INVENTARIO TABLE
// Tabla del inventario con producto, categoría,
// precio, stock y estado visual.
// ===========================================

import EmptyState from './common/EmptyState';
import Badge from './common/Badge';

function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO');
}

// Determina el estado y su variante visual según el stock.
function obtenerEstado(stock) {
    if (stock <= 0) {
        return { texto: 'Agotado', variante: 'danger' };
    }
    if (stock <= 10) {
        return { texto: 'Bajo stock', variante: 'warning' };
    }
    return { texto: 'Disponible', variante: 'success' };
}

function InventarioTable({ productos }) {
    if (productos.length === 0) {
        return (
            <EmptyState
                icono="fa-box-open"
                titulo="Sin productos"
                mensaje="No hay productos en el inventario."
            />
        );
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
                                    <Badge variante={estado.variante}>{estado.texto}</Badge>
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