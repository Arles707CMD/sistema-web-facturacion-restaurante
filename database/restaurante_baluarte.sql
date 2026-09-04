-- ============================================================
-- RESTAURANTE BALUARTE
-- Base de datos: restaurante_baluarte
-- Evidencia: GA7-220501096-AA2-EV01
-- Descripción: Script de creación de la base de datos con
--              sus tablas (categorias y productos), la
--              relación entre ellas y los datos iniciales.
-- ============================================================

CREATE DATABASE IF NOT EXISTS restaurante_baluarte
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE restaurante_baluarte;

-- ============================================================
-- TABLA: categorias
-- ============================================================

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: productos
-- ============================================================

CREATE TABLE IF NOT EXISTS productos (
    id_producto INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT(11) NOT NULL DEFAULT 0,
    id_categoria INT(11) NOT NULL,
    PRIMARY KEY (id_producto),
    KEY fk_productos_categoria (id_categoria),
    CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria)
        REFERENCES categorias (id_categoria)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS INICIALES: categorias
-- ============================================================

INSERT INTO categorias (id_categoria, nombre, descripcion) VALUES
(1, 'Hamburguesas', 'Productos de hamburgueseria'),
(2, 'Bebidas', 'Bebidas frias y calientes'),
(3, 'Acompañantes', 'Productos complementarios');

-- ============================================================
-- DATOS INICIALES: productos (4 productos originales)
-- ============================================================

INSERT INTO productos (id_producto, nombre, descripcion, precio, stock, id_categoria) VALUES
(1, 'Hamburguesa Baluarte', 'Hamburguesa especial de la casa', 18000.00, 20, 1),
(2, 'Hamburguesa Clasica', 'Hamburguesa tradicional', 15000.00, 15, 1),
(3, 'Gaseosa', 'Bebida gaseosa personal', 5000.00, 30, 2),
(4, 'Papas Fritas', 'Porcion de papas fritas', 7000.00, 25, 3);
-- ============================================================
-- TABLA: usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Ventas',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS INICIALES: usuarios
-- Contraseña por defecto: 123456 (almacenada como hash scrypt)
-- ============================================================

INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, estado) VALUES
('Juan David López', 'juan@baluarte.com', '3a105e13d11b580156dd19816bd6569d:754faacbef12c911ab062e7b89f6a153a658e7d21f20d8ac84d9af69764470793e33ab3b5e1383623eeef1d11f698e93822df51f43eed2288049016393993e86', 'Administrador', 'Activo'),
('María González', 'maria@baluarte.com', '3a105e13d11b580156dd19816bd6569d:754faacbef12c911ab062e7b89f6a153a658e7d21f20d8ac84d9af69764470793e33ab3b5e1383623eeef1d11f698e93822df51f43eed2288049016393993e86', 'Ventas', 'Activo'),
('Carlos Rodríguez', 'carlos@baluarte.com', '3a105e13d11b580156dd19816bd6569d:754faacbef12c911ab062e7b89f6a153a658e7d21f20d8ac84d9af69764470793e33ab3b5e1383623eeef1d11f698e93822df51f43eed2288049016393993e86', 'Inventario', 'Inactivo');

-- ============================================================
-- TABLA: facturas
-- ============================================================

CREATE TABLE IF NOT EXISTS facturas (
    id_factura INT(11) NOT NULL AUTO_INCREMENT,
    numero_factura VARCHAR(20) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cliente VARCHAR(150) NOT NULL,
    documento VARCHAR(50) DEFAULT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    observaciones VARCHAR(255) DEFAULT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    iva DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_factura),
    UNIQUE KEY uq_facturas_numero (numero_factura),
    KEY idx_facturas_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: detalle_factura
-- ============================================================

CREATE TABLE IF NOT EXISTS detalle_factura (
    id_detalle INT(11) NOT NULL AUTO_INCREMENT,
    id_factura INT(11) NOT NULL,
    id_producto INT(11) NOT NULL,
    cantidad INT(11) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_detalle),
    KEY idx_detalle_factura (id_factura),
    KEY idx_detalle_producto (id_producto),
    CONSTRAINT fk_detalle_factura FOREIGN KEY (id_factura)
        REFERENCES facturas (id_factura)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto)
        REFERENCES productos (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: recetas
-- Una receta por producto (id_producto UNIQUE).
-- ============================================================

CREATE TABLE IF NOT EXISTS recetas (
    id_receta INT(11) NOT NULL AUTO_INCREMENT,
    id_producto INT(11) NOT NULL,
    porciones INT(11) NOT NULL,
    tiempo INT(11) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_receta),
    UNIQUE KEY uq_recetas_producto (id_producto),
    CONSTRAINT fk_recetas_producto FOREIGN KEY (id_producto)
        REFERENCES productos (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: configuracion
-- Fila única de configuración (id = 1).
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracion (
    id INT(11) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    meta_mensual DECIMAL(12, 2) NOT NULL,
    iva DECIMAL(5, 2) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS INICIALES: configuracion
-- ============================================================

INSERT INTO configuracion (id, nombre, meta_mensual, iva) VALUES
(1, 'Restaurante Baluarte', 50000000, 19)
ON DUPLICATE KEY UPDATE id = id;