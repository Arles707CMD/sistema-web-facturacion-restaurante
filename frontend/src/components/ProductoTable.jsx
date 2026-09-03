// ===========================================
// COMPONENTE PRODUCTO TABLE
// Tabla de productos con estado de stock y
// acciones de ver, editar y eliminar.
// ===========================================

// Formatea un número como moneda en formato colombiano
function formatearPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-CO');
}

// Genera el código visual a partir del id del producto
function obtenerCodigo(producto) {
    return 'P' + String(producto.id_producto).padStart(3, '0');
}

// Determina la clase de color según el stock
function obtenerClaseStock(stock) {
    if (stock <= 0) {
        return 'agotado';
    }
    if (stock <= 10) {
        return 'bajo';
    }
    return 'disponible';
}

// Determina el texto de estado según el stock
function obtenerEstadoStock(stock) {
    if (stock <= 0) {
        return 'Agotado';
    }
    if (stock <= 10) {
        return 'Bajo Stock';
    }
    return 'Disponible';
}

function ProductoTable({ productos, onVer, onEditar, onEliminar }) {
    return (
        <div className="tabla-responsive">
            <table className="tabla-productos">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.id_producto}>
                            <td>{obtenerCodigo(producto)}</td>
                            <td>{producto.nombre}</td>
                            <td>{producto.categoria}</td>
                            <td>{formatearPrecio(producto.precio)}</td>
                            <td>{producto.stock}</td>
                            <td>
                                <span className={`estado ${obtenerClaseStock(producto.stock)}`}>
                                    {obtenerEstadoStock(producto.stock)}
                                </span>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-icon ver"
                                    title="Ver"
                                    onClick={() => onVer(producto)}
                                >
                                    <i className="fa-solid fa-eye"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon editar"
                                    title="Editar"
                                    onClick={() => onEditar(producto)}
                                >
                                    <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon eliminar"
                                    title="Eliminar"
                                    onClick={() => onEliminar(producto)}
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductoTable;