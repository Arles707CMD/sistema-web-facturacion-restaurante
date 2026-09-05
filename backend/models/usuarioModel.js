const database = require('../config/database');

// ===========================================
// MODELO DE USUARIOS
// Consultas parametrizadas con mysql2.
// Nunca devuelve el hash de la contraseña.
// ===========================================

// Obtiene todos los usuarios ordenados del más reciente al más antiguo.
async function obtenerUsuarios() {
    const [usuarios] = await database.query(`
        SELECT
            id_usuario,
            nombre,
            correo,
            rol,
            estado,
            fecha_creacion
        FROM usuarios
        ORDER BY id_usuario DESC
    `);

    return usuarios;
}

// Obtiene un usuario por su id.
async function obtenerUsuarioPorId(idUsuario) {
    const [usuario] = await database.query(`
        SELECT
            id_usuario,
            nombre,
            correo,
            rol,
            estado,
            fecha_creacion
        FROM usuarios
        WHERE id_usuario = ?
    `, [idUsuario]);

    return usuario[0] || null;
}

// Comprueba si un correo ya está registrado.
// Si se indica idExcluido, se ignora ese usuario (para la edición).
async function existeCorreo(correo, idExcluido = null) {
    if (idExcluido) {
        const [filas] = await database.query(
            `SELECT COUNT(*) AS total
            FROM usuarios
            WHERE correo = ? AND id_usuario <> ?`,
            [correo, idExcluido]
        );

        return filas[0].total > 0;
    }

    const [filas] = await database.query(
        `SELECT COUNT(*) AS total
        FROM usuarios
        WHERE correo = ?`,
        [correo]
    );

    return filas[0].total > 0;
}

// Crea un usuario con el hash de contraseña ya calculado.
async function crearUsuario(usuario) {
    const { nombre, correo, contrasenaHash, rol, estado } = usuario;

    const [resultado] = await database.query(
        `INSERT INTO usuarios
        (nombre, correo, contrasena_hash, rol, estado)
        VALUES (?, ?, ?, ?, ?)`,
        [nombre, correo, contrasenaHash, rol, estado]
    );

    return resultado.insertId;
}

// Actualiza un usuario. Si contrasenaHash es null, no cambia la contraseña.
async function actualizarUsuario(idUsuario, usuario) {
    const { nombre, correo, contrasenaHash, rol, estado } = usuario;

    if (contrasenaHash) {
        const [resultado] = await database.query(
            `UPDATE usuarios
            SET nombre = ?,
                correo = ?,
                contrasena_hash = ?,
                rol = ?,
                estado = ?
            WHERE id_usuario = ?`,
            [nombre, correo, contrasenaHash, rol, estado, idUsuario]
        );

        return resultado.affectedRows;
    }

    const [resultado] = await database.query(
        `UPDATE usuarios
        SET nombre = ?,
            correo = ?,
            rol = ?,
            estado = ?
        WHERE id_usuario = ?`,
        [nombre, correo, rol, estado, idUsuario]
    );

    return resultado.affectedRows;
}

// Elimina un usuario por su id.
async function eliminarUsuario(idUsuario) {
    const [resultado] = await database.query(
        `DELETE FROM usuarios
        WHERE id_usuario = ?`,
        [idUsuario]
    );

    return resultado.affectedRows;
}

// Obtiene un usuario por correo INCLUYENDO el hash de la contraseña.
// Se usa únicamente para la autenticación (login).
async function obtenerUsuarioParaAutenticacion(correo) {
    const [usuario] = await database.query(
        `SELECT
            id_usuario,
            nombre,
            correo,
            rol,
            estado,
            contrasena_hash
        FROM usuarios
        WHERE correo = ?`,
        [correo]
    );

    return usuario[0] || null;
}

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioParaAutenticacion,
    existeCorreo,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};