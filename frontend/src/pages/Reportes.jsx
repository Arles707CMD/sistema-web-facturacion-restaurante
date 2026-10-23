// ===========================================
// PÁGINA REPORTES
// Resumen de ventas, facturas, unidades y
// productos vendidos, con exportación CSV.
// Consume la API de reportes.
// ===========================================

import { useEffect, useState } from 'react';

import Mensaje from '../components/Mensaje';
import ReporteResumen from '../components/ReporteResumen';
import VentasPorProducto from '../components/VentasPorProducto';

import { obtenerResumenReportes } from '../api/reporteApi';
import { exportarCsvExcel } from '../utils/csvExport';

import '../styles/Reportes.css';

function Reportes() {
    // Resumen del reporte y estados
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Carga el resumen al montar
    useEffect(() => {
        cargarResumen();
    }, []);

    // Obtiene el resumen desde la API
    async function cargarResumen() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerResumenReportes();
            setResumen(datos);
        } catch (error) {
            console.error('Error al cargar reportes:', error.message);
            setError('No se pudieron cargar los datos de reportes.');
        } finally {
            setCargando(false);
        }
    }

    // Exporta los productos vendidos a CSV con formato para Excel
    // en español (separador ";", directiva sep=;, UTF-8 con BOM, CRLF).
    // La construcción y descarga del archivo vive en utils/csvExport.
    function exportarCsv() {
        const encabezados = ['Producto', 'Unidades', 'Ventas'];

        const filas = resumen.ventasPorProducto.map((producto) => [
            producto.nombre,
            producto.cantidad,
            producto.total
        ]);

        exportarCsvExcel('reporte-baluarte.csv', encabezados, filas);
    }

    if (cargando) {
        return (
            <p className="estado-carga">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Cargando reportes...
            </p>
        );
    }

    if (error) {
        return <Mensaje tipo="error" texto={error} />;
    }

    return (
        <div className="reportes-container">
            <ReporteResumen resumen={resumen} />

            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-chart-line"></i>
                        Productos vendidos
                    </h2>
                    <button className="btn-gray" type="button" onClick={exportarCsv}>
                        <i className="fa-solid fa-download"></i>
                        Exportar CSV
                    </button>
                </div>

                <VentasPorProducto productos={resumen.ventasPorProducto} />
            </section>
        </div>
    );
}

export default Reportes;