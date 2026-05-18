# To Apertado — Arquitetura e Estrutura de Negócio

## Contexto

**Problema:** Quem está em São Paulo sem conhecer a região não sabe onde encontrar banheiros por perto — e mesmo quando encontra, não sabe se vale a pena ir (limpo, com papel, acessível). Os concorrentes globais (Onde tá o banheiro?, Flush) têm dados imprecisos e não informam o estado atual do banheiro.

**Solução:** PWA crowdsourced focado em SP, com avaliações rápidas de qualidade (limpeza, papel, sabão, acessibilidade) e fotos, usando OSM + mapeamento manual como base de dados inicial. Diferencial: o usuário sabe o estado do banheiro *antes* de ir.

**Decisões de produto:**
- Plataforma: PWA
- Frontend: Next.js + TypeScript
- Backend: Node.js + Fastify + PostgreSQL + PostGIS
- Mapas: Leaflet + OpenStreetMap (100% gratuito, sem limites)
- Hospedagem: Vercel (frontend) + Railway (backend + DB)
- Storage de fotos: Cloudflare R2
- Auth: anônimo para visualizar, login (Google + Apple) para contribuir
- Monetização: anúncios (Google AdSense)
- Gamificação: pontos + badges + ranking
- Moderação: Vision API automática + fila manual para casos incertos
- Dados iniciais: OSM via Overpass API + mapeamento manual da equipe

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                    │
│              Next.js 14 + TypeScript + PWA              │
│       Leaflet + OpenStreetMap · next-pwa · Tailwind CSS │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / REST
┌───────────────────────▼─────────────────────────────────┐
│                  BACKEND (Railway)                       │
│              Node.js + Fastify + TypeScript             │
│      Auth: @fastify/passport (Google OAuth + Apple)     │
│      Rate limiting · CORS · Zod validation              │
└──────┬───────────────────────────┬──────────────────────┘
       │                           │
┌──────▼───────┐         ┌─────────▼──────────┐
│  PostgreSQL  │         │  Cloudflare R2     │
│  + PostGIS   │         │  (fotos uploads)   │
│  (Railway)   │         └────────────────────┘
└──────────────┘
       │
┌──────▼───────────────────────────────────────────────────┐
│               SERVIÇOS EXTERNOS                          │
│  Google Vision API (moderação de fotos)                  │
│  Google AdSense (monetização)                            │
│  Overpass API (import inicial OSM)                       │
└──────────────────────────────────────────────────────────┘
```

---

## Estrutura de Pastas

```
to-apertado/
├── apps/
│   ├── web/                          # Next.js PWA
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx          # Mapa principal
│   │   │   │   ├── banheiro/[id]/    # Página do banheiro
│   │   │   │   └── busca/            # Busca por endereço
│   │   │   ├── (auth)/
│   │   │   │   ├── login/            # Login Google/Apple
│   │   │   │   └── perfil/           # Perfil + pontos + badges
│   │   │   ├── (contribuir)/
│   │   │   │   ├── registrar/        # Cadastrar novo banheiro
│   │   │   │   └── avaliar/[id]/     # Avaliar banheiro
│   │   │   └── ranking/              # Leaderboard
│   │   ├── components/
│   │   │   ├── map/                  # LeafletMap, Pin, Cluster
│   │   │   ├── bathroom/             # Card, Detail, RatingForm
│   │   │   ├── gamification/         # BadgeCard, PointsDisplay
│   │   │   └── ui/                   # Botões, modals, skeleton
│   │   ├── lib/
│   │   │   ├── api.ts                # Cliente HTTP para o backend
│   │   │   ├── leaflet.ts            # Configuração Leaflet + tiles OSM
│   │   │   └── auth.ts               # NextAuth config
│   │   └── public/
│   │       └── manifest.json         # PWA manifest
│   │
│   └── api/                          # Fastify backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── bathrooms.ts      # CRUD banheiros + busca geo
│       │   │   ├── ratings.ts        # Avaliações + atributos
│       │   │   ├── photos.ts         # Upload + moderação
│       │   │   ├── users.ts          # Perfil + pontos + badges
│       │   │   └── ranking.ts        # Leaderboard
│       │   ├── plugins/
│       │   │   ├── auth.ts           # Passport Google + Apple
│       │   │   ├── db.ts             # Conexão PostgreSQL + PostGIS
│       │   │   └── storage.ts        # Cloudflare R2
│       │   ├── services/
│       │   │   ├── moderation.ts     # Vision API + fila manual
│       │   │   ├── gamification.ts   # Cálculo de pontos + badges
│       │   │   └── osm-import.ts     # Import Overpass API
│       │   └── db/
│       │       ├── schema.sql        # Criação das tabelas
│       │       └── migrations/
│       └── package.json
│
├── packages/
│   └── types/                        # Tipos compartilhados TS
│       └── index.ts
│
├── docs/                             # Documentação do projeto
│   ├── ARCHITECTURE.md               # Este arquivo
│   ├── BACKEND.md                    # Planejamento do backend
│   └── FRONTEND.md                   # Planejamento do frontend
├── package.json                      # Monorepo (pnpm workspaces)
└── turbo.json                        # Turborepo
```

---

## Schema do Banco de Dados (PostgreSQL + PostGIS)

```sql
-- Extensão geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- Usuários
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider    TEXT NOT NULL,            -- 'google' | 'apple'
  provider_id TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  points      INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Banheiros
CREATE TABLE bathrooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  location      GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS
  address       TEXT,
  place_type    TEXT,  -- 'shopping', 'restaurante', 'publico', 'posto', etc.
  is_free       BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT false,
  requires_key  BOOLEAN DEFAULT false,
  opening_hours JSONB,
  added_by      UUID REFERENCES users(id),
  source        TEXT DEFAULT 'user',  -- 'osm' | 'user' | 'manual'
  osm_id        BIGINT,
  status        TEXT DEFAULT 'active',  -- 'active' | 'closed' | 'needs_review'
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
  cleanliness SMALLINT CHECK (cleanliness BETWEEN 1 AND 3),  -- 1=sujo 2=ok 3=limpo
  has_paper   BOOLEAN,
  has_soap    BOOLEAN,
  has_dryer   BOOLEAN,
  smell       SMALLINT CHECK (smell BETWEEN 1 AND 3),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bathroom_id, user_id, DATE(created_at))  -- 1 avaliação por dia por banheiro
);

-- Fotos
CREATE TABLE photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id UUID REFERENCES bathrooms(id) ON DELETE CASCADE,
  rating_id   UUID REFERENCES ratings(id),
  user_id     UUID REFERENCES users(id),
  url         TEXT NOT NULL,            -- URL no R2
  status      TEXT DEFAULT 'pending',   -- 'pending' | 'approved' | 'rejected' | 'manual_review'
  vision_score FLOAT,                   -- Score de confiança da Vision API
  created_at  TIMESTAMPTZ DEFAULT NOW()
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
  reason      TEXT,  -- 'low_confidence' | 'reported'
  status      TEXT DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  reviewed_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Reports de usuários
CREATE TABLE reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL,  -- 'bathroom' | 'photo' | 'rating'
  target_id  UUID NOT NULL,
  user_id    UUID REFERENCES users(id),
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints (Fastify)

### Banheiros
```
GET  /bathrooms?lat=&lng=&radius=&type=&free=   # Busca geoespacial (PostGIS ST_DWithin)
GET  /bathrooms/:id                              # Detalhes + ratings agregados
POST /bathrooms                                  # Cadastrar (auth required)
PUT  /bathrooms/:id                              # Editar (auth + owner)
POST /bathrooms/:id/report                       # Reportar fechado/incorreto
```

### Avaliações
```
GET  /bathrooms/:id/ratings                      # Lista de avaliações
POST /bathrooms/:id/ratings                      # Avaliar (auth required)
```

### Fotos
```
POST /photos/upload                              # Upload para R2 + Vision API
GET  /admin/moderation                           # Fila manual (admin)
PUT  /admin/moderation/:id                       # Aprovar/rejeitar (admin)
```

### Usuários / Gamificação
```
GET  /me                                         # Perfil + pontos + badges
GET  /ranking?period=week|month|all              # Leaderboard
```

---

## Query Geoespacial Principal

```sql
-- Banheiros num raio de 1km, ordenados por distância, com média de avaliações
SELECT
  b.*,
  ST_Distance(b.location, ST_MakePoint($lng, $lat)::geography) AS distance_meters,
  AVG(r.overall)::FLOAT                                         AS avg_rating,
  COUNT(r.id)                                                   AS total_ratings
FROM bathrooms b
LEFT JOIN ratings r ON r.bathroom_id = b.id
WHERE
  b.status = 'active'
  AND ST_DWithin(b.location, ST_MakePoint($lng, $lat)::geography, $radius_meters)
GROUP BY b.id
ORDER BY distance_meters ASC
LIMIT 50;
```

---

## Sistema de Gamificação

### Pontos por ação
| Ação | Pontos |
|------|--------|
| Cadastrar banheiro | +50 |
| Avaliar banheiro | +10 |
| Adicionar foto aprovada | +20 |
| Avaliação marcada como útil | +5 |
| Reportar banheiro fechado (confirmado) | +15 |

### Badges
| Slug | Condição | Pontos bônus |
|------|----------|-------------|
| `first_flush` | 1ª avaliação | 0 |
| `scout` | 1º banheiro cadastrado | 0 |
| `explorer_10` | 10 banheiros cadastrados | +100 |
| `explorer_50` | 50 banheiros cadastrados | +500 |
| `critico_100` | 100 avaliações | +200 |
| `fotografo` | 10 fotos aprovadas | +100 |
| `guardiao_sp` | Top 10 ranking mensal | +300 |

---

## Pipeline de Moderação de Fotos

```
Upload do usuário
      │
      ▼
Salva no R2 (status: pending)
      │
      ▼
Google Vision API SafeSearch
      │
   ┌──┴───────────────────────────────┐
   │                │                 │
score > 0.9    score 0.5–0.9     score < 0.5
(confiança      (incerto)        (impróprio)
  alta)             │                 │
   │           fila manual         rejected
approved            │
   │         admin revisa
foto visível    no painel
```

---

## Estratégia de Dados Iniciais

### Fase 1 — Import OSM (script automatizado)
```
Overpass API query:
  area["name"="São Paulo"]["admin_level"="8"];
  node["amenity"="toilets"](area);
  out body;

→ Parse → Normalizar campos → INSERT INTO bathrooms (source='osm')
```
Estimativa: 500–2.000 banheiros públicos em SP já mapeados no OSM.

### Fase 2 — Mapeamento manual da equipe
- Prioridade: Av. Paulista, Centro histórico, Pinheiros, Vila Madalena, Parque Ibirapuera
- Meta pré-lançamento: 200 banheiros verificados com foto e horário correto
- Ferramenta: painel admin interno com form de cadastro rápido

---

## Modelo de Negócio

**Receita:** Google AdSense
- Banner no rodapé do mapa (não intrusivo)
- Anúncio intersticial na abertura do detalhe do banheiro (1x por sessão)
- Meta de RPM: R$2–5 por 1000 views

**Crescimento:** SEO agressivo
- Páginas estáticas via Next.js SSR: `/banheiros-em/[bairro]`
- Target: "banheiro perto de mim SP", "banheiro Paulista", "banheiro Ibirapuera"
- Estimativa: 80% do tráfego via busca orgânica

---

## Fases de Desenvolvimento

### Fase 1 — MVP (semanas 1–6)
- [ ] Monorepo configurado (pnpm + Turborepo)
- [ ] Schema PostgreSQL + PostGIS no Railway
- [ ] Script de import OSM (Overpass API)
- [ ] Backend: endpoints de busca geoespacial + detalhes
- [ ] Frontend: mapa Leaflet + OpenStreetMap com pins + filtros básicos
- [ ] PWA manifest + service worker (next-pwa)
- [ ] Auth Google OAuth (ver banheiro = anônimo, avaliar = logado)

### Fase 2 — Contribuição (semanas 7–10)
- [ ] Formulário de cadastro de banheiro
- [ ] Sistema de avaliação (estrelas + ícones de atributos)
- [ ] Upload de fotos + moderação Vision API
- [ ] Fila de moderação manual (painel admin)
- [ ] Google AdSense integrado

### Fase 3 — Engajamento (semanas 11–14)
- [ ] Sistema de pontos + badges
- [ ] Ranking semanal/mensal/geral
- [ ] Página de perfil do usuário
- [ ] Notificações push (PWA) para novo banheiro na área
- [ ] Páginas SEO por bairro (`/banheiros-em/[bairro]`)

### Fase 4 — Qualidade de dados (semanas 15+)
- [ ] "Confirmar que ainda existe" (CTA para usuários que passaram perto)
- [ ] Expiração de avaliações antigas (>90 dias = alerta)
- [ ] Login Apple (necessário para futura App Store)
- [ ] Modo offline básico (service worker cacheia banheiros próximos)

---

## Verificação (Como testar end-to-end)

1. **Import OSM:** `node apps/api/src/services/osm-import.ts` → verificar rows em `bathrooms` com `source='osm'`
2. **Query geoespacial:** `GET /bathrooms?lat=-23.5613&lng=-46.6564&radius=500` → retorna banheiros da Paulista
3. **Mapa:** abrir PWA, permitir localização → pins aparecem ao redor
4. **Avaliação:** login Google → avaliar banheiro → pontos adicionados no perfil
5. **Foto:** upload de imagem → Vision API retorna score → status `approved` ou `manual_review`
6. **Ranking:** `GET /ranking?period=week` → usuário com mais pontos no topo
7. **PWA:** Lighthouse PWA score > 90; manifest com ícone, nome, theme color

---

## Dependências Chave

### Frontend
```json
{
  "next": "^14",
  "react": "^18",
  "typescript": "^5",
  "leaflet": "^1.9",
  "react-leaflet": "^4",
  "@types/leaflet": "^1.9",
  "next-pwa": "^5",
  "tailwindcss": "^3",
  "next-auth": "^4"
}
```

> **Atenção Leaflet + Next.js:** `react-leaflet` depende de `window`, use sempre `dynamic import` com `ssr: false`:
> ```tsx
> const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });
> ```

### Backend
```json
{
  "fastify": "^4",
  "typescript": "^5",
  "pg": "^8",
  "zod": "^3",
  "@fastify/passport": "^2",
  "@fastify/multipart": "^8",
  "@aws-sdk/client-s3": "^3"
}
```

---

## Arquivos Críticos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `apps/api/src/db/schema.sql` | Schema completo com PostGIS |
| `apps/api/src/routes/bathrooms.ts` | Query ST_DWithin + agregação de ratings |
| `apps/api/src/services/osm-import.ts` | Import Overpass API → PostgreSQL |
| `apps/api/src/services/moderation.ts` | Vision API + fila manual |
| `apps/api/src/services/gamification.ts` | Cálculo de pontos + trigger badges |
| `apps/web/app/page.tsx` | Mapa principal |
| `apps/web/components/map/LeafletMap.tsx` | Wrapper react-leaflet + tiles OSM |
| `apps/web/components/bathroom/RatingForm.tsx` | Formulário de avaliação com ícones |
| `apps/web/public/manifest.json` | PWA manifest |
| `packages/types/index.ts` | Tipos compartilhados frontend/backend |
