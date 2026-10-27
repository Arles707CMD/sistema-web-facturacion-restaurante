// ===========================================
// PÁGINA LOGIN
// Autenticación real contra el backend
// (POST /api/auth/login) con diseño de dos
// columnas, sesión persistente ("Recordarme"),
// registro y recuperación de contraseña.
// ===========================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import chefCocinando from '../assets/chef-cocinando.jpg';
import comidaPizza from '../assets/comida-pizza.jpg';
import comidaHamburguesa from '../assets/comida-hamburguesa.jpg';
import logo2 from '../assets/logo2.png';
import { guardarSesion } from '../api/apiClient';
import {
    iniciarSesion,
    registrarUsuario,
    solicitarRecuperacion
} from '../api/authApi';
import '../styles/Login.css';

function Login() {
    const [modo, setModo] = useState('login'); // 'login' | 'registro' | 'recuperar'
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState(() => localStorage.getItem('recordarCorreo') || '');
    const [correoRecuperacion, setCorreoRecuperacion] = useState('');
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
            // "recordarme" pide al backend el token de sesión
            // persistente (TOKEN_EXPIRA_RECUERDA).
            const resultado = await iniciarSesion(correo.trim(), contrasena, recordarme);

            // Con "Recordarme" se guarda el correo para rellenarlo.
            if (recordarme) {
                localStorage.setItem('recordarCorreo', correo.trim());
            } else {
                localStorage.removeItem('recordarCorreo');
            }

            // La sesión se guarda en localStorage (persistente al
            // cerrar el navegador) o en sessionStorage (se pierde).
            guardarSesion(
                {
                    ...resultado.usuario,
                    token: resultado.token,
                    expiraEn: resultado.expiraEn
                },
                recordarme
            );

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

    // Solicita el correo de recuperación. La respuesta del backend
    // es genérica: no revela si la cuenta existe o no.
    async function manejarRecuperacion(evento) {
        evento.preventDefault();
        setError('');
        setExito('');
        setCargando(true);

        try {
            const respuesta = await solicitarRecuperacion(correoRecuperacion.trim());

            setExito(respuesta.mensaje || 'Revisa tu correo para continuar.');
        } catch (err) {
            setError(err.message || 'No se pudo enviar la solicitud.');
        } finally {
            setCargando(false);
        }
    }

    // Cambia entre modos limpiando los estados y mensajes.
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
                <header className="login-brand">
                    <img
                        src={logo2}
                        alt="Restaurante Baluarte"
                        className="login-logo"
                    />
                </header>

                <h1>
                    {modo === 'login'
                        ? 'Iniciar Sesión'
                        : modo === 'registro'
                            ? 'Crear Cuenta'
                            : 'Recuperar Contraseña'}
                </h1>
                <p className="login-welcome">
                    {modo === 'login'
                        ? 'Bienvenido de nuevo al sistema de gestión de Restaurante Baluarte'
                        : modo === 'registro'
                            ? 'Regístrate para acceder al sistema de gestión'
                            : 'Te enviaremos un enlace para elegir una contraseña nueva'}
                </p>

                <form
                    onSubmit={
                        modo === 'recuperar'
                            ? manejarRecuperacion
                            : modo === 'login'
                                ? manejarEnvio
                                : manejarRegistro
                    }
                    noValidate
                >
                    {modo === 'recuperar' ? (
                        <>
                            <label htmlFor="correo-recuperacion">Correo electrónico</label>
                            <div className="login-input">
                                <i className="fa-solid fa-envelope"></i>
                                <input
                                    id="correo-recuperacion"
                                    type="email"
                                    placeholder="Ingresa tu correo"
                                    value={correoRecuperacion}
                                    onChange={(evento) =>
                                        setCorreoRecuperacion(evento.target.value)
                                    }
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}

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
                            <button
                                type="button"
                                className="login-enlace"
                                onClick={() => cambiarModo('recuperar')}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
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
                        ) : modo === 'registro' ? (
                            <>
                                <i className="fa-solid fa-user-plus"></i>
                                Crear Cuenta
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-paper-plane"></i>
                                Enviar enlace
                            </>
                        )}
                    </button>
                </form>

                {modo !== 'recuperar' && (
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
                )}

                <footer className="login-footer">© 2026 Restaurante Baluarte</footer>
            </div>
        </div>
    );
}

export default Login;