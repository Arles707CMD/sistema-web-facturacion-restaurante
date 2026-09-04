// ===========================================
// COMPONENTE FACTURA DETALLE
// Muestra la información completa de una factura
// (cabecera, productos y totales) dentro de un
// Modal. No usa alert().
// ===========================================

function formatearPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-CO');
}

function FacturaDetalle({ factura }) {
    if (!factura) {
        return null;
    }

    return (
        <div className="factura-detalle">
            <div className="factura-cabecera">
                <p><strong>Número:</strong> {factura.numero_factura}</p>
                <p>
                    <strong>Fecha:</strong>{' '}
                    {new Date(factura.fecha).toLocaleDateString('es-CO')}
                </p>
                <p><strong>Cliente:</strong> {factura.cliente}</p>
                <p><strong>Documento:</strong> {factura.documento || '-'}</p>
                <p><strong>Teléfono:</strong> {factura.telefono || '-'}</p>
                <p><strong>Método de pago:</strong> {factura.metodo_pago}</p>
                <p><strong>Observaciones:</strong> {factura.observaciones || '-'}</p>
            </div>

            <table className="tabla-productos">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {factura.productos.map((producto, indice) => (
                        <tr key={indice}>
                            <td>{producto.nombre}</td>
                            <td>{producto.cantidad}</td>
                            <td>{formatearPrecio(producto.precio_unitario)}</td>
                            <td>{formatearPrecio(producto.subtotal_linea)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="totales">
                <p>
                    <span>Subtotal:</span>
                    <strong>{formatearPrecio(factura.subtotal)}</strong>
                </p>
                <p>
                    <span>IVA:</span>
                    <strong>{formatearPrecio(factura.iva)}</strong>
                </p>
                <p className="total">
                    <span>Total:</span>
                    <strong>{formatearPrecio(factura.total)}</strong>
                </p>
            </div>
        </div>
    );
}

export default FacturaDetalle;