document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    if (form && document.querySelector('input[type="password"]')) {
        form.addEventListener("submit", function(e){
            e.preventDefault();

            const usuario = document.querySelector('input[type="text"]').value;
            const password = document.querySelector('input[type="password"]').value;

            if(usuario === "admin" && password === "123456"){
                window.location.href = "index.html";
            }else{
                alert("Usuario o contraseña incorrectos");
            }
        });
    }

    const fechaActual = document.getElementById("fechaActual");

    if (fechaActual) {
        fechaActual.textContent = new Date().toLocaleDateString("es-CO", {
            day: "numeric", month: "long", year: "numeric"
        });
    }

    cargarDashboard();

});

function cargarDashboard() {

    const chartCanvas = document.getElementById("ventasChart");

    if (!chartCanvas) {
        return;
    }

    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const facturas = JSON.parse(localStorage.getItem("facturas")) || [];
    const fechaHoy = new Date().toLocaleDateString("es-CO");
    const moneda = valor => "$" + valor.toLocaleString("es-CO");

    const ventasHoy = facturas
        .filter(factura => factura.fecha === fechaHoy)
        .reduce((total, factura) => total + Number(factura.total || 0), 0);

    const ventasTotales = facturas
        .reduce((total, factura) => total + Number(factura.total || 0), 0);

    const bajoStock = productos.filter(producto =>
        Number(producto.stock) > 0 && Number(producto.stock) <= 10
    ).length;

    const disponibles = productos.filter(producto => Number(producto.stock) > 0).length;
    const disponibilidad = productos.length
        ? Math.round((disponibles / productos.length) * 100)
        : 0;

    document.getElementById("ventasHoy").textContent = moneda(ventasHoy);
    document.getElementById("ventasRegistradas").textContent = moneda(ventasTotales);
    document.getElementById("productosBajoStock").textContent = bajoStock;
    document.getElementById("ventasRealizadas").textContent = facturas.length;
    document.getElementById("totalProductosDashboard").textContent = productos.length;
    document.getElementById("bajoStockDashboard").textContent = bajoStock;
    document.getElementById("disponibilidadDashboard").textContent = disponibilidad + "%";
    document.getElementById("detalleVentasHoy").textContent = facturas.filter(factura => factura.fecha === fechaHoy).length + " factura(s) registradas hoy";
    document.getElementById("detalleVentasRegistradas").textContent = facturas.length + " factura(s) registradas";

    const ventasPorProducto = {};

    facturas.forEach(factura => {
        (factura.productos || []).forEach(producto => {
            const clave = producto.codigo || producto.nombre;

            if (!ventasPorProducto[clave]) {
                ventasPorProducto[clave] = { nombre: producto.nombre, cantidad: 0 };
            }

            ventasPorProducto[clave].cantidad += Number(producto.cantidad || 0);
        });
    });

    const masVendidos = Object.values(ventasPorProducto)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 4);

    document.getElementById("productosMasVendidos").innerHTML = masVendidos.length
        ? masVendidos.map(producto =>
            `<tr><td>${producto.nombre}</td><td>${producto.cantidad}</td></tr>`
        ).join("")
        : "<tr><td colspan=\"2\">Aún no hay ventas registradas.</td></tr>";

    const recientes = facturas.slice(-4).reverse();
    const alertaStock = productos.find(producto =>
        Number(producto.stock) > 0 && Number(producto.stock) <= 10
    );
    const actividad = [
        ...recientes.map(factura => `✅ Factura ${factura.numero} registrada para ${factura.cliente}.`),
        ...(alertaStock ? [`⚠️ ${alertaStock.nombre} tiene bajo stock (${alertaStock.stock} unidades).`] : [])
    ];

    document.getElementById("actividadReciente").innerHTML = actividad.length
        ? actividad.map(item => `<li>${item}</li>`).join("")
        : "<li>Aún no hay ventas ni alertas de inventario registradas.</li>";

    const etiquetas = [];
    const ventasSemana = [];

    for (let diasAtras = 6; diasAtras >= 0; diasAtras--) {
        const dia = new Date();
        dia.setDate(dia.getDate() - diasAtras);
        const fecha = dia.toLocaleDateString("es-CO");

        etiquetas.push(dia.toLocaleDateString("es-CO", { weekday: "short" }));
        ventasSemana.push(
            facturas
                .filter(factura => factura.fecha === fecha)
                .reduce((total, factura) => total + Number(factura.total || 0), 0)
        );
    }

    new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [{
                data: ventasSemana,
                backgroundColor: "#E53935",
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: "#EEEEEE" } },
                x: { grid: { display: false } }
            }
        }
    });

}
