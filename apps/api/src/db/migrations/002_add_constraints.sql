-- UNIQUE em osm_id para idempotência do import OSM
-- DEFERRABLE permite registros com osm_id NULL (source='user') coexistirem
ALTER TABLE bathrooms
  ADD CONSTRAINT bathrooms_osm_id_unique UNIQUE (osm_id)
  DEFERRABLE INITIALLY DEFERRED;
