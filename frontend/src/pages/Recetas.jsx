// ===========================================
// PÁGINA RECETAS
// Gestión de recetas: listado, búsqueda,
// filtro por estado, crear, editar, ver y
// eliminar. Consume la API de recetas.
// ===========================================

import { useEffect, useMemo, useState } from 'react';

import Mensaje from '../components/Mensaje';
import Modal from '../components/common/Modal';
import RecetaResumen from '../components/RecetaResumen';
import RecetaTable from '../components/RecetaTable';
import RecetaForm from '../components/RecetaForm';

import {
    actualizarReceta,
    crearReceta,
    eliminarReceta,
    obtenerRecetas
} from '../api/recetaApi';
import { obtenerProductos } from '../api/productoApi';

import '../styles/Recetas.css';

function Recetas() {
    // Recetas y productos (para el formulario)
    const [recetas, setRecetas] = useState([]);
    const [productos, setProductos] = useState([]);

    // Estados de carga, error y filtros
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todas');

    // Mensaje temporal
    const [mensaje, setMensaje] = useState(null);

    // Receta en edición y visibilidad del modal
    const [recetaEditar, setRecetaEditar] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    // Receta seleccionada para visualizar
    const [recetaVer, setRecetaVer] = useState(null);

    // Carga recetas y productos al montar
    useEffect(() => {
        cargarDatos();
    }, []);

    // Obtiene recetas y productos desde la API
    async function cargarDatos() {
        setCargando(true);
        setError('');

        try {
            const [datosRecetas, datosProductos] = await Promise.all([
                obtenerRecetas(),
                obtenerProductos()
            ]);

            setRecetas(datosRecetas);
            setProductos(datosProductos);
        } catch (error) {
            console.error('Error al cargar recetas:', error.message);
            setError('No se pudieron cargar las recetas.');
        } finally {
            setCargando(false);
        }
    }

    function mostrarMensaje(texto, tipo) {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 5000);
    }

    function abrirNuevaReceta() {
        setRecetaEditar(null);
        setModalAbierto(true);
    }

    function abrirEditarReceta(receta) {
        setRecetaEditar(receta);
        setModalAbierto(true);
    }

    function verReceta(receta) {
        setRecetaVer(receta);
    }

    // Crea o actualiza una receta
    async function guardarReceta(datos) {
        const esEdicion = recetaEditar !== null;

        try {
            if (esEdicion) {
                await actualizarReceta(recetaEditar.id_receta, datos);
                mostrarMensaje('Receta actualizada correctamente.', 'exito');
            } else {
                await crearReceta(datos);
                mostrarMensaje('Receta creada correctamente.', 'exito');
            }

            setModalAbierto(false);
            setRecetaEditar(null);
            await cargarDatos();
        } catch (error) {
            console.error('Error al guardar receta:', error.message);
            mostrarMensaje(error.message, 'error');
        }
    }

    // Elimina una receta
    async function eliminarRecetaHandler(receta) {
        const confirmar = confirm(
            '¿Está seguro de eliminar la receta de "' + receta.producto + '"?'
        );

        if (!confirmar) {
            return;
        }

        try {
            await eliminarReceta(receta.id_receta);
            mostrarMensaje('Receta eliminada correctamente.', 'exito');
            await cargarDatos();
        } catch (error) {
            console.error('Error al eliminar receta:', error.message);
            mostrarMensaje(error.message, 'error');
        }
    }

    // Recetas filtradas por búsqueda y estado
    const recetasFiltradas = useMemo(() => {
        const texto = busqueda.toLowerCase();

        return recetas.filter((receta) => {
            const coincideTexto =
                receta.producto.toLowerCase().includes(texto) ||
                receta.categoria.toLowerCase().includes(texto);

            const coincideEstado =
                filtroEstado === 'Todas' || receta.estado === filtroEstado;

            return coincideTexto && coincideEstado;
        });
    }, [recetas, busqueda, filtroEstado]);

    // Indicadores del resumen
    const totalRecetas = recetas.length;
    const activas = recetas.filter((r) => r.estado === 'Activa').length;
    const revision = recetas.filter((r) => r.estado === 'En revisión').length;
    const inactivas = recetas.filter((r) => r.estado === 'Inactiva').length;
return (
        <div className="recetas-container">
            <RecetaResumen
                total={totalRecetas}
                activas={activas}
                revision={revision}
                inactivas={inactivas}
            />

            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-book-open"></i>
                        Lista de recetas
                    </h2>
                    <button className="btn-red" type="button" onClick={abrirNuevaReceta}>
                        <i className="fa-solid fa-plus"></i>
                        Nueva receta
                    </button>
                </div>

                {mensaje && <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />}

                {error && !cargando && <Mensaje tipo="error" texto={error} />}

                <div className="busqueda">
                    <input
                        type="text"
                        placeholder="Buscar receta o producto..."
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                    />
                    <select
                        value={filtroEstado}
                        onChange={(evento) => setFiltroEstado(evento.target.value)}
                    >
                        <option value="Todas">Todos los estados</option>
                        <option value="Activa">Activas</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Inactiva">Inactivas</option>
                    </select>
                </div>

                {cargando ? (
                    <p className="estado-carga">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Cargando recetas...
                    </p>
                ) : (
                    <RecetaTable
                        recetas={recetasFiltradas}
                        onVer={verReceta}
                        onEditar={abrirEditarReceta}
                        onEliminar={eliminarRecetaHandler}
                    />
                )}
            </section>

            {modalAbierto && (
                <RecetaForm
                    productos={productos}
                    receta={recetaEditar}
                    onGuardar={guardarReceta}
                    onCerrar={() => setModalAbierto(false)}
                />
            )}

            {recetaVer && (
                <Modal titulo="Detalle de la receta" onClose={() => setRecetaVer(null)}>
                    <div className="receta-detalle">
                        <p><strong>Producto:</strong> {recetaVer.producto}</p>
                        <p><strong>Categoría:</strong> {recetaVer.categoria}</p>
                        <p><strong>Porciones:</strong> {recetaVer.porciones}</p>
                        <p><strong>Tiempo de preparación:</strong> {recetaVer.tiempo} min</p>
                        <p><strong>Estado:</strong> {recetaVer.estado}</p>
                        <p><strong>Descripción:</strong>{' '}
                            {recetaVer.descripcion || 'Sin descripción'}
                        </p>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default Recetas;