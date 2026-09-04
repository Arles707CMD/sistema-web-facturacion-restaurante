// ===========================================
// PÁGINA INVENTARIO
// Vista de consulta del stock actual con
// indicadores, búsqueda y filtro por categoría.
// NO modifica el stock (solo lectura).
// ===========================================

import { useEffect, useMemo, useState } from 'react';

import Mensaje from '../components/Mensaje';
import InventarioResumen from '../components/InventarioResumen';
import InventarioTable from '../components/InventarioTable';

import { obtenerResumenInventario } from '../api/inventarioApi';

import '../styles/Inventario.css';

function Inventario() {
    // Resumen del inventario y estados
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Búsqueda y filtro por categoría
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');

    // Carga el resumen al montar
    useEffect(() => {
        cargarResumen();
    }, []);

    // Obtiene el resumen desde la API
    async function cargarResumen() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerResumenInventario();
            setResumen(datos);
        } catch (error) {
            console.error('Error al cargar inventario:', error.message);
            setError('No se pudieron cargar los datos de inventario.');
        } finally {
            setCargando(false);
        }
    }

    // Categorías únicas desde los datos reales
    const categorias = useMemo(() => {
        if (!resumen) {
            return [];
        }

        return [...new Set(resumen.productos.map((producto) => producto.categoria))];
    }, [resumen]);

    // Productos filtrados por búsqueda y categoría
    const productosFiltrados = useMemo(() => {
        if (!resumen) {
            return [];
        }

        const texto = busqueda.toLowerCase();

        return resumen.productos.filter((producto) => {
            const coincideTexto = producto.nombre.toLowerCase().includes(texto);
            const coincideCategoria =
                filtroCategoria === '' || producto.categoria === filtroCategoria;

            return coincideTexto && coincideCategoria;
        });
    }, [resumen, busqueda, filtroCategoria]);

    if (cargando) {
        return (
            <p className="estado-carga">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Cargando inventario...
            </p>
        );
    }

    if (error) {
        return <Mensaje tipo="error" texto={error} />;
    }

    return (
        <div className="inventario-container">
            <InventarioResumen resumen={resumen} />

            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-warehouse"></i>
                        Inventario de productos
                    </h2>
                </div>

                <div className="busqueda">
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                    />
                    <select
                        value={filtroCategoria}
                        onChange={(evento) => setFiltroCategoria(evento.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>

                <InventarioTable productos={productosFiltrados} />
            </section>
        </div>
    );
}

export default Inventario;