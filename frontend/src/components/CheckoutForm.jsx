// ===========================================
// COMPONENTE CHECKOUT FORM
// Formulario de datos del cliente y método de
// pago. Es controlado: recibe el estado y lo
// actualiza mediante onCambio.
// ===========================================

const METODOS_PAGO = [
    'Efectivo',
    'Tarjeta Débito',
    'Tarjeta Crédito',
    'Nequi',
    'Daviplata'
];

function CheckoutForm({ formulario, onCambio, onFinalizar }) {
    // Actualiza un campo del formulario controlado
    function manejarCambio(evento) {
        const { name, value } = evento.target;

        onCambio(name, value);
    }

    // Envía el formulario al componente padre
    function manejarEnvio(evento) {
        evento.preventDefault();

        onFinalizar();
    }

    return (
        <form className="checkout-form" onSubmit={manejarEnvio}>
            <div className="form-group">
                <label htmlFor="cliente">Cliente</label>
                <input
                    type="text"
                    id="cliente"
                    name="cliente"
                    placeholder="Nombre del cliente"
                    value={formulario.cliente}
                    onChange={manejarCambio}
                    required
                />
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="documento">Documento</label>
                    <input
                        type="text"
                        id="documento"
                        name="documento"
                        placeholder="Número de documento"
                        value={formulario.documento}
                        onChange={manejarCambio}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                        type="text"
                        id="telefono"
                        name="telefono"
                        placeholder="Teléfono de contacto"
                        value={formulario.telefono}
                        onChange={manejarCambio}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="metodo_pago">Método de pago</label>
                    <select
                        id="metodo_pago"
                        name="metodo_pago"
                        value={formulario.metodo_pago}
                        onChange={manejarCambio}
                    >
                        {METODOS_PAGO.map((metodo) => (
                            <option key={metodo} value={metodo}>
                                {metodo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="observaciones">Observaciones</label>
                    <input
                        type="text"
                        id="observaciones"
                        name="observaciones"
                        placeholder="Observaciones (opcional)"
                        value={formulario.observaciones}
                        onChange={manejarCambio}
                    />
                </div>
            </div>

            <button type="submit" className="btn-red btn-finalizar">
                <i className="fa-solid fa-check"></i>
                Finalizar Venta
            </button>
        </form>
    );
}

export default CheckoutForm;