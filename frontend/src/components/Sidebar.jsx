// ===========================================
// COMPONENTE SIDEBAR
// Barra lateral de navegación del Restaurante
// Baluarte. El módulo activo es Productos.
// ===========================================

const enlacesNavegacion = [
    { icono: 'fa-table-columns', etiqueta: 'Dashboard' },
    { icono: 'fa-cart-shopping', etiqueta: 'Ventas' },
    { icono: 'fa-file-invoice-dollar', etiqueta: 'Facturas' },
    { icono: 'fa-box', etiqueta: 'Productos', activo: true },
    { icono: 'fa-bullseye', etiqueta: 'Metas' },
    { icono: 'fa-book-open', etiqueta: 'Recetas' },
    { icono: 'fa-users', etiqueta: 'Usuarios' },
    { icono: 'fa-chart-line', etiqueta: 'Reportes' },
    { icono: 'fa-gear', etiqueta: 'Configuración' }
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="logo">
                <img src="/logo.png" alt="Restaurante Baluarte" />
            </div>

            <nav>
                <ul>
                    {enlacesNavegacion.map((enlace) => (
                        <li key={enlace.etiqueta} className={enlace.activo ? 'active' : ''}>
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                <i className={`fa-solid ${enlace.icono}`}></i>
                                {enlace.etiqueta}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="user-box">
                <div className="avatar">
                    <i className="fa-solid fa-user"></i>
                </div>
                <div>
                    <h3>Juan David</h3>
                    <span>Administrador</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;