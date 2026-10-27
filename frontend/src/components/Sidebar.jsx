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
import { cerrarSesion as cerrarSesionApi } from '../api/apiClient';

// Obtiene el usuario logueado (sessionStorage con sesión normal,
// localStorage con "Recordarme").
function obtenerUsuario() {
    try {
        const sesion =
            sessionStorage.getItem('sesionBaluarte') ||
            localStorage.getItem('sesionBaluarte');

        return sesion ? JSON.parse(sesion) : null;
    } catch (error) {
        return null;
    }
}

function Sidebar() {
    const navigate = useNavigate();
    const usuario = obtenerUsuario();

    // Muestra únicamente los módulos permitidos según el rol del usuario.
    const modulosVisibles = modulos.filter(
        (modulo) => !Array.isArray(modulo.roles) || modulo.roles.includes(usuario?.rol)
    );

    // Cierra sesión: limpia la sesión completa (ambos almacenes,
    // token incluido) y vuelve al login.
    function cerrarSesion() {
        cerrarSesionApi();
        navigate('/login');
    }

    return (
        <aside className="sidebar">
            <div className="logo">
                <img src={logo} alt="Restaurante Baluarte" />
            </div>

            <nav>
                <ul>
                    {modulosVisibles.map((modulo) => (
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