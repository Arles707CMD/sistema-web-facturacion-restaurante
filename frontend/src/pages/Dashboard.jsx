// ===========================================
// PÁGINA DASHBOARD
// Resumen general del restaurante con datos
// reales de MariaDB obtenidos mediante la API.
// ===========================================

import { lazy, Suspense, useEffect, useState } from 'react';

import Mensaje from '../components/Mensaje';
import Loading from '../components/common/Loading';
import DashboardCards from '../components/DashboardCards';
import ProductosMasVendidos from '../components/ProductosMasVendidos';
import ActividadReciente from '../components/ActividadReciente';

import { obtenerResumen } from '../api/dashboardApi';

import '../styles/Dashboard.css';

// Chart.js es la dependencia más pesada del bundle; se carga de
// forma diferida únicamente cuando el gráfico se va a mostrar.
// El fallback usa la misma clase para reservar la altura del panel.
const GraficoVentas = lazy(() => import('../components/GraficoVentas'));

function Dashboard() {
    // Resumen del dashboard y estados de carga/error
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Carga el resumen al montar el componente
    useEffect(() => {
        cargarResumen();
    }, []);

    // Obtiene el resumen del backend
    async function cargarResumen() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerResumen();
            setResumen(datos);
        } catch (error) {
            console.error('Error al cargar dashboard:', error.message);
            setError('No se pudieron cargar los datos del dashboard.');
        } finally {
            setCargando(false);
        }
    }

    if (cargando) {
        return <Loading texto="Cargando dashboard..." />;
    }

    if (error) {
        return <Mensaje tipo="error" texto={error} />;
    }

    return (
        <div className="dashboard-container">
            <DashboardCards resumen={resumen} />

            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-chart-column"></i>
                        Ventas de la semana
                    </h2>
                </div>
                <Suspense fallback={<div className="grafico-contenedor"></div>}>
                    <GraficoVentas ventasSemana={resumen.ventasSemana} />
                </Suspense>
            </section>

            <div className="dashboard-columnas">
                <section className="panel">
                    <div className="panel-header">
                        <h2>
                            <i className="fa-solid fa-fire"></i>
                            Productos más vendidos
                        </h2>
                    </div>
                    <ProductosMasVendidos productos={resumen.productosMasVendidos} />
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            Actividad reciente
                        </h2>
                    </div>
                    <ActividadReciente actividad={resumen.actividadReciente} />
                </section>
            </div>
        </div>
    );
}

export default Dashboard;