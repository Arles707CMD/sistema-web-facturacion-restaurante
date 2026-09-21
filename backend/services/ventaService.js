const database = require('../config/database');
const facturaModel = require('../models/facturaModel');
const { ErrorServicio } = require('./errors');

// ===========================================
// SERVICIO DE VENTAS
// Lógica de negocio y orquestación de la venta:
// validación, numeración, totales, descuento de stock
// y transacción. El acceso SQL vive en facturaModel.
// ===========================================

const METODOS_PAGO_VALIDOS = [
    'Efectivo',
    'Tarjeta Débito',
    'Tarjeta Crédito',
    'Nequi',
    'Daviplata'
];

function validarDatosVenta(venta) {
    const errores = [];

    const { cliente, productos, metodo_pago } = venta;

    if (!cliente || typeof cliente !== 'string' || cliente.trim() === '') {
        errores.push('El cliente es obligatorio.');
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        errores.push('El carrito debe contener al menos un producto.');
    } else {
        productos.forEach((item, indice) => {
            if (!Number.isInteger(item.id_producto) || item.id_producto <= 0) {
                errores.push(`El producto ${indice + 1} tiene un id inválido.`);
            }

            if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
                errores.push(`El producto ${indice + 1} tiene una cantidad inválida.`);
            }
        });
    }

    if (!METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
        errores.push('El método de pago seleccionado no es válido.');
    }

    return errores;
}

// Genera el siguiente número de factura único (FAC-000001...).
function generarNumeroFactura(ultimoNumero) {
    const coincidencia = String(ultimoNumero).match(/(\d+)$/);
    const siguiente = (coincidencia ? Number(coincidencia[1]) : 0) + 1;

    return 'FAC-' + String(siguiente).padStart(6, '0');
}

// Crea una venta completa (factura + detalles + descuento de stock)
// de forma transaccional. Si algo falla, hace ROLLBACK.
async function crearVenta(datosVenta) {
    const errores = validarDatosVenta(datosVenta);

    if (errores.length > 0) {
        throw new ErrorServicio(400, 'Datos de la venta inválidos', errores);
    }

    const { cliente, documento, telefono, metodo_pago, observaciones, productos } = datosVenta;

    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        const ids = productos.map((item) => item.id_producto);

        // Bloquea las filas de productos para leer precio/stock actuales.
        const productosBloqueados = await facturaModel.bloquearProductos(connection, ids);
        const mapaProductos = new Map(
            productosBloqueados.map((producto) => [producto.id_producto, producto])
        );

        // Verifica que cada producto exista y tenga stock suficiente.
        for (const item of productos) {
            const producto = mapaProductos.get(item.id_producto);

            if (!producto) {
                throw new ErrorServicio(400, 'Producto no encontrado', ['Producto no encontrado.']);
            }

            if (Number(producto.stock) < item.cantidad) {
                throw new ErrorServicio(400, 'Stock insuficiente', [
                    `Stock insuficiente para el producto "${producto.nombre}".`
                ]);
            }
        }

        // Calcula subtotal, IVA y total siempre en el backend.
        let subtotal = 0;

        for (const item of productos) {
            const precio = Number(mapaProductos.get(item.id_producto).precio);
            subtotal += precio * item.cantidad;
        }

        const ivaPorcentaje = await facturaModel.obtenerIva(connection);
        const iva = subtotal * (ivaPorcentaje / 100);
        const total = subtotal + iva;

        const ultimoNumero = await facturaModel.obtenerUltimoNumeroFactura(connection);
        const numeroFactura = generarNumeroFactura(ultimoNumero);

        const idFactura = await facturaModel.insertarFactura(connection, {
            numeroFactura,
            cliente: cliente.trim(),
            documento: documento ? documento.trim() : null,
            telefono: telefono ? telefono.trim() : null,
            metodo_pago,
            observaciones: observaciones ? observaciones.trim() : null,
            subtotal,
            iva,
            total
        });

        // Inserta cada detalle y descuenta el stock de forma segura.
        for (const item of productos) {
            const producto = mapaProductos.get(item.id_producto);

            await facturaModel.insertarDetalle(connection, {
                idFactura,
                idProducto: item.id_producto,
                cantidad: item.cantidad,
                precioUnitario: producto.precio
            });

            const filas = await facturaModel.descontarStock(connection, item.id_producto, item.cantidad);

            if (filas === 0) {
                throw new ErrorServicio(400, 'Stock insuficiente', ['Stock insuficiente']);
            }
        }

        await connection.commit();

        return { idFactura, numeroFactura, total };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    crearVenta
};
