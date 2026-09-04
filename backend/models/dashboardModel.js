const database = require('../config/database');

// ===========================================
// MODELO DEL DASHBOARD
// Consultas de agregación sobre facturas,
// detalle_factura y productos.
// Solo lectura: no modifica datos.
// ===========================================

// Formatea una fecha local como YYYY-MM-DD.
function formatearFecha(dia) {
    const anio = dia.getFullYear();
    const mes = String(dia.getMonth() + 1).padStart(2, '0');
    const fecha = String(dia.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${fecha}`;
}

// Completa los últimos 7 días con total 0 cuando no hay ventas.
function completarSemana(filas) {
    const mapa = new Map();

    for (const fila of filas) {
        mapa.set(fila.fecha, Number(fila.total));
    }

    const dias = [];

    for (let atras = 6; atras >= 0; atras--) {
        const dia = new Date();
        dia.setDate(dia.getDate() - atras);
        const clave = formatearFecha(dia);

        dias.push({
            fecha: clave,
            total: mapa.get(clave) || 0
        });
    }

    return dias;
}

// Obtiene el resumen completo del dashboard.
async function obtenerResumen() {
    const [[ventasHoy]] = await database.query(`
        SELECT COALESCE(SUM(total), 0) AS total
        FROM facturas
        WHERE DATE(fecha) = CURDATE()
    `);

    const [[ventasTotales]] = await database.query(`
        SELECT COALESCE(SUM(total), 0) AS total
        FROM facturas
    `);

    const [[totalFacturas]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM facturas
    `);

    const [[facturasHoy]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM facturas
        WHERE DATE(fecha) = CURDATE()
    `);

    const [[unidadesVendidas]] = await database.query(`
        SELECT COALESCE(SUM(cantidad), 0) AS total
        FROM detalle_factura
    `);

    const [[totalProductos]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
    `);

    const [[bajoStock]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
        WHERE stock > 0 AND stock <= 10
    `);

    const [[disponibles]] = await database.query(`
        SELECT COUNT(*) AS total
        FROM productos
        WHERE stock > 0
    `);

    const [productosMasVendidos] = await database.query(`
        SELECT
            p.nombre,
            SUM(df.cantidad) AS cantidad
        FROM detalle_factura df
        INNER JOIN productos p
            ON p.id_producto = df.id_producto
        GROUP BY p.id_producto, p.nombre
        ORDER BY cantidad DESC
        LIMIT 4
    `);

    const [actividadReciente] = await database.query(`
        SELECT
            numero_factura,
            cliente,
            total,
            fecha
        FROM facturas
        ORDER BY id_factura DESC
        LIMIT 4
    `);

    const [ventasSemana] = await database.query(`
        SELECT
            DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
            SUM(total) AS total
        FROM facturas
        WHERE fecha >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d')
        ORDER BY fecha ASC
    `);

    // Calcula la disponibilidad (productos con stock > 0 sobre el total).
    const totalProductosNum = Number(totalProductos.total);
    const disponibilidad = totalProductosNum > 0
        ? Math.round((Number(disponibles.total) / totalProductosNum) * 100)
        : 0;

    return {
        ventasHoy: Number(ventasHoy.total),
        ventasTotales: Number(ventasTotales.total),
        totalFacturas: Number(totalFacturas.total),
        facturasHoy: Number(facturasHoy.total),
        unidadesVendidas: Number(unidadesVendidas.total),
        totalProductos: totalProductosNum,
        bajoStock: Number(bajoStock.total),
        disponibilidad,
        productosMasVendidos: productosMasVendidos.map((producto) => ({
            nombre: producto.nombre,
            cantidad: Number(producto.cantidad)
        })),
        actividadReciente: actividadReciente.map((factura) => ({
            numero_factura: factura.numero_factura,
            cliente: factura.cliente,
            total: Number(factura.total),
            fecha: factura.fecha
        })),
        ventasSemana: completarSemana(ventasSemana)
    };
}

module.exports = {
    obtenerResumen
};