//========================================
// RESTAURANTE BALUARTE
// MÓDULO DE VENTAS
//========================================

let carrito = [];

//========================================
// PRODUCTOS E INVENTARIO
//========================================

function obtenerProductos() {

    return JSON.parse(localStorage.getItem("productos")) || [];

}

function obtenerProductoPorCodigo(codigo) {

    return obtenerProductos().find(producto => producto.codigo === codigo);

}

//========================================
// CARGAR PRODUCTOS DESDE LOCALSTORAGE
//========================================

function cargarProductosVentas() {

    const contenedor = document.getElementById("productosGrid");

    if (!contenedor) {
        return;
    }

    const productos = obtenerProductos();

    contenedor.innerHTML = "";

    productos.forEach((producto) => {

        const card = document.createElement("div");

        const boton = document.createElement("button");

        const agotado = Number(producto.stock) <= 0;

        card.className = "producto-card";

        card.innerHTML = `
        
            <h3>${producto.nombre}</h3>

            <span>
                $${Number(producto.precio).toLocaleString("es-CO")}
            </span>

        `;

        boton.textContent = agotado ? "Agotado" : "Agregar";

        boton.disabled = agotado;

        boton.addEventListener("click", () => agregar(producto.codigo));

        card.appendChild(boton);

        contenedor.appendChild(card);

    });

}

//========================================
// AGREGAR AL CARRITO
//========================================

function agregar(codigo) {

    const productoInventario = obtenerProductoPorCodigo(codigo);

    const productoCarrito = carrito.find(item => item.codigo === codigo);

    const cantidadActual = productoCarrito ? productoCarrito.cantidad : 0;

    if (!productoInventario || Number(productoInventario.stock) <= cantidadActual) {

        alert("No hay más unidades disponibles de este producto.");

        return;

    }

    if (productoCarrito) {

        productoCarrito.cantidad++;

    } else {

        carrito.push({

            codigo: productoInventario.codigo,
            nombre: productoInventario.nombre,
            precio: Number(productoInventario.precio),
            cantidad: 1

        });

    }

    actualizarCarrito();

}

function actualizarCarrito() {

    const detalle = document.getElementById("detalle");

    detalle.innerHTML = "";

    let subtotal = 0;

    carrito.forEach((producto, index) => {

        const totalProducto = producto.precio * producto.cantidad;

        subtotal += totalProducto;

        detalle.innerHTML += `

            <tr>

                <td>${producto.nombre}</td>

                <td>

                    <button onclick="disminuir(${index})">-</button>

                    <strong style="margin:0 8px;">
                        ${producto.cantidad}
                    </strong>

                    <button onclick="aumentar(${index})">+</button>

                </td>

                <td>

                    $${totalProducto.toLocaleString("es-CO")}

                </td>

                <td>

                    <button onclick="eliminar(${index})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

    const porcentajeIva = Number(BaluarteData.leer("configuracion", { iva: 19 }).iva ?? 19) / 100;
    const iva = subtotal * porcentajeIva;

    const total = subtotal + iva;

    document.getElementById("sub").innerHTML =
        "$" + subtotal.toLocaleString("es-CO");

    document.getElementById("iva").innerHTML =
        "$" + iva.toLocaleString("es-CO");

    document.getElementById("total").innerHTML =
        "$" + total.toLocaleString("es-CO");

}

//========================================
// AUMENTAR CANTIDAD
//========================================

function aumentar(index){

    const productoCarrito = carrito[index];

    if (!productoCarrito) {
        return;
    }

    const productoInventario = obtenerProductoPorCodigo(productoCarrito.codigo);

    if (!productoInventario || Number(productoInventario.stock) <= productoCarrito.cantidad) {

        alert("No hay más unidades disponibles de este producto.");

        return;

    }

    productoCarrito.cantidad++;

    actualizarCarrito();

}

//========================================
// DISMINUIR CANTIDAD
//========================================

function disminuir(index){

    if(carrito[index].cantidad > 1){

        carrito[index].cantidad--;

    }else{

        carrito.splice(index,1);

    }

    actualizarCarrito();

}

//========================================
// ELIMINAR PRODUCTO
//========================================

function eliminar(index){

    carrito.splice(index,1);

    actualizarCarrito();

}

//========================================
// FINALIZAR VENTA
//========================================

const btnFinalizar = document.querySelector(".btn-finalizar");

if(btnFinalizar){

    btnFinalizar.addEventListener("click", finalizarVenta);

}

function finalizarVenta(){

    const cliente = document.getElementById("cliente").value.trim();

    const documento = document.getElementById("documento").value.trim();

    const telefono = document.getElementById("telefono").value.trim();

    const metodo = document.getElementById("metodo").value;

    const observaciones = document.getElementById("observaciones").value.trim();

    if(carrito.length === 0){

        alert("Debe agregar al menos un producto.");

        return;

    }

    if(cliente === ""){

        alert("Ingrese el nombre del cliente.");

        return;

    }

    const productos = obtenerProductos();

    const inventarioDisponible = carrito.every(productoCarrito => {

        const productoInventario = productos.find(
            producto => producto.codigo === productoCarrito.codigo
        );

        return productoInventario &&
            Number(productoInventario.stock) >= productoCarrito.cantidad;

    });

    if (!inventarioDisponible) {

        alert("No hay suficiente stock para finalizar esta venta.");

        cargarProductosVentas();

        return;

    }

    carrito.forEach(productoCarrito => {

        const productoInventario = productos.find(
            producto => producto.codigo === productoCarrito.codigo
        );

        productoInventario.stock = Number(productoInventario.stock) - productoCarrito.cantidad;

    });

    localStorage.setItem("productos", JSON.stringify(productos));

    //======================================
    // CREAR FACTURA
    //======================================

    let facturas = JSON.parse(localStorage.getItem("facturas")) || [];

    // No se usa la cantidad de facturas como consecutivo: una factura borrada
    // no debe provocar que se reutilice su número.
    const ultimoConsecutivo = facturas.reduce((mayor, factura) => {

        const coincidencia = String(factura.numero || "").match(/(\d+)$/);

        return Math.max(mayor, coincidencia ? Number(coincidencia[1]) : 0);

    }, 0);

    const numeroFactura =
        "FAC-" + String(ultimoConsecutivo + 1).padStart(6,"0");

    let subtotal = 0;

    carrito.forEach(producto=>{

        subtotal += producto.precio * producto.cantidad;

    });

    const porcentajeIva = Number(BaluarteData.leer("configuracion", { iva: 19 }).iva ?? 19) / 100;
    const iva = subtotal * porcentajeIva;

    const total = subtotal + iva;

    const hoy = new Date();

    const fecha = hoy.toLocaleDateString("es-CO");

    const factura={

        numero:numeroFactura,

        fecha:fecha,

        cliente:cliente,

        documento:documento,

        telefono:telefono,

        metodo:metodo,

        observaciones:observaciones,

        productos:[...carrito],

        subtotal:subtotal,

        iva:iva,

        total:total

    };

    facturas.push(factura);

    localStorage.setItem(

        "facturas",

        JSON.stringify(facturas)

    );

    alert(
`Venta registrada correctamente.

Cliente: ${cliente}

Productos: ${carrito.length}

Método de pago: ${metodo}

¡Gracias por su compra!`
    );

    carrito = [];

    actualizarCarrito();

    cargarProductosVentas();

    document.getElementById("cliente").value = "";

    document.getElementById("documento").value = "";

    document.getElementById("telefono").value = "";

    document.getElementById("metodo").selectedIndex = 0;

    document.getElementById("observaciones").value = "";

}

//========================================
// INICIALIZAR PRODUCTOS
//========================================

cargarProductosVentas();
