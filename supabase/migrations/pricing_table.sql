-- pricing jadvalini yaratish
CREATE TABLE IF NOT EXISTS pricing (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  cap     TEXT NOT NULL,
  base    INTEGER NOT NULL,
  per_km  INTEGER NOT NULL
);

-- Default narxlar
INSERT INTO pricing (id, name, cap, base, per_km) VALUES
  ('gazelle', 'Gazelle', '1.5 t', 25000, 1500),
  ('medium',  'O''rta',  '5 t',   45000, 2500),
  ('kamaz',   'Kamaz',   '10 t',  75000, 4000)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Hamma o'qiy oladi (narx kalkulyatori uchun)
CREATE POLICY "pricing_public_read" ON pricing
  FOR SELECT USING (true);
