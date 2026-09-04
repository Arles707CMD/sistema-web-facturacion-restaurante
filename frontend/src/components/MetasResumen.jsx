// ===========================================
// COMPONENTE METAS RESUMEN
// Muestra la meta mensual, el porcentaje de
// progreso y las métricas derivadas del periodo.
// ===========================================

function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO');
}

function MetasResumen({ resumen }) {
    const {
        metaMensual,
        ventas,
        unidades,
        totalFacturas,
        ticketPromedio,
        porcentaje,
        proyeccion,
        faltante,
        diaria,
        diasRestantes
    } = resumen;

    return (
        <section className="metas-resumen">
            <div className="metas-progreso">
                <div className="metas-porcentaje">
                    <h2>{Math.round(porcentaje)}%</h2>
                    <span>de la meta mensual</span>
                </div>
                <div className="metas-barra">
                    <span style={{ width: porcentaje + '%' }}></span>
                </div>
                <div className="metas-valores">
                    <p>
                        <strong>{formatearMoneda(ventas)}</strong>
                        <span>Meta: {formatearMoneda(metaMensual)}</span>
                    </p>
                </div>
            </div>

            <div className="cards">
                <div className="card">
                    <div className="icon green">
                        <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <div>
                        <p>Proyección mensual</p>
                        <h2>{formatearMoneda(proyeccion)}</h2>
                        <span>Estimación de cierre</span>
                    </div>
                </div>

                <div className="card">
                    <div className="icon red">
                        <i className="fa-solid fa-arrow-trend-down"></i>
                    </div>
                    <div>
                        <p>Faltante</p>
                        <h2>{formatearMoneda(faltante)}</h2>
                        <span>Para alcanzar la meta</span>
                    </div>
                </div>

                <div className="card">
                    <div className="icon orange">
                        <i className="fa-solid fa-calendar-day"></i>
                    </div>
                    <div>
                        <p>Diaria requerida</p>
                        <h2>{formatearMoneda(diaria)}</h2>
                        <span>{diasRestantes} días restantes</span>
                    </div>
                </div>
            </div>

            <div className="cards">
                <div className="card">
                    <div className="icon blue">
                        <i className="fa-solid fa-utensils"></i>
                    </div>
                    <div>
                        <p>Unidades vendidas</p>
                        <h2>{unidades}</h2>
                        <span>Productos</span>
                    </div>
                </div>

                <div className="card">
                    <div className="icon green">
                        <i className="fa-solid fa-file-invoice"></i>
                    </div>
                    <div>
                        <p>Facturas</p>
                        <h2>{totalFacturas}</h2>
                        <span>En el periodo</span>
                    </div>
                </div>

                <div className="card">
                    <div className="icon orange">
                        <i className="fa-solid fa-receipt"></i>
                    </div>
                    <div>
                        <p>Ticket promedio</p>
                        <h2>{formatearMoneda(ticketPromedio)}</h2>
                        <span>Por factura</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default MetasResumen;