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
        subtitulo: 'Resumen general del restaurante',
        roles: ['Administrador', 'Ventas', 'Inventario']
    },
    {
        ruta: '/ventas',
        etiqueta: 'Ventas',
        icono: 'fa-cart-shopping',
        numero: '02',
        subtitulo: 'Registro de ventas del restaurante',
        roles: ['Administrador', 'Ventas']
    },
    {
        ruta: '/facturas',
        etiqueta: 'Facturas',
        icono: 'fa-file-invoice-dollar',
        numero: '03',
        subtitulo: 'Gestión de facturas',
        roles: ['Administrador', 'Ventas', 'Inventario']
    },
    {
        ruta: '/productos',
        etiqueta: 'Productos',
        icono: 'fa-box',
        numero: '04',
        subtitulo: 'Administración de productos del restaurante',
        roles: ['Administrador', 'Ventas', 'Inventario']
    },
    {
        ruta: '/inventario',
        etiqueta: 'Inventario',
        icono: 'fa-warehouse',
        numero: '05',
        subtitulo: 'Control de inventario',
        roles: ['Administrador', 'Ventas', 'Inventario']
    },
    {
        ruta: '/metas',
        etiqueta: 'Metas',
        icono: 'fa-bullseye',
        numero: '06',
        subtitulo: 'Seguimiento de metas',
        roles: ['Administrador', 'Ventas', 'Inventario']
    },
    {
        ruta: '/recetas',
        etiqueta: 'Recetas',
        icono: 'fa-book-open',
        numero: '07',
        subtitulo: 'Gestión de recetas',
        roles: ['Administrador', 'Inventario']
    },
    {
        ruta: '/usuarios',
        etiqueta: 'Usuarios',
        icono: 'fa-users',
        numero: '08',
        subtitulo: 'Administración de usuarios',
        roles: ['Administrador']
    },
    {
        ruta: '/reportes',
        etiqueta: 'Reportes',
        icono: 'fa-chart-line',
        numero: '09',
        subtitulo: 'Reportes del negocio',
        roles: ['Administrador', 'Ventas', 'Inventario']
    },
    {
        ruta: '/configuracion',
        etiqueta: 'Configuración',
        icono: 'fa-gear',
        numero: '10',
        subtitulo: 'Configuración del sistema',
        roles: ['Administrador']
    }
];

// Busca un módulo por su ruta exacta.
function buscarModulo(ruta) {
    return modulos.find((modulo) => modulo.ruta === ruta);
}

export { modulos, buscarModulo };