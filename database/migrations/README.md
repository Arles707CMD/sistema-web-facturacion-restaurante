# Migraciones SQL — Restaurante Baluarte

Este proyecto **no usaba migraciones** (solo existía el script completo
`database/restaurante_baluarte.sql`). Esta carpeta introduce migraciones
versionadas e independientes para aplicar sobre bases de datos ya creadas.

## Orden de aplicación (obligatorio)

| # | Archivo | Qué hace |
|---|---------|----------|
| 001 | `001_tokens_recuperacion.sql` | Tabla `tokens_recuperacion` para el flujo de recuperación de contraseña. |
| 002 | `002_codigo_productos.sql` | Columna `codigo` UNIQUE en `productos` + tabla `secuencias` (fila `producto_codigo`). |
| 003 | `003_secuencia_facturas.sql` | Fila `factura_numero` en `secuencias`. **Requiere 002.** |

## Cómo aplicarlas en la base de datos de producción (Aiven)

> ⚠️ Aplica primero en un entorno de pruebas. Haz copia de seguridad
> (backup) antes de tocar producción. Ejecuta los archivos **en orden**.

1. Entra a la **consola de Aiven** → tu servicio MySQL → *Backup and restore*
   (crea un backup) y luego abre la herramienta de consultas SQL.
2. Conéctate también por CLI si lo prefieres:
   ```
   mysql -h <host-de-aiven> -P <puerto> -u <usuario> -p --ssl-mode=REQUIRED restaurante_baluarte
   ```
3. Ejecuta el contenido completo de cada archivo en orden
   (001 → 002 → 003). Todas usan `USE restaurante_baluarte;`.
4. Verifica:
   ```sql
   SHOW TABLES LIKE 'tokens_recuperacion';
   SHOW COLUMNS FROM productos LIKE 'codigo';
   SELECT * FROM secuencias;
   ```
   Deben aparecer la tabla de tokens, la columna `codigo` y las filas
   `producto_codigo` y `factura_numero` con el mayor valor ya asignado.

## Compatibilidad del backend durante el despliegue

El backend está preparado para funcionar **antes y después** de aplicar las
migraciones: si detecta que la tabla `secuencias` o la columna `codigo` aún no
existen, usa el comportamiento anterior (productos sin código empresarial —
el frontend muestra el cálculo provisional por id — y numeración de facturas
por último número existente). Al aplicar las migraciones, los flujos nuevos
se activan automáticamente sin reinicios.

## Reversibilidad

- **001**: `DROP TABLE IF EXISTS tokens_recuperacion;` (no afecta tablas previas).
- **002**: `ALTER TABLE productos DROP FOREIGN KEY` no aplica; basta
  `ALTER TABLE productos DROP KEY uq_productos_codigo, DROP COLUMN codigo;`
  y `DROP TABLE IF EXISTS secuencias;`.
- **003**: `DELETE FROM secuencias WHERE nombre = 'factura_numero';`.
