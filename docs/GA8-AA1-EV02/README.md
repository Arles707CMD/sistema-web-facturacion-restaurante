# GA8-220501096-AA1-EV02 — Seguridad: autenticación JWT y control de acceso por roles (RBAC)

## 1. Identificación
| Campo | Valor |
|---|---|
| Proyecto | Sistema Web de Facturación Restaurante Baluarte |
| Evidencia | GA8-220501096-AA1-EV02 — Configurar seguridad del software: autenticación JWT, control de acceso por roles (RBAC), rate limiting, CORS y cabeceras anti-caché |
| Repositorio | https://github.com/Arles707CMD/sistema-web-facturacion-restaurante.git |
| Arquitectura | routes → controllers → services → models → MySQL/MariaDB (mysql2) · Frontend React + Vite |

## 2. Alcance implementado (plan de FASES 1-12)

### Backend
1. **Dependencia** `jsonwebtoken` añadida (`backend/package.json`).
2. **Middleware de seguridad** (`backend/middleware/authMiddleware.js`):
   - `autenticar` — valida el token JWT `Bearer` y adjunta `req.usuario = { id_usuario, rol }`.
   - `autorizarRol(...roles)` — devuelve **403** si el rol del usuario no está permitido.
   - `rateLimitLogin` — **5 intentos fallidos por IP+correo en 15 minutos** (responde 429; se reinicia al iniciar sesión correctamente).
   - `noCache` y `seguridadHeaders` — cabeceras anti-caché y de seguridad en todas las respuestas.
3. **Login con JWT** (`backend/services/authService.js`, `backend/controllers/authController.js`):
   - `POST /api/auth/login` ahora devuelve `{ mensaje, usuario, token, expiraEn }`.
   - El token incluye `id_usuario` y `rol`; expira según `TOKEN_EXPIRA` (por defecto `2h`).
   - Las respuestas **nunca exponen** `contrasena_hash`, `salt` ni `contrasena`.
4. **RBAC aplicado en todas las rutas** (`backend/routes/*.js`):

   | Módulo | Lectura (GET) | Escritura |
   |---|---|---|
   | `/api/auth/login`, `/api/auth/register` | pública | pública (login con rate limit) |
   | `/api/productos` | cualquier rol autenticado | SOLO `Administrador`, `Inventario` (POST/PUT/DELETE) |
   | `/api/facturas` | cualquier rol autenticado | DELETE SOLO `Administrador` |
   | `/api/ventas` | — | SOLO `Administrador`, `Ventas` |
   | `/api/recetas` | SOLO `Administrador`, `Inventario` | SOLO `Administrador`, `Inventario` |
   | `/api/usuarios` | SOLO `Administrador` | SOLO `Administrador` |
   | `/api/configuracion` | SOLO `Administrador` | SOLO `Administrador` |
   | `/api/dashboard`, `/api/inventario`, `/api/metas`, `/api/reportes` | cualquier rol autenticado | — |
5. **CORS estricto** (`backend/app.js`): se refleja únicamente el origen configurado (`CLIENT_ORIGIN`), usando la librería `cors` con una función de origen. Peticiones de otros orígenes se atienden **sin cabeceras CORS** (el navegador las bloquea).
6. **Cabeceras anti-caché y de seguridad**: `Cache-Control: no-store...`, `Pragma: no-cache`, `Expires: 0`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`.
7. **Variables nuevas** en `backend/.env.example` (y en el `.env` local, que **no se sube a Git**):
   - `JWT_SECRET` — secreto para firmar/verificar tokens (obligatorio en producción).
   - `TOKEN_EXPIRA=2h` — duración del token.
   - `CLIENT_ORIGIN=http://localhost:5173` — origen permitido por CORS.
### Frontend
8. **Cliente HTTP compartido** (`frontend/src/api/apiClient.js`):
   - Añade automáticamente `Authorization: Bearer <token>` a todas las peticiones.
   - Al recibir **401** limpia la sesión y redirige a `/login` (sesión expirada o token inválido).
   - Los 10 módulos de API (`productoApi`, `usuarioApi`, `recetaApi`, `facturaApi`, `ventaApi`, `configuracionApi`, `metaApi`, `reporteApi`, `inventarioApi`, `dashboardApi`) ya no usan `fetch` directo: usan `apiClient`. La capa de autenticación (`authApi.js`) sigue usando `fetch` directo porque login/registro son públicos y devuelven 401 con credenciales incorrectas (sin redirigir).
9. **Sesión con token**: `Login.jsx` guarda `{ ...usuario, token, expiraEn }` en `sesionBaluarte`.
10. **Guard de rutas** (`frontend/src/components/common/ProtectedRoute.jsx`):
    - Redirige a `/login` si no hay sesión **con token**.
    - Redirige a `/dashboard` si el usuario intenta abrir un módulo cuyo rol no está permitido (definido en `frontend/src/config/navegacion.js`).
11. **Navegación por rol**: `navegacion.js` declara los `roles` permitidos por módulo y el `Sidebar` filtra los enlaces visibles. Botones de acción condicionados:
    - `Productos`: “Nuevo Producto”, editar y eliminar solo para `Administrador`/`Inventario`.
    - `Facturas`: eliminar factura solo para `Administrador`.
12. **Cabeceras anti-caché en Vite** (`frontend/vite.config.js`): `server.headers` y `preview.headers` con `Cache-Control: no-store...`, `Pragma: no-cache`, `Expires: 0`.

## 3. Matriz de pruebas ejecutadas (resultado 44/44)
Pruebas automatizadas con usuarios y datos **temporales** (prefijo `TEMP_PRUEBA_`), creados y **eliminados** al final:

| # | Prueba | Resultado |
|---|---|---|
| 1 | Login correcto devuelve `token` JWT y `expiraEn` futuro; no expone hash | PASS |
| 2 | Sin token → 401 · token inválido → 401 | PASS |
| 3 | RBAC: Ventas sin permiso en usuarios/configuración/recetas/productos/facturas → 403 · Inventario en ventas → 403 | PASS |
| 4 | Lecturas permitidas responden 200 (productos, facturas, dashboard, inventario, recetas, usuarios, configuración) | PASS |
| 5 | Productos: creación 201 con Inventario/Admin; 403 con Ventas | PASS |
| 6 | Ventas: 201 con Ventas (descuenta stock 50→48); 403 con Inventario | PASS |
| 7 | Facturas: DELETE 403 con Ventas; 200 con Admin (restaura stock 48→50) | PASS |
| 8 | CORS: refleja `http://localhost:5173`; no refleja otros orígenes | PASS |
| 9 | Cabeceras: `Cache-Control no-store`, `Pragma no-cache`, `Expires 0`, `nosniff`, `X-Frame-Options DENY` | PASS |
| 10 | Rate limit: 5 intentos fallidos → 401 y el 6º → 429 | PASS |
| 11 | Registro público → 201, sin hash en respuesta | PASS |
| 12 | Salud: `GET /` y `GET /api/prueba-db` → 200 (públicos) | PASS |

### Cómo usar el token en Postman (colección existente)
La colección `postman/GA7-AA5-EV04-Restaurante-Baluarte.postman_collection.json` no se modificó para no alterar la evidencia EV04. Para probar los endpoints protegidos con la nueva autenticación:

1. Enviar `POST /api/auth/login` con `{ "correo": "TU_CORREO", "contrasena": "TU_CLAVE" }`.
2. Copiar el valor de `token` de la respuesta.
3. Crear una variable (entorno/colección) llamada `token` con ese valor (un JWT válido dura `TOKEN_EXPIRA`, por defecto 2 h).
4. En cada petición protegida añadir la cabecera `Authorization: Bearer {{token}}`.
5. Respuestas esperadas: **401** sin token o con token vencido · **403** si el rol no tiene permiso · **429** tras 5 intentos de login fallidos en 15 min.

## 4. Cómo ejecutar
```bash
# 1) Base de datos: importar database/restaurante_baluarte.sql (XAMPP/MySQL en :3306)
# 2) Backend
cd backend
npm install            # instala jsonwebtoken (ya en package.json)
copy .env.example .env # y ajustar DB_* , JWT_SECRET, CLIENT_ORIGIN
npm start              # http://localhost:3000

# 3) Frontend
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxy /api → :3000)
```

## 5. Limitaciones y pendientes
- `JWT_SECRET` se configura en `.env` (local) o como variable de entorno (producción). **Nunca** versionar el `.env`.
- El rate limit del login se mantiene **en memoria** del proceso (adecuado para un solo servidor); para múltiples instancias se recomienda Redis.
- Pruebas de RBAC: como no se conocen las contraseñas de los usuarios semilla, las ejecuciones usan usuarios temporales (`TEMP_PRUEBA_*`) que se eliminan al terminar; no se alteran datos reales.
- Recuperación de contraseña (“¿Olvidaste tu contraseña?”) sigue pendiente de un servicio SMTP (documentado en GA8-AA1-EV01).