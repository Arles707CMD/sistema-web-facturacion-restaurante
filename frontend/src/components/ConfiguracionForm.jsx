// ===========================================
// COMPONENTE CONFIGURACIÓN FORM
// Formulario para editar nombre, meta mensual
// e IVA. Recibe la configuración actual y
// notifica al padre mediante onGuardar.
// ===========================================

import { useEffect, useState } from 'react';

import Mensaje from './Mensaje';

function ConfiguracionForm({ configuracion, onGuardar, guardando }) {
    const [formulario, setFormulario] = useState({
        nombre: '',
        meta_mensual: '',
        iva: ''
    });

    const [errorFormulario, setErrorFormulario] = useState('');

    // Sincroniza el formulario cuando cambia la configuración
    useEffect(() => {
        if (configuracion) {
            setFormulario({
                nombre: configuracion.nombre || '',
                meta_mensual: configuracion.meta_mensual ?? '',
                iva: configuracion.iva ?? ''
            });
        }

        setErrorFormulario('');
    }, [configuracion]);

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
        const metaMensual = Number(formulario.meta_mensual);
        const iva = Number(formulario.iva);

        if (!formulario.nombre.trim()) {
            setErrorFormulario('El nombre es obligatorio.');
            return false;
        }

        if (!Number.isFinite(metaMensual) || metaMensual < 0) {
            setErrorFormulario('La meta mensual debe ser un número mayor o igual a 0.');
            return false;
        }

        if (!Number.isFinite(iva) || iva < 0 || iva > 100) {
            setErrorFormulario('El IVA debe ser un número entre 0 y 100.');
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
            nombre: formulario.nombre.trim(),
            meta_mensual: Number(formulario.meta_mensual),
            iva: Number(formulario.iva)
        });
    }

    return (
        <form className="configuracion-form" onSubmit={manejarEnvio}>
            {errorFormulario && <Mensaje tipo="error" texto={errorFormulario} />}

            <div className="form-group">
                <label htmlFor="nombre">Nombre del restaurante</label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    maxLength="150"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="meta_mensual">Meta mensual de ventas</label>
                <input
                    type="number"
                    id="meta_mensual"
                    name="meta_mensual"
                    min="0"
                    step="1000"
                    value={formulario.meta_mensual}
                    onChange={manejarCambio}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="iva">IVA (%)</label>
                <input
                    type="number"
                    id="iva"
                    name="iva"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formulario.iva}
                    onChange={manejarCambio}
                    required
                />
            </div>

            <button type="submit" className="btn-red" disabled={guardando}>
                <i className="fa-solid fa-floppy-disk"></i>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
        </form>
    );
}

export default ConfiguracionForm;