// ===========================================
// UTILIDAD DE EXPORTACIÓN CSV PARA EXCEL
// Genera archivos CSV pensados para abrirse
// directamente en Excel con configuración
// regional en español (Colombia):
// - Separador de campos: punto y coma (;)
// - Directiva inicial "sep=;" para que Excel
//   reconozca el separador de forma explícita.
// - Codificación UTF-8 con BOM (tildes, ñ, etc.).
// - Finales de línea CRLF (\r\n).
// - Escapado RFC 4180: separadores, comillas
//   dobles y saltos de línea dentro de un campo.
// - Protección contra inyección de fórmulas
//   (=, +, -, @, tab, CR) sin alterar los
//   valores numéricos legítimos.
// ===========================================

const SEPARADOR = ';';
const SALTO_LINEA = '\r\n';
const BOM_UTF8 = '\uFEFF';

// Prefijos que Excel interpretaría como fórmula.
const PREFIJOS_FORMULA = /^[=+\-@\t\r]/;

// Números legítimos: enteros, decimales, negativos y notación exponencial.
const PATRON_NUMERO = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

// Convierte cualquier valor a texto seguro: null/undefined → ''.
function valorATexto(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor);
}

// Determina si el texto es un número legítimo (entero, decimal o negativo).
function esNumeroLegitimo(texto) {
    const limpio = texto.trim();

    return limpio !== '' && PATRON_NUMERO.test(limpio);
}

// Prefija una comilla simple en los textos que Excel podría interpretar
// como fórmula (=SUM, +2+3, -cmd, @fun, tab o retorno de carro).
// Los números legítimos pasan sin cambios.
function protegerInyeccionFormulas(texto) {
    if (esNumeroLegitimo(texto)) {
        return texto;
    }

    if (PREFIJOS_FORMULA.test(texto)) {
        return "'" + texto;
    }

    return texto;
}

// Escapa un campo según RFC 4180 adaptado a ";" como separador:
// se entrecomilla solo cuando el valor contiene el separador,
// comillas dobles o saltos de línea; las comillas se duplican.
function escaparCampo(valor) {
    const texto = protegerInyeccionFormulas(valorATexto(valor));

    if (
        texto.includes(SEPARADOR) ||
        texto.includes('"') ||
        texto.includes('\n') ||
        texto.includes('\r')
    ) {
        return '"' + texto.replaceAll('"', '""') + '"';
    }

    return texto;
}

// Construye el contenido CSV completo (puro, sin tocar el DOM):
// BOM + "sep=;" + encabezados + filas, todo con finales CRLF.
// Devuelve el texto listo para el Blob.
function construirCsvExcel(encabezados, filas) {
    const encabezadoCsv = encabezados.map(escaparCampo).join(SEPARADOR);

    const filasCsv = (Array.isArray(filas) ? filas : []).map((fila) =>
        (Array.isArray(fila) ? fila : []).map(escaparCampo).join(SEPARADOR)
    );

    return (
        BOM_UTF8 +
        'sep=' + SEPARADOR + SALTO_LINEA +
        [encabezadoCsv, ...filasCsv].join(SALTO_LINEA)
    );
}

// Genera y descarga el archivo CSV en el navegador.
// Mantiene el nombre y la extensión definidos por cada módulo.
function exportarCsvExcel(nombreArchivo, encabezados, filas) {
    if (!Array.isArray(encabezados) || encabezados.length === 0) {
        return;
    }

    const contenido = construirCsvExcel(encabezados, filas);
    const enlace = document.createElement('a');

    enlace.href = URL.createObjectURL(
        new Blob([contenido], { type: 'text/csv;charset=utf-8' })
    );
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
}

export { construirCsvExcel, exportarCsvExcel };
