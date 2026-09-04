// ===========================================
// PÁGINA LOGIN
// Formulario de inicio de sesión del frontend.
// NOTA: la validación de usuario/contraseña es
// LOCAL y SOLO de demostración (prototipo).
// NO es autenticación real contra el backend.
// ===========================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';
import '../styles/Login.css';

function Login() {
    // Estado local del formulario
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');

    // Navegación programática tras el acceso
    const navigate = useNavigate();

    // Valida localmente (prototipo) y navega al dashboard
    function manejarEnvio(evento) {
        evento.preventDefault();

        // Prototipo de validación. No consulta al backend.
        if (usuario === 'admin' && contrasena === '123456') {
            navigate('/dashboard');
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    }

    return (
        <div className="login-shell">
            <div className="login-card">
                <aside className="login-brand">
                    <img src={logo} alt="Restaurante Baluarte" className="login-logo" />
                    <h1>Restaurante Baluarte</h1>
                    <p>Sistema de administración y gestión para tu restaurante.</p>
                    <div className="login-brand-footer">
                        <i className="fa-solid fa-utensils"></i>
                        Productos, ventas, facturas, inventario y reportes.
                    </div>
                </aside>

                <section className="login-panel">
                    <h2>Iniciar Sesión</h2>
                    <p className="login-subtitle">Accede con tus credenciales</p>

                    <form className="login-form" onSubmit={manejarEnvio}>
                        <div className="form-group">
                            <label htmlFor="usuario">Usuario</label>
                            <input
                                type="text"
                                id="usuario"
                                name="usuario"
                                placeholder="admin"
                                value={usuario}
                                onChange={(evento) => setUsuario(evento.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contrasena">Contraseña</label>
                            <input
                                type="password"
                                id="contrasena"
                                name="contrasena"
                                placeholder="123456"
                                value={contrasena}
                                onChange={(evento) => setContrasena(evento.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="login-error">{error}</p>}

                        <button type="submit" className="btn-red login-btn">
                            <i className="fa-solid fa-right-to-bracket"></i>
                            Entrar
                        </button>
                    </form>

                    <p className="login-nota">
                        Prototipo de demostración: usuario <strong>admin</strong> / contraseña{' '}
                        <strong>123456</strong>.
                    </p>
                </section>
            </div>
        </div>
    );
}

export default Login;