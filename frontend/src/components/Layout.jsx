// ===========================================
// COMPONENTE LAYOUT
// Estructura compartida por los módulos con
// sesión: Sidebar a la izquierda, Topbar con el
// título del módulo activo y <Outlet/> donde
// React Router renderiza la página actual.
// ===========================================

import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { buscarModulo } from '../config/navegacion';
import '../styles/Layout.css';

function Layout() {
    const location = useLocation();
    const moduloActual = buscarModulo(location.pathname);

    return (
        <div className="container">
            <Sidebar />

            <main className="content">
                <Topbar
                    numero={moduloActual?.numero || '00'}
                    titulo={moduloActual?.etiqueta || 'Módulo'}
                    subtitulo={moduloActual?.subtitulo || ''}
                    rutaVolver="/dashboard"
                />
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;