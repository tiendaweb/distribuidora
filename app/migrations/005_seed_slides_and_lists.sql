-- Insertar slides por defecto si la tabla está vacía
INSERT INTO slides (image_url, title, sort_order, is_active)
SELECT 'https://aapp.space/storage/store/images/usSqH9EIpZEjRAkO53Fo.png','Banner 1',0,1
WHERE NOT EXISTS (SELECT 1 FROM slides LIMIT 1);

INSERT INTO slides (image_url, title, sort_order, is_active)
SELECT 'https://aapp.space/storage/store/images/McJ06c7ki18GY9ZSziWs.png','Banner 2',1,1
WHERE NOT EXISTS (SELECT 1 FROM slides WHERE sort_order = 1);

INSERT INTO slides (image_url, title, sort_order, is_active)
SELECT 'https://aapp.space/storage/store/images/cRUiezU0TrsrG520D5MR.png','Banner 3',2,1
WHERE NOT EXISTS (SELECT 1 FROM slides WHERE sort_order = 2);

-- Lista B (90%) si no existe
INSERT INTO price_lists (name, description, factor, is_active, is_default, overrides)
SELECT 'Lista B','Lista de precios B - 90%',0.9,1,0,'{}'
WHERE (SELECT COUNT(*) FROM price_lists WHERE name = 'Lista B') = 0;

-- Lista C (80%) si no existe
INSERT INTO price_lists (name, description, factor, is_active, is_default, overrides)
SELECT 'Lista C','Lista de precios C - 80%',0.8,1,0,'{}'
WHERE (SELECT COUNT(*) FROM price_lists WHERE name = 'Lista C') = 0;

-- Tabla de historial de cambios
CREATE TABLE IF NOT EXISTS change_log (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  product_id TEXT DEFAULT NULL,
  product_name TEXT DEFAULT NULL,
  field TEXT DEFAULT NULL,
  old_value TEXT DEFAULT NULL,
  new_value TEXT DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
