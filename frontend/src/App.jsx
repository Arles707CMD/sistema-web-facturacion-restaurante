import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Facturas from './pages/Facturas';
import Inventario from './pages/Inventario';
import Recetas from './pages/Recetas';
import Reportes from './pages/Reportes';
import Metas from './pages/Metas';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import './styles/Productos.css';

// Componente principal: define las rutas de la aplicación.
// /login es una ruta pública; el resto se renderizan dentro
// del Layout compartido (Sidebar + Topbar + Outlet).
function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/facturas" element={<Facturas />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/recetas" element={<Recetas />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/metas" element={<Metas />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/configuracion" element={<Configuracion />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
