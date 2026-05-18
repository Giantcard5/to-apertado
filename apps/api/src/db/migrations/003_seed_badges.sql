INSERT INTO badges (slug, name, description, points_award) VALUES
  ('first_flush',  'Primeira Descarga',   'Fez sua primeira avaliação',     0),
  ('scout',        'Escoteiro',           'Cadastrou seu primeiro banheiro', 0),
  ('explorer_10',  'Explorador',          'Cadastrou 10 banheiros',         100),
  ('explorer_50',  'Desbravador',         'Cadastrou 50 banheiros',         500),
  ('critico_100',  'Crítico Experiente',  'Fez 100 avaliações',             200),
  ('fotografo',    'Fotógrafo de Campo',  '10 fotos aprovadas',             100),
  ('guardiao_sp',  'Guardião de SP',      'Top 10 do ranking mensal',       300)
ON CONFLICT (slug) DO NOTHING;
