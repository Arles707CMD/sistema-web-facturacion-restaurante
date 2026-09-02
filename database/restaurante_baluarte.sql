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