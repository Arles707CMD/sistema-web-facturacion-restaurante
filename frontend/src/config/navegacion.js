// ===========================================
// CONFIGURACIÓN DE NAVEGACIÓN
// Lista central de módulos del sistema.
// Alimenta el Sidebar (NavLink) y el Topbar
// (título dinámico) para centralizar las rutas.
// ===========================================

const modulos = [
    {
        ruta: '/dashboard',
        etiqueta: 'Dashboard',
        icono: 'fa-table-columns',
        numero: '01',
        subtitulo: 'Resumen general del restaurante'
    },
    {
        ruta: '/ventas',
        etiqueta: 'Ventas',
        icono: 'fa-cart-shopping',
        numero: '02',
        subtitulo: 'Registro de ventas del restaurante'
    },
    {
        ruta: '/facturas',
        etiqueta: 'Facturas',
        icono: 'fa-file-invoice-dollar',
        numero: '03',
        subtitulo: 'Gestión de facturas'
    },
    {
        ruta: '/productos',
        etiqueta: 'Productos',
        icono: 'fa-box',
        numero: '04',
        subtitulo: 'Administración de productos del restaurante'
    },
    {
        ruta: '/inventario',
        etiqueta: 'Inventario',
        icono: 'fa-warehouse',
        numero: '05',
        subtitulo: 'Control de inventario'
    },
    {
        ruta: '/metas',
        etiqueta: 'Metas',
        icono: 'fa-bullseye',
        numero: '06',
        subtitulo: 'Seguimiento de metas'
    },
    {
        ruta: '/recetas',
        etiqueta: 'Recetas',
        icono: 'fa-book-open',
        numero: '07',
        subtitulo: 'Gestión de recetas'
    },
    {
        ruta: '/usuarios',
        etiqueta: 'Usuarios',
        icono: 'fa-users',
        numero: '08',
        subtitulo: 'Administración de usuarios'
    },
    {
        ruta: '/reportes',
        etiqueta: 'Reportes',
        icono: 'fa-chart-line',
        numero: '09',
        subtitulo: 'Reportes del negocio'
    },
    {
        ruta: '/configuracion',
        etiqueta: 'Configuración',
        icono: 'fa-gear',
        numero: '10',
        subtitulo: 'Configuración del sistema'
    }
];

// Busca un módulo por su ruta exacta.
function buscarModulo(ruta) {
    return modulos.find((modulo) => modulo.ruta === ruta);
}

export { modulos, buscarModulo };