const formConfiguracion = document.getElementById("formConfiguracion");
const configuracion = BaluarteData.leer("configuracion", {});
document.getElementById("nombreRestaurante").value = configuracion.nombre || "Restaurante Baluarte";
document.getElementById("metaMensual").value = configuracion.metaMensual || 50000000;
document.getElementById("ivaConfiguracion").value = configuracion.iva ?? 19;
formConfiguracion.addEventListener("submit", event => { event.preventDefault(); BaluarteData.guardar("configuracion", { nombre: document.getElementById("nombreRestaurante").value.trim(), metaMensual: Number(document.getElementById("metaMensual").value), iva: Number(document.getElementById("ivaConfiguracion").value) }); alert("Configuración guardada."); });
document.getElementById("reiniciarDatos").addEventListener("click", () => { if (!confirm("¿Eliminar ventas, recetas y usuarios creados? Esta acción no se puede deshacer.")) return; ["productos", "facturas", "recetas", "usuarios", "configuracion"].forEach(clave => localStorage.removeItem(clave)); BaluarteData.asegurarDatos(); location.reload(); });
