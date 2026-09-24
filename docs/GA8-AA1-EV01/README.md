# GA8-220501096-AA1-EV01 — Integración de módulos del software

## 1. Identificación
| Campo | Valor |
|---|---|
| Proyecto | Sistema Web de Facturación Restaurante Baluarte |
| Evidencia | GA8-220501096-AA1-EV01 — Desarrollar software a partir de la integración de sus módulos componentes |
| Repositorio | https://github.com/Arles707CMD/sistema-web-facturacion-restaurante.git |
| Arquitectura | routes → controllers → services → models → MySQL/MariaDB (mysql2) |

## 2. Requisitos
- Node.js (v18 o superior).
- npm.
- XAMPP o MySQL/MariaDB en ejecución (puerto 3306).
- Navegador web.

## 3. Base de datos
- Nombre de la base de datos: `restaurante_baluarte`.
- Importar el script `database/restaurante_baluarte.sql`:
  - Con phpMyAdmin: importar el archivo en el servidor.
  - Por consola: `mysql -u root -p < restaurante_baluarte.sql`.

## 4. Backend
```bash
cd backend
npm install
npm start
```
- URL: `http://localhost:3000`
- Health check: `http://localhost:3000/`
- Verificación de conexión BD: `http://localhost:3000/api/prueba-db`

## 5. Frontend
```bash
cd frontend
npm install
npm run dev
```
- URL: `http://localhost:5173` (Vite redirige `/api` al backend `localhost:3000` mediante proxy).

## 6. Configuración (backend/.env)
- Copiar `backend/.env.example` → `backend/.env` y ajustar los valores locales.
- Variables usadas: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `PORT`.
- El archivo `.env` **NO se sube a GitHub** (está en `.gitignore`). El `.env.example` sí se versiona y no contiene secretos.

## 7. Inicio de sesión
- Si no existen credenciales de demostración conocidas, **registrar un usuario nuevo** desde el propio Login:
  1. Pulsar “Crear una cuenta”.
  2. Ingresar nombre, correo y contraseña (mínimo 6 caracteres).
  3. El sistema crea el usuario con rol `Ventas` y estado `Activo`.
  4. Iniciar sesión con ese correo y contraseña.

## 8. Recuperación de contraseña (“¿Olvidaste tu contraseña?”)
- El enlace está presente en el login, pero **por ahora no tiene flujo funcional de extremo a extremo**.
- Para habilitarlo se requiere un **servicio de correo/SMTP** que permita entregar el enlace o código de recuperación al usuario.
- Diseño requerido (cuando exista SMTP): token criptográficamente seguro con vencimiento, almacenar solo un **hash** del token, token de **un solo uso**, validación de contraseña con el mismo mecanismo de hash scrypt del sistema, y respuestas genéricas que **no revelen si el correo existe**.
- **No se implementó** una recuperación falsa ni se exponen tokens en la interfaz.

## 9. Módulos integrados
- Login · Registro · Dashboard · Ventas · Facturas · Productos · Inventario · Metas · Recetas · Usuarios · Reportes · Configuración.
- Todos consumen la API real (proxy `/api` → `localhost:3000`) y la base de datos MySQL/MariaDB.

## 10. Correcciones aplicadas (GA8 - AA1 - EV01)
- `backend/.env.example` creado (documenta variables locales sin secretos).
- Manejo controlado de errores de integridad en DELETE (productos, recetas, usuarios) → `400` con mensaje claro en lugar de `500`.
- Documentación de ejecución local (este archivo).
- La recuperación de contraseña se documenta como pendiente de un servicio SMTP (no se implementa solución falsa).