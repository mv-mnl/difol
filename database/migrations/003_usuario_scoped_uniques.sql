-- Los nombres de lugares/categorias eran unicos globalmente; con multi-usuario
-- cada usuario tiene su propio namespace (dos usuarios pueden tener ambos "Efectivo").
ALTER TABLE lugares
  DROP INDEX nombre,
  ADD CONSTRAINT uniq_lugar_usuario_nombre UNIQUE (usuario_id, nombre);

ALTER TABLE categorias
  DROP INDEX uniq_categoria_nombre_tipo,
  ADD CONSTRAINT uniq_categoria_usuario_nombre_tipo UNIQUE (usuario_id, nombre, tipo);
