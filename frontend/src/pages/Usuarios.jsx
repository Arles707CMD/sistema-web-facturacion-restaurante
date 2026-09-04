// ===========================================
// PÁGINA USUARIOS
// Módulo de gestión de usuarios que consume
// la API Express mediante el proxy de Vite.
// CRUD completo (listar, crear, editar,
// visualizar, eliminar) + búsqueda y filtro.
// ===========================================

import { useEffect, useMemo, useState } from 'react';

import Mensaje from '../components/Mensaje';
import Modal from '../components/common/Modal';
import UsuarioForm from '../components/UsuarioForm';
import UsuarioResumen from '../components/UsuarioResumen';
import UsuarioTable from '../components/UsuarioTable';

import {
    actualizarUsuario,
    crearUsuario,
    eliminarUsuario,
    obtenerUsuarios
} from '../api/usuarioApi';

import '../styles/Usuarios.css';

function Usuarios() {
    // Lista completa de usuarios obtenida del backend
    const [usuarios, setUsuarios] = useState([]);

    // Estado de carga, error y filtros
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');

    // Mensaje temporal de éxito o error
    const [mensaje, setMensaje] = useState(null);

    // Usuario en edición y visibilidad del modal
    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    // Usuario seleccionado para visualizar (modal de detalle)
    const [usuarioVer, setUsuarioVer] = useState(null);

    // Carga los usuarios al montar el componente
    useEffect(() => {
        cargarUsuarios();
    }, []);

    // Obtiene los usuarios del backend y actualiza el estado
    async function cargarUsuarios() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerUsuarios();
            setUsuarios(datos);
        } catch (error) {
            console.error('Error al cargar usuarios:', error.message);
            setError('No se pudieron cargar los usuarios desde el servidor.');
        } finally {
            setCargando(false);
        }
    }

    // Muestra un mensaje y lo oculta después de unos segundos
    function mostrarMensaje(texto, tipo) {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 5000);
    }

    // Abre el modal para crear un usuario nuevo
    function abrirNuevoUsuario() {
        setUsuarioEditar(null);
        setModalAbierto(true);
    }

    // Abre el modal precargando el usuario seleccionado
    function abrirEditarUsuario(usuario) {
        setUsuarioEditar(usuario);
        setModalAbierto(true);
    }

    // Abre el modal de detalle con la información del usuario
    function verUsuario(usuario) {
        setUsuarioVer(usuario);
    }

    // Crea o actualiza un usuario según corresponda
    async function guardarUsuario(datos) {
        const esEdicion = usuarioEditar !== null;

        try {
            if (esEdicion) {
                await actualizarUsuario(usuarioEditar.id_usuario, datos);
                mostrarMensaje('Usuario actualizado correctamente.', 'exito');
            } else {
                await crearUsuario(datos);
                mostrarMensaje('Usuario creado correctamente.', 'exito');
            }

            setModalAbierto(false);
            setUsuarioEditar(null);
            await cargarUsuarios();
        } catch (error) {
            console.error('Error al guardar usuario:', error.message);
            mostrarMensaje(error.message, 'error');
        }
    }

    // Elimina un usuario tras confirmar con el usuario
    async function eliminarUsuarioHandler(usuario) {
        const confirmarEliminacion = confirm(
            '¿Está seguro de eliminar a "' + usuario.nombre + '"?'
        );

        if (!confirmarEliminacion) {
            return;
        }

        try {
            await eliminarUsuario(usuario.id_usuario);
            mostrarMensaje('Usuario eliminado correctamente.', 'exito');
            await cargarUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario:', error.message);
            mostrarMensaje(error.message, 'error');
        }
    }

    // Usuarios filtrados por búsqueda de texto y rol
    const usuariosFiltrados = useMemo(() => {
        const texto = busqueda.toLowerCase();

        return usuarios.filter((usuario) => {
            const coincideTexto =
                usuario.nombre.toLowerCase().includes(texto) ||
                usuario.correo.toLowerCase().includes(texto);

            const coincideRol =
                filtroRol === 'todos' || usuario.rol === filtroRol;

            return coincideTexto && coincideRol;
        });
    }, [usuarios, busqueda, filtroRol]);

    // Indicadores del resumen superior
    const totalUsuarios = usuarios.length;
    const totalAdministradores = usuarios.filter(
        (usuario) => usuario.rol === 'Administrador'
    ).length;
    const totalVentas = usuarios.filter(
        (usuario) => usuario.rol === 'Ventas'
    ).length;
return (
        <div className="usuarios-container">
            <UsuarioResumen
                totalUsuarios={totalUsuarios}
                totalAdministradores={totalAdministradores}
                totalVentas={totalVentas}
            />

            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-users"></i>
                        Gestión de Usuarios
                    </h2>
                    <button className="btn-red" type="button" onClick={abrirNuevoUsuario}>
                        <i className="fa-solid fa-plus"></i>
                        Nuevo Usuario
                    </button>
                </div>

                {mensaje && <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />}

                {error && !cargando && <Mensaje tipo="error" texto={error} />}

                <div className="busqueda">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                    />
                    <select
                        value={filtroRol}
                        onChange={(evento) => setFiltroRol(evento.target.value)}
                    >
                        <option value="todos">Todos los roles</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Ventas">Ventas</option>
                        <option value="Inventario">Inventario</option>
                    </select>
                </div>

                {cargando ? (
                    <p className="estado-carga">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Cargando usuarios...
                    </p>
                ) : (
                    <UsuarioTable
                        usuarios={usuariosFiltrados}
                        onVer={verUsuario}
                        onEditar={abrirEditarUsuario}
                        onEliminar={eliminarUsuarioHandler}
                    />
                )}
            </section>

            {modalAbierto && (
                <UsuarioForm
                    usuario={usuarioEditar}
                    onGuardar={guardarUsuario}
                    onCerrar={() => setModalAbierto(false)}
                />
            )}

            {usuarioVer && (
                <Modal titulo="Detalle del Usuario" onClose={() => setUsuarioVer(null)}>
                    <div className="usuario-detalle">
                        <p><strong>Nombre:</strong> {usuarioVer.nombre}</p>
                        <p><strong>Correo:</strong> {usuarioVer.correo}</p>
                        <p><strong>Rol:</strong> {usuarioVer.rol}</p>
                        <p><strong>Estado:</strong> {usuarioVer.estado}</p>
                        <p><strong>Fecha de creación:</strong>{' '}
                            {usuarioVer.fecha_creacion
                                ? new Date(usuarioVer.fecha_creacion).toLocaleDateString('es-CO')
                                : 'No disponible'}
                        </p>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default Usuarios;