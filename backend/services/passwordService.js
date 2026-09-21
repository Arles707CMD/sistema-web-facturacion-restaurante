const crypto = require('crypto');

// ===========================================
// SERVICIO DE CONTRASEÑAS (HASH scrypt)
// Utilidad compartida entre auth y usuarios para
// evitar duplicar la lógica criptográfica.
// ===========================================

// scrypt consume mucha memoria, lo que encarece ataques
// de fuerza bruta. Se usa un salt aleatorio por usuario
// (formato "sal:hash"), de modo que dos contraseñas iguales
// generan hashes distintos.
function generarHashContrasena(contrasena) {
    const sal = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(contrasena, sal, 64).toString('hex');

    return `${sal}:${hash}`;
}

// Verifica la contraseña contra el hash almacenado ("sal:hash").
// timingSafeEqual evita ataques de tiempo en la comparación.
function verificarContrasena(contrasena, hashAlmacenado) {
    const partes = String(hashAlmacenado).split(':');

    if (partes.length !== 2) {
        return false;
    }

    const [sal, hash] = partes;

    try {
        const hashCalculado = crypto.scryptSync(contrasena, sal, 64);
        const hashEsperado = Buffer.from(hash, 'hex');

        return (
            hashCalculado.length === hashEsperado.length &&
            crypto.timingSafeEqual(hashCalculado, hashEsperado)
        );
    } catch (error) {
        return false;
    }
}

module.exports = {
    generarHashContrasena,
    verificarContrasena
};
