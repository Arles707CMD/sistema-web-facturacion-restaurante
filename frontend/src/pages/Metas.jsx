// ===========================================
// PÁGINA METAS
// Seguimiento de la meta mensual de ventas con
// indicadores, gráfico y ranking. Consume la API
// de metas con un periodo seleccionable.
// ===========================================

import { useEffect, useState } from 'react';

import Mensaje from '../components/Mensaje';
import MetasResumen from '../components/MetasResumen';
import RankingProductos from '../components/RankingProductos';
import GraficoVentas from '../components/GraficoVentas';

import { obtenerResumenMetas } from '../api/metaApi';

import '../styles/Metas.css';

function Metas() {
    // Periodo seleccionado y datos del resumen
    const [periodo, setPeriodo] = useState('mes');
    const [resumen, setResumen] = useState(null);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Recarga el resumen cuando cambia el periodo
    useEffect(() => {
        cargarResumen();
    }, [periodo]);

    // Obtiene el resumen de metas del periodo actual
    async function cargarResumen() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerResumenMetas(periodo);
            setResumen(datos);
        } catch (error) {
            console.error('Error al cargar metas:', error.message);
            setError('No se pudieron cargar los datos de metas.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="metas-container">
            <div className="periodo-buttons">
                <button
                    type="button"
                    className={periodo === 'mes' ? 'activo' : ''}
                    onClick={() => setPeriodo('mes')}
                >
                    Este mes
                </button>
                <button
                    type="button"
                    className={periodo === 'semana' ? 'activo' : ''}
                    onClick={() => setPeriodo('semana')}
                >
                    Últimos 7 días
                </button>
                <button
                    type="button"
                    className={periodo === 'todo' ? 'activo' : ''}
                    onClick={() => setPeriodo('todo')}
                >
                    Histórico
                </button>
            </div>

            {cargando && (
                <p className="estado-carga">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Cargando metas...
                </p>
            )}

            {error && !cargando && <Mensaje tipo="error" texto={error} />}

            {!cargando && !error && resumen && (
                <>
                    <MetasResumen resumen={resumen} />

                    <section className="panel">
                        <div className="panel-header">
                            <h2>
                                <i className="fa-solid fa-chart-column"></i>
                                Gráfico de ventas
                            </h2>
                        </div>
                        <GraficoVentas ventasSemana={resumen.grafica} />
                    </section>

                    <section className="panel">
                        <div className="panel-header">
                            <h2>
                                <i className="fa-solid fa-medal"></i>
                                Productos más vendidos
                            </h2>
                        </div>
                        <RankingProductos ranking={resumen.rankingProductos} />
                    </section>
                </>
            )}
        </div>
    );
}

export default Metas;