// ===========================================
// SERVICIO DE SECUENCIAS EMPRESARIALES
// Contadores independientes de los ids autoincrementales
// (tabla "secuencias", migraciones 002 y 003). La asignación
// usa SELECT ... FOR UPDATE dentro de la transacción del
// llamador, por lo que dos operaciones simultáneas nunca
// obtienen el mismo valor y el contador nunca retrocede
// (no se reutilizan números de registros eliminados).
// ===========================================

// Detecta que la tabla de secuencias aún no existe (migración
// pendiente) para que el llamador pueda usar un fallback.
function esErrorSecuenciaInexistente(error) {
    return Boolean(
        error &&
        (error.code === 'ER_NO_SUCH_TABLE' ||
            error.errno === 1146 ||
            error.code === 'ER_BAD_FIELD_ERROR' ||
            error.errno === 1054)
    );
}

// Formatea un valor numérico como código de producto (P0XX).
function formatearCodigoProducto(valor) {
    return 'P' + String(Number(valor)).padStart(3, '0');
}

// Formatea un valor numérico como número de factura (FAC-000001).
function formatearNumeroFactura(valor) {
    return 'FAC-' + String(Number(valor)).padStart(6, '0');
}

// Obtiene el siguiente valor de la secuencia de forma atómica.
// DEBE ejecutarse dentro de la transacción del llamador: el
// SELECT ... FOR UPDATE bloquea la fila hasta el COMMIT, lo que
// serializa creaciones simultáneas y evita duplicados.
async function siguienteValor(connection, nombre) {
    const [filas] = await connection.query(
        'SELECT valor FROM secuencias WHERE nombre = ? FOR UPDATE',
        [nombre]
    );

    if (filas.length === 0) {
        throw new Error(
            `La secuencia "${nombre}" no está inicializada. ` +
            'Aplica la migración correspondiente (database/migrations).'
        );
    }

    const siguiente = Number(filas[0].valor) + 1;

    await connection.query(
        'UPDATE secuencias SET valor = ? WHERE nombre = ?',
        [siguiente, nombre]
    );

    return siguiente;
}

module.exports = {
    esErrorSecuenciaInexistente,
    formatearCodigoProducto,
    formatearNumeroFactura,
    siguienteValor
};
