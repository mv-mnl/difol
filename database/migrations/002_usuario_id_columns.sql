-- usuario_id nace nullable a proposito: los datos existentes (lugares, categorias
-- y movimientos creados antes de que existiera el login) no tienen dueno todavia.
-- Se reclaman por el primer usuario que se registra (ver backend/src/routes/auth.routes.js).
ALTER TABLE lugares
  ADD COLUMN usuario_id INT NULL AFTER id,
  ADD CONSTRAINT fk_lugares_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE categorias
  ADD COLUMN usuario_id INT NULL AFTER id,
  ADD CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE movimientos
  ADD COLUMN usuario_id INT NULL AFTER id,
  ADD CONSTRAINT fk_movimientos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
