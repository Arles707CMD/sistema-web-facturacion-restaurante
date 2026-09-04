// ===========================================
// COMPONENTE USUARIO TABLE
// Tabla de usuarios con rol, estado y acciones
// de ver, editar y eliminar.
// ===========================================

function UsuarioTable({ usuarios, onVer, onEditar, onEliminar }) {
    return (
        <div className="tabla-responsive">
            <table className="tabla-productos">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id_usuario}>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.correo}</td>
                            <td>{usuario.rol}</td>
                            <td>
                                <span className={`estado ${usuario.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                                    {usuario.estado}
                                </span>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-icon ver"
                                    title="Ver usuario"
                                    onClick={() => onVer(usuario)}
                                >
                                    <i className="fa-solid fa-eye"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon editar"
                                    title="Editar usuario"
                                    onClick={() => onEditar(usuario)}
                                >
                                    <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon eliminar"
                                    title="Eliminar usuario"
                                    onClick={() => onEliminar(usuario)}
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsuarioTable;