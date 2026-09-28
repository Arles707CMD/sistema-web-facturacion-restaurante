// ===========================================
// COMPONENTE PROTECTED ROUTE
// Guard de rutas reutilizable: redirige a
// /login cuando no hay una sesión válida con
// token en localStorage y a /dashboard cuando
// el rol del usuario no tiene acceso al módulo
// que intenta abrir.
// ===========================================

import { Navigate, useLocation } from 'react-router-dom';

import { modulos } from '../../config/navegacion';

// Obtiene la sesión guardada (null si no existe o es inválida).
function obtenerSesion() {
    try {
        const sesion = localStorage.getItem('sesionBaluarte');

        if (!sesion) {
            return null;
        }

        return JSON.parse(sesion);
    } catch (error) {
        return null;
    }
}

function ProtectedRoute({ children }) {
    const location = useLocation();
    const sesion = obtenerSesion();

    // Sin sesión o sin token: vuelve al login.
    if (!sesion || !sesion.token) {
        return <Navigate to="/login" replace />;
    }

    // Si el módulo exige roles permitidos y el rol del usuario no está,
    // se redirige al dashboard (el backend también aplica un 403 de respaldo).
    const modulo = modulos.find((modulo) => modulo.ruta === location.pathname);

    if (modulo && Array.isArray(modulo.roles) && !modulo.roles.includes(sesion.rol)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;