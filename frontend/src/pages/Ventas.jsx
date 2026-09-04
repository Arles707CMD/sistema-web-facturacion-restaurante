// ===========================================
// PÁGINA VENTAS
// Módulo de registro de ventas: selección de
// productos, carrito, datos del cliente y
// checkout. Consume la API de productos y la
// API de ventas mediante el proxy de Vite.
// ===========================================

import { useEffect, useMemo, useState } from 'react';

import Mensaje from '../components/Mensaje';
import ProductoVentaCard from '../components/ProductoVentaCard';
import Carrito from '../components/Carrito';
import TotalesVenta from '../components/TotalesVenta';
import CheckoutForm from '../components/CheckoutForm';

import { obtenerProductos } from '../api/productoApi';
import { crearVenta } from '../api/ventaApi';

import '../styles/Ventas.css';

function Ventas() {
    // Productos disponibles y estado de carga
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Carrito de la venta (en memoria, no localStorage)
    const [carrito, setCarrito] = useState([]);

    // Mensaje temporal de éxito o error
    const [mensaje, setMensaje] = useState(null);

    // Estado del formulario de checkout (controlado)
    const [checkout, setCheckout] = useState({
        cliente: '',
        documento: '',
        telefono: '',
        metodo_pago: 'Efectivo',
        observaciones: ''
    });

    // Indica si la venta se está enviando
    const [enviando, setEnviando] = useState(false);

    // Carga los productos al montar el componente
    useEffect(() => {
        cargarProductos();
    }, []);

    // Obtiene los productos del backend
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
// Agrega un producto al carrito (o incrementa su cantidad)
    function agregarAlCarrito(producto) {
        setCarrito((actual) => {
            const existente = actual.find(
                (item) => item.id_producto === producto.id_producto
            );

            if (existente) {
                if (existente.cantidad >= Number(producto.stock)) {
                    mostrarMensaje(
                        'No hay más unidades disponibles de este producto.',
                        'error'
                    );
                    return actual;
                }

                return actual.map((item) =>
                    item.id_producto === producto.id_producto
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }

            return [
                ...actual,
                {
                    id_producto: producto.id_producto,
                    nombre: producto.nombre,
                    precio: Number(producto.precio),
                    stock: Number(producto.stock),
                    cantidad: 1
                }
            ];
        });
    }

    // Aumenta la cantidad de un producto del carrito
    function aumentarCantidad(idProducto) {
        setCarrito((actual) =>
            actual.map((item) => {
                if (item.id_producto !== idProducto) {
                    return item;
                }

                if (item.cantidad >= item.stock) {
                    mostrarMensaje(
                        'No hay más unidades disponibles de este producto.',
                        'error'
                    );
                    return item;
                }

                return { ...item, cantidad: item.cantidad + 1 };
            })
        );
    }

    // Disminuye la cantidad (si llega a 0 se elimina)
    function disminuirCantidad(idProducto) {
        setCarrito((actual) =>
            actual.flatMap((item) => {
                if (item.id_producto !== idProducto) {
                    return [item];
                }

                return item.cantidad > 1
                    ? [{ ...item, cantidad: item.cantidad - 1 }]
                    : [];
            })
        );
    }

    // Elimina un producto del carrito
    function eliminarDelCarrito(idProducto) {
        setCarrito((actual) =>
            actual.filter((item) => item.id_producto !== idProducto)
        );
    }

    // Actualiza un campo del formulario de checkout
    function manejarCambioCheckout(nombre, valor) {
        setCheckout((actual) => ({
            ...actual,
            [nombre]: valor
        }));
    }

    // Cálculo de totales (solo visualización; el backend recalcula)
    const subtotal = useMemo(
        () => carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0),
        [carrito]
    );
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    // Finaliza la venta enviando el carrito y los datos del cliente
    async function finalizarVenta() {
        if (carrito.length === 0) {
            mostrarMensaje('Debe agregar al menos un producto.', 'error');
            return;
        }

        if (!checkout.cliente.trim()) {
            mostrarMensaje('Ingrese el nombre del cliente.', 'error');
            return;
        }

        setEnviando(true);

        try {
            const resultado = await crearVenta({
                cliente: checkout.cliente.trim(),
                documento: checkout.documento.trim(),
                telefono: checkout.telefono.trim(),
                metodo_pago: checkout.metodo_pago,
                observaciones: checkout.observaciones.trim(),
                productos: carrito.map((item) => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad
                }))
            });

            mostrarMensaje(
                'Venta registrada correctamente. Factura ' + resultado.numeroFactura + '.',
                'exito'
            );

            setCarrito([]);
            setCheckout({
                cliente: '',
                documento: '',
                telefono: '',
                metodo_pago: 'Efectivo',
                observaciones: ''
            });
            await cargarProductos();
        } catch (error) {
            console.error('Error al finalizar venta:', error.message);
            mostrarMensaje(error.message, 'error');
        } finally {
            setEnviando(false);
        }
    }
return (
        <div className="ventas-container">
            {mensaje && <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />}

            {error && !cargando && <Mensaje tipo="error" texto={error} />}

            <div className="ventas-layout">
                <section className="panel productos-panel">
                    <div className="panel-header">
                        <h2>
                            <i className="fa-solid fa-box"></i>
                            Productos
                        </h2>
                    </div>

                    {cargando ? (
                        <p className="estado-carga">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Cargando productos...
                        </p>
                    ) : (
                        <div className="productos-grid">
                            {productos.map((producto) => (
                                <ProductoVentaCard
                                    key={producto.id_producto}
                                    producto={producto}
                                    onAgregar={agregarAlCarrito}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="panel carrito-panel">
                    <div className="panel-header">
                        <h2>
                            <i className="fa-solid fa-cart-shopping"></i>
                            Carrito
                        </h2>
                    </div>

                    <Carrito
                        items={carrito}
                        onAumentar={aumentarCantidad}
                        onDisminuir={disminuirCantidad}
                        onEliminar={eliminarDelCarrito}
                    />

                    <TotalesVenta subtotal={subtotal} iva={iva} total={total} />
                </section>

                <section className="panel cliente-panel">
                    <div className="panel-header">
                        <h2>
                            <i className="fa-solid fa-user"></i>
                            Datos del Cliente
                        </h2>
                    </div>

                    <CheckoutForm
                        formulario={checkout}
                        onCambio={manejarCambioCheckout}
                        onFinalizar={finalizarVenta}
                    />

                    {enviando && (
                        <p className="estado-carga">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Registrando venta...
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Ventas;