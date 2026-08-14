const usuarios = () => BaluarteData.leer("usuarios");
const guardarUsuarios = lista => BaluarteData.guardar("usuarios", lista);
const tablaUsuarios = document.getElementById("tablaUsuarios");
let usuarioEditando = null;

function escapar(texto) { const e = document.createElement("span"); e.textContent = texto; return e.innerHTML; }
function actualizarUsuarios() {
    const texto = document.getElementById("buscarUsuario").value.toLowerCase();
    const rol = document.getElementById("filtroRol").value;
    const lista = usuarios();
    document.getElementById("totalUsuarios").textContent = lista.length;
    document.getElementById("totalAdministradores").textContent = lista.filter(u => u.rol === "Administrador").length;
    document.getElementById("totalVentas").textContent = lista.filter(u => u.rol === "Ventas").length;
    const filtrados = lista.filter(u => (rol === "todos" || u.rol === rol) && `${u.nombre} ${u.correo}`.toLowerCase().includes(texto));
    tablaUsuarios.innerHTML = filtrados.length ? filtrados.map(u => `<tr><td>${escapar(u.nombre)}</td><td>${escapar(u.correo)}</td><td>${u.rol}</td><td><span class="estado ${u.estado === "Activo" ? "activo" : "inactivo"}">${u.estado}</span></td><td><button class="btn-icon editar" onclick="editarUsuario('${u.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button><button class="btn-icon eliminar" onclick="eliminarUsuario('${u.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button><button class="btn-icon ver" onclick="verUsuario('${u.id}')" title="Ver"><i class="fa-solid fa-eye"></i></button></td></tr>`).join("") : '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
}
function abrirUsuario(id = null) {
    usuarioEditando = id;
    const usuario = usuarios().find(u => u.id === id) || { nombre: "", correo: "", rol: "Ventas", estado: "Activo" };
    document.getElementById("formUsuario").reset();
    document.getElementById("nombreUsuario").value = usuario.nombre;
    document.getElementById("correoUsuario").value = usuario.correo;
    document.getElementById("rolUsuario").value = usuario.rol;
    document.getElementById("estadoUsuario").value = usuario.estado;
    document.getElementById("modalUsuarioTitulo").textContent = id ? "Editar usuario" : "Nuevo usuario";
    document.getElementById("modalUsuario").hidden = false;
}
function editarUsuario(id) { abrirUsuario(id); }
function verUsuario(id) { const u = usuarios().find(item => item.id === id); if (u) alert(`USUARIO\n\nNombre: ${u.nombre}\nCorreo: ${u.correo}\nRol: ${u.rol}\nEstado: ${u.estado}`); }
function eliminarUsuario(id) { if (!confirm("¿Eliminar este usuario?")) return; guardarUsuarios(usuarios().filter(u => u.id !== id)); actualizarUsuarios(); }
document.getElementById("btnNuevoUsuario").addEventListener("click", () => abrirUsuario());
document.getElementById("buscarUsuario").addEventListener("input", actualizarUsuarios);
document.getElementById("filtroRol").addEventListener("change", actualizarUsuarios);
document.getElementById("cerrarUsuario").addEventListener("click", () => document.getElementById("modalUsuario").hidden = true);
document.getElementById("formUsuario").addEventListener("submit", event => {
    event.preventDefault(); const lista = usuarios(); const correo = document.getElementById("correoUsuario").value.trim().toLowerCase();
    if (lista.some(u => u.correo.toLowerCase() === correo && u.id !== usuarioEditando)) return alert("Ya existe un usuario con ese correo.");
    const registro = { id: usuarioEditando || `USR-${String(Date.now()).slice(-6)}`, nombre: document.getElementById("nombreUsuario").value.trim(), correo, rol: document.getElementById("rolUsuario").value, estado: document.getElementById("estadoUsuario").value };
    const indice = lista.findIndex(u => u.id === usuarioEditando); if (indice >= 0) lista[indice] = registro; else lista.push(registro);
    guardarUsuarios(lista); document.getElementById("modalUsuario").hidden = true; actualizarUsuarios();
});
actualizarUsuarios();
