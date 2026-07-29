CREATE DATABASE IF NOT EXISTS difol;
USE difol;

CREATE TABLE IF NOT EXISTS lugares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo ENUM('ingreso', 'egreso') NOT NULL,
  UNIQUE KEY uniq_categoria_nombre_tipo (nombre, tipo)
);

CREATE TABLE IF NOT EXISTS movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('ingreso', 'egreso') NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  fecha DATE NOT NULL,
  descripcion VARCHAR(255),
  categoria_id INT NULL,
  lugar_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE RESTRICT
);

-- Seed inicial
INSERT INTO lugares (nombre) VALUES
  ('Efectivo'),
  ('Banco')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO categorias (nombre, tipo) VALUES
  ('Sueldo', 'ingreso'),
  ('Otros ingresos', 'ingreso'),
  ('Comida', 'egreso'),
  ('Transporte', 'egreso'),
  ('Servicios', 'egreso'),
  ('Otros gastos', 'egreso')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
