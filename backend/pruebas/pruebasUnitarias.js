// ===========================================
// PRUEBAS UNITARIAS DEL BACKEND (funciones puras)
// No requieren base de datos ni servidor SMTP.
// Ejecutar desde backend/: npm test
// ===========================================

const assert = require('assert');

const {
    generarHashContrasena,
    verificarContrasena
} = require('../services/passwordService');
const {
    formatearCodigoProducto,
    formatearNumeroFactura
} = require('../services/secuenciaService');
const { generarNumeroFactura } = require('../services/ventaService');

let correctas = 0;
let fallidas = 0;

function prueba(nombre, funcion) {
    try {
        funcion();
        console.log('  ✔ ' + nombre);
        correctas += 1;
    } catch (error) {
        console.error('  ✘ ' + nombre + ' → ' + error.message);
        fallidas += 1;
    }
}

console.log('\npasswordService (hash de contraseñas, scrypt):');

prueba('verifica la contraseña correcta', () => {
    const hash = generarHashContrasena('secreto123');

    assert.ok(verificarContrasena('secreto123', hash));
});

prueba('rechaza una contraseña incorrecta', () => {
    const hash = generarHashContrasena('secreto123');

    assert.strictEqual(verificarContrasena('otraClave', hash), false);
});

prueba('salt aleatorio: dos hashes de la misma contraseña difieren', () => {
    assert.notStrictEqual(
        generarHashContrasena('mismoSecreto'),
        generarHashContrasena('mismoSecreto')
    );
});

prueba('un hash malformado no lanza excepción', () => {
    assert.strictEqual(verificarContrasena('x', 'formato-invalido'), false);
});

console.log('\nsecuenciaService (códigos empresariales de productos):');

prueba('continúa desde el mayor código asignado: 46 → P047', () => {
    assert.strictEqual(formatearCodigoProducto(47), 'P047');
});

prueba('mantiene el padding de 3 dígitos: 5 → P005', () => {
    assert.strictEqual(formatearCodigoProducto(5), 'P005');
});

prueba('códigos con más de 3 dígitos no se truncan: 1234 → P1234', () => {
    assert.strictEqual(formatearCodigoProducto(1234), 'P1234');
});

console.log('\nsecuenciaService (numeración de facturas):');

prueba('mantiene el padding de 6 dígitos: 10 → FAC-000010', () => {
    assert.strictEqual(formatearNumeroFactura(10), 'FAC-000010');
});

prueba('siguiente número de factura: 9 → FAC-000010', () => {
    assert.strictEqual(formatearNumeroFactura(9 + 1), 'FAC-000010');
});

prueba('el primer número de factura es FAC-000001', () => {
    assert.strictEqual(formatearNumeroFactura(1), 'FAC-000001');
});

console.log('\nventaService (fallback mientras la migración 003 no se aplica):');

prueba('último FAC-000009 → siguiente FAC-000010', () => {
    assert.strictEqual(generarNumeroFactura('FAC-000009'), 'FAC-000010');
});

prueba('sin facturas previas → FAC-000001', () => {
    assert.strictEqual(generarNumeroFactura(''), 'FAC-000001');
});

prueba('último FAC-000046 → siguiente FAC-000047', () => {
    assert.strictEqual(generarNumeroFactura('FAC-000046'), 'FAC-000047');
});

console.log(
    `\nResultado: ${correctas} pruebas correctas, ${fallidas} fallidas ` +
    `de ${correctas + fallidas}.`
);

if (fallidas > 0) {
    process.exit(1);
}
