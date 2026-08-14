//======================================
// RESTAURANTE BALUARTE
// MODULO FACTURAS
//======================================

let facturas = JSON.parse(localStorage.getItem("facturas")) || [];

const listaFacturas = document.getElementById("listaFacturas");
const sinFacturas = document.getElementById("sinFacturas");

const totalFacturas = document.getElementById("totalFacturas");
const ventasTotales = document.getElementById("ventasTotales");
const fechaActual = document.getElementById("fechaActual");

cargarFacturas();

function cargarFacturas(){

    listaFacturas.innerHTML="";

    if(facturas.length===0){

        sinFacturas.style.display="flex";

        totalFacturas.innerHTML="0";

        ventasTotales.innerHTML="$0";

        colocarFecha();

        return;

    }

    sinFacturas.style.display="none";

    let totalVentas=0;

    facturas.forEach((factura,index)=>{

        totalVentas+=factura.total;

        listaFacturas.innerHTML+=`

        <tr>

            <td>${factura.numero}</td>

            <td>${factura.fecha}</td>

            <td>${factura.cliente}</td>

            <td>${factura.documento}</td>

            <td>${factura.metodo}</td>

            <td>$${factura.total.toLocaleString("es-CO")}</td>

            <td>

                <span class="estado">

                    Pagada

                </span>

            </td>

            <td>

                <button
                    class="btn-ver"
                    onclick="verFactura(${index})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                    class="btn-eliminar"
                    onclick="eliminarFactura(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    totalFacturas.innerHTML=facturas.length;

    ventasTotales.innerHTML="$"+totalVentas.toLocaleString("es-CO");

    colocarFecha();

}

function colocarFecha(){

    const hoy=new Date();

    fechaActual.innerHTML=hoy.toLocaleDateString("es-CO");

}
//======================================
// VER FACTURA
//======================================

function verFactura(index){

    const factura = facturas[index];

    let productos = "";

    factura.productos.forEach(producto=>{

        productos +=

`${producto.nombre}

Cantidad: ${producto.cantidad}

Precio: $${producto.precio.toLocaleString("es-CO")}

----------------------------

`;

    });

    alert(

`=================================

FACTURA ${factura.numero}

=================================

Cliente:

${factura.cliente}

Documento:

${factura.documento}

Teléfono:

${factura.telefono}

Fecha:

${factura.fecha}

Método de pago:

${factura.metodo}

=================================

PRODUCTOS

${productos}

=================================

Subtotal:

$${factura.subtotal.toLocaleString("es-CO")}

IVA:

$${factura.iva.toLocaleString("es-CO")}

TOTAL:

$${factura.total.toLocaleString("es-CO")}

=================================`

    );

}

//======================================
// ELIMINAR FACTURA
//======================================

function eliminarFactura(index){

    if(confirm("¿Desea eliminar esta factura? El stock de sus productos se restaurará.")){

        const factura = facturas[index];
        const productos = BaluarteData.leer("productos");

        (factura.productos || []).forEach(productoFactura => {

            const producto = productos.find(item => item.codigo === productoFactura.codigo);

            if (producto) {
                producto.stock = Number(producto.stock || 0) + Number(productoFactura.cantidad || 0);
            }

        });

        BaluarteData.guardar("productos", productos);

        facturas.splice(index,1);

        localStorage.setItem(

            "facturas",

            JSON.stringify(facturas)

        );

        cargarFacturas();

    }

}

//======================================
// BUSCADOR
//======================================

const buscador = document.getElementById("buscarFactura");

if(buscador){

    buscador.addEventListener("keyup",buscarFacturas);

}

function buscarFacturas(){

    const texto = buscador.value.toLowerCase();

    const filas = document.querySelectorAll("#listaFacturas tr");

    filas.forEach(fila=>{

        fila.style.display =

        fila.innerText.toLowerCase().includes(texto)

        ? ""

        : "none";

    });

}

const btnExportar = document.querySelector(".btn-exportar");

if (btnExportar) {
    btnExportar.addEventListener("click", () => {
        const encabezado = "Factura,Fecha,Cliente,Documento,Metodo,Subtotal,IVA,Total";
        const filas = facturas.map(factura => [
            factura.numero, factura.fecha, factura.cliente, factura.documento,
            factura.metodo, factura.subtotal, factura.iva, factura.total
        ].map(valor => `"${String(valor ?? "").replaceAll('"', '""')}"`).join(","));
        const archivo = new Blob(["\uFEFF" + [encabezado, ...filas].join("\n")], { type: "text/csv;charset=utf-8" });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(archivo);
        enlace.download = "facturas-baluarte.csv";
        enlace.click();
        URL.revokeObjectURL(enlace.href);
    });
}
