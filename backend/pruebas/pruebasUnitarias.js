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
    formatearNumeroFactura,
    formatearCodigoReceta
} = require('../services/secuenciaService');
const { generarNumeroFactura } = require('../services/ventaService');
const { describirErrorCorreo } = require('../services/recuperacionService');
const {
    ErrorCorreo,
    construirSolicitudBrevo,
    enviarCorreoRecuperacion
} = require('../services/correoService');

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

// Variante asíncrona para funciones que devuelven promesas.
async function pruebaAsincrona(nombre, funcion) {
    try {
        await funcion();
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

console.log('\nsecuenciaService (códigos empresariales de recetas):');

prueba('el primer código de receta es REC-001', () => {
    assert.strictEqual(formatearCodigoReceta(1), 'REC-001');
});

prueba('mantiene el padding de 3 dígitos: 2 → REC-002', () => {
    assert.strictEqual(formatearCodigoReceta(2), 'REC-002');
});

prueba('continúa desde el mayor asignado: 12 → REC-013', () => {
    assert.strictEqual(formatearCodigoReceta(12 + 1), 'REC-013');
});

prueba('escenario verificado: tras renumerar a REC-001, la siguiente es REC-002', () => {
    assert.strictEqual(formatearCodigoReceta(1 + 1), 'REC-002');
});

prueba('códigos con más de 3 dígitos no se truncan: 1234 → REC-1234', () => {
    assert.strictEqual(formatearCodigoReceta(1234), 'REC-1234');
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

console.log('\nrecuperacionService (registro sanitizado de errores de Brevo):');

prueba('distingue code, http y código de error de Brevo', () => {
    const descripcion = describirErrorCorreo({
        codigo: 'BREVO_NO_AUTORIZADO',
        message: 'La clave API de Brevo no es válida.',
        detalle: {
            httpStatus: 401,
            codigoBrevo: 'unauthorized',
            textoBrevo: 'Key is invalid'
        }
    });

    assert.ok(descripcion.includes('code=BREVO_NO_AUTORIZADO'));
    assert.ok(descripcion.includes('http=401'));
    assert.ok(descripcion.includes('brevo=unauthorized'));
});

prueba('error vacío produce SIN_CODIGO sin lanzar excepción', () => {
    assert.ok(describirErrorCorreo({}).includes('code=SIN_CODIGO'));
    assert.ok(describirErrorCorreo(null).includes('code=SIN_CODIGO'));
});

prueba('acota el texto del error a 300 caracteres', () => {
    const descripcion = describirErrorCorreo({ message: 'x'.repeat(500) });

    assert.ok(descripcion.length < 350);
});

prueba('enmascara la clave API si apareciera en el texto', () => {
    const original = process.env.BREVO_API_KEY;

    process.env.BREVO_API_KEY = 'clave-ficticia-solo-pruebas';

    try {
        const descripcion = describirErrorCorreo({
            message: 'fallo con clave-ficticia-solo-pruebas en el texto'
        });

        assert.ok(descripcion.includes('***'));
        assert.ok(!descripcion.includes('clave-ficticia-solo-pruebas'));
    } finally {
        if (original === undefined) {
            delete process.env.BREVO_API_KEY;
        } else {
            process.env.BREVO_API_KEY = original;
        }
    }
});

// ===========================================
// correoService (API HTTPS de Brevo): las pruebas inyectan una
// función de red FALSA; nunca se envían correos reales.
// ===========================================

// Valores de entorno FICTICIOS, exclusivos de las pruebas.
const ENV_PRUEBA = {
    BREVO_API_KEY: 'clave-ficticia-solo-pruebas',
    BREVO_FROM_EMAIL: 'remitente-ficticio@ejemplo.prueba',
    BREVO_FROM_NAME: 'Restaurante Baluarte'
};

const entornoOriginal = {};

Object.keys(ENV_PRUEBA).forEach((nombre) => {
    entornoOriginal[nombre] = process.env[nombre];
    process.env[nombre] = ENV_PRUEBA[nombre];
});

function restaurarEntorno() {
    Object.keys(ENV_PRUEBA).forEach((nombre) => {
        if (entornoOriginal[nombre] === undefined) {
            delete process.env[nombre];
        } else {
            process.env[nombre] = entornoOriginal[nombre];
        }
    });
}

(async () => {
    console.log('\ncorreoService (API de Brevo con red simulada, sin envíos reales):');

    try {
        await pruebaAsincrona('construye la petición correcta a /v3/smtp/email', async () => {
            const { opciones, cuerpo } = construirSolicitudBrevo({
                destino: 'destino-ficticio@ejemplo.prueba',
                enlace: 'https://frontend-prueba/restablecer?token=ficticio'
            });

            assert.strictEqual(opciones.hostname, 'api.brevo.com');
            assert.strictEqual(opciones.path, '/v3/smtp/email');
            assert.strictEqual(opciones.method, 'POST');
            assert.strictEqual(opciones.headers['api-key'], ENV_PRUEBA.BREVO_API_KEY);
            assert.strictEqual(opciones.headers['Content-Type'], 'application/json');

            const analizado = JSON.parse(cuerpo);

            assert.strictEqual(analizado.sender.email, ENV_PRUEBA.BREVO_FROM_EMAIL);
            assert.strictEqual(analizado.to[0].email, 'destino-ficticio@ejemplo.prueba');
            assert.ok(analizado.textContent.includes('restablecer?token=ficticio'));
            assert.ok(analizado.htmlContent.includes('restablecer?token=ficticio'));

            // Protección contra filtraciones: la clave API no va en el cuerpo.
            assert.ok(!cuerpo.includes(ENV_PRUEBA.BREVO_API_KEY));
        });

        await pruebaAsincrona('envío satisfactorio (201) devuelve true', async () => {
            const resultado = await enviarCorreoRecuperacion(
                'destino-ficticio@ejemplo.prueba',
                'https://frontend-prueba/restablecer?token=ficticio',
                async () => ({ estado: 201, cuerpo: '{"messageId":"id-ficticio"}' })
            );

            assert.strictEqual(resultado, true);
        });

        await pruebaAsincrona('sin credenciales lanza CORREO_NO_CONFIGURADO', async () => {
            const clave = process.env.BREVO_API_KEY;

            delete process.env.BREVO_API_KEY;

            try {
                await enviarCorreoRecuperacion(
                    'destino-ficticio@ejemplo.prueba',
                    'https://frontend-prueba/restablecer?token=ficticio',
                    async () => ({ estado: 201, cuerpo: '{}' })
                );

                throw new Error('debió fallar por falta de configuración');
            } catch (error) {
                assert.ok(error instanceof ErrorCorreo);
                assert.strictEqual(error.codigo, 'CORREO_NO_CONFIGURADO');
            } finally {
                process.env.BREVO_API_KEY = clave;
            }
        });

        await pruebaAsincrona('HTTP 401 se clasifica como BREVO_NO_AUTORIZADO', async () => {
            try {
                await enviarCorreoRecuperacion(
                    'destino-ficticio@ejemplo.prueba',
                    'https://frontend-prueba/restablecer?token=ficticio',
                    async () => ({
                        estado: 401,
                        cuerpo: '{"code":"unauthorized","message":"Key is invalid"}'
                    })
                );

                throw new Error('debió fallar con 401');
            } catch (error) {
                assert.ok(error instanceof ErrorCorreo);
                assert.strictEqual(error.codigo, 'BREVO_NO_AUTORIZADO');
                assert.strictEqual(error.detalle.httpStatus, 401);
                assert.strictEqual(error.detalle.codigoBrevo, 'unauthorized');
            }
        });

        await pruebaAsincrona('HTTP 429 se clasifica como límite alcanzado', async () => {
            try {
                await enviarCorreoRecuperacion(
                    'destino-ficticio@ejemplo.prueba',
                    'https://frontend-prueba/restablecer?token=ficticio',
                    async () => ({ estado: 429, cuerpo: '{"code":"too_many_requests"}' })
                );

                throw new Error('debió fallar con 429');
            } catch (error) {
                assert.strictEqual(error.codigo, 'BREVO_LIMITE_ALCANZADO');
            }
        });

        await pruebaAsincrona('HTTP 400 se clasifica como remitente/solicitud inválida', async () => {
            try {
                await enviarCorreoRecuperacion(
                    'destino-ficticio@ejemplo.prueba',
                    'https://frontend-prueba/restablecer?token=ficticio',
                    async () => ({
                        estado: 400,
                        cuerpo: '{"code":"unauthorized_sender","message":"sender is not verified"}'
                    })
                );

                throw new Error('debió fallar con 400');
            } catch (error) {
                assert.strictEqual(error.codigo, 'BREVO_SOLICITUD_INVALIDA');
                assert.strictEqual(error.detalle.codigoBrevo, 'unauthorized_sender');
            }
        });

        await pruebaAsincrona('tiempo de espera excedido se clasifica correctamente', async () => {
            try {
                await enviarCorreoRecuperacion(
                    'destino-ficticio@ejemplo.prueba',
                    'https://frontend-prueba/restablecer?token=ficticio',
                    async () => {
                        throw new Error('TIEMPO_EXCEDIDO');
                    }
                );

                throw new Error('debió fallar por tiempo de espera');
            } catch (error) {
                assert.strictEqual(error.codigo, 'BREVO_TIEMPO_EXCEDIDO');
            }
        });

        await pruebaAsincrona('fallo de red se clasifica como BREVO_FALLO_RED', async () => {
            try {
                await enviarCorreoRecuperacion(
                    'destino-ficticio@ejemplo.prueba',
                    'https://frontend-prueba/restablecer?token=ficticio',
                    async () => {
                        throw Object.assign(new Error('connect ECONNREFUSED'), {
                            code: 'ECONNREFUSED'
                        });
                    }
                );

                throw new Error('debió fallar por red');
            } catch (error) {
                assert.strictEqual(error.codigo, 'BREVO_FALLO_RED');
                assert.strictEqual(error.detalle.errorRed, 'ECONNREFUSED');
            }
        });

        await pruebaAsincrona('el diagnóstico no revela clave, destinatario ni enlace', async () => {
            try {
                await enviarCorreoRecuperacion(
                    'destino-ficticio@ejemplo.prueba',
                    'https://frontend-prueba/restablecer?token=ficticio',
                    async () => ({
                        estado: 401,
                        cuerpo: '{"code":"unauthorized","message":"Key clave-ficticia-solo-pruebas invalid"}'
                    })
                );

                throw new Error('debió fallar con 401');
            } catch (error) {
                const descripcion = describirErrorCorreo(error);

                assert.ok(descripcion.includes('***'));
                assert.ok(!descripcion.includes(ENV_PRUEBA.BREVO_API_KEY));
                // Ni el destinatario ni el enlace aparecen en el diagnóstico.
                assert.ok(!descripcion.includes('destino-ficticio'));
                assert.ok(!descripcion.includes('token=ficticio'));
            }
        });
    } finally {
        restaurarEntorno();
    }

    console.log(
        `\nResultado: ${correctas} pruebas correctas, ${fallidas} fallidas ` +
        `de ${correctas + fallidas}.`
    );

    if (fallidas > 0) {
        process.exit(1);
    }
})();
