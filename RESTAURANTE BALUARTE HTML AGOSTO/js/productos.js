// ===========================================
// RESTAURANTE BALUARTE
// MÓDULO PRODUCTOS
// ===========================================


// ===========================================
// ELEMENTOS HTML
// ===========================================

const tabla = document.querySelector(".tabla-productos tbody");

const modal = document.getElementById("modalProducto");

const formulario = document.querySelector("#modalProducto form");

const buscador = document.querySelector(".busqueda input");

const btnNuevo = document.querySelector(".btn-red");

const btnCerrar = document.querySelector(".cerrar");

const btnCancelar = document.querySelector(".cancelar");

const totalProductos = document.getElementById("totalProductos");

const totalCategorias = document.getElementById("totalCategorias");

const totalBajoStock = document.getElementById("totalBajoStock");


// ===========================================
// CAMPOS DEL FORMULARIO
// ===========================================

const codigoInput = document.getElementById("codigo");

const nombreInput = document.getElementById("nombre");

const categoriaInput = document.getElementById("categoria");

const precioInput = document.getElementById("precio");

const stockInput = document.getElementById("stock");

const tituloModal = document.getElementById("tituloModal");


// ===========================================
// PRODUCTOS
// ===========================================

let productos = [];

let indiceEditar = null;


// ===========================================
// CARGAR PRODUCTOS
// ===========================================

function cargarProductos() {

    const datos = localStorage.getItem("productos");

    if (datos) {

        productos = JSON.parse(datos);

    } else {

        productos = [

            {
                codigo: "P001",
                nombre: "Hamburguesa Especial",
                categoria: "Comidas",
                precio: 25000,
                stock: 18
            },

            {
                codigo: "P002",
                nombre: "Pizza Familiar",
                categoria: "Comidas",
                precio: 48000,
                stock: 10
            },

            {
                codigo: "P003",
                nombre: "Lasaña",
                categoria: "Comidas",
                precio: 28000,
                stock: 6
            },

            {
                codigo: "P004",
                nombre: "Perro Especial",
                categoria: "Comidas",
                precio: 18000,
                stock: 20
            }

        ];

        guardarProductos();
    }

}


// ===========================================
// GUARDAR PRODUCTOS
// ===========================================

function guardarProductos() {

    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );

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
// MOSTRAR PRODUCTOS
// ===========================================

function mostrarProductos(lista = productos) {

    tabla.innerHTML = "";

    actualizarResumen();

    lista.forEach((producto) => {

        // La lista puede estar filtrada; conservamos el índice del catálogo
        // completo para que las acciones actúen sobre el producto correcto.
        const indiceProducto = productos.indexOf(producto);

        tabla.innerHTML += `

            <tr>

                <td>${producto.codigo}</td>

                <td>${producto.nombre}</td>

                <td>${producto.categoria}</td>

                <td>$${producto.precio.toLocaleString("es-CO")}</td>

                <td>${producto.stock}</td>

                <td>

                    <span class="estado ${obtenerClase(producto.stock)}">

                        ${obtenerEstado(producto.stock)}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-icon editar"
                        onclick="editarProducto(${indiceProducto})"
                        title="Editar">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn-icon eliminar"
                        onclick="eliminarProducto(${indiceProducto})"
                        title="Eliminar">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                    <button
                        class="btn-icon ver"
                        onclick="verProducto(${indiceProducto})"
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

    indiceEditar = null;

    tituloModal.textContent = "Nuevo Producto";

    formulario.reset();

    modal.style.display = "flex";

    codigoInput.focus();

});


// ===========================================
// CERRAR MODAL
// ===========================================

function cerrarModal() {

    modal.style.display = "none";

    formulario.reset();

    indiceEditar = null;

}


btnCerrar.addEventListener("click", cerrarModal);

btnCancelar.addEventListener("click", cerrarModal);


// ===========================================
// GUARDAR / EDITAR PRODUCTO
// ===========================================

formulario.addEventListener("submit", (e) => {

    e.preventDefault();

    const producto = {

        codigo: codigoInput.value.trim(),

        nombre: nombreInput.value.trim(),

        categoria: categoriaInput.value,

        precio: Number(precioInput.value),

        stock: Number(stockInput.value)

    };


    // EDITAR

    if (indiceEditar !== null) {

        productos[indiceEditar] = producto;

        alert("Producto actualizado correctamente.");

    }

    // NUEVO

    else {

        const existe = productos.some(
            p => p.codigo.toLowerCase() === producto.codigo.toLowerCase()
        );

        if (existe) {

            alert("Ya existe un producto con ese código.");

            return;
        }

        productos.push(producto);

        alert("Producto agregado correctamente.");

    }


    guardarProductos();

    mostrarProductos();

    cerrarModal();

});


// ===========================================
// EDITAR PRODUCTO
// ===========================================

function editarProducto(index) {

    const producto = productos[index];

    indiceEditar = index;

    tituloModal.textContent = "Editar Producto";

    codigoInput.value = producto.codigo;

    nombreInput.value = producto.nombre;

    categoriaInput.value = producto.categoria;

    precioInput.value = producto.precio;

    stockInput.value = producto.stock;

    modal.style.display = "flex";

    nombreInput.focus();

}


// ===========================================
// ELIMINAR PRODUCTO
// ===========================================

function eliminarProducto(index) {

    const producto = productos[index];

    const confirmar = confirm(
        `¿Está seguro de eliminar "${producto.nombre}"?`
    );

    if (!confirmar) {

        return;

    }

    productos.splice(index, 1);

    guardarProductos();

    mostrarProductos();

    alert("Producto eliminado correctamente.");

}


// ===========================================
// VER PRODUCTO
// ===========================================

function verProducto(index) {

    const producto = productos[index];

    alert(

        "INFORMACIÓN DEL PRODUCTO\n\n" +

        "Código: " + producto.codigo + "\n" +

        "Producto: " + producto.nombre + "\n" +

        "Categoría: " + producto.categoria + "\n" +

        "Precio: $" + producto.precio.toLocaleString("es-CO") + "\n" +

        "Stock: " + producto.stock + "\n" +

        "Estado: " + obtenerEstado(producto.stock)

    );

}


// ===========================================
// BUSCADOR
// ===========================================

if (buscador) {

    buscador.addEventListener("input", () => {

        const texto = buscador.value.toLowerCase();

        const filtrados = productos.filter(producto =>

            producto.nombre.toLowerCase().includes(texto) ||

            producto.codigo.toLowerCase().includes(texto) ||

            producto.categoria.toLowerCase().includes(texto)

        );

        mostrarProductos(filtrados);

    });

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

mostrarProductos();

console.log("Módulo Productos iniciado");

console.log("Productos:", productos);
