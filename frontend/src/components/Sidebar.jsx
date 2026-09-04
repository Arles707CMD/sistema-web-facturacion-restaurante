// ===========================================
// COMPONENTE SIDEBAR
// Barra lateral de navegación del Restaurante
// Baluarte. Usa NavLink para resaltar
// automáticamente el módulo activo.
// ===========================================

import { NavLink } from 'react-router-dom';

import logo from '../assets/logo.png';
import { modulos } from '../config/navegacion';

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="logo">
                <img src={logo} alt="Restaurante Baluarte" />
            </div>

            <nav>
                <ul>
                    {modulos.map((modulo) => (
                        <li key={modulo.ruta}>
                            <NavLink
                                to={modulo.ruta}
                                className={({ isActive }) => (isActive ? 'active' : undefined)}
                            >
                                <i className={`fa-solid ${modulo.icono}`}></i>
                                {modulo.etiqueta}
                            </NavLink>
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