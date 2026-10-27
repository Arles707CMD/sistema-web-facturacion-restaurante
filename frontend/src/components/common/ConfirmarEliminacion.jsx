// ===========================================
// COMPONENTE CONFIRMAR ELIMINACION
// Diálogo de confirmación reutilizable para
// operaciones destructivas (facturas y
// productos). Reutiliza el Modal compartido
// del sistema: mismo estilo que "Ver factura".
// ===========================================

import Modal from './Modal';

function ConfirmarEliminacion({
    titulo,
    textoBoton = 'Eliminar',
    advertencia,
    cargando = false,
    error = '',
    onCancelar,
    onConfirmar,
    children
}) {
    return (
        <Modal titulo={titulo} onClose={onCancelar}>
            <div className="confirmar-eliminacion">
                {children}

                <p className="confirmar-advertencia" role="alert">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {advertencia}
                </p>

                {error && (
                    <p className="confirmar-error" role="alert">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {error}
                    </p>
                )}

                <div className="confirmar-acciones">
                    <button
                        type="button"
                        className="btn-gray"
                        disabled={cargando}
                        onClick={onCancelar}
                    >
                        <i className="fa-solid fa-xmark"></i>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-red"
                        disabled={cargando}
                        onClick={onConfirmar}
                    >
                        {cargando ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-trash"></i>
                                {textoBoton}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmarEliminacion;