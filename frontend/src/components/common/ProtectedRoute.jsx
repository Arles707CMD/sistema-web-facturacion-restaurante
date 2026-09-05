// ===========================================
// COMPONENTE PROTECTED ROUTE
// Guard de rutas reutilizable: redirige a
// /login cuando no hay una sesión válida en
// localStorage; si la hay, renderiza el hijo.
// ===========================================

import { Navigate } from 'react-router-dom';

// Comprueba si existe una sesión válida guardada.
function tieneSesion() {
    try {
        const sesion = localStorage.getItem('sesionBaluarte');

        if (!sesion) {
            return false;
        }

        const datos = JSON.parse(sesion);

        return Boolean(datos && datos.nombre);
    } catch (error) {
        return false;
    }
}

function ProtectedRoute({ children }) {
    if (!tieneSesion()) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;