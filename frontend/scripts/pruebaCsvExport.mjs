// ===========================================
// PRUEBAS DE LA UTILIDAD DE EXPORTACIÓN CSV
// (frontend React y páginas HTML legacy).
// Usa un conjunto de datos de EJEMPLO: no
// consulta el backend ni modifica datos reales.
// Ejecutar: node frontend/scripts/pruebaCsvExport.mjs
// ===========================================

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { construirCsvExcel } from '../src/utils/csvExport.js';

// Carga la versión para las páginas HTML (script clásico).
const require = createRequire(import.meta.url);
const carpetaActual = path.dirname(fileURLToPath(import.meta.url));
const { construirCsvExcel: construirCsvExcelLegacy } = require(
    path.join(carpetaActual, '..', '..', 'RESTAURANTE BALUARTE HTML AGOSTO', 'js', 'csvExport.js')
);

// ---------- CONJUNTO DE DATOS DE EJEMPLO ----------
// Incluye: encabezados, tildes y ñ, nombres con espacios, importes
// (positivos, negativos y cero), fechas, campos vacíos y nulos,
// texto con separador (";") y valores con comillas dobles, un
// salto de línea embebido y patrones típicos de inyección de fórmulas.
const encabezados = [
    'numero_factura', 'fecha', 'cliente', 'documento',
    'metodo_pago', 'subtotal', 'iva', 'total', 'observaciones'
];

const filas = [
    ['F-001', '22/10/2026', 'María José Muñoz', '1.080.123.456', 'Efectivo', 18000, 3420, 21420, null],
    ['F-002', '23/10/2026', 'José Ñúñez', '', 'Transferencia', 7000, 1330, 8330, 'Entrega; en domicilio'],
    ['F-003', '24/10/2026', 'Andrés Gómez', '10203040', 'Tarjeta', 5000, 950, 5950, 'Contiene "comillas" y salto\nde línea'],
    ['F-004', '25/10/2026', '=SUM(A1:A2)', '', 'Efectivo', -5000, -950, -5950, "=cmd|' /C calc'!A0"],
    ['F-005', '26/10/2026', '+2+3|calc', undefined, 'Nequi', 0, 0, 0, '']
];

// ---------- ANALIZADOR CSV (RFC 4180 con separador ";") ----------
// Reconstruye las filas tal como las leería Excel para poder
// verificar columnas, escapado y saltos de línea embebidos.
function analizarCsv(contenido) {
    let texto = contenido.startsWith('\uFEFF') ? contenido.slice(1) : contenido;

    // Se descarta la fila de la directiva "sep=;" que Excel interpreta
    // como configuración (no como dato).
    if (texto.startsWith('sep=;\r\n')) {
        texto = texto.slice('sep=;\r\n'.length);
    }

    const filasParseadas = [];
    let fila = [];
    let campo = '';
    let entreComillas = false;
    let i = 0;

    while (i < texto.length) {
        const car = texto[i];

        if (entreComillas) {
            if (car === '"') {
                if (texto[i + 1] === '"') {
                    campo += '"';
                    i += 2;
                    continue;
                }

                entreComillas = false;
                i++;
                continue;
            }

            campo += car;
            i++;
            continue;
        }

        if (car === '"') {
            entreComillas = true;
            i++;
            continue;
        }

        if (car === ';') {
            fila.push(campo);
            campo = '';
            i++;
            continue;
        }

        if (car === '\r' && texto[i + 1] === '\n') {
            fila.push(campo);
            filasParseadas.push(fila);
            fila = [];
            campo = '';
            i += 2;
            continue;
        }

        if (car === '\n' || car === '\r') {
            fila.push(campo);
            filasParseadas.push(fila);
            fila = [];
            campo = '';
            i++;
            continue;
        }

        campo += car;
        i++;
    }

    if (campo !== '' || fila.length > 0) {
        fila.push(campo);
        filasParseadas.push(fila);
    }

    return filasParseadas;
}

function contar(texto, subcadena) {
    return texto.split(subcadena).length - 1;
}

// ---------- SUITE DE PRUEBAS ----------
let ok = 0;
let fallidas = 0;

function verificar(nombre, condicion, detalle) {
    if (condicion) {
        ok++;
        console.log('  [OK]    ' + nombre);
    } else {
        fallidas++;
        console.error('  [FALLO] ' + nombre + (detalle !== undefined ? ' → ' + detalle : ''));
    }
}

const csv = construirCsvExcel(encabezados, filas);

const filasParseadas = analizarCsv(csv);

console.log('--- Pruebas del formato del archivo ---');

verificar('1. BOM UTF-8 al inicio', csv.startsWith('\uFEFF'));
verificar('2. Directiva inicial sep=;', csv.startsWith('\uFEFFsep=;\r\n'));
verificar(
    '3. Finales de línea CRLF (unico salto suelto = embebido en campo)',
    contar(csv, '\n') === contar(csv, '\r\n') + 1,
    'saltos=' + contar(csv, '\n') + ', CRLF=' + contar(csv, '\r\n')
);
verificar(
    '4. Cantidad de filas (encabezado + 5 datos)',
    filasParseadas.length === 6,
    'obtenidas=' + filasParseadas.length
);
verificar(
    '5. Encabezado con 9 columnas en orden',
    filasParseadas[0].join(';') === encabezados.join(';'),
    'obtenido=' + filasParseadas[0].join(';')
);
verificar(
    '6. Todas las filas de datos con 9 columnas',
    filasParseadas.every((fila) => fila.length === 9),
    'columnas=' + filasParseadas.map((fila) => fila.length).join(',')
);

console.log('--- Pruebas de contenido y escapado ---');

verificar(
    '7. Tildes y enie conservadas (Maria Jose Muñoz)',
    filasParseadas[1][2] === 'María José Muñoz',
    'obtenido=' + filasParseadas[1][2]
);
verificar(
    '8. Enie y espacio en apellido (José Ñúñez)',
    filasParseadas[2][2] === 'José Ñúñez',
    'obtenido=' + filasParseadas[2][2]
);
verificar(
    '9. Nombre con espacios (Andrés Gómez)',
    filasParseadas[3][2] === 'Andrés Gómez',
    'obtenido=' + filasParseadas[3][2]
);
verificar(
    '10. Campo con separador ";" en una sola columna',
    filasParseadas[2][8] === 'Entrega; en domicilio',
    'obtenido=' + filasParseadas[2][8]
);
verificar(
    '11. Comillas dobles conservadas dentro del campo',
    filasParseadas[3][8] === 'Contiene "comillas" y salto\nde línea',
    'obtenido=' + JSON.stringify(filasParseadas[3][8])
);
verificar(
    '12. Salto de línea embebido dentro del campo entrecomillado',
    filasParseadas[3][8].includes('\nde línea'),
    'obtenido=' + JSON.stringify(filasParseadas[3][8])
);
verificar(
    '13. null exportado como campo vacío',
    filasParseadas[1][8] === '',
    'obtenido=' + JSON.stringify(filasParseadas[1][8])
);
verificar(
    '14. undefined exportado como campo vacío',
    filasParseadas[5][3] === '',
    'obtenido=' + JSON.stringify(filasParseadas[5][3])
);
verificar(
    '15. Cadena vacía exportada como campo vacío',
    filasParseadas[2][3] === '' && filasParseadas[5][8] === '',
    'doc=' + JSON.stringify(filasParseadas[2][3]) + ', obs=' + JSON.stringify(filasParseadas[5][8])
);
verificar(
    '16. Importes y cero sin alterar (18000, -5000, 0)',
    filasParseadas[1][5] === '18000' &&
        filasParseadas[4][5] === '-5000' &&
        filasParseadas[4][6] === '-950' &&
        filasParseadas[5][5] === '0',
    'valores=' + [filasParseadas[1][5], filasParseadas[4][5], filasParseadas[5][5]].join('|')
);
verificar(
    '17. Fecha sin alterar (22/10/2026)',
    filasParseadas[1][1] === '22/10/2026',
    'obtenido=' + filasParseadas[1][1]
);
verificar(
    '18. Documento con puntos sin alterar (1.080.123.456)',
    filasParseadas[1][3] === '1.080.123.456',
    'obtenido=' + filasParseadas[1][3]
);

console.log('--- Pruebas de protección contra fórmulas ---');

verificar(
    '19. Texto "=SUM(A1:A2)" neutralizado con prefijo de comilla',
    filasParseadas[4][2] === "'=SUM(A1:A2)",
    'obtenido=' + JSON.stringify(filasParseadas[4][2])
);
verificar(
    '20. Texto "+2+3|calc" neutralizado con prefijo de comilla',
    filasParseadas[5][2] === "'+2+3|calc",
    'obtenido=' + JSON.stringify(filasParseadas[5][2])
);
verificar(
    '21. Texto de comando con "=" neutralizado',
    filasParseadas[4][8].startsWith("'="),
    'obtenido=' + JSON.stringify(filasParseadas[4][8])
);
verificar(
    '22. Números negativos legítimos SIN prefijo',
    filasParseadas[4][5] === '-5000' && filasParseadas[4][7] === '-5950',
    'obtenidos=' + filasParseadas[4][5] + ',' + filasParseadas[4][7]
);

console.log('--- Pruebas de la versión legacy (páginas HTML) ---');

const csvLegacy = construirCsvExcelLegacy(encabezados, filas);

verificar(
    '23. La versión legacy produce exactamente el mismo CSV',
    csvLegacy === csv
);
verificar(
    '24. La utilidad tolera filas nulas sin lanzar error',
    construirCsvExcel(['A', 'B'], null) === '\uFEFFsep=;\r\n' + 'A;B'
);

console.log('');
console.log('Archivo CSV de ejemplo (primeras 4 líneas):');
console.log(csv.split('\r\n').slice(0, 4).join('\r\n').replace('\uFEFF', '[BOM]'));
console.log('');

if (fallidas > 0) {
    console.error('RESULTADO: ' + fallidas + ' prueba(s) fallida(s) de ' + (ok + fallidas) + '.');
    process.exit(1);
}

console.log('RESULTADO: todas las pruebas pasaron (' + ok + '/' + (ok + fallidas) + ').');
