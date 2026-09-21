# GA7-220501096-AA5-EV04 — API del proyecto · Pruebas con Postman

## 1. Identificación
| Campo | Valor |
|---|---|
| Proyecto | Sistema Web de Facturación Restaurante Baluarte |
| Evidencia | GA7-220501096-AA5-EV04 — API del proyecto (pruebas con Postman) |
| Repositorio | https://github.com/Arles707CMD/sistema-web-facturacion-restaurante.git |
| Pila | Node.js + Express · React + Vite · MySQL/MariaDB (mysql2) |

## 2. Objetivo
Probar la API construida en la EV03 (27 endpoints de negocio + 2 auxiliares) mediante una colección Postman organizada por módulos, con pruebas automatizadas (`pm.test`) que verifican códigos HTTP, estructura JSON, campos importantes y ausencia de información sensible.

## 3. Alcance
- Probar todos los endpoints reales del backend (sin crear endpoints nuevos).
- Casos positivos (creación, lectura, actualización, eliminación) y negativos representativos (validación, duplicados, IDs inválidos/inexistentes, stock insuficiente, período inválido, usuario inactivo).
- No se modifica backend, frontend ni base de datos (solo datos temporales que se limpian al final).

## 4. Herramienta
- **Postman** (colección v2.1.0) con scripts `pm.test`.
- Backend local ejecutándose en `http://localhost:3000` (requiere base de datos levantada).

## 5. Base URL
- Variable `{{baseUrl}}` = `http://localhost:3000`.

## 6. Estructura de la colección
- Colección: `postman/GA7-AA5-EV04-Restaurante-Baluarte.postman_collection.json`
- Environment de ejemplo: `postman/GA7-AA5-EV04-Restaurante-Baluarte.local.example.postman_environment.json`

| # | Carpeta | Requests |
|---|---|---|
| 01 | Auth | 7 |
| 02 | Productos | 9 |
| 03 | Usuarios | 7 |
| 04 | Ventas | 6 |
| 05 | Facturas | 3 |
| 06 | Recetas | 8 |
| 07 | Configuracion | 3 |
| 08 | Metas | 2 |
| 09 | Reportes | 1 |
| 10 | Inventario | 1 |
| 11 | Dashboard | 1 |
| 12 | Auxiliares | 2 |
| 13 | Limpieza | 8 |
| **Total** | | **58** |

### Variables
| Variable | Valor | Uso |
|---|---|---|
| `baseUrl` | http://localhost:3000 | URL base |
| `testEmail` | test.ev04@baluarte.local | usuario temporal de auth |
| `testPassword` | CAMBIAR_EN_POSTMAN | contraseña temporal (cambiar localmente en Postman) |
| `idProducto` | (se llena en ejecución) | producto temporal |
| `idUsuario` | (se llena en ejecución) | usuario administrativo temporal |
| `idUsuarioAuth` | (se llena en ejecución) | usuario temporal de auth |
| `idReceta` | (se llena en ejecución) | receta temporal |
| `idFactura` | (se llena en ejecución) | factura temporal |

## 7. Recursos y endpoints probados
Ver `endpoints-api-restaurante-baluarte.md` (lista completa agrupada por recurso).

## 8. Casos positivos (resumen)
- **Auth:** registro exitoso (201), login exitoso (200).
- **Productos / Usuarios / Recetas:** GET lista, GET por id, POST (201), PUT (200), DELETE (200 en limpieza).
- **Ventas:** POST (201) transaccional (factura + detalle + descuento de stock).
- **Facturas:** GET lista, GET por id (con detalle), DELETE (restaura stock).
- **Configuración:** GET, PUT.
- **Metas / Reportes / Inventario / Dashboard:** GET resumen.
- **Auxiliares:** health check + prueba-db.

## 9. Casos negativos (resumen)
- **Validación:** campos faltantes (nombre, cliente, contraseña), datos inválidos, rol/estado/método de pago inválido, IVA fuera de rango.
- **Duplicados:** correo ya registrado (auth y usuarios), receta duplicada por producto.
- **IDs:** inválidos (400) e inexistentes (404).
- **Negocio:** stock insuficiente, producto inexistente, período inválido.
- **Autenticación:** credenciales inválidas (401), usuario inactivo (403).

## 10. Códigos HTTP verificados
`200` éxito · `201` creación · `400` validación/negocio · `401` credenciales inválidas · `403` usuario inactivo · `404` recurso no encontrado.

## 11. Estrategia de datos temporales
- Todo dato creado usa identificador claro (`TEST-EV04`, `*.ev04@baluarte.local`).
- Los IDs devueltos por los POST se guardan en variables de colección para encadenar GET/PUT/DELETE y la limpieza.
- No se tocan los datos originales: productos semilla 1–4, usuarios reales/semilla, categorías 1–3 y configuración original.

## 12. Limpieza (orden)
1. DELETE factura temporal (restaura stock).
2. Verificar stock restaurado.
3. DELETE receta temporal.
4. DELETE producto temporal.
5. DELETE usuario administrativo temporal.
6. DELETE usuario temporal de auth.
7. PUT restaurar configuración (`nombre = Restaurante Baluarte`, `meta_mensual = 50000000`, `iva = 19`).
8. Verificar estado final (solo 4 productos semilla).

## 13. Seguridad
- No se incluyen contraseñas reales, hashes, salts, tokens ni claves API.
- `testPassword = CAMBIAR_EN_POSTMAN` (placeholder; se cambia localmente en Postman).
- Las respuestas de auth/usuarios se validan para que NO expongan `contrasena_hash`, `salt` ni `contrasena`.

## 14. Resultados esperados
- Todos los `pm.test` en verde (PASS) tras una ejecución ordenada (01 → 13).
- Base de datos restaurada a su estado original al finalizar la limpieza.

## 15. Git/GitHub
- Rama: `main`.
- Los artefactos de EV04 (colección + environment + documentación) se agregan sin modificar backend, frontend ni base de datos.
- Commit/push pendiente de autorización del autor.
