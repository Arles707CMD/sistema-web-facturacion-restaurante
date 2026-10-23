// ===========================================
// UTILIDAD DE EXPORTACIÓN CSV PARA EXCEL
// (versión script clásico para las páginas HTML)
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

(function (raiz) {
    var SEPARADOR = ';';
    var SALTO_LINEA = '\r\n';
    var BOM_UTF8 = '\uFEFF';

    // Prefijos que Excel interpretaría como fórmula.
    var PREFIJOS_FORMULA = /^[=+\-@\t\r]/;

    // Números legítimos: enteros, decimales, negativos y notación exponencial.
    var PATRON_NUMERO = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

    // Convierte cualquier valor a texto seguro: null/undefined → ''.
    function valorATexto(valor) {
        if (valor === null || valor === undefined) {
            return '';
        }

        return String(valor);
    }

    // Determina si el texto es un número legítimo (entero, decimal o negativo).
    function esNumeroLegitimo(texto) {
        var limpio = texto.trim();

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
        var texto = protegerInyeccionFormulas(valorATexto(valor));

        if (
            texto.indexOf(SEPARADOR) !== -1 ||
            texto.indexOf('"') !== -1 ||
            texto.indexOf('\n') !== -1 ||
            texto.indexOf('\r') !== -1
        ) {
            return '"' + texto.split('"').join('""') + '"';
        }

        return texto;
    }

    // Construye el contenido CSV completo (puro, sin tocar el DOM):
    // BOM + "sep=;" + encabezados + filas, todo con finales CRLF.
    function construirCsvExcel(encabezados, filas) {
        var encabezadoCsv = encabezados.map(escaparCampo).join(SEPARADOR);

        var filasCsv = (Array.isArray(filas) ? filas : []).map(function (fila) {
            return (Array.isArray(fila) ? fila : []).map(escaparCampo).join(SEPARADOR);
        });

        return (
            BOM_UTF8 +
            'sep=' + SEPARADOR + SALTO_LINEA +
            [encabezadoCsv].concat(filasCsv).join(SALTO_LINEA)
        );
    }

    // Genera y descarga el archivo CSV en el navegador.
    // Mantiene el nombre y la extensión definidos por cada módulo.
    function exportarCsvExcel(nombreArchivo, encabezados, filas) {
        if (!Array.isArray(encabezados) || encabezados.length === 0) {
            return;
        }

        var contenido = construirCsvExcel(encabezados, filas);
        var enlace = document.createElement('a');

        enlace.href = URL.createObjectURL(
            new Blob([contenido], { type: 'text/csv;charset=utf-8' })
        );
        enlace.download = nombreArchivo;
        enlace.click();
        URL.revokeObjectURL(enlace.href);
    }

    // Publica la utilidad en el ámbito global de la página.
    raiz.construirCsvExcel = construirCsvExcel;
    raiz.exportarCsvExcel = exportarCsvExcel;

    // Permite reutilizar la utilidad en pruebas automatizadas con Node.js.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            construirCsvExcel: construirCsvExcel,
            exportarCsvExcel: exportarCsvExcel
        };
    }
})(typeof window !== 'undefined' ? window : globalThis);
