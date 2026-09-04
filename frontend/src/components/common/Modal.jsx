// ===========================================
// COMPONENTE MODAL
// Ventana modal reutilizable con encabezado
// (título + botón de cierre) y contenido.
// Se podrá reutilizar en Recetas, Metas, etc.
// ===========================================

function Modal({ titulo, onClose, children }) {
    return (
        <div className="modal modal-activo">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{titulo}</h2>
                    <button type="button" className="cerrar" onClick={onClose}>
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default Modal;