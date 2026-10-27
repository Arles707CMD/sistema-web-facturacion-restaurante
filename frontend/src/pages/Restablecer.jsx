// ===========================================
// PÁGINA RESTABLECER CONTRASEÑA
// Pantalla pública a la que llega el usuario
// desde el enlace del correo de recuperación
// (/restablecer?token=...). Permite elegir y
// confirmar la nueva contraseña; informa con
// claridad si el enlace expiró o ya se usó.
// ===========================================

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import logo2 from '../assets/logo2.png';
import { restablecerContrasena } from '../api/authApi';
import '../styles/Login.css';

function Restablecer() {
    const [parametros] = useSearchParams();
    const token = parametros.get('token') || '';

    const [contrasena, setContrasena] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // Envía la nueva contraseña junto con el token del enlace.
    async function manejarEnvio(evento) {
        evento.preventDefault();
        setError('');

        if (contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (contrasena !== confirmacion) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);

        try {
            const respuesta = await restablecerContrasena(token, contrasena, confirmacion);

            setExito(respuesta.mensaje || 'Contraseña restablecida correctamente.');
            setError('');
        } catch (err) {
            // El mensaje del backend diferencia: enlace inválido,
            // ya utilizado o expirado.
            setError(err.message || 'No se pudo restablecer la contraseña.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="restablecer">
            <div className="restablecer-card">
                <header className="login-brand">
                    <img src={logo2} alt="Restaurante Baluarte" className="login-logo" />
                </header>

                <h1>Nueva contraseña</h1>
                <p className="login-welcome">
                    Elige una contraseña nueva para tu cuenta. El enlace caduca a los
                    15 minutos y solo puede usarse una vez.
                </p>


                {!token ? (
                    <>
                        <p className="login-error" role="alert">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            El enlace de recuperación no es válido: falta el token.
                        </p>
                        <p className="login-cambiar">
                            <Link to="/login">Volver al inicio de sesión</Link>
                        </p>
                    </>
                ) : exito ? (
                    <>
                        <p className="login-success" role="status">
                            <i className="fa-solid fa-circle-check"></i>
                            {exito}
                        </p>
                        <Link to="/login" className="login-btn restablecer-btn">
                            <i className="fa-solid fa-right-to-bracket"></i>
                            Ir a iniciar sesión
                        </Link>
                    </>
                ) : (
                    <form onSubmit={manejarEnvio} noValidate>
                        <label htmlFor="nueva-contrasena">Nueva contraseña</label>
                        <div className="login-input">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                id="nueva-contrasena"
                                type={mostrarContrasena ? 'text' : 'password'}
                                placeholder="Mínimo 6 caracteres"
                                value={contrasena}
                                onChange={(evento) => setContrasena(evento.target.value)}
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                            <i
                                className={`fa-solid ${mostrarContrasena ? 'fa-eye-slash' : 'fa-eye'} login-toggle`}
                                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                title={
                                    mostrarContrasena
                                        ? 'Ocultar contraseña'
                                        : 'Mostrar contraseña'
                                }
                            ></i>
                        </div>

                        <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
                        <div className="login-input">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                id="confirmar-contrasena"
                                type={mostrarContrasena ? 'text' : 'password'}
                                placeholder="Repite la nueva contraseña"
                                value={confirmacion}
                                onChange={(evento) => setConfirmacion(evento.target.value)}
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
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
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-key"></i>
                                    Guardar contraseña
                                </>
                            )}
                        </button>

                        <p className="login-cambiar">
                            <Link to="/login">Volver al inicio de sesión</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Restablecer;