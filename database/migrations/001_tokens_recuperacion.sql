-- ============================================================
-- MIGRACIÓN 001: RECUPERACIÓN DE CONTRASEÑA
-- Restaurante Baluarte
--
-- Crea la tabla tokens_recuperacion utilizada por el flujo
-- "¿Olvidaste tu contraseña?". Se guarda únicamente el hash
-- SHA-256 del token (nunca el token en claro), con caducidad
-- de 15 minutos y uso único (columna "usado").
--
-- CÓMO APLICAR (base de datos de producción en Aiven):
--   1. Entra a la consola de Aiven → tu servicio MySQL.
--   2. Abre la herramienta de consulta (Query editor) o conéctate
--      con: mysql -h <host> -P <puerto> -u <usuario> -p --ssl-mode=REQUIRED
--   3. Selecciona la base de datos: USE restaurante_baluarte;
--   4. Ejecuta el contenido completo de este archivo.
--   5. Verifica: SHOW TABLES LIKE 'tokens_recuperacion';
--
-- Es reversible con: DROP TABLE IF EXISTS tokens_recuperacion;
-- (no afecta a ninguna tabla existente).
-- ============================================================

USE restaurante_baluarte;

CREATE TABLE IF NOT EXISTS tokens_recuperacion (
    id_token INT(11) NOT NULL AUTO_INCREMENT,
    id_usuario INT(11) NOT NULL,
    token_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 hex del token, nunca el token en claro',
    expiracion DATETIME NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_token),
    KEY idx_tokens_hash (token_hash),
    KEY idx_tokens_usuario (id_usuario),
    KEY idx_tokens_expiracion (expiracion),
    CONSTRAINT fk_tokens_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
