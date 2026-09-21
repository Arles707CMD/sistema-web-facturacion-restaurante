# Lista de Endpoints — API Restaurante Baluarte
## GA7-220501096-AA5-EV03 · Diseño y desarrollo de servicios web

**Base URL:** `http://localhost:3000`

Todos los endpoints confirmados y funcionales del backend. Estructura por capas:
`routes → controllers → services → models → BD (MySQL/MariaDB vía mysql2)`.

---

## Auth — `/api/auth`

### POST `/api/auth/register`
- **Propósito:** registrar un nuevo usuario (rol y estado fijados en `Ventas`/`Activo`).
- **Body (JSON):** `{ "nombre": string, "correo": string, "contrasena": string }`
- **Respuesta 201:** `{ "mensaje": "Usuario registrado correctamente.", "usuario": { ... } }` (sin hash/salt/contrasena).
- **Errores:** `400` (nombre vacío, correo inválido, contraseña < 6, correo duplicado) · `500`.

### POST `/api/auth/login`
- **Propósito:** autenticar un usuario por correo y contraseña.
- **Body (JSON):** `{ "correo": string, "contrasena": string }`
- **Respuesta 200:** `{ "mensaje": "Inicio de sesión correcto", "usuario": { ... } }` (usuario seguro).
- **Errores:** `400` (campos faltantes) · `401` (credenciales inválidas) · `403` (usuario inactivo) · `500`.

---

## Productos — `/api/productos`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Listar todos los productos (con categoría) | 200 | 500 |
| GET | `/:id` | Obtener producto por id | 200 | 400, 404, 500 |
| POST | `/` | Crear producto | 201 | 400, 500 |
| PUT | `/:id` | Actualizar producto | 200 | 400, 404, 500 |
| DELETE | `/:id` | Eliminar producto | 200 | 400, 404, 500 |

**Body (POST/PUT):** `{ "nombre", "descripcion"?, "precio", "stock", "idCategoria" }`

---

## Usuarios — `/api/usuarios`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Listar usuarios | 200 | 500 |
| GET | `/:id` | Obtener usuario por id | 200 | 400, 404, 500 |
| POST | `/` | Crear usuario | 201 | 400, 500 |
| PUT | `/:id` | Actualizar usuario | 200 | 400, 404, 500 |
| DELETE | `/:id` | Eliminar usuario | 200 | 400, 404, 500 |

**Body (POST):** `{ "nombre", "correo", "contrasena", "rol", "estado" }`
**Body (PUT):** `{ "nombre", "correo", "rol", "estado", "contrasena"? }` (contraseña opcional; si se omite no se cambia).

---

## Ventas — `/api/ventas`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| POST | `/` | Registrar venta (genera factura + detalle y descuenta stock, transaccional) | 201 | 400, 500 |

**Body (JSON):**
```json
{
  "cliente": "string",
  "documento": "string?",
  "telefono": "string?",
  "metodo_pago": "Efectivo | Tarjeta Débito | Tarjeta Crédito | Nequi | Daviplata",
  "observaciones": "string?",
  "productos": [{ "id_producto": number, "cantidad": number }]
}
```
**Respuesta 201:** `{ "mensaje": "Venta registrada correctamente", "idFactura", "numeroFactura", "total" }`
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
Estados válidos: `Activa`, `En revisión`, `Inactiva`. Una receta por producto.

---

## Configuración — `/api/configuracion`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/` | Obtener configuración (fila id=1) | 200 | 404, 500 |
| PUT | `/` | Actualizar configuración | 200 | 400, 500 |

**Body (PUT):** `{ "nombre", "meta_mensual", "iva" }`

---

## Metas — `/api/metas`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/resumen?periodo=mes\|semana\|todo` | Resumen de metas (ventas vs meta mensual) | 200 | 400, 500 |

---

## Reportes — `/api/reportes`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/resumen` | Indicadores agregados de ventas | 200 | 500 |

---

## Inventario — `/api/inventario`

| Método | URL | Propósito | Éxito | Errores |
|--------|-----|-----------|:-----:|---------|
| GET | `/resumen` | Estado actual del stock (solo lectura) | 200 | 500 |

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

**No existe endpoint de categorías.** Las categorías son una **dependencia estática** del recurso productos (se cargan desde una lista fija en el frontend y se validan contra la tabla `categorias` en BD). No hay una necesidad funcional real de administrarlas vía API, por lo que no se creó CRUD para evitar endpoints artificiales.
