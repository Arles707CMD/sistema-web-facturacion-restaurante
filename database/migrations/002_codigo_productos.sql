-- ============================================================
-- MIGRACIÓN 002: CÓDIGO EMPRESARIAL DE PRODUCTOS + SECUENCIAS
-- Restaurante Baluarte
--
-- PROBLEMA QUE RESUELVE: el "código" P0XX no existía en la base
-- de datos; el frontend lo calculaba a partir del id_producto
-- (PK autoincremental), lo que producía saltos como P004 → P046
-- cuando el AUTO_INCREMENT consumía ids (inserciones previas
-- eliminadas o fallidas).
--
-- SOLUCIÓN: la tabla productos gana una columna "codigo" UNIQUE
-- independiente de la clave primaria. Los productos EXISTENTES
-- conservan exactamente el código que hoy ven los usuarios
-- (P + su id con padding), sin renumerar nada. Los productos
-- NUEVOS reciben el siguiente código desde la tabla "secuencias"
-- (mayor código asignado + 1), asignado con bloqueo de fila
-- (SELECT ... FOR UPDATE) dentro de la transacción de creación,
-- lo que impide códigos duplicados ante creaciones simultáneas.
--
-- IMPORTANTE (trazabilidad): no se rellenan huecos históricos ni
-- se reutilizan códigos de productos eliminados; la secuencia
-- siempre continúa desde el mayor código asignado.
--
-- CÓMO APLICAR (ver instrucciones en README.md de esta carpeta):
--   USE restaurante_baluarte; y ejecutar este archivo completo.
--
-- Verificación:
--   SELECT codigo, nombre FROM productos ORDER BY id_producto;
--   SELECT * FROM secuencias WHERE nombre = 'producto_codigo';
-- ============================================================

USE restaurante_baluarte;

-- 1) Columna código (nullable al principio para poder rellenarla).
ALTER TABLE productos
    ADD COLUMN codigo VARCHAR(10) DEFAULT NULL AFTER id_producto;

-- 2) Los productos existentes conservan su código visual actual.
UPDATE productos
SET codigo = CONCAT('P', LPAD(id_producto, 3, '0'))
WHERE codigo IS NULL;

-- 3) Restricción UNIQUE: impide códigos duplicados (respaldo de
--    la asignación atómica de la aplicación).
ALTER TABLE productos
    ADD UNIQUE KEY uq_productos_codigo (codigo);

-- 4) Tabla de secuencias empresariales (contador independiente
--    de los ids autoincrementales; sobrevive a eliminaciones).
CREATE TABLE IF NOT EXISTS secuencias (
    nombre VARCHAR(50) NOT NULL,
    valor BIGINT NOT NULL DEFAULT 0 COMMENT 'Último valor empresarial usado',
    PRIMARY KEY (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) La secuencia de productos arranca en el MAYOR código ya
--    asignado (p. ej. si existe P046, el siguiente será P047).
INSERT INTO secuencias (nombre, valor)
SELECT 'producto_codigo', COALESCE(MAX(CAST(SUBSTRING(codigo, 2) AS UNSIGNED)), 0)
FROM productos
ON DUPLICATE KEY UPDATE valor = GREATEST(valor, VALUES(valor));
