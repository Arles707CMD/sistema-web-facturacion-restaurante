// ===========================================
// COMPONENTE REPORTE RESUMEN
// Tarjetas de resumen del módulo Reportes.
// ===========================================

function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO');
}

function ReporteResumen({ resumen }) {
    const tarjetas = [
        {
            icono: 'fa-sack-dollar',
            color: 'red',
            etiqueta: 'Ventas acumuladas',
            valor: formatearMoneda(resumen.ventas)
        },
        {
            icono: 'fa-file-invoice',
            color: 'blue',
            etiqueta: 'Facturas registradas',
            valor: resumen.totalFacturas
        },
        {
            icono: 'fa-boxes-stacked',
            color: 'green',
            etiqueta: 'Unidades vendidas',
            valor: resumen.unidadesVendidas
        },
        {
            icono: 'fa-triangle-exclamation',
            color: 'orange',
            etiqueta: 'Productos con stock bajo',
            valor: resumen.stockBajo
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
                    </div>
                </div>
            ))}
        </section>
    );
}

export default ReporteResumen;