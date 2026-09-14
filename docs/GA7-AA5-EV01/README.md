# GA7-220501096-AA5-EV01 — Servicio Web de Autenticación (Restaurante Baluarte)

## 1. Identificación del proyecto
- **Proyecto:** Sistema Web de Facturación Restaurante Baluarte.
- **Evidencia:** GA7-220501096-AA5-EV01 — Servicio web de autenticación sobre capas y estándares.
- **Repositorio:** https://github.com/Arles707CMD/sistema-web-facturacion-restaurante.git
- **Pila tecnológica:** Node.js + Express, React + Vite, MariaDB (MySQL2).

## 2. Objetivo
Refactorizar la autenticación existente hacia una arquitectura clara y segura por capas
**rutas → controladores → servicios → modelos**, separando la lógica de negocio del manejo
HTTP, y validar el servicio con una colección Postman y pruebas automatizadas.

## 3. Arquitectura por capas
La autenticación quedó organizada en cuatro capas, cada una con una única responsabilidad:

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Rutas** | `backend/routes/authRoutes.js` | Define las URL (`/login`, `/register`) y enlaza con el controlador. |
| **Controlador** | `backend/controllers/authController.js` | Recibe la petición HTTP, llama al servicio y traduce el resultado a `res.status(...).json(...)`. |
| **Servicio** | `backend/services/authService.js` | Lógica de negocio: validación, generación/verificación de hash (scrypt), orquestación con el modelo. |
| **Modelo** | `backend/models/usuarioModel.js` | Acceso a datos: `obtenerUsuarioParaAutenticacion`, `existeCorreo`, `crearUsuario`. |

El flujo es unidireccional: **ruta → controlador → servicio → modelo**, sin que ninguna capa
salte a una inferior. El controlador no conoce SQL ni criptografía; el servicio no conoce Express.

## 4. Estructura de carpetas (backend)
```
backend/
├── config/          # conexión a MariaDB (.env)
├── controllers/     # solo HTTP/respuestas
│   └── authController.js
├── models/          # acceso a datos
│   └── usuarioModel.js
├── routes/          # definición de endpoints
│   └── authRoutes.js
├── services/        # lógica de negocio
│   └── authService.js
└── app.js           # arranque de Express
```

## 5. Endpoints del servicio

### 5.1 REGISTER
- **Método / URL:** `POST /api/auth/register`
- **Body (JSON):**
```json
{ "nombre": "Usuario Prueba", "correo": "usuario.prueba@baluarte.local", "contrasena": "Prueba123" }
```
- **Respuesta 201 (éxito):** nunca incluye contraseña, hash ni salt.
```json
{
  "mensaje": "Usuario registrado correctamente.",
  "usuario": { "id_usuario": 1, "nombre": "Usuario Prueba", "correo": "usuario.prueba@baluarte.local", "rol": "Ventas", "estado": "Activo" }
}
```
- **Errores:** `400` (nombre vacío, correo inválido, contraseña < 6, correo duplicado) · `500` (error interno).

### 5.2 LOGIN
- **Método / URL:** `POST /api/auth/login`
- **Body (JSON):**
```json
{ "correo": "usuario.prueba@baluarte.local", "contrasena": "Prueba123" }
```
- **Respuesta 200 (éxito):** devuelve el usuario seguro (sin hash, salt ni contraseña).
```json
{ "mensaje": "Inicio de sesión correcto", "usuario": { "id_usuario": 1, "nombre": "...", "correo": "...", "rol": "Ventas", "estado": "Activo" } }
```
- **Errores:** `400` (campos faltantes) · `401` (credenciales inválidas — mensaje genérico) · `403` (usuario inactivo) · `500` (error interno).

## 6. Seguridad implementada
- **Hash de contraseñas con `scrypt`** (función de derivación con costo de memoria alto).
- **Salt aleatorio por usuario**: se guarda el valor `sal:hash` (32 hex + 128 hex), de modo que dos
  contraseñas iguales producen hashes distintos.
- **Comparación con `timingSafeEqual`** para evitar ataques de tiempo.
- **Respuestas sin información sensible**: nunca se devuelven contraseña, hash ni salt.
- **Errores genéricos en login** (`401`) para no revelar si el correo existe o no.
- **Rol y estado fijados en el servicio** (`Ventas` / `Activo`) para impedir el escalado de privilegios.
- **Variables de entorno** para credenciales de BD (`.env` no se versiona).
## 7. Colección Postman
Archivo: `postman/GA7-AA5-EV01-Restaurante-Baluarte.postman_collection.json`
- 8 peticiones (4 de registro + 4 de login) con scripts `pm.test` que validan código de estado
  y la ausencia de `hash`/`salt`/`contrasena` en las respuestas.

## 8. Environment de ejemplo
Archivo: `postman/Restaurante-Baluarte.local.example.postman_environment.json`
| Variable | Valor de ejemplo | Descripción |
|----------|------------------|-------------|
| `baseUrl` | `http://localhost:3000` | Raíz de la API. |
| `testEmail` | `usuario.prueba@baluarte.local` | Correo del usuario de prueba. |
| `testPassword` | `CAMBIAR_EN_POSTMAN` | Contraseña de prueba (definirla en Postman, sin credenciales reales). |

> No contiene credenciales reales ni secretos de producción.

## 9. Casos de prueba y resultados
Ejecutados contra la API local (`http://localhost:3000`). Usuario de prueba: `usuario.aa5@baluarte.local` / `Aa5Prueba123!`.

| # | Caso | Esperado | Resultado |
|---|------|----------|-----------|
| 1 | Registro exitoso | 201 | ✔ PASS |
| 2 | Registro correo duplicado | 400 | ✔ PASS |
| 3 | Registro nombre vacío | 400 | ✔ PASS |
| 4 | Registro correo inválido | 400 | ✔ PASS |
| 5 | Registro contraseña corta | 400 | ✔ PASS |
| 6 | Login exitoso | 200 | ✔ PASS |
| 7 | Login contraseña incorrecta | 401 | ✔ PASS |
| 8 | Login correo inexistente | 401 | ✔ PASS |
| 9 | Login usuario inactivo | 403 | ✔ PASS |
| 10 | Login campos faltantes | 400 | ✔ PASS |

Además, se validó que las respuestas de registro y login **no exponen** hash, salt ni contraseña.

## 10. Verificación en base de datos y limpieza
- Se consultó la tabla `usuarios` y se verificó que la contraseña **NO está en texto plano** y que el
  valor almacenado tiene **formato `salt:hash`** (salt = 32 hex, hash = 128 hex, generados con scrypt).
- El usuario de prueba fue **eliminado** al finalizar las pruebas (quedan solo los 4 usuarios semilla).
- No quedan datos temporales en el repositorio ni en la base de datos.

## 11. Pruebas de regresión
- **Build del frontend:** `npm run build` finalizó correctamente (solo aviso de tamaño de chunk, no error).
- **Smoke test de los demás módulos:** 9/9 endpoints responden (dashboard, productos, usuarios,
  facturas, inventario, recetas, reportes, metas, configuración).
- **Login existente intacto:** `arles@baluarte.com` inicia sesión correctamente (rol Administrador).
- **Frontend actualizado:** la llamada de registro ahora apunta a `/api/auth/register` y el flujo por
  el proxy de Vite (`:5173`) responde 201.

## 12. Cómo levantar el proyecto
```bash
# Backend (puerto 3000)
cd backend
npm install
npm start          # o: node app.js

# Frontend (puerto 5173, con proxy a /api)
cd frontend
npm install
npm run dev
```

## 13. Cómo usar la colección Postman
1. Abre Postman → Import → selecciona `postman/GA7-AA5-EV01-Restaurante-Baluarte.postman_collection.json`.
2. Importa el environment `postman/Restaurante-Baluarte.local.example.postman_environment.json`.
3. Configura `testPassword` (y `testEmail` si lo deseas) con el usuario de prueba.
4. Ejecuta las peticiones en orden (01 → 08); las pruebas `pm.test` se muestran en la pestaña **Test Results**.

