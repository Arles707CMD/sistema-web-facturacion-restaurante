// ===========================================
// COMPONENTE RECETA TABLE
// Tabla de recetas con producto, categoría,
// porciones, tiempo, estado y acciones.
// ===========================================

function obtenerCodigo(receta) {
    return 'REC-' + String(receta.id_receta).padStart(3, '0');
}

function claseEstado(estado) {
    if (estado === 'Activa') {
        return 'activa';
    }
    if (estado === 'En revisión') {
        return 'revision';
    }
    return 'inactiva';
}

function RecetaTable({ recetas, onVer, onEditar, onEliminar }) {
    if (recetas.length === 0) {
        return <p className="sin-datos">No hay recetas registradas.</p>;
    }

    return (
        <div className="tabla-responsive">
            <table className="tabla-productos">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Porciones</th>
                        <th>Tiempo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {recetas.map((receta) => (
                        <tr key={receta.id_receta}>
                            <td>{obtenerCodigo(receta)}</td>
                            <td>{receta.producto}</td>
                            <td>{receta.categoria}</td>
                            <td>{receta.porciones}</td>
                            <td>{receta.tiempo} min</td>
                            <td>
                                <span className={`estado-receta ${claseEstado(receta.estado)}`}>
                                    {receta.estado}
                                </span>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-icon ver"
                                    title="Ver receta"
                                    onClick={() => onVer(receta)}
                                >
                                    <i className="fa-solid fa-eye"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon editar"
                                    title="Editar receta"
                                    onClick={() => onEditar(receta)}
                                >
                                    <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon eliminar"
                                    title="Eliminar receta"
                                    onClick={() => onEliminar(receta)}
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

export default RecetaTable;