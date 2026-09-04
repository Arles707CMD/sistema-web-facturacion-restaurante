const database = require('../config/database');

// ===========================================
// MODELO DE METAS
// Calcula los indicadores de metas a partir
// de configuracion, facturas, detalle_factura
// y productos. Solo lectura.
// ===========================================

const PERIODOS_VALIDOS = ['mes', 'semana', 'todo'];

function formatearFecha(dia) {
    const anio = dia.getFullYear();
    const mes = String(dia.getMonth() + 1).padStart(2, '0');
    const fecha = String(dia.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${fecha}`;
}

// Obtiene la fecha de inicio del periodo (null para todo).
function obtenerFechaInicio(periodo) {
    if (periodo === 'mes') {
        const hoy = new Date();

        return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
    }

    if (periodo === 'semana') {
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - 6);

        return formatearFecha(inicio);
    }

    return null;
}

// Completa los días con total 0 (para mes y semana).
function completarDias(filas, dias) {
    const mapa = new Map(filas.map((fila) => [fila.fecha, Number(fila.total)]));
    const resultado = [];

    for (let atras = dias - 1; atras >= 0; atras--) {
        const dia = new Date();
        dia.setDate(dia.getDate() - atras);
        const clave = formatearFecha(dia);

        resultado.push({ fecha: clave, total: mapa.get(clave) || 0 });
    }

    return resultado;
}

// Obtiene la gráfica de ventas del periodo.
async function obtenerGrafica(periodo) {
    if (periodo === 'mes' || periodo === 'semana') {
        const dias = periodo === 'mes' ? 14 : 7;
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - (dias - 1));
        const inicioStr = formatearFecha(inicio);

        const [filas] = await database.query(`
            SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, SUM(total) AS total
            FROM facturas
            WHERE DATE(fecha) >= ?
            GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d')
            ORDER BY fecha ASC
        `, [inicioStr]);

        return completarDias(filas, dias);
    }

    const [filas] = await database.query(`
        SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, SUM(total) AS total
        FROM facturas
        GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d')
        ORDER BY fecha ASC
    `);

    return filas.map((fila) => ({ fecha: fila.fecha, total: Number(fila.total) }));
}

// Obtiene el resumen de metas para un periodo dado.
async function obtenerResumenMetas(periodo) {
    const fechaInicio = obtenerFechaInicio(periodo);
    const filtro = fechaInicio ? 'WHERE fecha >= ?' : '';
    const params = fechaInicio ? [fechaInicio] : [];

    // Meta mensual desde configuracion.
    const [[config]] = await database.query(`
        SELECT meta_mensual
        FROM configuracion
        WHERE id = 1
    `);
    const metaMensual = Number(config?.meta_mensual ?? 0);

    const [[ventasRow]] = await database.query(
        `SELECT COALESCE(SUM(total), 0) AS total FROM facturas ${filtro}`,
        params
    );

    const [[facturasRow]] = await database.query(
        `SELECT COUNT(*) AS total FROM facturas ${filtro}`,
        params
    );

    const [[unidadesRow]] = await database.query(`
        SELECT COALESCE(SUM(df.cantidad), 0) AS total
        FROM detalle_factura df
        INNER JOIN facturas f ON f.id_factura = df.id_factura
        ${filtro}
    `, params);

    const ventas = Number(ventasRow.total);
    const totalFacturas = Number(facturasRow.total);
    const unidades = Number(unidadesRow.total);

    const ticketPromedio = totalFacturas > 0 ? ventas / totalFacturas : 0;
    const porcentaje = metaMensual > 0 ? Math.min(100, (ventas / metaMensual) * 100) : 0;

    const hoy = new Date();
    const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const diasTranscurridos = hoy.getDate();
    const diasRestantes = Math.max(0, diasMes - diasTranscurridos);

    const proyeccion = diasTranscurridos > 0
        ? (ventas / diasTranscurridos) * diasMes
        : 0;

    const faltante = Math.max(0, metaMensual - ventas);
    const diaria = diasRestantes > 0 ? faltante / diasRestantes : 0;

    const [ranking] = await database.query(`
        SELECT p.nombre, SUM(df.cantidad) AS cantidad
        FROM detalle_factura df
        INNER JOIN productos p ON p.id_producto = df.id_producto
        INNER JOIN facturas f ON f.id_factura = df.id_factura
        ${filtro}
        GROUP BY p.id_producto, p.nombre
        ORDER BY cantidad DESC
        LIMIT 4
    `, params);

    const grafica = await obtenerGrafica(periodo);

    return {
        metaMensual,
        ventas,
        unidades,
        totalFacturas,
        ticketPromedio,
        porcentaje: Math.round(porcentaje * 100) / 100,
        proyeccion,
        faltante,
        diaria,
        diasRestantes,
        rankingProductos: ranking.map((fila) => ({
            nombre: fila.nombre,
            cantidad: Number(fila.cantidad)
        })),
        grafica
    };
}

module.exports = {
    PERIODOS_VALIDOS,
    obtenerResumenMetas
};