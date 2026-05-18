-- Extensão geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- Usuários
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider    TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  points      INT DEFAULT 0,
  role        TEXT NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Banheiros
CREATE TABLE bathrooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  location      GEOGRAPHY(POINT, 4326) NOT NULL,
  address       TEXT,
  place_type    TEXT,
  is_free       BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT false,
  requires_key  BOOLEAN DEFAULT false,
  opening_hours JSONB,
  added_by      UUID REFERENCES users(id),
  source        TEXT DEFAULT 'user',
  osm_id        BIGINT,
  status        TEXT DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bathrooms_location ON bathrooms USING GIST(location);

-- Avaliações
CREATE TABLE ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id UUID REFERENCES bathrooms(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  overall     SMALLINT CHECK (overall BETWEEN 1 AND 5),
  cleanliness SMALLINT CHECK (cleanliness BETWEEN 1 AND 3),
  has_paper   BOOLEAN,
  has_soap    BOOLEAN,
  has_dryer   BOOLEAN,
  smell       SMALLINT CHECK (smell BETWEEN 1 AND 3),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bathroom_id, user_id, (DATE(created_at)))
);

-- Fotos
CREATE TABLE photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id  UUID REFERENCES bathrooms(id) ON DELETE CASCADE,
  rating_id    UUID REFERENCES ratings(id),
  user_id      UUID REFERENCES users(id),
  url          TEXT NOT NULL,
  status       TEXT DEFAULT 'pending',
  vision_score FLOAT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Badges
CREATE TABLE badges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  icon_url     TEXT,
  points_award INT DEFAULT 0
);

CREATE TABLE user_badges (
  user_id    UUID REFERENCES users(id),
  badge_id   UUID REFERENCES badges(id),
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Fila de moderação manual
CREATE TABLE moderation_queue (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id    UUID REFERENCES photos(id),
  reason      TEXT,
  status      TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Reports de usuários
CREATE TABLE reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL,
  target_id  UUID NOT NULL,
  user_id    UUID REFERENCES users(id),
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
