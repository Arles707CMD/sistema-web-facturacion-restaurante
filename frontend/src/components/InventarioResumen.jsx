// ===========================================
// COMPONENTE INVENTARIO RESUMEN
// Tarjetas de indicadores del inventario.
// ===========================================

function InventarioResumen({ resumen }) {
    const tarjetas = [
        {
            icono: 'fa-boxes-stacked',
            color: 'blue',
            etiqueta: 'Total productos',
            valor: resumen.totalProductos
        },
        {
            icono: 'fa-cubes',
            color: 'red',
            etiqueta: 'Stock total',
            valor: resumen.stockTotal
        },
        {
            icono: 'fa-circle-check',
            color: 'green',
            etiqueta: 'Disponibles',
            valor: resumen.disponibles
        },
        {
            icono: 'fa-circle-xmark',
            color: 'orange',
            etiqueta: 'Agotados',
            valor: resumen.agotados
        },
        {
            icono: 'fa-triangle-exclamation',
            color: 'red',
            etiqueta: 'Stock bajo',
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

export default InventarioResumen;