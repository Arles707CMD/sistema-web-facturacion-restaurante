// ===========================================
// RESTAURANTE BALUARTE
// MÓDULO PRODUCTOS
// FLUJO: Formulario HTML -> POST -> Express ->
// mysql2 -> respuesta JSON -> interfaz
// ===========================================


// ===========================================
// CONFIGURACIÓN API
// ===========================================

const apiUrl = "http://localhost:3000/api/productos";


// ===========================================
// ELEMENTOS HTML
// ===========================================

const tabla = document.querySelector(".tabla-productos tbody");

const modal = document.getElementById("modalProducto");

const formulario = document.querySelector("#modalProducto form");

const buscador = document.querySelector(".busqueda input");

const filtroCategoria = document.querySelector(".busqueda select");

const btnNuevo = document.querySelector(".btn-red");

const btnCerrar = document.querySelector(".cerrar");

const btnCancelar = document.querySelector(".cancelar");

const mensajeProducto = document.getElementById("mensajeProducto");

const totalProductos = document.getElementById("totalProductos");

const totalCategorias = document.getElementById("totalCategorias");

const totalBajoStock = document.getElementById("totalBajoStock");


// ===========================================
// CAMPOS DEL FORMULARIO
// ===========================================

const nombreInput = document.getElementById("nombre");

const descripcionInput = document.getElementById("descripcion");

const categoriaInput = document.getElementById("categoria");

const precioInput = document.getElementById("precio");

const stockInput = document.getElementById("stock");

const tituloModal = document.getElementById("tituloModal");


// ===========================================
// PRODUCTOS
// ===========================================

let productos = [];

let idProductoEditar = null;


// ===========================================
// MENSAJES DE ÉXITO / ERROR
// ===========================================

function mostrarMensaje(texto, esError = false) {

    mensajeProducto.textContent = texto;

    mensajeProducto.classList.toggle("exito", !esError);

    mensajeProducto.classList.toggle("error", esError);

    mensajeProducto.hidden = false;

    setTimeout(() => {

        mensajeProducto.hidden = true;

    }, 5000);

}


// ===========================================
// SINCRONIZAR LOCALSTORAGE (COMPATIBILIDAD)
// ===========================================
// ventas.js, recetas.js y app.js (dashboard)
// todavía leen la clave "productos"; por eso se
// mantiene actualizada con el formato legado.

function sincronizarLocalStorage() {

    const productosLegado = productos.map(producto => ({

        codigo: "P" + String(producto.id_producto).padStart(3, "0"),

        nombre: producto.nombre,

        categoria: producto.categoria,

        precio: Number(producto.precio),

        stock: Number(producto.stock)

    }));

    localStorage.setItem("productos", JSON.stringify(productosLegado));

}


// ===========================================
// CARGAR PRODUCTOS (CONSULTA GET)
// ===========================================

async function cargarProductos() {

    try {

        const respuesta = await fetch(apiUrl);

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(datos.mensaje || "Error al obtener los productos");

        }

        productos = datos;

        sincronizarLocalStorage();

        mostrarProductos();

    } catch (error) {

        console.error("Error al cargar productos:", error.message);

        productos = [];

        mostrarProductos();

        mostrarMensaje(
            "No se pudieron cargar los productos desde el servidor.",
            true
        );

    }

}


// ===========================================
// ESTADO DEL STOCK
// ===========================================

function obtenerEstado(stock) {

    if (stock <= 0) {

        return "Agotado";

    }

    if (stock <= 10) {

        return "Bajo Stock";

    }

    return "Disponible";

}


// ===========================================
// CLASE DEL ESTADO
// ===========================================

function obtenerClase(stock) {

    if (stock <= 0) {

        return "agotado";

    }

    if (stock <= 10) {

        return "bajo";

    }

    return "disponible";

}


// ===========================================
// ACTUALIZAR TARJETAS RESUMEN
// ===========================================

function actualizarResumen() {

    const categorias = new Set(
        productos
            .map(producto => String(producto.categoria || "").trim())
            .filter(categoria => categoria !== "")
    );

    const bajoStock = productos.filter(producto =>
        producto.stock > 0 && producto.stock <= 10
    );

    totalProductos.textContent = productos.length;

    totalCategorias.textContent = categorias.size;

    totalBajoStock.textContent = bajoStock.length;

}


// ===========================================
// FORMATO DE CÓDIGO Y PRECIO
// ===========================================

function obtenerCodigo(producto) {

    if (producto.id_producto) {

        return "P" + String(producto.id_producto).padStart(3, "0");

    }

    return producto.codigo || "--";

}

function formatearPrecio(precio) {

    return "$" + Number(precio).toLocaleString("es-CO");

}


// ===========================================
// MOSTRAR PRODUCTOS (RESPUESTA GET)
// ===========================================

function mostrarProductos(lista = productos) {

    tabla.innerHTML = "";

    actualizarResumen();

    lista.forEach((producto) => {

        tabla.innerHTML += `

            <tr>

                <td>${obtenerCodigo(producto)}</td>

                <td>${producto.nombre}</td>

                <td>${producto.categoria}</td>

                <td>${formatearPrecio(producto.precio)}</td>

                <td>${producto.stock}</td>

                <td>

                    <span class="estado ${obtenerClase(producto.stock)}">

                        ${obtenerEstado(producto.stock)}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-icon editar"
                        onclick="editarProducto(${producto.id_producto})"
                        title="Editar">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn-icon eliminar"
                        onclick="eliminarProducto(${producto.id_producto})"
                        title="Eliminar">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                    <button
                        class="btn-icon ver"
                        onclick="verProducto(${producto.id_producto})"
                        title="Ver">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}


// ===========================================
// ABRIR MODAL NUEVO PRODUCTO
// ===========================================

btnNuevo.addEventListener("click", () => {

    idProductoEditar = null;

    tituloModal.textContent = "Nuevo Producto";

    formulario.reset();

    modal.style.display = "flex";

    nombreInput.focus();

});


// ===========================================
// CERRAR MODAL
// ===========================================

function cerrarModal() {

    modal.style.display = "none";

    formulario.reset();

    idProductoEditar = null;

}


btnCerrar.addEventListener("click", cerrarModal);

btnCancelar.addEventListener("click", cerrarModal);


// ===========================================
// GUARDAR / EDITAR PRODUCTO
// Envío POST (nuevo) o PUT (editar) al backend
// ===========================================

formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    const producto = {

        nombre: nombreInput.value.trim(),

        descripcion: descripcionInput.value.trim(),

        idCategoria: Number(categoriaInput.value),

        precio: Number(precioInput.value),

        stock: Number(stockInput.value)

    };

    if (!producto.nombre) {

        mostrarMensaje("El nombre del producto es obligatorio.", true);

        return;

    }

    if (!producto.idCategoria) {

        mostrarMensaje("Debe seleccionar una categoría.", true);

        return;

    }

    try {

        const esNuevo = idProductoEditar === null;

        const url = esNuevo ? apiUrl : `${apiUrl}/${idProductoEditar}`;

        const metodo = esNuevo ? "POST" : "PUT";

        const respuesta = await fetch(url, {

            method: metodo,

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify(producto)

        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(datos.mensaje || "Error al guardar el producto");

        }

        mostrarMensaje(
            esNuevo
                ? "Producto creado correctamente."
                : "Producto actualizado correctamente."
        );

        cerrarModal();

        await cargarProductos();

    } catch (error) {

        console.error("Error al guardar producto:", error.message);

        mostrarMensaje(error.message, true);

    }

});


// ===========================================
// EDITAR PRODUCTO
// ===========================================

function editarProducto(id) {

    const producto = productos.find(p => p.id_producto === id);

    if (!producto) {

        return;

    }

    idProductoEditar = id;

    tituloModal.textContent = "Editar Producto";

    nombreInput.value = producto.nombre;

    descripcionInput.value = producto.descripcion || "";

    categoriaInput.value = producto.id_categoria;

    precioInput.value = producto.precio;

    stockInput.value = producto.stock;

    modal.style.display = "flex";

    nombreInput.focus();

}


// ===========================================
// ELIMINAR PRODUCTO (DELETE)
// ===========================================

async function eliminarProducto(id) {

    const producto = productos.find(p => p.id_producto === id);

    if (!producto) {

        return;

    }

    const confirmar = confirm(
        `¿Está seguro de eliminar "${producto.nombre}"?`
    );

    if (!confirmar) {

        return;

    }

    try {

        const respuesta = await fetch(`${apiUrl}/${id}`, {

            method: "DELETE"

        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(datos.mensaje || "Error al eliminar el producto");

        }

        mostrarMensaje("Producto eliminado correctamente.");

        await cargarProductos();

    } catch (error) {

        console.error("Error al eliminar producto:", error.message);

        mostrarMensaje(error.message, true);

    }

}


// ===========================================
// VER PRODUCTO
// ===========================================

function verProducto(id) {

    const producto = productos.find(p => p.id_producto === id);

    if (!producto) {

        return;

    }

    const descripcion = producto.descripcion
        ? "Descripción: " + producto.descripcion + "\n"
        : "";

    alert(

        "INFORMACIÓN DEL PRODUCTO\n\n" +

        "Código: " + obtenerCodigo(producto) + "\n" +

        "Producto: " + producto.nombre + "\n" +

        descripcion +

        "Categoría: " + producto.categoria + "\n" +

        "Precio: " + formatearPrecio(producto.precio) + "\n" +

        "Stock: " + producto.stock + "\n" +

        "Estado: " + obtenerEstado(producto.stock)

    );

}


// ===========================================
// BUSCADOR Y FILTRO POR CATEGORÍA
// ===========================================

if (buscador) {

    buscador.addEventListener("input", filtrarProductos);

}

if (filtroCategoria) {

    filtroCategoria.addEventListener("change", filtrarProductos);

}

function filtrarProductos() {

    const texto = buscador.value.toLowerCase();

    const categoria = filtroCategoria.value;

    const filtrados = productos.filter(producto => {

        const coincideTexto =

            producto.nombre.toLowerCase().includes(texto) ||

            obtenerCodigo(producto).toLowerCase().includes(texto) ||

            producto.categoria.toLowerCase().includes(texto);

        const coincideCategoria =

            categoria === "Todas las categorías" ||

            producto.categoria === categoria;

        return coincideTexto && coincideCategoria;

    });

    mostrarProductos(filtrados);

}


// ===========================================
// CERRAR MODAL AL HACER CLICK AFUERA
// ===========================================

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        cerrarModal();

    }

});


// ===========================================
// INICIALIZAR
// ===========================================

cargarProductos();

console.log("Módulo Productos iniciado");

console.log("Productos:", productos);
