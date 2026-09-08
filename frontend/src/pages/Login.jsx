// ===========================================
// PÁGINA LOGIN
// Autenticación real contra el backend
// (POST /api/auth/login) con diseño de dos
// columnas inspirado en el login original y
// mejoras interactivas.
// ===========================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import chefCocinando from '../assets/chef-cocinando.jpg';
import comidaPizza from '../assets/comida-pizza.jpg';
import comidaHamburguesa from '../assets/comida-hamburguesa.jpg';
import logo2 from '../assets/logo2.png';
import { iniciarSesion, registrarUsuario } from '../api/authApi';
import '../styles/Login.css';

function Login() {
    const [modo, setModo] = useState('login'); // 'login' | 'registro'
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState(() => localStorage.getItem('recordarCorreo') || '');
    const [contrasena, setContrasena] = useState('');
    const [recordarme, setRecordarme] = useState(() => !!localStorage.getItem('recordarCorreo'));
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

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

    // Crea una cuenta nueva y vuelve al modo login.
    async function manejarRegistro(evento) {
        evento.preventDefault();
        setError('');
        setExito('');
        setCargando(true);

        try {
            await registrarUsuario(nombre.trim(), correo.trim(), contrasena);

            setExito('Cuenta creada correctamente. Ya puedes iniciar sesión.');
            setNombre('');
            setContrasena('');
            setModo('login');
        } catch (err) {
            setError(err.message || 'No se pudo crear la cuenta.');
        } finally {
            setCargando(false);
        }
    }

    // Cambia entre login y registro limpiando los estados.
    function cambiarModo(nuevoModo) {
        setModo(nuevoModo);
        setError('');
        setExito('');
        setContrasena('');
    }

    return (
        <div className="login">
            <div className="login-left">
                <div className="login-slideshow">
                    <img src={chefCocinando} alt="Chef cocinando" className="login-slide" />
                    <img src={logo2} alt="Comida" className="login-slide" />
                    <img src={comidaPizza} alt="Pizza" className="login-slide" />
                    <img src={comidaHamburguesa} alt="Hamburguesa" className="login-slide" />
                </div>
                <div className="login-overlay">
                    <div className="login-foods">
                        <i className="fa-solid fa-burger"></i>
                        <i className="fa-solid fa-pizza-slice"></i>
                        <i className="fa-solid fa-bowl-food"></i>
                        <i className="fa-solid fa-mug-hot"></i>
                    </div>

                    <h2>Restaurante Baluarte</h2>
                    <p>Sistema de gestión integral para tu negocio</p>
                </div>
            </div>

            <div className="login-right">
                <div className="login-number">01</div>

                <h1>{modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h1>
                <div className="login-line"></div>
                <p className="login-welcome">
                    {modo === 'login'
                        ? 'Bienvenido de nuevo al Sistema de Gestión Restaurante Baluarte'
                        : 'Regístrate para acceder al sistema de gestión'}
                </p>

                <form onSubmit={modo === 'login' ? manejarEnvio : manejarRegistro} noValidate>
                    {modo === 'registro' && (
                        <>
                            <label htmlFor="nombre">Nombre completo</label>
                            <div className="login-input">
                                <i className="fa-solid fa-user"></i>
                                <input
                                    id="nombre"
                                    type="text"
                                    placeholder="Ingresa tu nombre"
                                    value={nombre}
                                    onChange={(evento) => setNombre(evento.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </>
                    )}

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
                            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                            required
                        />
                        <i
                            className={`fa-solid ${mostrarContrasena ? 'fa-eye-slash' : 'fa-eye'} login-toggle`}
                            onClick={() => setMostrarContrasena(!mostrarContrasena)}
                            title={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        ></i>
                    </div>

                    {modo === 'login' && (
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
                    )}

                    {error && (
                        <p className="login-error" role="alert">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </p>
                    )}

                    {exito && (
                        <p className="login-success" role="status">
                            <i className="fa-solid fa-circle-check"></i>
                            {exito}
                        </p>
                    )}

                    <button type="submit" className="login-btn" disabled={cargando}>
                        {cargando ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Procesando...
                            </>
                        ) : modo === 'login' ? (
                            <>
                                <i className="fa-solid fa-right-to-bracket"></i>
                                Iniciar Sesión
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-user-plus"></i>
                                Crear Cuenta
                            </>
                        )}
                    </button>
                </form>

                <p className="login-cambiar">
                    {modo === 'login' ? (
                        <>
                            ¿No tienes cuenta?{' '}
                            <button type="button" onClick={() => cambiarModo('registro')}>
                                Crear una cuenta
                            </button>
                        </>
                    ) : (
                        <>
                            ¿Ya tienes cuenta?{' '}
                            <button type="button" onClick={() => cambiarModo('login')}>
                                Iniciar sesión
                            </button>
                        </>
                    )}
                </p>

                <footer className="login-footer">© 2026 Restaurante Baluarte</footer>
            </div>
        </div>
    );
}

export default Login;