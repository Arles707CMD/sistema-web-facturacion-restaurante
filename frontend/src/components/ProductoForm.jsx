// ===========================================
// COMPONENTE PRODUCTO FORM
// Formulario para crear o editar un producto.
// Recibe un producto (null si es nuevo) y
// notifica al padre mediante onGuardar.
// ===========================================

import { useEffect, useState } from 'react';

import Mensaje from './Mensaje';

// Categorías que coinciden con la tabla categorias
const categorias = [
    { id: 1, nombre: 'Hamburguesas' },
    { id: 2, nombre: 'Bebidas' },
    { id: 3, nombre: 'Acompañantes' }
];

function ProductoForm({ producto, onGuardar, onCerrar }) {
    // Estado inicial del formulario
    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        idCategoria: ''
    });

    // Mensaje de validación local del formulario
    const [errorFormulario, setErrorFormulario] = useState('');

    // Cuando cambia el producto a editar se rellenan los campos
    useEffect(() => {
        if (producto) {
            setFormulario({
                nombre: producto.nombre || '',
                descripcion: producto.descripcion || '',
                precio: producto.precio ?? '',
                stock: producto.stock ?? '',
                idCategoria: producto.id_categoria ?? ''
            });
        } else {
            setFormulario({
                nombre: '',
                descripcion: '',
                precio: '',
                stock: '',
                idCategoria: ''
            });
        }

        setErrorFormulario('');
    }, [producto]);

    // Actualiza una propiedad del formulario y limpia el error local
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

    // Valida los campos en el formulario antes de enviarlos al backend
    function validarFormulario() {
        const stockNumero = Number(formulario.stock);

        if (!formulario.nombre.trim()) {
            setErrorFormulario('El nombre del producto es obligatorio.');
            return false;
        }

        if (!Number.isInteger(stockNumero)) {
            setErrorFormulario('El stock debe ser un número entero mayor o igual a 0.');
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
            descripcion: formulario.descripcion.trim(),
            precio: Number(formulario.precio),
            stock: Number(formulario.stock),
            idCategoria: Number(formulario.idCategoria)
        });
    }

    return (
        <div className="modal-activo modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>
                        <i className="fa-solid fa-box-open"></i>
                        {producto ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button type="button" className="cerrar" onClick={onCerrar}>
                        &times;
                    </button>
                </div>

                {errorFormulario && <Mensaje tipo="error" texto={errorFormulario} />}

                <form onSubmit={manejarEnvio}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del producto</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Nombre del producto"
                            maxLength="150"
                            value={formulario.nombre}
                            onChange={manejarCambio}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <input
                            type="text"
                            id="descripcion"
                            name="descripcion"
                            placeholder="Descripción del producto (opcional)"
                            maxLength="255"
                            value={formulario.descripcion}
                            onChange={manejarCambio}
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="idCategoria">Categoría</label>
                            <select
                                id="idCategoria"
                                name="idCategoria"
                                value={formulario.idCategoria}
                                onChange={manejarCambio}
                                required
                            >
                                <option value="">Seleccionar categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="precio">Precio</label>
                            <input
                                type="number"
                                id="precio"
                                name="precio"
                                min="0"
                                step="0.01"
                                placeholder="25000"
                                value={formulario.precio}
                                onChange={manejarCambio}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">Stock</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                min="0"
                                step="1"
                                placeholder="10"
                                value={formulario.stock}
                                onChange={manejarCambio}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-gray" onClick={onCerrar}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-red">
                            {producto ? 'Actualizar Producto' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductoForm;