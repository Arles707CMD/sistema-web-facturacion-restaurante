// ===========================================
// PÁGINA CONFIGURACIÓN
// Permite ver y editar el nombre del negocio,
// la meta mensual y el IVA. Los datos persisten
// en MariaDB mediante la API.
// ===========================================

import { useEffect, useState } from 'react';

import Mensaje from '../components/Mensaje';
import ConfiguracionForm from '../components/ConfiguracionForm';

import {
    actualizarConfiguracion,
    obtenerConfiguracion
} from '../api/configuracionApi';

import '../styles/Configuracion.css';

function Configuracion() {
    // Configuración actual y estados
    const [configuracion, setConfiguracion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // Carga la configuración al montar
    useEffect(() => {
        cargarConfiguracion();
    }, []);

    // Obtiene la configuración desde la API
    async function cargarConfiguracion() {
        setCargando(true);
        setError('');

        try {
            const datos = await obtenerConfiguracion();
            setConfiguracion(datos);
        } catch (error) {
            console.error('Error al cargar configuración:', error.message);
            setError('No se pudieron cargar los datos de configuración.');
        } finally {
            setCargando(false);
        }
    }

    // Muestra un mensaje temporal
    function mostrarMensaje(texto, tipo) {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 5000);
    }

    // Guarda la configuración
    async function guardarConfiguracion(datos) {
        setGuardando(true);

        try {
            await actualizarConfiguracion(datos);
            mostrarMensaje('Configuración guardada correctamente.', 'exito');
            await cargarConfiguracion();
        } catch (error) {
            console.error('Error al guardar configuración:', error.message);
            mostrarMensaje(error.message, 'error');
        } finally {
            setGuardando(false);
        }
    }

    if (cargando) {
        return (
            <p className="estado-carga">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Cargando configuración...
            </p>
        );
    }

    if (error) {
        return <Mensaje tipo="error" texto={error} />;
    }

    return (
        <div className="configuracion-container">
            <section className="panel">
                <div className="panel-header">
                    <h2>
                        <i className="fa-solid fa-gear"></i>
                        Datos del negocio
                    </h2>
                </div>

                {mensaje && <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />}

                <ConfiguracionForm
                    configuracion={configuracion}
                    onGuardar={guardarConfiguracion}
                    guardando={guardando}
                />
            </section>
        </div>
    );
}

export default Configuracion;