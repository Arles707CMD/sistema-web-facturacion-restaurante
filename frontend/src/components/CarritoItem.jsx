// ===========================================
// COMPONENTE CARRITO ITEM
// Fila del carrito con controles de cantidad
// (+/-) y botón para eliminar el producto.
// ===========================================

function CarritoItem({ item, onAumentar, onDisminuir, onEliminar }) {
    return (
        <tr>
            <td>{item.nombre}</td>
            <td>
                <div className="cantidad-control">
                    <button type="button" className="btn-cantidad" onClick={onDisminuir}>
                        -
                    </button>
                    <strong className="cantidad">{item.cantidad}</strong>
                    <button type="button" className="btn-cantidad" onClick={onAumentar}>
                        +
                    </button>
                </div>
            </td>
            <td>${(Number(item.precio) * item.cantidad).toLocaleString('es-CO')}</td>
            <td>
                <button
                    type="button"
                    className="btn-icon eliminar"
                    title="Eliminar"
                    onClick={onEliminar}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    );
}

export default CarritoItem;