// ===========================================
// COMPONENTE RECETA FORM
// Formulario (modal) para crear o editar una
// receta: producto, porciones, tiempo, estado
// y descripción.
// ===========================================

import { useEffect, useState } from 'react';

import Modal from './common/Modal';
import Mensaje from './Mensaje';

const ESTADOS = ['Activa', 'En revisión', 'Inactiva'];

function RecetaForm({ productos, receta, onGuardar, onCerrar }) {
    const [formulario, setFormulario] = useState({
        id_producto: '',
        porciones: '1',
        tiempo: '15',
        estado: 'Activa',
        descripcion: ''
    });

    const [errorFormulario, setErrorFormulario] = useState('');

    // Sincroniza el formulario al editar o crear
    useEffect(() => {
        if (receta) {
            setFormulario({
                id_producto: receta.id_producto || '',
                porciones: receta.porciones ?? '1',
                tiempo: receta.tiempo ?? '15',
                estado: receta.estado || 'Activa',
                descripcion: receta.descripcion || ''
            });
        } else {
            setFormulario({
                id_producto: '',
                porciones: '1',
                tiempo: '15',
                estado: 'Activa',
                descripcion: ''
            });
        }

        setErrorFormulario('');
    }, [receta]);

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

    function validarFormulario() {
        if (!formulario.id_producto) {
            setErrorFormulario('El producto es obligatorio.');
            return false;
        }

        const porciones = Number(formulario.porciones);
        const tiempo = Number(formulario.tiempo);

        if (!Number.isInteger(porciones) || porciones <= 0) {
            setErrorFormulario('Las porciones deben ser un número entero mayor a 0.');
            return false;
        }

        if (!Number.isInteger(tiempo) || tiempo <= 0) {
            setErrorFormulario('El tiempo debe ser un número entero mayor a 0.');
            return false;
        }

        return true;
    }

    function manejarEnvio(evento) {
        evento.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        onGuardar({
            id_producto: Number(formulario.id_producto),
            porciones: Number(formulario.porciones),
            tiempo: Number(formulario.tiempo),
            estado: formulario.estado,
            descripcion: formulario.descripcion.trim()
        });
    }
return (
        <Modal titulo={receta ? 'Editar Receta' : 'Nueva Receta'} onClose={onCerrar}>
            <form onSubmit={manejarEnvio}>
                {errorFormulario && <Mensaje tipo="error" texto={errorFormulario} />}

                <div className="form-group">
                    <label htmlFor="id_producto">Producto del catálogo</label>
                    <select
                        id="id_producto"
                        name="id_producto"
                        value={formulario.id_producto}
                        onChange={manejarCambio}
                        required
                    >
                        <option value="">Seleccionar producto</option>
                        {productos.map((producto) => (
                            <option key={producto.id_producto} value={producto.id_producto}>
                                {producto.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="porciones">Porciones</label>
                        <input
                            type="number"
                            id="porciones"
                            name="porciones"
                            min="1"
                            step="1"
                            value={formulario.porciones}
                            onChange={manejarCambio}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tiempo">Tiempo de preparación (min)</label>
                        <input
                            type="number"
                            id="tiempo"
                            name="tiempo"
                            min="1"
                            step="1"
                            value={formulario.tiempo}
                            onChange={manejarCambio}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="estado">Estado</label>
                        <select
                            id="estado"
                            name="estado"
                            value={formulario.estado}
                            onChange={manejarCambio}
                        >
                            {ESTADOS.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción de la preparación</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        rows="4"
                        maxLength="255"
                        placeholder="Describe la preparación o ingredientes principales."
                        value={formulario.descripcion}
                        onChange={manejarCambio}
                    ></textarea>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-gray" onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-red">
                        {receta ? 'Actualizar Receta' : 'Guardar Receta'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default RecetaForm;