const database = require('../config/database');
const secuenciaService = require('../services/secuenciaService');

// ===========================================
// MODELO DE RECETAS
// El "codigo" es el código EMPRESARIAL (REC-001,
// REC-002...), independiente de la clave
// primaria id_receta. Se asigna desde la
// secuencia atómica (migración 004); si la
// migración aún no se ha aplicado, el modelo
// funciona igual que antes (sin código) para
// mantener la compatibilidad durante el
// despliegue. Consultas parametrizadas mysql2.
// ===========================================

// Caché por proceso: ¿existe la columna "codigo"?
let columnaCodigoRecetaDisponible = null;

// Detecta "Unknown column" de MySQL/MariaDB.
function esErrorColumnaInexistente(error) {
    return Boolean(
        error &&
        (error.code === 'ER_BAD_FIELD_ERROR' || error.errno === 1054)
    );
}

// Comprueba (una vez por proceso) si la columna codigo existe.
async function existeColumnaCodigo() {
    if (columnaCodigoRecetaDisponible !== null) {
        return columnaCodigoRecetaDisponible;
    }

    try {
        await database.query('SELECT codigo FROM recetas LIMIT 1');
        columnaCodigoRecetaDisponible = true;
    } catch (error) {
        if (esErrorColumnaInexistente(error)) {
            columnaCodigoRecetaDisponible = false;
        } else {
            throw error;
        }
    }

    return columnaCodigoRecetaDisponible;
}

// Obtiene todas las recetas con producto y categoría.
async function obtenerRecetas() {
    const conCodigo = await existeColumnaCodigo();

    const [recetas] = await database.query(`
        SELECT
            r.id_receta,
            ${conCodigo ? 'r.codigo,' : ''}
            r.id_producto,
            p.nombre AS producto,
            c.nombre AS categoria,
            r.porciones,
            r.tiempo,
            r.estado,
            r.descripcion,
            r.fecha_actualizacion
        FROM recetas r
        INNER JOIN productos p
            ON p.id_producto = r.id_producto
        INNER JOIN categorias c
            ON c.id_categoria = p.id_categoria
        ORDER BY r.id_receta DESC
    `);

    return recetas;
}

// Obtiene una receta por su id (con producto y categoría).
async function obtenerRecetaPorId(idReceta) {
    const conCodigo = await existeColumnaCodigo();

    const [receta] = await database.query(`
        SELECT
            r.id_receta,
            ${conCodigo ? 'r.codigo,' : ''}
            r.id_producto,
            p.nombre AS producto,
            c.nombre AS categoria,
            r.porciones,
            r.tiempo,
            r.estado,
            r.descripcion,
            r.fecha_actualizacion
        FROM recetas r
        INNER JOIN productos p
            ON p.id_producto = r.id_producto
        INNER JOIN categorias c
            ON c.id_categoria = p.id_categoria
        WHERE r.id_receta = ?
    `, [idReceta]);

    return receta[0] || null;
}

// Comprueba si un producto existe.
async function existeProducto(idProducto) {
    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM productos
        WHERE id_producto = ?`,
        [idProducto]
    );

    return filas[0].total > 0;
}

// Comprueba si ya existe una receta para un producto.
// Si se indica idExcluido, se ignora esa receta (para la edición).
async function existeRecetaProducto(idProducto, idExcluido = null) {
    if (idExcluido) {
        const [filas] = await database.query(
            `SELECT COUNT(*) AS total
            FROM recetas
            WHERE id_producto = ? AND id_receta <> ?`,
            [idProducto, idExcluido]
        );

        return filas[0].total > 0;
    }

    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM recetas
        WHERE id_producto = ?`,
        [idProducto]
    );

    return filas[0].total > 0;
}

// Crea una receta con su código empresarial. La creación es
// transaccional: el SELECT ... FOR UPDATE sobre la secuencia
// bloquea la fila hasta el COMMIT, por lo que dos creaciones
// simultáneas obtienen códigos distintos (sin duplicados), y la
// restricción UNIQUE de la columna actúa como respaldo. La
// secuencia continúa desde el MAYOR código asignado: nunca
// rellena huecos ni reutiliza códigos de recetas eliminadas.
// El código empresarial NO se modifica al editar.
async function crearReceta(datos) {
    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        // Siguiente código empresarial (REC-0XX) desde la secuencia.
        let codigo = null;

        try {
            const valor = await secuenciaService.siguienteValor(
                connection,
                'receta_codigo'
            );
            codigo = secuenciaService.formatearCodigoReceta(valor);
        } catch (error) {
            // Tabla de secuencias o columna aún no aplicadas
            // (migración 004 pendiente): la receta se crea sin
            // código empresarial y el frontend usa el cálculo
            // provisional basado en el id.
            if (!secuenciaService.esErrorSecuenciaInexistente(error)) {
                throw error;
            }
        }

        let resultado;

        if (codigo) {
            try {
                [resultado] = await connection.query(
                    `INSERT INTO recetas
                    (codigo, id_producto, porciones, tiempo, estado, descripcion)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        codigo,
                        datos.id_producto,
                        datos.porciones,
                        datos.tiempo,
                        datos.estado,
                        datos.descripcion || null
                    ]
                );
            } catch (error) {
                if (!esErrorColumnaInexistente(error)) {
                    throw error;
                }

                // Columna codigo pendiente (migración 004): se
                // reintenta sin código en la misma transacción.
                columnaCodigoRecetaDisponible = false;
                codigo = null;
            }
        }

        if (!codigo) {
            [resultado] = await connection.query(
                `INSERT INTO recetas
                (id_producto, porciones, tiempo, estado, descripcion)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    datos.id_producto,
                    datos.porciones,
                    datos.tiempo,
                    datos.estado,
                    datos.descripcion || null
                ]
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

// Actualiza una receta. El código empresarial NO se modifica
// al editar: conserva su trazabilidad.
async function actualizarReceta(idReceta, datos) {
    const [resultado] = await database.query(`
        UPDATE recetas
        SET id_producto = ?,
            porciones = ?,
            tiempo = ?,
            estado = ?,
            descripcion = ?
        WHERE id_receta = ?
    `, [
        datos.id_producto,
        datos.porciones,
        datos.tiempo,
        datos.estado,
        datos.descripcion || null,
        idReceta
    ]);

    return resultado.affectedRows;
}

// Elimina una receta.
async function eliminarReceta(idReceta) {
    const [resultado] = await database.query(
        `DELETE FROM recetas WHERE id_receta = ?`,
        [idReceta]
    );

    return resultado.affectedRows;
}

module.exports = {
    obtenerRecetas,
    obtenerRecetaPorId,
    existeProducto,
    existeRecetaProducto,
    crearReceta,
    actualizarReceta,
    eliminarReceta
};