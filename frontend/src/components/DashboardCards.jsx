// ===========================================
// COMPONENTE DASHBOARD CARDS
// Tarjetas de métricas del dashboard: ventas
// del día, ventas totales, facturas, unidades
// vendidas, stock bajo y disponibilidad.
// ===========================================

function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO');
}

function DashboardCards({ resumen }) {
    const tarjetas = [
        {
            icono: 'fa-chart-line',
            color: 'red',
            etiqueta: 'Ventas de hoy',
            valor: formatearMoneda(resumen.ventasHoy),
            detalle: 'Registradas hoy'
        },
        {
            icono: 'fa-sack-dollar',
            color: 'green',
            etiqueta: 'Ventas totales',
            valor: formatearMoneda(resumen.ventasTotales),
            detalle: 'Acumuladas'
        },
        {
            icono: 'fa-file-invoice-dollar',
            color: 'blue',
            etiqueta: 'Facturas',
            valor: resumen.totalFacturas,
            detalle: 'Registradas'
        },
        {
            icono: 'fa-boxes-stacked',
            color: 'orange',
            etiqueta: 'Unidades vendidas',
            valor: resumen.unidadesVendidas,
            detalle: 'Productos vendidos'
        },
        {
            icono: 'fa-triangle-exclamation',
            color: 'orange',
            etiqueta: 'Stock bajo',
            valor: resumen.bajoStock,
            detalle: 'Revisar inventario'
        },
        {
            icono: 'fa-percent',
            color: 'green',
            etiqueta: 'Disponibilidad',
            valor: resumen.disponibilidad + '%',
            detalle: 'Productos disponibles'
        }
    ];

    return (
        <section className="cards">
            {tarjetas.map((tarjeta, indice) => (
                <div className="card" key={indice}>
                    <div className={`icon ${tarjeta.color}`}>
                        <i className={`fa-solid ${tarjeta.icono}`}></i>
                    </div>
                    <div>
                        <p>{tarjeta.etiqueta}</p>
                        <h2>{tarjeta.valor}</h2>
                        <span>{tarjeta.detalle}</span>
                    </div>
                </div>
            ))}
        </section>
    );
}

export default DashboardCards;