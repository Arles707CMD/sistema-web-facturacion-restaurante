// ===========================================
// COMPONENTE USUARIO FORM
// Formulario para crear o editar un usuario.
// Recibe un usuario (null si es nuevo) y
// notifica al padre mediante onGuardar.
// ===========================================

import { useEffect, useState } from 'react';

import Modal from './common/Modal';
import Mensaje from './Mensaje';

// Roles y estados permitidos por el backend.
const roles = ['Administrador', 'Ventas', 'Inventario'];
const estados = ['Activo', 'Inactivo'];

function UsuarioForm({ usuario, onGuardar, onCerrar }) {
    // Estado local del formulario
    const [formulario, setFormulario] = useState({
        nombre: '',
        correo: '',
        contrasena: '',
        rol: 'Ventas',
        estado: 'Activo'
    });

    // Mensaje de validación local
    const [errorFormulario, setErrorFormulario] = useState('');

    // Cuando cambia el usuario a editar se rellenan los campos
    useEffect(() => {
        if (usuario) {
            setFormulario({
                nombre: usuario.nombre || '',
                correo: usuario.correo || '',
                contrasena: '',
                rol: usuario.rol || 'Ventas',
                estado: usuario.estado || 'Activo'
            });
        } else {
            setFormulario({
                nombre: '',
                correo: '',
                contrasena: '',
                rol: 'Ventas',
                estado: 'Activo'
            });
        }

        setErrorFormulario('');
    }, [usuario]);

    // Actualiza una propiedad del formulario y limpia el error
    function manejarCambio(evento) {
        const { name, value } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

        if (errorFormulario) {
            setErrorFormulario('');
        }
    }

    // Valida los campos antes de enviar al backend
    function validarFormulario() {
        if (!formulario.nombre.trim()) {
            setErrorFormulario('El nombre es obligatorio.');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo.trim())) {
            setErrorFormulario('El correo debe tener un formato válido.');
            return false;
        }

        // La contraseña es obligatoria al crear y opcional al editar
        if (!usuario && formulario.contrasena.length < 6) {
            setErrorFormulario('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }

        if (usuario && formulario.contrasena && formulario.contrasena.length < 6) {
            setErrorFormulario('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }

        return true;
    }

    // Envía los datos al componente padre
    function manejarEnvio(evento) {
        evento.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        onGuardar({
            nombre: formulario.nombre.trim(),
            correo: formulario.correo.trim(),
            contrasena: formulario.contrasena,
            rol: formulario.rol,
            estado: formulario.estado
        });
    }
return (
        <Modal titulo={usuario ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={onCerrar}>
            <form onSubmit={manejarEnvio}>
                {errorFormulario && <Mensaje tipo="error" texto={errorFormulario} />}

                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Nombre completo"
                        maxLength="150"
                        value={formulario.nombre}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="correo">Correo</label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        placeholder="correo@baluarte.com"
                        maxLength="150"
                        value={formulario.correo}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        type="password"
                        id="contrasena"
                        name="contrasena"
                        placeholder={usuario ? 'Dejar vacía para no cambiarla' : 'Mínimo 6 caracteres'}
                        value={formulario.contrasena}
                        onChange={manejarCambio}
                        required={!usuario}
                    />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="rol">Rol</label>
                        <select id="rol" name="rol" value={formulario.rol} onChange={manejarCambio}>
                            {roles.map((rol) => (
                                <option key={rol} value={rol}>
                                    {rol}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="estado">Estado</label>
                        <select id="estado" name="estado" value={formulario.estado} onChange={manejarCambio}>
                            {estados.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-gray" onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-red">
                        {usuario ? 'Actualizar Usuario' : 'Guardar Usuario'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default UsuarioForm;