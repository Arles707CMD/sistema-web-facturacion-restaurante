# Preparación de hosting gratuito — Restaurante Baluarte

Guía para publicar el sistema en hosting gratuito para las evidencias SENA
(GA8-220501096-AA1-EV01 y GA8-220501096-AA1-EV02).

Este documento **prepara** el despliegue: no se ha creado ningún servicio
todavía y no se requiere tarjeta ni plan de pago.

---

## 1. Arquitectura del despliegue

| Capa | Servicio | Qué se publica | Costo |
|---|---|---|---|
| Frontend | **Netlify** | Aplicación React + Vite compilada (`frontend/dist`) | Plan gratuito |
| Backend | **Render** | API Node.js + Express (`backend/`) | Plan gratuito (Web Service) |
| Base de datos | **Aiven** | MySQL independiente del equipo local | Plan gratuito |

Flujo de una petición:

```
Navegador → Netlify (frontend React)
   └─ llama a /api/... → Render (backend Express, JWT + RBAC)
                            └─ consulta con TLS → Aiven (MySQL)
```

El frontend llama a rutas relativas `/api/...`. En local funciona por el
proxy de Vite; en producción funcionará por la regla de proxy de Netlify
(ver sección 7).

---

## 2. Configurar el backend en Render

1. En Render, crear un **Web Service** conectado al repositorio de GitHub.
2. Indicar el directorio raíz del servicio: `backend`.
3. Render detecta el `package.json`:
   - Build command: `npm install`
   - Start command: `npm start` (ejecuta `node app.js`, script `start`
     definido en `backend/package.json`).
4. Render asigna automáticamente la variable `PORT` y el backend escucha
   en ella (`app.js` ya usa `process.env.PORT || 3000`).
5. Definir las variables de entorno en el panel de Render (Environment),
   con los valores reales de Aiven (ver sección 3). Nunca subir el
   archivo `backend/.env` a Git: en el hosting las variables se configuran
   en el panel.
6. Health check path sugerido: `/` (responde JSON de confirmación).
   `/api/prueba-db` permite verificar la conexión con la base de datos.

Nota: en el plan gratuito, Render apaga el servicio tras ~15 minutos sin
tráfico y lo despierta con la primera petición (arranque en frío de
30–60 segundos).

---

## 3. Variables necesarias para la conexión con Aiven

En el panel de Render (Environment del backend) configurar:

| Variable | Valor |
|---|---|
| `DB_HOST` | Host del servicio MySQL de Aiven |
| `DB_PORT` | Puerto del servicio (Aiven NO usa 3306) |
| `DB_USER` | Usuario del servicio (p. ej. el usuario admin de Aiven) |
| `DB_PASSWORD` | Contraseña del usuario |
| `DB_NAME` | Nombre de la base de datos (p. ej. la base por defecto del servicio o la creada al importar el esquema) |
| `DB_SSL` | `true` (Aiven exige TLS) |
| `DB_CA_CERT_BASE64` | Certificado CA de Aiven codificado en Base64 (ver sección 4) |
| `JWT_SECRET` | Secreto largo y único, distinto del usado localmente |
| `TOKEN_EXPIRA` | Duración del token JWT (p. ej. `2h`) |
| `CLIENT_ORIGIN` | URL pública real del frontend en Netlify (se completa tras publicarlo) |
| `PORT` | La asigna Render automáticamente; no hay que definirla |

La contraseña, el usuario y el certificado se obtienen del panel de Aiven
(service overview → conexión). Nunca escribirlos en archivos del
repositorio ni compartirlos en el informe de la evidencia.

---

## 4. Configuración TLS para MySQL

Aiven exige conexiones cifradas. El backend ya incluye soporte opcional
en `backend/config/database.js`:

- Si `DB_SSL` está ausente o es `false`: la conexión local actual
  (XAMPP/MariaDB) funciona exactamente igual que antes.
- Si `DB_SSL=true`: el backend decodifica el certificado CA desde Base64
  (`DB_CA_CERT_BASE64`) y configura el pool de mysql2 con
  `rejectUnauthorized: true`: la validación del certificado del servidor
  **nunca se deshabilita**.
- Si `DB_SSL=true` y falta `DB_CA_CERT_BASE64`, el backend no arranca con
  un mensaje de error claro que solo menciona nombres de variables (no
  expone contraseñas ni certificados en los logs).

Cómo obtener el valor de `DB_CA_CERT_BASE64`:

1. En Aiven, descargar el archivo `ca.pem` del servicio MySQL.
2. Codificarlo a Base64 (una sola línea). En Windows (PowerShell):

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("ca.pem"))
   ```

3. Copiar la línea resultante como valor de `DB_CA_CERT_BASE64` en el
   panel de Render.

Importación del esquema: usar el archivo `database/restaurante_baluarte.sql`
del repositorio (esquema + datos semilla, sin datos del negocio) con un
cliente MySQL conectado por TLS al servicio de Aiven (p. ej. `mysql` CLI).
No importar la base local. Tras el primer login en producción se recomienda
rotar las contraseñas de los usuarios semilla.

---

## 5. Configuración de Netlify

El repositorio ya incluye `netlify.toml` en la raíz:

- Directorio base: `frontend`.
- Comando de compilación: `npm run build`.
- Directorio publicado: `dist`.
- Versión de Node para compilar: `22`.

Pasos cuando se cree el servicio (sin costo):

1. En Netlify, conectar el repositorio de GitHub ("Add new site" →
   "Import an existing project").
2. Netlify lee `netlify.toml` automáticamente; no hay que escribir nada
   más en el panel de build.
3. Al terminar la compilación, Netlify entrega una URL pública del
   frontend (algo como `https://<nombre-del-sitio>.netlify.app`).
4. Esa URL se usa después como valor de `CLIENT_ORIGIN` en el panel de
   Render, para que el backend acepte las peticiones del frontend por CORS.

---

## 6. Regla SPA

El frontend es una Single Page Application con React Router. Rutas como
`/dashboard`, `/ventas`, `/productos` o `/facturas` **no existen como
archivos** en `dist/`: si un usuario recarga la página en esa ruta,
Netlify buscaría un archivo inexistente y devolvería 404.

`netlify.toml` incluye la regla:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Con esta regla, al recargar cualquier ruta Netlify devuelve `index.html`
(código 200) y React Router resuelve la ruta en el navegador.

---

## 7. Regla de proxy de la API (PENDIENTE de la URL de Render)

Hoy el frontend llama a rutas relativas `/api/...` (p. ej.
`/api/productos`). En Netlify esas rutas no existen: habría que
redirigirlas al backend real en Render.

**Esta regla todavía NO está activa** porque aún no existe una URL pública
confirmada del backend. `netlify.toml` la trae documentada como comentario
antes de la regla SPA:

```toml
# [[redirects]]
#   from = "/api/*"
#   to = "https://<url-del-backend>/api/:splat"
#   status = 200
#   force = true
```

Cuando el backend esté publicado en Render:

1. Copiar la URL pública real del servicio.
2. Descomentar el bloque y sustituir `<url-del-backend>` por esa URL.
3. **Colocar el bloque ANTES de la regla SPA** (`from = "/*"`), porque
   Netlify aplica la primera regla que coincide: si la regla SPA estuviera
   antes, capturaría también las rutas `/api/*` y devolvería `index.html`
   en lugar de la respuesta JSON del backend.
4. Volver a desplegar Netlify para que la regla surta efecto.

No se configuró ninguna URL inventada ni se modificaron los archivos API
del frontend: siguen usando rutas relativas `/api/...`.

---

## 8. Orden recomendado para desplegar

1. **Aiven**: crear el servicio MySQL (plan gratuito) y descargar
   credenciales + certificado CA.
2. **Importar el esquema** `database/restaurante_baluarte.sql` al servicio
   de Aiven por TLS (solo el archivo del repositorio; no la base local).
3. **Render**: crear el Web Service del backend (`backend/`), configurar
   las variables de entorno (sección 3) con `DB_SSL=true` y verificar
   `GET /` y `GET /api/prueba-db`.
4. **Netlify**: publicar el frontend; Netlify compila con `netlify.toml`.
5. **CORS**: en Render, actualizar `CLIENT_ORIGIN` con la URL pública
   real de Netlify.
6. **Proxy**: descomentar la regla `/api/*` en `netlify.toml` con la URL
   real de Render (antes de la regla SPA) y redesplegar Netlify.
7. **Pruebas end-to-end**: login/JWT, roles, dashboard, productos, ventas,
   facturas, inventario, metas, recetas, usuarios, reportes,
   configuración, flujo venta→factura→stock, logout y exportaciones CSV.
8. **Sustentación**: documentar URLs y evidencias.

---

## 9. Medidas de seguridad

- `backend/.env` está excluido de Git (`.gitignore`); los secretos solo
  se configuran en los paneles de Render/Netlify/Aiven.
- `JWT_SECRET` se lee de variables de entorno (nunca queda en el código);
  en producción usar un secreto largo y único, distinto del local.
- CORS del backend refleja únicamente el origen del frontend
  (`CLIENT_ORIGIN`): peticiones de otros orígenes son bloqueadas.
- TLS hacia MySQL con `rejectUnauthorized: true`: la validación del
  certificado del servidor nunca se deshabilita.
- Las respuestas del backend no exponen hashes ni contraseñas, y el
  login tiene límite de intentos por IP + correo.
- Tras el primer login en producción, rotar las contraseñas de los
  usuarios semilla del esquema.
- No compartir credenciales, tokens ni el certificado CA en los informes
  de evidencias.

---

## 10. Limitaciones de los planes gratuitos

Estos límites cambian con el tiempo; verificarlos en cada servicio antes
de la sustentación. **No hay garantía de disponibilidad permanente**.

| Servicio | Límites típicos del plan gratuito |
|---|---|
| **Render** | El Web Service se apaga tras ~15 min sin tráfico (arranque en frío de 30–60 s en la primera petición). ~750 h/mes de instancia. Ancho de banda limitado. Un solo nodo. |
| **Netlify** | ~100 GB de ancho de banda/mes y ~300 min de compilación/mes (de sobra para este proyecto). |
| **Aiven** | Plan gratuito de MySQL: 1 nodo, ~1 CPU / 1 GB RAM / 5 GB de almacenamiento, TLS obligatorio. Sin réplicas ni copias de seguridad de larga retención. |

Consecuencias prácticas:

- El sistema puede "tardar en responder" la primera vez tras un rato de
  inactividad: es el arranque en frío de Render, no un error.
- La base de datos gratuita no debe considerarse persistente a largo
  plazo: exportar respaldos con regularidad.
- Los tres servicios pueden cambiar o suspender planes gratuitos: las
  evidencias deben documentar las URLs y el estado al momento de la
  sustentación.

---

## Tareas pendientes para el despliegue real

- [ ] Crear el servicio MySQL en Aiven (plan gratuito) y obtener
      credenciales + certificado CA.
- [ ] Importar `database/restaurante_baluarte.sql` por TLS.
- [ ] Crear el Web Service en Render con `backend/` y sus variables.
- [ ] Verificar `GET /` y `GET /api/prueba-db` en Render.
- [ ] Publicar el frontend en Netlify y obtener su URL pública.
- [ ] Configurar `CLIENT_ORIGIN` en Render con la URL de Netlify.
- [ ] Descomentar y completar la regla de proxy `/api/*` en `netlify.toml`
      (antes de la regla SPA) con la URL real de Render.
- [ ] Ejecutar las pruebas end-to-end de la sección 8.
- [ ] Rotar las contraseñas de los usuarios semilla.
