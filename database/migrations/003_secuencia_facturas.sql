-- ============================================================
-- MIGRACIÓN 003: SECUENCIA EMPRESARIAL DE FACTURAS
-- Restaurante Baluarte
--
-- REQUIERE la tabla "secuencias" creada en la migración 002.
--
-- PROBLEMA QUE RESUELVE: el número de factura (FAC-000001) se
-- generaba a partir del último id_factura EXISTENTE. Esto:
--   a) REUTILIZABA números de facturas eliminadas (la de mayor
--      id), perdiendo trazabilidad.
--   b) No era atómico ante ventas simultáneas (el UNIQUE de la
--      columna rechazaba una de las dos y la venta fallaba).
--
-- SOLUCIÓN: la numeración pasa a la secuencia "factura_numero",
-- asignada con bloqueo de fila (SELECT ... FOR UPDATE) dentro de
-- la transacción de la venta: dos ventas simultáneas obtienen
-- números distintos y el contador NUNCA retrocede, por lo que un
-- número ya asignado (aunque su factura se elimine después) no
-- se vuelve a usar.
--
-- NOTA DE TRAZABILIDAD: los huecos históricos de numeración (por
-- facturas eliminadas con el flujo anterior) NO se rellenan ni se
-- renumeran; se conservan como parte de la historia y pueden
-- explicarse consultando la tabla.
--
-- CÓMO APLICAR (ver instrucciones en README.md de esta carpeta):
--   USE restaurante_baluarte; y ejecutar este archivo completo.
--
-- Verificación:
--   SELECT * FROM secuencias WHERE nombre = 'factura_numero';
-- ============================================================

USE restaurante_baluarte;

-- La secuencia arranca en el MAYOR número de factura ya usado.
INSERT INTO secuencias (nombre, valor)
SELECT 'factura_numero', COALESCE(MAX(CAST(SUBSTRING(numero_factura, 5) AS UNSIGNED)), 0)
FROM facturas
ON DUPLICATE KEY UPDATE valor = GREATEST(valor, VALUES(valor));
