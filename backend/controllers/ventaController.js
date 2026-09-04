const facturaModel = require('../models/facturaModel');

// ===========================================
// CONSTANTES DE VALIDACIÓN
// ===========================================

const METODOS_PAGO_VALIDOS = [
    'Efectivo',
    'Tarjeta Débito',
    'Tarjeta Crédito',
    'Nequi',
    'Daviplata'
];

// ===========================================
// VALIDACIONES
// ===========================================

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

// ===========================================
// CREAR VENTA (POST /api/ventas)
// ===========================================

async function crearVenta(req, res) {
    try {
        const errores = validarDatosVenta(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Datos de la venta inválidos',
                errores
            });
        }

        const { cliente, documento, telefono, metodo_pago, observaciones, productos } = req.body;

        const resultado = await facturaModel.crearVenta({
            cliente: cliente.trim(),
            documento: documento ? documento.trim() : null,
            telefono: telefono ? telefono.trim() : null,
            metodo_pago,
            observaciones: observaciones ? observaciones.trim() : null,
            productos
        });

        res.status(201).json({
            mensaje: 'Venta registrada correctamente',
            idFactura: resultado.idFactura,
            numeroFactura: resultado.numeroFactura,
            total: resultado.total
        });
    } catch (error) {
        if (error.codigo === 'PRODUCTO_NO_EXISTE') {
            return res.status(400).json({
                mensaje: 'Producto no encontrado',
                errores: ['Producto no encontrado.']
            });
        }

        if (error.codigo === 'STOCK_INSUFICIENTE') {
            return res.status(400).json({
                mensaje: 'Stock insuficiente',
                errores: [error.message]
            });
        }

        console.error('Error al crear venta:', error.message);

        res.status(500).json({
            mensaje: 'Error al registrar la venta'
        });
    }
}

module.exports = {
    crearVenta
};