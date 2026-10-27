// ===========================================
// PÁGINA PRODUCTOS
// Módulo de gestión de productos que consume
// la API Express mediante el proxy de Vite.
// Maneja el CRUD completo (listar, crear,
// editar, eliminar) y los estados de carga,
// error y mensajes de éxito.
// ===========================================

import { useEffect, useMemo, useState } from 'react';

import Mensaje from '../components/Mensaje';
import Modal from '../components/common/Modal';
import ConfirmarEliminacion from '../components/common/ConfirmarEliminacion';
import ProductoForm from '../components/ProductoForm';
import ProductoTable from '../components/ProductoTable';
import ResumenCards from '../components/ResumenCards';

import { obtenerSesion } from '../api/apiClient';
import {
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductos
} from '../api/productoApi';

// Devuelve el código empresarial del producto (columna "codigo"
// de la base de datos, migración 002) con fallback compatible
// mientras la migración no se aplica.
function obtenerCodigo(producto) {
    return producto.codigo || 'P' + String(producto.id_producto).padStart(3, '0');
}

function Productos() {
    // Usuario en sesión y permisos de edición de productos.
    const usuario = obtenerSesion();
    const puedeEditar = ['Administrador', 'Inventario'].includes(usuario?.rol);
    // Lista completa de productos obtenida del backend
    const [productos, setProductos] = useState([]);

    // Estado de la tabla y filtros
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');

    // Mensaje temporal de éxito o error
    const [mensaje, setMensaje] = useState(null);

    // Producto en edición (null si se está creando uno nuevo)
    const [productoEditar, setProductoEditar] = useState(null);

    // Controla la visibilidad del modal del formulario
    const [modalAbierto, setModalAbierto] = useState(false);

    // Producto seleccionado para visualizar (modal de detalle)
    const [productoVer, setProductoVer] = useState(null);
    const [modalVerAbierto, setModalVerAbierto] = useState(false);

    // Producto seleccionado para eliminar (diálogo de confirmación)
    const [productoEliminar, setProductoEliminar] = useState(null);
    const [eliminandoProducto, setEliminandoProducto] = useState(false);
    const [errorEliminarProducto, setErrorEliminarProducto] = useState('');

    // Carga los productos desde la API al montar el componente
    useEffect(() => {
        cargarProductos();
    }, []);

    // Obtiene los productos del backend y actualiza el estado
    async function cargarProductos() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerProductos();
            setProductos(datos);
        } catch (error) {
            console.error('Error al cargar productos:', error.message);
            setError('No se pudieron cargar los productos desde el servidor.');
        } finally {
            setCargando(false);
        }
    }

    // Muestra un mensaje y lo oculta después de unos segundos
    function mostrarMensaje(texto, tipo) {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 5000);
    }

    // Abre el modal para crear un producto nuevo
    function abrirNuevoProducto() {
        setProductoEditar(null);
        setModalAbierto(true);
    }

    // Abre el modal precargando el producto seleccionado
    function abrirEditarProducto(producto) {
        setProductoEditar(producto);
        setModalAbierto(true);
    }

    // Abre el modal de detalle del producto (mismo estilo
    // visual que el detalle de factura, sin alert()).
    function verProducto(producto) {
        setProductoVer(producto);
        setModalVerAbierto(true);
    }
// Crea o actualiza un producto según corresponda
    async function guardarProducto(datos) {
        const esEdicion = productoEditar !== null;

        try {
            if (esEdicion) {
                await actualizarProducto(productoEditar.id_producto, datos);
                mostrarMensaje('Producto actualizado correctamente.', 'exito');
            } else {
                await crearProducto(datos);
                mostrarMensaje('Producto creado correctamente.', 'exito');
            }

            setModalAbierto(false);
            setProductoEditar(null);
            await cargarProductos();
        } catch (error) {
            console.error('Error al guardar producto:', error.message);
            mostrarMensaje(error.message, 'error');
        }
    }

    // Abre el diálogo de confirmación de eliminación
    // (sin cuadros nativos del navegador).
    function eliminarProductoHandler(producto) {
        setErrorEliminarProducto('');
        setProductoEliminar(producto);
    }

    // Cierra el diálogo de confirmación sin eliminar nada.
    function cancelarEliminacionProducto() {
        if (eliminandoProducto) {
            return;
        }

        setProductoEliminar(null);
        setErrorEliminarProducto('');
    }

    // Elimina el producto SOLO tras la confirmación explícita.
    // Protegido contra dobles envíos; si el backend impide la
    // eliminación (registros relacionados), el error se muestra
    // dentro del diálogo y no se informa de éxito.
    async function confirmarEliminacionProducto() {
        if (!productoEliminar || eliminandoProducto) {
            return;
        }

        setEliminandoProducto(true);
        setErrorEliminarProducto('');

        try {
            await eliminarProducto(productoEliminar.id_producto);

            setProductoEliminar(null);
            mostrarMensaje('Producto eliminado correctamente.', 'exito');
            await cargarProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error.message);
            setErrorEliminarProducto(
                error.message || 'No se pudo eliminar el producto. Inténtalo de nuevo.'
            );
        } finally {
            setEliminandoProducto(false);
        }
    }

    // Lista de categorías únicas para el filtro
    const categorias = useMemo(() => {
        return [...new Set(productos.map((producto) => producto.categoria))];
    }, [productos]);

    // Productos filtrados por búsqueda de texto y categoría
    const productosFiltrados = useMemo(() => {
        const texto = busqueda.toLowerCase();

        return productos.filter((producto) => {
            const coincideTexto =
                producto.nombre.toLowerCase().includes(texto) ||
                producto.categoria.toLowerCase().includes(texto) ||
                obtenerCodigo(producto).toLowerCase().includes(texto);

            const coincideCategoria =
                filtroCategoria === '' || producto.categoria === filtroCategoria;

            return coincideTexto && coincideCategoria;
        });
    }, [productos, busqueda, filtroCategoria]);

    // Indicadores del resumen superior
    const totalProductos = productos.length;
    const totalCategorias = categorias.length;
    const bajoStock = productos.filter(
        (producto) => producto.stock > 0 && producto.stock <= 10
    ).length;

    return (
        <div className="productos-container">
            <ResumenCards
                totalProductos={totalProductos}
                totalCategorias={totalCategorias}
                bajoStock={bajoStock}
            />

            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-box-open"></i>
                        Gestión de Productos
                    </h2>
                    {puedeEditar && (
                        <button className="btn-red" type="button" onClick={abrirNuevoProducto}>
                            <i className="fa-solid fa-plus"></i>
                            Nuevo Producto
                        </button>
                    )}
                </div>

                {mensaje && <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />}

                {error && !cargando && <Mensaje tipo="error" texto={error} />}

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

                {cargando ? (
                    <p className="estado-carga">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Cargando productos...
                    </p>
                ) : (
                    <ProductoTable
                        productos={productosFiltrados}
                        puedeEditar={puedeEditar}
                        onVer={verProducto}
                        onEditar={abrirEditarProducto}
                        onEliminar={eliminarProductoHandler}
                    />
                )}
            </section>

            {modalAbierto && (
                <ProductoForm
                    producto={productoEditar}
                    onGuardar={guardarProducto}
                    onCerrar={() => setModalAbierto(false)}
                />
            )}

            {modalVerAbierto && productoVer && (
                <Modal
                    titulo={'Producto ' + obtenerCodigo(productoVer)}
                    onClose={() => setModalVerAbierto(false)}
                >
                    <div className="detalle-datos">
                        <p><strong>Código:</strong> {obtenerCodigo(productoVer)}</p>
                        <p><strong>Nombre:</strong> {productoVer.nombre}</p>
                        <p><strong>Categoría:</strong> {productoVer.categoria}</p>
                        <p>
                            <strong>Precio:</strong>{' '}
                            ${Number(productoVer.precio).toLocaleString('es-CO')}
                        </p>
                        <p><strong>Existencias:</strong> {productoVer.stock}</p>
                        <p>
                            <strong>Estado:</strong>{' '}
                            {productoVer.stock <= 0
                                ? 'Agotado'
                                : productoVer.stock <= 10
                                    ? 'Bajo Stock'
                                    : 'Disponible'}
                        </p>
                        <p>
                            <strong>Descripción:</strong>{' '}
                            {productoVer.descripcion || 'Sin descripción'}
                        </p>
                    </div>
                </Modal>
            )}

            {productoEliminar && (
                <ConfirmarEliminacion
                    titulo="¿Eliminar producto?"
                    textoBoton="Eliminar producto"
                    advertencia={
                        'El producto se eliminará permanentemente. Si tiene ventas, ' +
                        'facturas o recetas asociadas, el servidor impedirá la eliminación.'
                    }
                    cargando={eliminandoProducto}
                    error={errorEliminarProducto}
                    onCancelar={cancelarEliminacionProducto}
                    onConfirmar={confirmarEliminacionProducto}
                >
                    <div className="detalle-datos">
                        <p>
                            <strong>Código:</strong> {obtenerCodigo(productoEliminar)}
                        </p>
                        <p><strong>Nombre:</strong> {productoEliminar.nombre}</p>
                        <p><strong>Categoría:</strong> {productoEliminar.categoria}</p>
                    </div>
                </ConfirmarEliminacion>
            )}
        </div>
    );
}

export default Productos;