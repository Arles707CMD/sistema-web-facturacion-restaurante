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
import ProductoForm from '../components/ProductoForm';
import ProductoTable from '../components/ProductoTable';
import ResumenCards from '../components/ResumenCards';

import {
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductos
} from '../api/productoApi';

function Productos() {
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

    // Muestra los datos del producto en una ventana emergente
    function verProducto(producto) {
        const descripcion = producto.descripcion
            ? 'Descripción: ' + producto.descripcion + '\n'
            : '';

        alert(
            'INFORMACIÓN DEL PRODUCTO\n\n' +
            'Código: P' + String(producto.id_producto).padStart(3, '0') + '\n' +
            'Producto: ' + producto.nombre + '\n' +
            descripcion +
            'Categoría: ' + producto.categoria + '\n' +
            'Precio: $' + Number(producto.precio).toLocaleString('es-CO') + '\n' +
            'Stock: ' + producto.stock + '\n' +
            'Estado: ' + (producto.stock <= 0 ? 'Agotado' : producto.stock <= 10 ? 'Bajo Stock' : 'Disponible')
        );
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

    // Elimina un producto tras confirmar con el usuario
    async function eliminarProductoHandler(producto) {
        const confirmarEliminacion = confirm(
            '¿Está seguro de eliminar "' + producto.nombre + '"?'
        );

        if (!confirmarEliminacion) {
            return;
        }

        try {
            await eliminarProducto(producto.id_producto);
            mostrarMensaje('Producto eliminado correctamente.', 'exito');
            await cargarProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error.message);
            mostrarMensaje(error.message, 'error');
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
                ('P' + String(producto.id_producto).padStart(3, '0')).toLowerCase().includes(texto);

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
                    <button className="btn-red" type="button" onClick={abrirNuevoProducto}>
                        <i className="fa-solid fa-plus"></i>
                        Nuevo Producto
                    </button>
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
        </div>
    );
}

export default Productos;