const facturasReporte = BaluarteData.leer("facturas");
const productosReporte = BaluarteData.leer("productos");
const totalReporte = facturasReporte.reduce((total, f) => total + Number(f.total || 0), 0);
const unidadesReporte = facturasReporte.reduce((total, f) => total + (f.productos || []).reduce((s, p) => s + Number(p.cantidad || 0), 0), 0);
document.getElementById("reporteVentas").textContent = BaluarteData.moneda(totalReporte);
document.getElementById("reporteFacturas").textContent = facturasReporte.length;
document.getElementById("reporteUnidades").textContent = unidadesReporte;
document.getElementById("reporteStock").textContent = productosReporte.filter(p => Number(p.stock) <= 10).length;
const ventasPorProducto = {};
facturasReporte.forEach(f => (f.productos || []).forEach(p => { const clave = p.codigo || p.nombre; ventasPorProducto[clave] = ventasPorProducto[clave] || { nombre: p.nombre, cantidad: 0, total: 0 }; ventasPorProducto[clave].cantidad += Number(p.cantidad || 0); ventasPorProducto[clave].total += Number(p.precio || 0) * Number(p.cantidad || 0); }));
const filas = Object.values(ventasPorProducto).sort((a,b) => b.total - a.total);
document.getElementById("tablaReporte").innerHTML = filas.length ? filas.map(p => `<tr><td>${p.nombre}</td><td>${p.cantidad}</td><td>${BaluarteData.moneda(p.total)}</td></tr>`).join("") : '<tr><td colspan="3">Aún no hay ventas para generar el reporte.</td></tr>';
document.getElementById("exportarReporte").addEventListener("click", () => {
    const contenido = ["Producto,Cantidad,Total", ...filas.map(p => `"${p.nombre.replaceAll('"','""')}",${p.cantidad},${p.total}`)].join("\n");
    const enlace = document.createElement("a"); enlace.href = URL.createObjectURL(new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8" })); enlace.download = "reporte-baluarte.csv"; enlace.click(); URL.revokeObjectURL(enlace.href);
});
