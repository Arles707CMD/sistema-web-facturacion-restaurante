const facturasMetas = BaluarteData.leer("facturas");
const configMetas = BaluarteData.leer("configuracion", { metaMensual: 50000000 });
const vendidoMetas = facturasMetas.reduce((s, f) => s + Number(f.total || 0), 0);
const unidadesMetas = facturasMetas.reduce((s, f) => s + (f.productos || []).reduce((n, p) => n + Number(p.cantidad || 0), 0), 0);
const meta = Number(configMetas.metaMensual || 50000000);
document.getElementById("metaPlatillos").textContent = unidadesMetas.toLocaleString("es-CO");
document.getElementById("metaDinero").textContent = BaluarteData.moneda(vendidoMetas);
document.getElementById("metaPorcentaje").textContent = `${meta ? Math.min(100, Math.round(vendidoMetas / meta * 100)) : 0}%`;
document.getElementById("metaMensual").textContent = BaluarteData.moneda(meta);
