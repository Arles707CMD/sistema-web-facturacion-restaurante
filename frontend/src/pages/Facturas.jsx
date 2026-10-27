// ===========================================
// PÁGINA FACTURAS
// Módulo de gestión de facturas: listado,
// búsqueda, detalle (modal), eliminación con
// restauración de stock y exportación CSV.
// Consume la API de facturas vía proxy Vite.
// ===========================================

import { useEffect, useMemo, useState } from 'react';

import Mensaje from '../components/Mensaje';
import Modal from '../components/common/Modal';
import ConfirmarEliminacion from '../components/common/ConfirmarEliminacion';
import FacturaTable from '../components/FacturaTable';
import FacturaDetalle from '../components/FacturaDetalle';

import {
    eliminarFactura,
    obtenerFactura,
    obtenerFacturas
} from '../api/facturaApi';
import { obtenerSesion } from '../api/apiClient';
import { exportarCsvExcel } from '../utils/csvExport';

import '../styles/Facturas.css';

function Facturas() {
    // Usuario en sesión: solo el Administrador puede eliminar facturas.
    const usuario = obtenerSesion();
    const puedeEliminar = usuario?.rol === 'Administrador';
    // Lista de facturas obtenida del backend
    const [facturas, setFacturas] = useState([]);

    // Estado de carga, error y búsqueda
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Mensaje temporal de éxito o error
    const [mensaje, setMensaje] = useState(null);

    // Factura seleccionada para visualizar (con detalle)
    const [facturaVer, setFacturaVer] = useState(null);
    const [modalVerAbierto, setModalVerAbierto] = useState(false);

    // Factura seleccionada para eliminar (diálogo de confirmación)
    const [facturaEliminar, setFacturaEliminar] = useState(null);
    const [eliminandoFactura, setEliminandoFactura] = useState(false);
    const [errorEliminarFactura, setErrorEliminarFactura] = useState('');

    // Carga las facturas al montar el componente
    useEffect(() => {
        cargarFacturas();
    }, []);

    // Obtiene las facturas del backend
    async function cargarFacturas() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerFacturas();
            setFacturas(datos);
        } catch (error) {
            console.error('Error al cargar facturas:', error.message);
            setError('No se pudieron cargar las facturas desde el servidor.');
        } finally {
            setCargando(false);
        }
    }

    // Muestra un mensaje y lo oculta después de unos segundos
    function mostrarMensaje(texto, tipo) {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 5000);
    }

    // Carga el detalle de una factura y abre el modal
    async function verFactura(factura) {
        try {
            const detalle = await obtenerFactura(factura.id_factura);
            setFacturaVer(detalle);
            setModalVerAbierto(true);
        } catch (error) {
            console.error('Error al obtener factura:', error.message);
            mostrarMensaje(error.message, 'error');
        }
    }

    // Abre el diálogo de confirmación de eliminación
    // (sin cuadros nativos del navegador).
    function eliminarFacturaHandler(factura) {
        setErrorEliminarFactura('');
        setFacturaEliminar(factura);
    }

    // Cierra el diálogo de confirmación sin eliminar nada.
    function cancelarEliminacionFactura() {
        if (eliminandoFactura) {
            return;
        }

        setFacturaEliminar(null);
        setErrorEliminarFactura('');
    }

    // Elimina la factura SOLO tras la confirmación explícita
    // (restaura stock en el backend). Protegido contra dobles envíos.
    async function confirmarEliminacionFactura() {
        if (!facturaEliminar || eliminandoFactura) {
            return;
        }

        setEliminandoFactura(true);
        setErrorEliminarFactura('');

        try {
            await eliminarFactura(facturaEliminar.id_factura);

            setFacturaEliminar(null);
            mostrarMensaje('Factura eliminada correctamente.', 'exito');
            await cargarFacturas();
        } catch (error) {
            console.error('Error al eliminar factura:', error.message);
            // El error se muestra dentro del diálogo; no se
            // informa de éxito si el servidor rechazó la operación.
            setErrorEliminarFactura(
                error.message || 'No se pudo eliminar la factura. Inténtalo de nuevo.'
            );
        } finally {
            setEliminandoFactura(false);
        }
    }

    // Exporta las facturas a un archivo CSV con formato para Excel
    // en español (separador ";", directiva sep=;, UTF-8 con BOM, CRLF).
    // La construcción y descarga del archivo vive en utils/csvExport.
    function exportarCsv() {
        const encabezados = [
            'numero_factura', 'fecha', 'cliente', 'documento',
            'metodo_pago', 'subtotal', 'iva', 'total'
        ];

        const filas = facturas.map((factura) => [
            factura.numero_factura,
            new Date(factura.fecha).toLocaleDateString('es-CO'),
            factura.cliente,
            factura.documento || '',
            factura.metodo_pago,
            factura.subtotal,
            factura.iva,
            factura.total
        ]);

        exportarCsvExcel('facturas-baluarte.csv', encabezados, filas);
    }

    // Facturas filtradas por número o cliente
    const facturasFiltradas = useMemo(() => {
        const texto = busqueda.toLowerCase();

        return facturas.filter(
            (factura) =>
                factura.numero_factura.toLowerCase().includes(texto) ||
                factura.cliente.toLowerCase().includes(texto)
        );
    }, [facturas, busqueda]);

    // Indicadores del resumen
    const totalFacturas = facturas.length;
    const ventasTotales = facturas.reduce(
        (suma, factura) => suma + Number(factura.total),
        0
    );
    const fechaActual = new Date().toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
return (
        <div className="facturas-container">
            <section className="cards">
                <div className="card">
                    <div className="icon red">
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <div>
                        <p>Total Facturas</p>
                        <h2>{totalFacturas}</h2>
                        <span>Registradas</span>
                    </div>
                </div>

                <div className="card">
                    <div className="icon green">
                        <i className="fa-solid fa-sack-dollar"></i>
                    </div>
                    <div>
                        <p>Ventas Totales</p>
                        <h2>${Number(ventasTotales).toLocaleString('es-CO')}</h2>
                        <span>Facturadas</span>
                    </div>
                </div>

                <div className="card">
                    <div className="icon orange">
                        <i className="fa-solid fa-calendar-day"></i>
                    </div>
                    <div>
                        <p>Fecha</p>
                        <h2>{fechaActual}</h2>
                        <span>Hoy</span>
                    </div>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                        Facturas
                    </h2>
                    <button className="btn-gray" type="button" onClick={exportarCsv}>
                        <i className="fa-solid fa-download"></i>
                        Exportar
                    </button>
                </div>

                {mensaje && <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />}

                {error && !cargando && <Mensaje tipo="error" texto={error} />}

                <div className="busqueda">
                    <input
                        type="text"
                        placeholder="Buscar por número o cliente..."
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                    />
                </div>

                {cargando ? (
                    <p className="estado-carga">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Cargando facturas...
                    </p>
                ) : (
                    <FacturaTable
                        facturas={facturasFiltradas}
                        puedeEliminar={puedeEliminar}
                        onVer={verFactura}
                        onEliminar={eliminarFacturaHandler}
                    />
                )}
            </section>

            {modalVerAbierto && facturaVer && (
                <Modal
                    titulo={'Factura ' + facturaVer.numero_factura}
                    onClose={() => setModalVerAbierto(false)}
                >
                    <FacturaDetalle factura={facturaVer} />
                </Modal>
            )}

            {facturaEliminar && (
                <ConfirmarEliminacion
                    titulo="¿Eliminar factura?"
                    textoBoton="Eliminar factura"
                    advertencia={
                        'Esta acción es irreversible: la factura se eliminará ' +
                        'permanentemente y el stock de sus productos se restaurará.'
                    }
                    cargando={eliminandoFactura}
                    error={errorEliminarFactura}
                    onCancelar={cancelarEliminacionFactura}
                    onConfirmar={confirmarEliminacionFactura}
                >
                    <div className="detalle-datos">
                        <p><strong>Número:</strong> {facturaEliminar.numero_factura}</p>
                        <p><strong>Cliente:</strong> {facturaEliminar.cliente}</p>
                        <p>
                            <strong>Fecha:</strong>{' '}
                            {new Date(facturaEliminar.fecha).toLocaleDateString('es-CO')}
                        </p>
                        <p>
                            <strong>Total:</strong>{' '}
                            ${Number(facturaEliminar.total).toLocaleString('es-CO')}
                        </p>
                    </div>
                </ConfirmarEliminacion>
            )}
        </div>
    );
}

export default Facturas;