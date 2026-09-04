// ===========================================
// COMPONENTE FACTURA TABLE
// Tabla de facturas con número, fecha, cliente,
// documento, método, total, estado y acciones.
// ===========================================

import EmptyState from './common/EmptyState';
import Badge from './common/Badge';

function formatearPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-CO');
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO');
}

function FacturaTable({ facturas, onVer, onEliminar }) {
    if (facturas.length === 0) {
        return (
            <EmptyState
                icono="fa-file-invoice"
                titulo="Sin facturas"
                mensaje="Aún no hay facturas registradas."
            />
        );
    }

    return (
        <div className="tabla-responsive">
            <table className="tabla-productos">
                <thead>
                    <tr>
                        <th># Factura</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Documento</th>
                        <th>Método</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {facturas.map((factura) => (
                        <tr key={factura.id_factura}>
                            <td>{factura.numero_factura}</td>
                            <td>{formatearFecha(factura.fecha)}</td>
                            <td>{factura.cliente}</td>
                            <td>{factura.documento || '-'}</td>
                            <td>{factura.metodo_pago}</td>
                            <td>{formatearPrecio(factura.total)}</td>
                            <td>
                                <Badge variante="success">Pagada</Badge>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-icon ver"
                                    title="Ver factura"
                                    onClick={() => onVer(factura)}
                                >
                                    <i className="fa-solid fa-eye"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon eliminar"
                                    title="Eliminar factura"
                                    onClick={() => onEliminar(factura)}
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

export default FacturaTable;