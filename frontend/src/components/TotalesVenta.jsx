// ===========================================
// COMPONENTE TOTALES VENTA
// Muestra el subtotal, el IVA y el total de la
// venta actual. El cálculo definitivo lo hace el
// backend; aquí es solo visualización.
// ===========================================

function TotalesVenta({ subtotal, iva, total }) {
    const formatear = (valor) => '$' + Number(valor).toLocaleString('es-CO');

    return (
        <div className="totales">
            <p>
                <span>Subtotal:</span>
                <strong>{formatear(subtotal)}</strong>
            </p>
            <p>
                <span>IVA (19%):</span>
                <strong>{formatear(iva)}</strong>
            </p>
            <p className="total">
                <span>Total:</span>
                <strong>{formatear(total)}</strong>
            </p>
        </div>
    );
}

export default TotalesVenta;