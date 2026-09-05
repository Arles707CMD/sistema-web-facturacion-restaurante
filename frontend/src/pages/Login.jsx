// ===========================================
// PÁGINA LOGIN
// Autenticación real contra el backend
// (POST /api/auth/login) con diseño de dos
// columnas inspirado en el login original y
// mejoras interactivas.
// ===========================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo2 from '../assets/logo2.png';
import { iniciarSesion } from '../api/authApi';
import '../styles/Login.css';

function Login() {
    const [correo, setCorreo] = useState(() => localStorage.getItem('recordarCorreo') || '');
    const [contrasena, setContrasena] = useState('');
    const [recordarme, setRecordarme] = useState(() => !!localStorage.getItem('recordarCorreo'));
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Envía las credenciales al backend y navega al dashboard.
    async function manejarEnvio(evento) {
        evento.preventDefault();
        setError('');
        setCargando(true);

        try {
            const resultado = await iniciarSesion(correo.trim(), contrasena);

            if (recordarme) {
                localStorage.setItem('recordarCorreo', correo.trim());
            } else {
                localStorage.removeItem('recordarCorreo');
            }

            localStorage.setItem('sesionBaluarte', JSON.stringify(resultado.usuario));

            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'No se pudo iniciar sesión.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="login">
            <div className="login-left">
                <img src={logo2} alt="Restaurante Baluarte" className="login-food" />
                <div className="login-overlay">
                    <h2>Restaurante Baluarte</h2>
                    <p>Sistema de gestión integral para tu negocio</p>
                </div>
            </div>

            <div className="login-right">
                <div className="login-number">01</div>

                <h1>Iniciar Sesión</h1>
                <div className="login-line"></div>
                <p className="login-welcome">
                    Bienvenido de nuevo al Sistema de Gestión Restaurante Baluarte
                </p>

                <form onSubmit={manejarEnvio} noValidate>
                    <label htmlFor="correo">Correo electrónico</label>
                    <div className="login-input">
                        <i className="fa-solid fa-envelope"></i>
                        <input
                            id="correo"
                            type="email"
                            placeholder="Ingresa tu correo"
                            value={correo}
                            onChange={(evento) => setCorreo(evento.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <label htmlFor="contrasena">Contraseña</label>
                    <div className="login-input">
                        <i className="fa-solid fa-lock"></i>
                        <input
                            id="contrasena"
                            type={mostrarContrasena ? 'text' : 'password'}
                            placeholder="Ingresa tu contraseña"
                            value={contrasena}
                            onChange={(evento) => setContrasena(evento.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <i
                            className={`fa-solid ${mostrarContrasena ? 'fa-eye-slash' : 'fa-eye'} login-toggle`}
                            onClick={() => setMostrarContrasena(!mostrarContrasena)}
                            title={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        ></i>
                    </div>

                    <div className="login-options">
                        <label className="login-recordar">
                            <input
                                type="checkbox"
                                checked={recordarme}
                                onChange={(evento) => setRecordarme(evento.target.checked)}
                            />
                            Recordarme
                        </label>
                        <a href="#" onClick={(evento) => evento.preventDefault()}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    {error && (
                        <p className="login-error" role="alert">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </p>
                    )}

                    <button type="submit" className="login-btn" disabled={cargando}>
                        {cargando ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Iniciando...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-right-to-bracket"></i>
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                <footer className="login-footer">© 2026 Restaurante Baluarte</footer>
            </div>
        </div>
    );
}

export default Login;