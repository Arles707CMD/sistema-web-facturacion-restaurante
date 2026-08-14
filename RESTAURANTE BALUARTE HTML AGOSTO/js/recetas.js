const listaRecetas = document.getElementById("listaRecetas");
const buscarReceta = document.getElementById("buscarReceta");
const filtroEstado = document.getElementById("filtroEstado");
const modalReceta = document.getElementById("modalReceta");
const formReceta = document.getElementById("formReceta");
const productoReceta = document.getElementById("productoReceta");

let recetaEditando = null;

function leerProductos() {
    return JSON.parse(localStorage.getItem("productos")) || [];
}

function leerRecetas() {
    return JSON.parse(localStorage.getItem("recetas")) || [];
}

function guardarRecetas(recetas) {
    localStorage.setItem("recetas", JSON.stringify(recetas));
}

function recetaDeProducto(producto, index) {
    return {
        codigo: `REC-${String(index + 1).padStart(3, "0")}`,
        productoCodigo: producto.codigo,
        porciones: 1,
        tiempo: 15,
        estado: "Activa",
        descripcion: `Preparación registrada para ${producto.nombre}.`,
        actualizacion: "Catálogo actual"
    };
}

function recetasConProductos() {
    const productos = leerProductos();
    const recetasGuardadas = leerRecetas();

    return productos.map((producto, index) => {
        const receta = recetasGuardadas.find(item => item.productoCodigo === producto.codigo) || recetaDeProducto(producto, index);
        return { ...receta, producto };
    });
}

function claseEstado(estado) {
    return estado === "Activa" ? "activa" : estado === "En revisión" ? "revision" : "inactiva";
}

function actualizarResumen(recetas) {
    document.getElementById("totalRecetas").textContent = recetas.length;
    document.getElementById("recetasActivas").textContent = recetas.filter(receta => receta.estado === "Activa").length;
    document.getElementById("recetasRevision").textContent = recetas.filter(receta => receta.estado === "En revisión").length;
    document.getElementById("recetasInactivas").textContent = recetas.filter(receta => receta.estado === "Inactiva").length;
}

function mostrarRecetas() {
    const texto = buscarReceta.value.trim().toLowerCase();
    const estado = filtroEstado.value;
    const recetas = recetasConProductos();
    const filtradas = recetas.filter(receta => {
        const coincideTexto = receta.producto.nombre.toLowerCase().includes(texto) || receta.codigo.toLowerCase().includes(texto) || receta.producto.categoria.toLowerCase().includes(texto);
        return coincideTexto && (estado === "Todas" || receta.estado === estado);
    });

    actualizarResumen(recetas);
    listaRecetas.innerHTML = filtradas.length ? filtradas.map(receta => `
        <tr>
            <td>${receta.codigo}</td>
            <td><span class="receta-nombre">${receta.producto.nombre}</span><span class="receta-descripcion">${receta.descripcion || "Sin descripción"}</span></td>
            <td>${receta.producto.categoria}</td>
            <td>${receta.porciones}</td>
            <td><i class="fa-regular fa-clock"></i> ${receta.tiempo} min</td>
            <td><span class="estado-receta ${claseEstado(receta.estado)}">${receta.estado}</span></td>
            <td>${receta.actualizacion || "Catálogo actual"}</td>
            <td class="acciones-receta"><button class="btn-accion-receta" title="Ver receta" onclick="verReceta('${receta.productoCodigo}')"><i class="fa-solid fa-eye"></i></button><button class="btn-accion-receta" title="Editar receta" onclick="editarReceta('${receta.productoCodigo}')"><i class="fa-solid fa-pen"></i></button></td>
        </tr>
    `).join("") : "<tr><td colspan=\"8\">No se encontraron recetas vinculadas al catálogo.</td></tr>";

    document.getElementById("resumenRecetas").textContent = `Mostrando ${filtradas.length} de ${recetas.length} recetas del catálogo.`;
}

function cargarProductosEnFormulario() {
    const productos = leerProductos();
    productoReceta.innerHTML = productos.length
        ? productos.map(producto => `<option value="${producto.codigo}">${producto.codigo} — ${producto.nombre}</option>`).join("")
        : "<option value=\"\">No hay productos registrados</option>";
}

function abrirModal() {
    modalReceta.classList.add("abierto");
    modalReceta.setAttribute("aria-hidden", "false");
}

function cerrarModalReceta() {
    modalReceta.classList.remove("abierto");
    modalReceta.setAttribute("aria-hidden", "true");
    formReceta.reset();
    recetaEditando = null;
    document.getElementById("tituloModalReceta").textContent = "Nueva receta";
}

function editarReceta(codigo) {
    const receta = recetasConProductos().find(item => item.productoCodigo === codigo);
    if (!receta) return;
    recetaEditando = codigo;
    cargarProductosEnFormulario();
    productoReceta.value = receta.productoCodigo;
    document.getElementById("porcionesReceta").value = receta.porciones;
    document.getElementById("tiempoReceta").value = receta.tiempo;
    document.getElementById("estadoReceta").value = receta.estado;
    document.getElementById("descripcionReceta").value = receta.descripcion || "";
    document.getElementById("tituloModalReceta").textContent = "Editar receta";
    abrirModal();
}

function verReceta(codigo) {
    const receta = recetasConProductos().find(item => item.productoCodigo === codigo);
    if (receta) alert(`RECETA: ${receta.producto.nombre}\n\nCategoría: ${receta.producto.categoria}\nPorciones: ${receta.porciones}\nTiempo: ${receta.tiempo} min\nEstado: ${receta.estado}\n\n${receta.descripcion || "Sin descripción"}`);
}

document.getElementById("btnNuevaReceta").addEventListener("click", () => {
    recetaEditando = null;
    document.getElementById("tituloModalReceta").textContent = "Nueva receta";
    cargarProductosEnFormulario();
    abrirModal();
});

document.getElementById("cerrarReceta").addEventListener("click", cerrarModalReceta);
document.getElementById("cancelarReceta").addEventListener("click", cerrarModalReceta);
buscarReceta.addEventListener("input", mostrarRecetas);
filtroEstado.addEventListener("change", mostrarRecetas);

formReceta.addEventListener("submit", event => {
    event.preventDefault();
    const productoCodigo = productoReceta.value;
    if (!productoCodigo) return alert("Primero registra un producto en el módulo Productos.");
    const recetas = leerRecetas().filter(receta => receta.productoCodigo !== productoCodigo);
    const indice = leerProductos().findIndex(producto => producto.codigo === productoCodigo);
    recetas.push({
        codigo: recetaEditando ? recetasConProductos().find(item => item.productoCodigo === recetaEditando).codigo : `REC-${String(indice + 1).padStart(3, "0")}`,
        productoCodigo,
        porciones: Number(document.getElementById("porcionesReceta").value),
        tiempo: Number(document.getElementById("tiempoReceta").value),
        estado: document.getElementById("estadoReceta").value,
        descripcion: document.getElementById("descripcionReceta").value.trim(),
        actualizacion: new Date().toLocaleDateString("es-CO")
    });
    guardarRecetas(recetas);
    cerrarModalReceta();
    mostrarRecetas();
});

modalReceta.addEventListener("click", event => { if (event.target === modalReceta) cerrarModalReceta(); });
mostrarRecetas();
