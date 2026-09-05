// ===========================================
// COMPONENTE SIDEBAR
// Barra lateral de navegación del Restaurante
// Baluarte. Usa NavLink para resaltar el módulo
// activo, muestra el usuario en sesión y permite
// cerrar sesión.
// ===========================================

import { NavLink, useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';
import { modulos } from '../config/navegacion';

// Obtiene el usuario logueado desde localStorage.
function obtenerUsuario() {
    try {
        return JSON.parse(localStorage.getItem('sesionBaluarte')) || null;
    } catch (error) {
        return null;
    }
}

function Sidebar() {
    const navigate = useNavigate();
    const usuario = obtenerUsuario();

    // Cierra sesión: limpia el almacenamiento y vuelve al login.
    function cerrarSesion() {
        localStorage.removeItem('sesionBaluarte');
        navigate('/login');
    }

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
                    <h3>{usuario?.nombre || 'Usuario'}</h3>
                    <span>{usuario?.rol || 'Rol'}</span>
                </div>
                <button
                    type="button"
                    className="logout-btn"
                    onClick={cerrarSesion}
                    title="Cerrar sesión"
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;