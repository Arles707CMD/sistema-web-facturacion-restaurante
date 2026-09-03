import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Productos from './pages/Productos';
import './styles/Productos.css';

// Componente principal: arma el layout general con la
// barra lateral, el encabezado superior y la página
// de gestión de productos.
function App() {
    return (
        <div className="container">
            <Sidebar />

            <main className="content">
                <Topbar />
                <Productos />
            </main>
        </div>
    );
}

export default App
