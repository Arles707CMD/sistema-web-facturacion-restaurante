const database = require('../config/database');
const secuenciaService = require('../services/secuenciaService');

// ===========================================
// MODELO DE PRODUCTOS
// El "codigo" es el código EMPRESARIAL (P001, P002...),
// independiente de la clave primaria id_producto. Se
// asigna desde la secuencia atómica (migración 002);
// si la migración aún no se ha aplicado, el modelo
// funciona igual que antes (sin código) para mantener
// la compatibilidad durante el despliegue.
// ===========================================

// Caché por proceso: ¿existe la columna "codigo"? Se comprueba
// una sola vez y evita fallos si el backend se despliega antes
// de aplicar la migración en la base de datos.
let columnaCodigoDisponible = null;

// Detecta "Unknown column" de MySQL/MariaDB.
function esErrorColumnaInexistente(error) {
    return Boolean(
        error &&
        (error.code === 'ER_BAD_FIELD_ERROR' || error.errno === 1054)
    );
}

// Comprueba (una vez por proceso) si la columna codigo existe.
async function existeColumnaCodigo(connection = null) {
    if (columnaCodigoDisponible !== null) {
        return columnaCodigoDisponible;
    }

    try {
        if (connection) {
            await connection.query('SELECT codigo FROM productos LIMIT 1');
        } else {
            await database.query('SELECT codigo FROM productos LIMIT 1');
        }

        columnaCodigoDisponible = true;
    } catch (error) {
        if (esErrorColumnaInexistente(error)) {
            columnaCodigoDisponible = false;
        } else {
            throw error;
        }
    }

    return columnaCodigoDisponible;
}

async function obtenerProductos() {
    const conCodigo = await existeColumnaCodigo();

    const [productos] = await database.query(`
        SELECT
            p.id_producto,
            ${conCodigo ? 'p.codigo,' : ''}
            p.nombre,
            p.descripcion,
            p.precio,
            p.stock,
            p.id_categoria,
            c.nombre AS categoria
        FROM productos p
        INNER JOIN categorias c
            ON p.id_categoria = c.id_categoria
        ORDER BY p.id_producto DESC
    `);

    return productos;
}

async function obtenerProductoPorId(idProducto) {
    const conCodigo = await existeColumnaCodigo();

    const [producto] = await database.query(`
        SELECT
            p.id_producto,
            ${conCodigo ? 'p.codigo,' : ''}
            p.nombre,
            p.descripcion,
            p.precio,
            p.stock,
            p.id_categoria,
            c.nombre AS categoria
        FROM productos p
        INNER JOIN categorias c
            ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = ?
    `, [idProducto]);

    return producto[0] || null;
}

// Comprueba si una categoría existe en la tabla categorias.
async function existeCategoria(idCategoria) {
    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM categorias
        WHERE id_categoria = ?`,
        [idCategoria]
    );

    return filas[0].total > 0;
}

// Crea un producto con su código empresarial. La creación es
// transaccional: el SELECT ... FOR UPDATE sobre la secuencia
// bloquea la fila hasta el COMMIT, por lo que dos creaciones
// simultáneas obtienen códigos distintos (sin duplicados), y la
// restricción UNIQUE de la columna actúa como respaldo.
// La secuencia continúa desde el MAYOR código asignado: nunca
// rellena huecos ni reutiliza códigos de productos eliminados.
async function crearProducto(producto) {
    const { nombre, descripcion, precio, stock, idCategoria } = producto;

    const descripcionFinal = descripcion || null;

    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        // Siguiente código empresarial (P0XX) desde la secuencia.
        let codigo = null;

        try {
            const valor = await secuenciaService.siguienteValor(
                connection,
                'producto_codigo'
            );
            codigo = secuenciaService.formatearCodigoProducto(valor);
        } catch (error) {
            // Tabla de secuencias aún no aplicada (migración 002
            // pendiente): el producto se crea sin código empresarial.
            if (!secuenciaService.esErrorSecuenciaInexistente(error)) {
                throw error;
            }
        }

        let resultado;

        if (codigo) {
            try {
                [resultado] = await connection.query(
                    `INSERT INTO productos
                    (codigo, nombre, descripcion, precio, stock, id_categoria)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [codigo, nombre, descripcionFinal, precio, stock, idCategoria]
                );
            } catch (error) {
                if (!esErrorColumnaInexistente(error)) {
                    throw error;
                }

                // Columna codigo pendiente: se registra y se reintenta
                // sin código en la misma transacción.
                columnaCodigoDisponible = false;
                codigo = null;
            }
        }

        if (!codigo) {
            [resultado] = await connection.query(
                `INSERT INTO productos
                (nombre, descripcion, precio, stock, id_categoria)
                VALUES (?, ?, ?, ?, ?)`,
                [nombre, descripcionFinal, precio, stock, idCategoria]
            );
        }

        await connection.commit();

        return resultado.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function actualizarProducto(idProducto, producto) {
    const { nombre, descripcion, precio, stock, idCategoria } = producto;

    const descripcionFinal = descripcion || null;

    // El código empresarial NO se modifica al editar: conserva su
    // trazabilidad y el formulario no lo envía.
    const [resultado] = await database.query(
        `UPDATE productos
        SET nombre = ?,
            descripcion = ?,
            precio = ?,
            stock = ?,
            id_categoria = ?
        WHERE id_producto = ?`,
        [nombre, descripcionFinal, precio, stock, idCategoria, idProducto]
    );

    return resultado.affectedRows;
}

async function eliminarProducto(idProducto) {
    const [resultado] = await database.query(
        `DELETE FROM productos
        WHERE id_producto = ?`,
        [idProducto]
    );

    return resultado.affectedRows;
}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    existeCategoria,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};