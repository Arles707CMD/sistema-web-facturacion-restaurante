# Lista de Endpoints — API Restaurante Baluarte
## GA7-220501096-AA5-EV04 · API del proyecto (pruebas con Postman)

**Base URL:** `http://localhost:3000`

Lista completa de los endpoints reales del backend (arquitectura `routes → controllers → services → models → BD`), verificados contra el código de EV03. No incluye endpoints artificiales.

---

## Auth — `/api/auth`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| POST | `/register` | Registrar usuario (rol `Ventas`, estado `Activo` fijados) | 201 | 400, 500 |
| POST | `/login` | Autenticar por correo y contraseña | 200 | 400, 401, 403, 500 |

- **register** · Body: `{ "nombre", "correo", "contrasena" }` · Respuesta sin hash/salt/contrasena.
- **login** · Body: `{ "correo", "contrasena" }` · Respuesta con usuario seguro. Errores: 400 campos faltantes, 401 credenciales, 403 usuario inactivo.

---

## Productos — `/api/productos`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Listar productos (con categoría) | 200 | 500 |
| GET | `/:id` | Obtener producto por id | 200 | 400, 404, 500 |
| POST | `/` | Crear producto | 201 | 400, 500 |
| PUT | `/:id` | Actualizar producto | 200 | 400, 404, 500 |
| DELETE | `/:id` | Eliminar producto | 200 | 400, 404, 500 |

**Body (POST/PUT):** `{ "nombre", "descripcion"?, "precio", "stock", "idCategoria" }`

---

## Usuarios — `/api/usuarios`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Listar usuarios (sin hash) | 200 | 500 |
| GET | `/:id` | Obtener usuario por id | 200 | 400, 404, 500 |
| POST | `/` | Crear usuario | 201 | 400, 500 |
| PUT | `/:id` | Actualizar usuario | 200 | 400, 404, 500 |
| DELETE | `/:id` | Eliminar usuario | 200 | 400, 404, 500 |

**Body (POST):** `{ "nombre", "correo", "contrasena", "rol", "estado" }`
**Body (PUT):** `{ "nombre", "correo", "rol", "estado", "contrasena"? }` (contraseña opcional).
Roles: `Administrador`, `Ventas`, `Inventario`. Estados: `Activo`, `Inactivo`.

---

## Ventas — `/api/ventas`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| POST | `/` | Registrar venta (factura + detalle + descuento de stock, transaccional) | 201 | 400, 500 |

**Body:** `{ "cliente", "documento"?, "telefono"?, "metodo_pago", "observaciones"?, "productos": [{ "id_producto", "cantidad" }] }`
**Métodos de pago:** `Efectivo`, `Tarjeta Débito`, `Tarjeta Crédito`, `Nequi`, `Daviplata`.
**Errores de negocio (400):** producto no encontrado, stock insuficiente.

---

## Facturas — `/api/facturas`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Listar facturas | 200 | 500 |
| GET | `/:id` | Obtener factura con detalle | 200 | 400, 404, 500 |
| DELETE | `/:id` | Eliminar factura (restaura stock, transaccional) | 200 | 400, 404, 500 |

---

## Recetas — `/api/recetas`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Listar recetas | 200 | 500 |
| GET | `/:id` | Obtener receta por id | 200 | 400, 404, 500 |
| POST | `/` | Crear receta | 201 | 400, 500 |
| PUT | `/:id` | Actualizar receta | 200 | 400, 404, 500 |
| DELETE | `/:id` | Eliminar receta | 200 | 400, 404, 500 |

**Body (POST/PUT):** `{ "id_producto", "porciones", "tiempo", "estado", "descripcion"? }`
Estados: `Activa`, `En revisión`, `Inactiva`. Una receta por producto.

---

## Configuración — `/api/configuracion`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Obtener configuración (fila id=1) | 200 | 404, 500 |
| PUT | `/` | Actualizar configuración | 200 | 400, 500 |

**Body (PUT):** `{ "nombre", "meta_mensual", "iva" }` (iva entre 0 y 100).

---

## Metas — `/api/metas`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/resumen?periodo=mes|semana|todo` | Resumen de metas | 200 | 400, 500 |

---

## Reportes — `/api/reportes`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/resumen` | Indicadores agregados de ventas | 200 | 500 |

---

## Inventario — `/api/inventario`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/resumen` | Estado actual del stock | 200 | 500 |

---

## Dashboard — `/api/dashboard`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/resumen` | Indicadores del panel principal | 200 | 500 |

---

## Auxiliares (app.js)

| Método | URL | Propósito |
|--------|-----|-----------|
| GET | `/` | Health check |
| GET | `/api/prueba-db` | Verificación de conexión a BD |

---

## Categorías

**No existe endpoint de categorías.** Son una dependencia estática del recurso productos (se validan contra la tabla `categorias` en BD). No se creó CRUD para evitar endpoints artificiales.
