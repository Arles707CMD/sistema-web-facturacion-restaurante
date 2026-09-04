// ===========================================
// COMPONENTE GRÁFICO VENTAS
// Gráfico de barras de los últimos 7 días.
// Usa Chart.js (dependencia npm) con useRef y
// useEffect; destruye la instancia al desmontar.
// ===========================================

import { useEffect, useRef } from 'react';

import { Chart } from 'chart.js/auto';

function GraficoVentas({ ventasSemana }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        // Destruye la instancia anterior si existe
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        const etiquetas = ventasSemana.map((dia) => {
            const [anio, mes, fecha] = dia.fecha.split('-');

            return new Date(anio, mes - 1, fecha).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short'
            });
        });

        const valores = ventasSemana.map((dia) => Number(dia.total));

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [
                    {
                        label: 'Ventas',
                        data: valores,
                        backgroundColor: '#E53935',
                        borderRadius: 10
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#EEEEEE' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Limpia el gráfico al desmontar el componente
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [ventasSemana]);

    return (
        <div className="grafico-contenedor">
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

export default GraficoVentas;