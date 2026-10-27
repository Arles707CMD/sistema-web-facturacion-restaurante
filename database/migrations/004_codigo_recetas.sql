-- ============================================================
-- MIGRACIÓN 004: CÓDIGO EMPRESARIAL DE RECETAS
-- Restaurante Baluarte
--
-- REQUIERE la tabla "secuencias" creada en la migración 002.
--
-- PROBLEMA QUE RESUELVE: el código REC-0XX no existía en la base
-- de datos; el frontend lo calculaba a partir del id_receta
-- (PK autoincremental). Por eso la primera receta visible mostró
-- REC-012: el AUTO_INCREMENT ya había consumido ids previos
-- (inserciones luego eliminadas durante pruebas), aunque solo
-- existía una receta en la tabla.
--
-- ESTADO VERIFICADO EN PRODUCCIÓN (consultas de solo lectura,
-- confirmadas por el propietario antes de esta migración):
--   * Existe EXACTAMENTE UNA receta: id_receta = 12,
--     id_producto = 48, estado = Activa.
--   * AUTO_INCREMENT de la tabla = 12.
--
-- SOLUCIÓN APLICADA:
--   1) La tabla recetas gana una columna "codigo" UNIQUE
--      independiente de la clave primaria (id_receta NO cambia;
--      id_producto NO cambia; las relaciones internas tampoco).
--   2) RENUMERACIÓN: la única receta existente (id_receta = 12,
--      condición verificada) pasa a mostrarse como REC-001.
--   3) La secuencia "receta_codigo" queda inicializada en 1,
--      por lo que la SIGUIENTE receta nueva recibirá REC-002,
--      luego REC-003, y así sucesivamente.
--   4) Las creaciones usan SELECT ... FOR UPDATE (transaccional):
--      dos recetas simultáneas nunca obtienen el mismo código y
--      no se reutilizan códigos de recetas eliminadas.
--
-- NOTA: el id interno sigue siendo una sola receta por producto
-- (UNIQUE uq_recetas_producto) y no se toca esa restricción.
--
-- PRE-REQUISITO DE VERIFICACIÓN (solo lectura, antes de aplicar):
--   SELECT COUNT(*) AS total, MIN(id_receta), MAX(id_receta) FROM recetas;
--   SELECT id_receta, id_producto, estado FROM recetas ORDER BY id_receta;
--   El paso 2) está condicionado a id_receta = 12 (la única receta
--   verificada); si en otro entorno existieran otras recetas,
--   quedarían sin código y el paso 3) fallaría de forma visible si
--   hubiera duplicados (nunca se corrompen datos en silencio).
--
-- CÓMO APLICAR (ver instrucciones en README.md de esta carpeta):
--   USE restaurante_baluarte; y ejecutar este archivo completo.
--
-- Verificación posterior:
--   SHOW COLUMNS FROM recetas LIKE 'codigo';
--   SELECT id_receta, id_producto, codigo, estado FROM recetas;
--   SELECT * FROM secuencias WHERE nombre = 'receta_codigo';  -- debe ser 1
-- ============================================================

USE restaurante_baluarte;

-- 1) Columna código (nullable al principio para poder rellenarla).
ALTER TABLE recetas
    ADD COLUMN codigo VARCHAR(10) DEFAULT NULL AFTER id_receta;

-- 2) RENUMERACIÓN: la única receta existente (id_receta = 12,
--    verificada por consulta de solo lectura) pasa a REC-001.
--    El id_receta, id_producto y todas las relaciones internas
--    se conservan intactos: el código es una columna empresarial
--    nueva e independiente de la clave primaria.
UPDATE recetas
SET codigo = 'REC-001'
WHERE id_receta = 12 AND codigo IS NULL;

-- 3) Restricción UNIQUE: impide códigos duplicados (respaldo de
--    la asignación atómica de la aplicación).
ALTER TABLE recetas
    ADD UNIQUE KEY uq_recetas_codigo (codigo);

-- 4) La secuencia "receta_codigo" queda EXACTAMENTE en 1, de
--    forma determinista, incluso si ya existiera una fila previa
--    con un valor superior (p. ej. 12, procedente de una versión
--    anterior de esta migración). Es seguro fijarla en 1 porque
--    en el estado verificado existe una única receta, que queda
--    como REC-001: ningún código 2..12 fue emitido jamás por la
--    secuencia, y cualquier colisión sería rechazada de forma
--    visible por el UNIQUE del paso 3. Así, la SIGUIENTE receta
--    nueva recibirá REC-002, luego REC-003, y así sucesivamente.
INSERT INTO secuencias (nombre, valor)
VALUES ('receta_codigo', 1)
ON DUPLICATE KEY UPDATE valor = 1;