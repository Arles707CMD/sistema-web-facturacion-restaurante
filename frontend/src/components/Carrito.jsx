// ===========================================
// COMPONENTE CARRITO
// Tabla del carrito de la venta. Renderiza cada
// ítem mediante CarritoItem.
// ===========================================

import CarritoItem from './CarritoItem';

function Carrito({ items, onAumentar, onDisminuir, onEliminar }) {
    if (items.length === 0) {
        return <p className="carrito-vacio">El carrito está vacío.</p>;
    }

    return (
        <table className="tabla-productos">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, indice) => (
                    <CarritoItem
                        key={item.id_producto}
                        item={item}
                        onAumentar={() => onAumentar(item.id_producto)}
                        onDisminuir={() => onDisminuir(item.id_producto)}
                        onEliminar={() => onEliminar(item.id_producto)}
                    />
                ))}
            </tbody>
        </table>
    );
}

export default Carrito;