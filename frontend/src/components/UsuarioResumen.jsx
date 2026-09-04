// ===========================================
// COMPONENTE USUARIO RESUMEN
// Tarjetas de resumen con el total de usuarios,
// administradores y personal de ventas.
// ===========================================

function UsuarioResumen({ totalUsuarios, totalAdministradores, totalVentas }) {
    return (
        <section className="cards">
            <div className="card">
                <div className="icon red">
                    <i className="fa-solid fa-users"></i>
                </div>
                <div>
                    <p>Total Usuarios</p>
                    <h2>{totalUsuarios}</h2>
                    <span>Registrados</span>
                </div>
            </div>

            <div className="card">
                <div className="icon green">
                    <i className="fa-solid fa-user-shield"></i>
                </div>
                <div>
                    <p>Administradores</p>
                    <h2>{totalAdministradores}</h2>
                    <span>Acceso total</span>
                </div>
            </div>

            <div className="card">
                <div className="icon orange">
                    <i className="fa-solid fa-cart-shopping"></i>
                </div>
                <div>
                    <p>Ventas</p>
                    <h2>{totalVentas}</h2>
                    <span>Personal de ventas</span>
                </div>
            </div>
        </section>
    );
}

export default UsuarioResumen;