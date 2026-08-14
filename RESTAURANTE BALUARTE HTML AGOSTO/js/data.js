(() => {
    const productosIniciales = [
        { codigo: "P001", nombre: "Hamburguesa Especial", categoria: "Comidas", precio: 25000, stock: 18 },
        { codigo: "P002", nombre: "Pizza Familiar", categoria: "Comidas", precio: 48000, stock: 10 },
        { codigo: "P003", nombre: "Lasaña", categoria: "Comidas", precio: 28000, stock: 6 },
        { codigo: "P004", nombre: "Perro Especial", categoria: "Comidas", precio: 18000, stock: 20 }
    ];
    const usuariosIniciales = [
        { id: "USR-001", nombre: "Juan David López", correo: "juan@baluarte.com", rol: "Administrador", estado: "Activo" },
        { id: "USR-002", nombre: "María González", correo: "maria@baluarte.com", rol: "Ventas", estado: "Activo" },
        { id: "USR-003", nombre: "Carlos Rodríguez", correo: "carlos@baluarte.com", rol: "Inventario", estado: "Inactivo" }
    ];

    function leer(clave, respaldo = []) {
        try { return JSON.parse(localStorage.getItem(clave)) ?? respaldo; }
        catch { return respaldo; }
    }
    function guardar(clave, valor) { localStorage.setItem(clave, JSON.stringify(valor)); }
    function asegurarDatos() {
        if (!localStorage.getItem("productos")) guardar("productos", productosIniciales);
        if (!localStorage.getItem("usuarios")) guardar("usuarios", usuariosIniciales);
        if (!localStorage.getItem("configuracion")) guardar("configuracion", { metaMensual: 50000000, iva: 19, nombre: "Restaurante Baluarte" });
    }
    function moneda(valor) { return "$" + Number(valor || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 }); }

    asegurarDatos();
    window.BaluarteData = { leer, guardar, asegurarDatos, moneda };
})();
