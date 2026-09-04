// ===========================================
// COMPONENTE DASHBOARD CARDS
// Tarjetas de métricas del dashboard usando el
// componente reutilizable StatCard.
// ===========================================

import StatCard from './common/StatCard';

function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO');
}

function DashboardCards({ resumen }) {
    return (
        <section className="cards">
            <StatCard
                icono="fa-chart-line"
                color="red"
                titulo="Ventas de hoy"
                valor={formatearMoneda(resumen.ventasHoy)}
                subtitulo="Registradas hoy"
            />
            <StatCard
                icono="fa-sack-dollar"
                color="green"
                titulo="Ventas totales"
                valor={formatearMoneda(resumen.ventasTotales)}
                subtitulo="Acumuladas"
            />
            <StatCard
                icono="fa-file-invoice-dollar"
                color="blue"
                titulo="Facturas"
                valor={resumen.totalFacturas}
                subtitulo="Registradas"
            />
            <StatCard
                icono="fa-boxes-stacked"
                color="orange"
                titulo="Unidades vendidas"
                valor={resumen.unidadesVendidas}
                subtitulo="Productos vendidos"
            />
            <StatCard
                icono="fa-triangle-exclamation"
                color="orange"
                titulo="Stock bajo"
                valor={resumen.bajoStock}
                subtitulo="Revisar inventario"
            />
            <StatCard
                icono="fa-percent"
                color="green"
                titulo="Disponibilidad"
                valor={resumen.disponibilidad + '%'}
                subtitulo="Productos disponibles"
            />
        </section>
    );
}

export default DashboardCards;