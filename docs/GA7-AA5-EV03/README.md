# GA7-220501096-AA5-EV03 — Diseño y desarrollo de servicios web · Proyecto

Documentación técnica del servicio web del **Restaurante Baluarte** (reutilizando el proyecto existente de EV01/EV02, sin crear un proyecto nuevo).

---

## 1. Objetivo

Fortalecer la arquitectura de servicios web del backend del Restaurante Baluarte, garantizando una separación clara por capas (`routes → controllers → services → models → BD`), conservando el comportamiento externo de la API y documentando todos los endpoints reales.

## 2. Requerimientos funcionales relacionados

- Registro y autenticación de usuarios (`/api/auth`).
- Administración de usuarios (`/api/usuarios`).
- Catálogo de productos con categoría y stock (`/api/productos`).
- Registro de ventas con facturación y control de stock (`/api/ventas`, `/api/facturas`).
- Gestión de recetas por producto (`/api/recetas`).
- Configuración del negocio (nombre, meta mensual, IVA) (`/api/configuracion`).
- Indicadores de metas, reportes, inventario y dashboard (solo lectura).

## 3. Recursos principales

| Recurso | Descripción |
|---------|-------------|
| Auth | Registro y login |
| Usuarios | CRUD de usuarios del sistema |
| Productos | CRUD del catálogo (con categoría) |
| Ventas / Facturas | Venta transaccional + consulta/eliminación de facturas |
| Recetas | CRUD de recetas |
| Configuración | Lectura/actualización de la configuración única |
| Metas / Reportes / Inventario / Dashboard | Indicadores de solo lectura |

## 4. Arquitectura

```
routes → controllers → services → models → BD
```

- **Routes:** definen URL + método y enlazan con el controller.
- **Controllers:** solo `req/res` y códigos HTTP (traducen resultados/errores).
- **Services:** lógica de negocio, validación y orquestación (transacciones, hash, numeración, totales).
- **Models:** acceso a datos (consultas SQL parametrizadas con `mysql2`).
- **BD:** MySQL/MariaDB, pool en `backend/config/database.js`.

Se creó una capa de servicios para los 10 recursos (antes solo existía para `auth`), y un `passwordService` compartido para eliminar la duplicación del hash de contraseñas entre `auth` y `usuarios`.

## 5. Listado completo de endpoints

Ver `endpoints-api-restaurante-baluarte.md` (27 endpoints + 2 auxiliares).

Resumen por recurso:

| Recurso | Endpoints |
|---------|-----------|
| Auth | POST `/register`, POST `/login` |
| Productos | GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id` |
| Usuarios | GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id` |
| Ventas | POST `/` |
| Facturas | GET `/`, GET `/:id`, DELETE `/:id` |
| Recetas | GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id` |
| Configuración | GET `/`, PUT `/` |
| Metas | GET `/resumen` |
| Reportes | GET `/resumen` |
| Inventario | GET `/resumen` |
| Dashboard | GET `/resumen` |

## 6. CRUD por recurso

| Recurso | GET lista | GET id | POST | PUT | DELETE |
|---------|:---:|:---:|:---:|:---:|:---:|
| Productos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Usuarios | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recetas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ventas | — | — | ✅ | — | — |
| Facturas | ✅ | ✅ | — (vía venta) | — | ✅ |
| Configuración | ✅ | — | — | ✅ | — |
| Metas / Reportes / Inventario / Dashboard | ✅ (resumen) | — | — | — | — |
| Categorías | — (dependencia estática de productos) |

## 7. Validaciones y manejo de errores

- **Validaciones:** campos requeridos, tipos y formatos (correo, números), ids positivos, valores de enumeraciones (rol, estado, método de pago, estado de receta, periodo) y existencia de recursos relacionados (categoría, producto, receta duplicada).
- **Códigos de respuesta:**
  - `200` éxito (lectura/actualización/eliminación) · `201` creación.
  - `400` datos inválidos / regla de negocio (stock insuficiente, producto inexistente, duplicados).
  - `401` credenciales inválidas · `403` usuario inactivo.
  - `404` recurso no encontrado.
  - `500` error interno del servidor.
- Los errores de negocio se lanzan desde los services mediante `ErrorServicio` y el controller los traduce a la respuesta HTTP.

## 8. Conexión con BD

- `backend/config/database.js`: pool `mysql2/promise` con variables de entorno (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`).
- Las operaciones de venta y eliminación de factura son **transaccionales** (begin/commit/rollback) para garantizar la integridad del stock.

## 9. Versionamiento Git

- Rama: `main`.
- Último commit: `c9566dd` — "Actualiza documentacion AA5 EV01".
- Los cambios de EV03 (service layer + documentación) quedan sin commitear (pendiente de `git commit`/`push` por el autor).

## 10. Repositorio

`https://github.com/Arles707CMD/sistema-web-facturacion-restaurante.git`
