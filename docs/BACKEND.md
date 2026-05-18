# To Apertado — Planejamento Completo do Backend

> **Referência de desenvolvimento.** Este arquivo define 100% das regras de negócio, decisões arquiteturais e passo a passo de implementação do backend. Consultar sempre antes de criar ou modificar qualquer arquivo em `apps/api/`.
>
> Arquitetura geral (stack, schema SQL, endpoints, estrutura de pastas): ver `docs/ARCHITECTURE.md`.

---

## Stack e Versões

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Node.js | 20 LTS | Runtime |
| TypeScript | ^5 | Linguagem |
| Fastify | ^4 | Framework HTTP |
| `tsx` | latest | Executa `.ts` em dev sem build |
| `tsc` | via typescript | Compila para `dist/` em produção |
| PostgreSQL + PostGIS | Railway | Banco de dados geoespacial |
| `node-pg-migrate` | ^7 | Migrations SQL |
| `pg` | ^8 | Cliente PostgreSQL |
| Zod | ^3 | Validação de schemas e env vars |
| `@fastify/passport` | ^2 | Google OAuth |
| `@fastify/cookie` | ^9 | Cookie JWT |
| `@fastify/cors` | ^9 | CORS |
| `@fastify/rate-limit` | ^9 | Rate limiting |
| `@fastify/multipart` | ^8 | Multipart (não usado para upload direto, mas para outros forms) |
| `@aws-sdk/client-s3` | ^3 | Cloudflare R2 (API compatível S3) |
| `jsonwebtoken` | ^9 | Geração e verificação JWT |
| `pino-pretty` | ^11 | Logs formatados em desenvolvimento |
| `passport-google-oauth20` | ^2 | Estratégia OAuth Google |

---

## Scripts `package.json`

```json
{
  "scripts": {
    "dev":        "tsx watch src/index.ts",
    "build":      "tsc",
    "start":      "node dist/index.js",
    "db:migrate": "node-pg-migrate up",
    "db:create":  "node-pg-migrate create",
    "osm:import": "tsx src/services/osm-import.ts",
    "typecheck":  "tsc --noEmit"
  }
}
```

---

## Estrutura de Pastas

```
apps/api/
├── src/
│   ├── index.ts                  ← Entry point: registra plugins e sobe servidor
│   ├── config.ts                 ← Validação Zod de env vars (falha no startup)
│   ├── plugins/
│   │   ├── db.ts                 ← Pool PostgreSQL + PostGIS (decorates fastify.db)
│   │   ├── auth.ts               ← JWT cookie + Passport Google OAuth
│   │   ├── cors.ts               ← CORS com credentials
│   │   ├── rate-limit.ts         ← Rate limiting global + por rota
│   │   ├── error-handler.ts      ← setErrorHandler global
│   │   └── storage.ts            ← Cloudflare R2 client (decorates fastify.r2)
│   ├── routes/
│   │   ├── bathrooms.ts          ← CRUD + busca geoespacial
│   │   ├── ratings.ts            ← Avaliações + pontos (transaction)
│   │   ├── photos.ts             ← Presigned URL + confirm + Vision API
│   │   ├── users.ts              ← Perfil + pontos + badges
│   │   ├── ranking.ts            ← Leaderboard
│   │   └── admin.ts              ← Moderação manual (role: admin)
│   ├── services/
│   │   ├── gamification.ts       ← Cálculo de pontos + award de badges
│   │   ├── moderation.ts         ← Vision API SafeSearch + Label Detection
│   │   └── osm-import.ts         ← Import Overpass API → PostgreSQL
│   ├── hooks/
│   │   └── require-auth.ts       ← preHandler: verifica JWT
│   │   └── require-admin.ts      ← preHandler: verifica role = 'admin'
│   └── db/
│       ├── migrations/
│       │   ├── 001_initial_schema.sql   ← Schema completo (ver docs/ARCHITECTURE.md)
│       │   ├── 002_add_role_to_users.sql
│       │   └── 003_seed_badges.sql
│       └── schema.sql            ← Referência (não executado diretamente)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Variáveis de Ambiente

Definidas em `apps/api/.env` (dev) e no painel Railway (produção).
Todas validadas com Zod no startup — app não sobe se faltar qualquer variável obrigatória.

```env
# Banco
DATABASE_URL=postgresql://user:pass@host:5432/toapertado

# JWT
JWT_SECRET=string-aleatoria-minimo-32-caracteres

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=toapertado-photos
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Google Vision API
GOOGLE_VISION_API_KEY=

# CORS
CORS_ORIGIN=https://to-apertado.vercel.app

# App
NODE_ENV=development
PORT=3001
```

### Schema de validação (`src/config.ts`)

```ts
const envSchema = z.object({
  DATABASE_URL:                    z.string().url(),
  JWT_SECRET:                      z.string().min(32),
  GOOGLE_CLIENT_ID:                z.string(),
  GOOGLE_CLIENT_SECRET:            z.string(),
  GOOGLE_CALLBACK_URL:             z.string().url(),
  CLOUDFLARE_R2_ACCOUNT_ID:        z.string(),
  CLOUDFLARE_R2_ACCESS_KEY_ID:     z.string(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_BUCKET:            z.string(),
  CLOUDFLARE_R2_PUBLIC_URL:        z.string().url(),
  GOOGLE_VISION_API_KEY:           z.string(),
  CORS_ORIGIN:                     z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT:     z.coerce.number().default(3001),
})

export const config = envSchema.parse(process.env)
```

---

## Autenticação

### Estratégia: JWT em cookie `httpOnly`

- Usuário não autenticado pode acessar rotas de leitura (mapa, detalhes)
- Para escrever (avaliar, cadastrar, foto) → JWT obrigatório
- Admin → JWT com `role: 'admin'`

### Fluxo Google OAuth

```
1. GET /auth/google
   → redireciona para Google (passport-google-oauth20)

2. Google autentica → GET /auth/google/callback
   → Fastify: UPSERT em users (provider='google', provider_id=googleId)
   → Gera JWT: { userId, name, avatar, role }
   → Seta cookie: httpOnly, sameSite: strict, secure em produção
   → 302 redirect para CORS_ORIGIN + (req.cookies.returnTo || '/perfil')

3. GET /auth/logout
   → Limpa cookie JWT
   → 200 OK

4. GET /auth/me
   → Verifica cookie JWT
   → Retorna { id, name, avatar, points, role } ou 401
```

### Cookie `returnTo`

Antes de redirecionar para `/auth/google`, o frontend seta `?returnTo=/avaliar/uuid`.
O Fastify armazena em cookie temporário (`returnTo`, não httpOnly, 5min) e usa no redirect final.

### Hooks de proteção

```ts
// src/hooks/require-auth.ts
export async function requireAuth(req, reply) {
  const token = req.cookies.token
  if (!token) return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Login necessário' })
  try {
    req.user = jwt.verify(token, config.JWT_SECRET)
  } catch {
    return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Sessão expirada' })
  }
}

// src/hooks/require-admin.ts
export async function requireAdmin(req, reply) {
  await requireAuth(req, reply)
  if (req.user?.role !== 'admin') {
    return reply.code(403).send({ error: 'FORBIDDEN', message: 'Acesso restrito' })
  }
}
```

---

## Rate Limiting

```ts
// Global — todas as rotas
fastify.register(rateLimit, {
  max: 200,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Muitas requisições. Tente novamente em 1 minuto.',
  }),
})

// Rotas de escrita — config por rota
const writeRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }
// Aplicar em: POST /bathrooms, POST /bathrooms/:id/ratings, POST /photos/presign, POST /bathrooms/:id/report
```

Armazenamento: memória local (sem Redis). Suficiente para Railway com instância única no MVP.

---

## Formato de Erro Padrão

Todos os erros da API retornam nesse shape. Nunca vazar stack traces em produção.

```ts
// 400 — Validação Zod
{
  "error": "VALIDATION_ERROR",
  "message": "Dados inválidos",
  "details": [{ "field": "overall", "message": "Expected number, received string" }]
}

// 401 — Não autenticado
{ "error": "UNAUTHORIZED", "message": "Login necessário" }

// 403 — Sem permissão
{ "error": "FORBIDDEN", "message": "Acesso restrito" }

// 404 — Recurso não encontrado
{ "error": "NOT_FOUND", "message": "Banheiro não encontrado" }

// 429 — Rate limit
{ "error": "RATE_LIMIT_EXCEEDED", "message": "Muitas requisições. Tente novamente em 1 minuto." }

// 500 — Erro interno
{ "error": "INTERNAL_ERROR", "message": "Algo deu errado" }
```

### `setErrorHandler` global (`src/plugins/error-handler.ts`)

```ts
fastify.setErrorHandler((error, req, reply) => {
  // Erros Zod
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }
  // Erros de negócio (lançados manualmente com statusCode)
  if (error.statusCode) {
    return reply.code(error.statusCode).send({
      error: error.code ?? 'ERROR',
      message: error.message,
    })
  }
  // Erro interno
  fastify.log.error(error)
  return reply.code(500).send({ error: 'INTERNAL_ERROR', message: 'Algo deu errado' })
})
```

---

## CORS

```ts
fastify.register(cors, {
  origin: config.NODE_ENV === 'development'
    ? ['http://localhost:3000']
    : config.CORS_ORIGIN.split(','),
  credentials: true,   // obrigatório para cookie cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})
```

O frontend deve usar `credentials: 'include'` em todas as chamadas `fetch`.

---

## Logging

```ts
const loggerConfig = {
  development: {
    level: 'debug',
    transport: { target: 'pino-pretty', options: { colorize: true } },
  },
  production: { level: 'warn' },   // Railway captura stdout como JSON
  test: false,
}

const fastify = Fastify({ logger: loggerConfig[config.NODE_ENV] })
```

**O que logar:**
- `warn` — rate limit atingido, foto rejeitada pela Vision API, report threshold atingido
- `error` — falha DB, Vision API indisponível, R2 inacessível

**Nunca logar:** dados pessoais, conteúdo de avaliações, tokens JWT.

---

## Endpoints Completos

### Auth
```
GET  /auth/google                    → redireciona para Google OAuth
GET  /auth/google/callback           → callback OAuth → seta cookie JWT → redirect
GET  /auth/logout                    → limpa cookie → 200
GET  /auth/me                        → retorna user autenticado ou 401
```

### Banheiros
```
GET  /bathrooms                      → busca geoespacial (anônimo)
     ?lat=&lng=&radius=&type=&free=
GET  /bathrooms/:id                  → detalhes completos (anônimo)
POST /bathrooms                      → cadastrar (auth) [rate limit estrito]
PUT  /bathrooms/:id                  → editar (auth + owner ou admin)
POST /bathrooms/:id/report           → reportar (auth) [rate limit estrito]
```

### Avaliações
```
GET  /bathrooms/:id/ratings          → lista paginada (anônimo)
POST /bathrooms/:id/ratings          → avaliar (auth) [rate limit estrito]
```

### Fotos
```
POST /photos/presign                 → gera presigned URL para R2 (auth) [rate limit estrito]
POST /photos/confirm                 → confirma upload + Vision API (auth)
```

### Usuários / Gamificação
```
GET  /me                             → perfil + pontos + badges (auth)
GET  /ranking                        → leaderboard
     ?period=week|month|all
```

### Admin
```
GET  /admin/moderation               → fila de fotos em manual_review (admin)
PUT  /admin/moderation/:photoId      → aprovar ou rejeitar foto (admin)
     body: { action: 'approve' | 'reject' }
GET  /admin/reports                  → banheiros com needs_review (admin)
PUT  /admin/reports/:bathroomId      → resolver report (admin)
     body: { action: 'confirm_active' | 'close' | 'clear_reports' }
```

---

## Regras de Negócio Detalhadas

### Busca Geoespacial (`GET /bathrooms`)

```sql
SELECT
  b.id, b.name, b.place_type, b.is_free, b.is_accessible, b.status,
  ST_Y(b.location::geometry) AS lat,
  ST_X(b.location::geometry) AS lng,
  ST_Distance(b.location, ST_MakePoint($lng, $lat)::geography) AS distance_meters,
  AVG(r.overall)::FLOAT   AS avg_rating,
  COUNT(r.id)             AS total_ratings
FROM bathrooms b
LEFT JOIN ratings r ON r.bathroom_id = b.id
WHERE
  b.status IN ('active', 'needs_review')
  AND ST_DWithin(b.location, ST_MakePoint($lng, $lat)::geography, $radius_meters)
  AND ($type  IS NULL OR b.place_type = $type)
  AND ($free  IS NULL OR b.is_free    = $free)
GROUP BY b.id
ORDER BY distance_meters ASC
LIMIT 50
```

- Raio padrão: `500` metros. Máximo aceito: `5000` metros.
- Banheiros com `needs_review` aparecem no mapa com badge de alerta — não são ocultados.
- Banheiros `closed` não aparecem.

### Avaliações (`POST /bathrooms/:id/ratings`)

**Regras:**
- Máximo 1 avaliação por usuário por banheiro por dia (UNIQUE no schema)
- Campos obrigatórios: `overall` (1–5)
- Campos opcionais: `cleanliness` (1–3), `has_paper`, `has_soap`, `has_dryer`, `smell` (1–3), `comment`

**Transaction completa:**
```
BEGIN
  INSERT INTO ratings (...)
  UPDATE users SET points = points + 10 WHERE id = $userId
  verificar badges de avaliação (first_flush, critico_100)
  INSERT INTO user_badges ... ON CONFLICT DO NOTHING
COMMIT
```

### Upload de Fotos — Fluxo Completo

```
1. POST /photos/presign
   body: { bathroomId, contentType: 'image/jpeg' | 'image/png' | 'image/webp' }
   → valida que bathroomId existe
   → gera S3 presigned PUT URL com expiração de 5 minutos
   → retorna { uploadUrl, key }

2. Frontend faz PUT direto para uploadUrl (não passa pelo Fastify)

3. POST /photos/confirm
   body: { key, bathroomId, ratingId? }
   → verifica que o objeto existe no R2 (HEAD request)
   → chama Google Vision API (SafeSearch + Label Detection)
   → aplica regras de moderação (ver seção Moderação)
   → INSERT INTO photos (url, status, vision_score)
   → se approved: UPDATE users SET points = points + 20
   → verifica badge 'fotografo' (10 fotos aprovadas)
   → retorna { photoId, status }
```

**Tamanho máximo aceito:** 10MB. Validado no presign (Content-Length no header da presigned URL).
**Formatos aceitos:** `image/jpeg`, `image/png`, `image/webp`.

### Moderação de Fotos — Regras Vision API

Chamada única que inclui SafeSearch + Label Detection:

```
REJECTED (não entra no banco como approved):
  - SafeSearch: adult | violence | racy = LIKELY ou VERY_LIKELY

MANUAL_REVIEW:
  - SafeSearch: score 0.5–0.9 (incerto)
  - Label Detection: nenhum dos labels [bathroom, toilet, sink, plumbing fixture, tile] com score > 0.6
    → foto não parece ser de banheiro
  - Label Detection: qualquer label [mold, garbage, waste, fungus] com score > 0.8
    → condição extrema detectada

APPROVED:
  - SafeSearch ok (score > 0.9 de confiança que é seguro)
  - Pelo menos 1 label de banheiro presente com score > 0.6
  - Sem labels de condição extrema
```

Quando status = `manual_review`: INSERT automático em `moderation_queue` com `reason = 'vision_low_confidence'` ou `'not_bathroom'` ou `'extreme_condition'`.

### Sistema de Reports (`POST /bathrooms/:id/report`)

**Threshold automático:**
```
Após INSERT em reports:
  COUNT reports WHERE type='bathroom' AND target_id = bathroomId

  >= 3 reports → UPDATE bathrooms SET status = 'needs_review'
                 (só se status atual for 'active')
                 LOG warn: "bathroom {id} moved to needs_review ({count} reports)"
```

**Admin resolve via `PUT /admin/reports/:bathroomId`:**
- `confirm_active` → status = 'active', DELETE reports do banheiro
- `close` → status = 'closed', DELETE reports
- `clear_reports` → status = 'active', DELETE reports (falso alarme)

### Sistema de Gamificação

**Pontos por ação:**

| Ação | Pontos | Onde calcular |
|------|--------|--------------|
| Cadastrar banheiro | +50 | `POST /bathrooms` |
| Avaliar banheiro | +10 | `POST /bathrooms/:id/ratings` |
| Foto aprovada | +20 | `POST /photos/confirm` (só se approved) |
| Avaliação marcada como útil | +5 | (Fase 2) |
| Report confirmado pelo admin | +15 | `PUT /admin/reports/:id` (action: close) |

**Badges — verificação por ação:**

| Badge | Condição | Verificado em |
|-------|----------|--------------|
| `first_flush` | 1ª avaliação | `POST /ratings` |
| `scout` | 1º banheiro cadastrado | `POST /bathrooms` |
| `explorer_10` | 10 banheiros cadastrados (+100 pts) | `POST /bathrooms` |
| `explorer_50` | 50 banheiros cadastrados (+500 pts) | `POST /bathrooms` |
| `critico_100` | 100 avaliações (+200 pts) | `POST /ratings` |
| `fotografo` | 10 fotos aprovadas (+100 pts) | `POST /photos/confirm` |
| `guardiao_sp` | Top 10 ranking mensal (+300 pts) | job diário (Fase 3) |

**Função de award de badge (inline na transaction):**
```ts
// src/services/gamification.ts
export async function awardBadgeIfEarned(
  db: PoolClient,
  userId: string,
  slug: string,
  bonusPoints: number
) {
  const result = await db.query(`
    INSERT INTO user_badges (user_id, badge_id)
    SELECT $1, id FROM badges WHERE slug = $2
    ON CONFLICT DO NOTHING
    RETURNING badge_id
  `, [userId, slug])

  if (result.rowCount > 0 && bonusPoints > 0) {
    await db.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [bonusPoints, userId]
    )
  }
}
```

### Import OSM (`pnpm --filter api osm:import`)

**Query Overpass API:**
```
[out:json][timeout:60];
area["name"="São Paulo"]["admin_level"="8"]->.sp;
node["amenity"="toilets"](area.sp);
out body;
```

**Mapeamento de campos OSM → banco:**

| Tag OSM | Campo banco | Transformação |
|---------|-------------|--------------|
| `id` | `osm_id` | direto |
| `lat`, `lon` | `location` | `ST_MakePoint(lon, lat)::geography` |
| `tags.name` | `name` | fallback: `"Banheiro Público"` |
| `tags["addr:full"]` ou `tags["addr:street"]` | `address` | concatena número se disponível |
| `tags.fee` | `is_free` | `fee=yes → false`, `fee=no → true` |
| `tags.wheelchair` | `is_accessible` | `wheelchair=yes → true` |
| `tags.opening_hours` | `opening_hours` | `{ raw: string }` como JSONB |
| `tags.access` | `requires_key` | `access=key → true` |

**Idempotência:**
```sql
INSERT INTO bathrooms (name, location, address, is_free, is_accessible,
                       requires_key, opening_hours, osm_id, source)
VALUES (...)
ON CONFLICT (osm_id) DO UPDATE
  SET name          = EXCLUDED.name,
      address       = EXCLUDED.address,
      opening_hours = EXCLUDED.opening_hours,
      updated_at    = NOW()
-- Nunca sobrescreve: is_free, is_accessible (podem ter sido corrigidos manualmente)
```

Requer `UNIQUE(osm_id)` — adicionar em `002_add_role_to_users.sql` ou migration dedicada.

**Execução:**
```bash
pnpm --filter api osm:import
# Logs: total encontrado, inseridos, atualizados, erros
```

---

## Migrations (`node-pg-migrate`)

### `001_initial_schema.sql`
Schema completo conforme `docs/ARCHITECTURE.md` + campo `role TEXT DEFAULT 'user'` na tabela `users`.

### `002_add_constraints.sql`
```sql
ALTER TABLE bathrooms ADD CONSTRAINT bathrooms_osm_id_unique UNIQUE (osm_id)
  DEFERRABLE INITIALLY DEFERRED;
-- O DEFERRABLE permite que registros sem osm_id (source='user') sejam NULL sem conflito
```

### `003_seed_badges.sql`
```sql
INSERT INTO badges (slug, name, description, points_award) VALUES
  ('first_flush',  'Primeira Descarga',    'Fez sua primeira avaliação',           0),
  ('scout',        'Escoteiro',            'Cadastrou seu primeiro banheiro',       0),
  ('explorer_10',  'Explorador',           'Cadastrou 10 banheiros',              100),
  ('explorer_50',  'Desbravador',          'Cadastrou 50 banheiros',              500),
  ('critico_100',  'Crítico Experiente',   'Fez 100 avaliações',                  200),
  ('fotografo',    'Fotógrafo de Campo',   '10 fotos aprovadas',                  100),
  ('guardiao_sp',  'Guardião de SP',       'Top 10 do ranking mensal',            300)
ON CONFLICT (slug) DO NOTHING;
```

---

## Tipos Compartilhados (`packages/types/index.ts`)

Apenas DTOs de resposta da API — o contrato público entre frontend e backend.

```ts
export type BathroomPin = {
  id: string
  name: string
  lat: number
  lng: number
  distance_meters: number
  avg_rating: number | null
  total_ratings: number
  is_free: boolean
  is_accessible: boolean
  place_type: string
  status: 'active' | 'needs_review'
}

export type BathroomDetail = BathroomPin & {
  address: string | null
  requires_key: boolean
  opening_hours: { raw: string } | null
  source: 'osm' | 'user' | 'manual'
  recent_ratings: Rating[]
  photos: Photo[]
}

export type Rating = {
  id: string
  overall: number
  cleanliness: number | null
  has_paper: boolean | null
  has_soap: boolean | null
  has_dryer: boolean | null
  smell: number | null
  comment: string | null
  created_at: string
}

export type Photo = {
  id: string
  url: string
  status: 'pending' | 'approved' | 'rejected' | 'manual_review'
}

export type User = {
  id: string
  name: string | null
  avatar_url: string | null
  points: number
  role: 'user' | 'admin'
  badges: Badge[]
}

export type Badge = {
  slug: string
  name: string
  description: string | null
  awarded_at: string
}

export type ApiError = {
  error: string
  message: string
  details?: Array<{ field: string; message: string }>
}
```

---

## Passo a Passo de Implementação

> Seguir rigorosamente essa ordem. Cada passo é um bloco funcional que deve estar completo antes de avançar.

### Passo 1 — Setup do Monorepo

- [ ] Criar `package.json` raiz com `pnpm workspaces` (`apps/*`, `packages/*`)
- [ ] Criar `turbo.json` com pipelines `dev`, `build`, `typecheck`
- [ ] Criar `apps/api/package.json` com todas as dependências listadas neste documento
- [ ] Criar `apps/api/tsconfig.json` com `strict: true`, `target: ES2022`, `module: NodeNext`
- [ ] Criar `packages/types/package.json` e `packages/types/index.ts` com os tipos definidos acima
- [ ] Verificar: `pnpm install` sem erros

### Passo 2 — Configuração e Entry Point

- [ ] Criar `apps/api/src/config.ts` com validação Zod de todas as env vars
- [ ] Criar `apps/api/.env.example` com todas as variáveis (sem valores reais)
- [ ] Criar `apps/api/src/index.ts`:
  - Importa `config`
  - Instancia Fastify com logger configurado por ambiente
  - Registra plugins na ordem: `db` → `cors` → `rate-limit` → `auth` → `error-handler`
  - Registra rotas com prefixo `/`
  - `fastify.listen({ port: config.PORT, host: '0.0.0.0' })`
- [ ] Verificar: `pnpm --filter api dev` sobe sem erros (mesmo sem banco conectado, deve mostrar erro claro)

### Passo 3 — Plugin de Banco de Dados

- [ ] Criar `apps/api/src/plugins/db.ts`:
  - Cria `Pool` do `pg` com `config.DATABASE_URL`
  - `fastify.decorate('db', pool)`
  - Testa conexão no startup (`pool.query('SELECT 1')`)
  - Encerra pool no `fastify.onClose`
- [ ] Configurar `node-pg-migrate` no `package.json` (`"migrate": { "migrationsDir": "src/db/migrations" }`)
- [ ] Verificar: `pnpm --filter api db:migrate` aplica migrations sem erros

### Passo 4 — Migrations e Schema

- [ ] Criar `apps/api/src/db/migrations/001_initial_schema.sql` com schema completo (docs/ARCHITECTURE.md + campo `role`)
- [ ] Criar `apps/api/src/db/migrations/002_add_constraints.sql` com UNIQUE em `osm_id`
- [ ] Criar `apps/api/src/db/migrations/003_seed_badges.sql` com INSERT dos 7 badges
- [ ] Verificar: `pnpm --filter api db:migrate` → tabelas criadas + badges inseridos no Railway

### Passo 5 — Plugin de Autenticação

- [ ] Criar `apps/api/src/plugins/auth.ts`:
  - Registra `@fastify/cookie`
  - Configura `@fastify/passport` com estratégia `passport-google-oauth20`
  - Rotas: `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/logout`, `GET /auth/me`
  - Callback: UPSERT em `users` → gera JWT → seta cookie `httpOnly` → redirect com `returnTo`
- [ ] Criar `apps/api/src/hooks/require-auth.ts`
- [ ] Criar `apps/api/src/hooks/require-admin.ts`
- [ ] Verificar: fluxo OAuth completo em desenvolvimento (requer Google Client ID/Secret)

### Passo 6 — Plugin de Storage (R2)

- [ ] Criar `apps/api/src/plugins/storage.ts`:
  - Instancia `S3Client` com endpoint R2 (`https://${ACCOUNT_ID}.r2.cloudflarestorage.com`)
  - `fastify.decorate('r2', s3Client)`
  - Exporta helper `generatePresignedUrl(key, contentType, expiresIn)`
- [ ] Verificar: `generatePresignedUrl` retorna URL válida (testar com curl)

### Passo 7 — Rotas de Banheiros

- [ ] Criar `apps/api/src/routes/bathrooms.ts`:
  - `GET /bathrooms` — query geoespacial com PostGIS (conforme SQL neste documento)
    - Validação Zod: `lat`, `lng` obrigatórios, `radius` 100–5000 (default 500), `type` e `free` opcionais
    - Retorna `BathroomPin[]`
  - `GET /bathrooms/:id` — SELECT completo com ratings recentes (LIMIT 5) e fotos aprovadas
    - Retorna `BathroomDetail`
  - `POST /bathrooms` — INSERT + pontos + badge scout/explorer (auth + rate limit estrito)
    - Validação Zod: `name`, `lat`, `lng` obrigatórios
  - `PUT /bathrooms/:id` — UPDATE (auth + owner || admin)
  - `POST /bathrooms/:id/report` — INSERT em reports + checar threshold (auth + rate limit estrito)
- [ ] Verificar: `GET /bathrooms?lat=-23.5613&lng=-46.6564&radius=500` retorna dados do Railway

### Passo 8 — Rotas de Avaliações

- [ ] Criar `apps/api/src/services/gamification.ts` com `awardBadgeIfEarned`
- [ ] Criar `apps/api/src/routes/ratings.ts`:
  - `GET /bathrooms/:id/ratings` — lista paginada (page + limit, default limit=10)
  - `POST /bathrooms/:id/ratings` — transaction completa: INSERT rating + pontos + badges (auth + rate limit)
    - Validação Zod: `overall` 1–5 obrigatório, demais opcionais
    - Retorna `{ rating, pointsEarned, badgesEarned[] }`
- [ ] Verificar: avaliar um banheiro → pontos incrementados em `users` → badge `first_flush` concedido

### Passo 9 — Rotas de Fotos

- [ ] Criar `apps/api/src/services/moderation.ts`:
  - `moderatePhoto(imageUrl)` — chama Vision API com SafeSearch + Label Detection
  - Retorna `{ status: 'approved' | 'manual_review' | 'rejected', reason?: string, score: number }`
  - Labels de banheiro: `['bathroom', 'toilet', 'sink', 'plumbing fixture', 'tile']`
  - Labels de condição extrema: `['mold', 'garbage', 'waste', 'fungus']`
- [ ] Criar `apps/api/src/routes/photos.ts`:
  - `POST /photos/presign` — gera presigned URL + valida bathroomId (auth + rate limit)
  - `POST /photos/confirm` — verifica objeto R2 + Vision API + INSERT photos + pontos/badges
    - Se `manual_review`: INSERT em `moderation_queue` com reason
- [ ] Verificar: upload de foto real → Vision API classifica → status correto no banco

### Passo 10 — Rotas de Usuários e Ranking

- [ ] Criar `apps/api/src/routes/users.ts`:
  - `GET /me` — SELECT user + badges conquistados (auth)
- [ ] Criar `apps/api/src/routes/ranking.ts`:
  - `GET /ranking?period=week|month|all` — SELECT users ORDER BY points DESC LIMIT 20
    - `week`: points ganhos nos últimos 7 dias (JOIN com ratings/bathrooms por created_at)
    - `month`: últimos 30 dias
    - `all`: total acumulado (users.points)
- [ ] Verificar: ranking retorna usuários ordenados corretamente por período

### Passo 11 — Rotas de Admin

- [ ] Criar `apps/api/src/routes/admin.ts`:
  - `GET /admin/moderation` — fotos com status `manual_review` + dados do banheiro (requireAdmin)
  - `PUT /admin/moderation/:photoId` — `{ action: 'approve' | 'reject' }` → UPDATE photos + UPDATE moderation_queue
    - Se approve: UPDATE users pontos +20, verificar badge fotografo
  - `GET /admin/reports` — banheiros com status `needs_review` + contagem de reports (requireAdmin)
  - `PUT /admin/reports/:bathroomId` — `{ action: 'confirm_active' | 'close' | 'clear_reports' }` (requireAdmin)
    - `close`: UPDATE status + pontos +15 para quem reportou (se report confirmado)
- [ ] Promover primeiro admin: `UPDATE users SET role = 'admin' WHERE provider_id = 'seu-google-id'`
- [ ] Verificar: painel de moderação acessível só com cookie de admin

### Passo 12 — Script de Import OSM

- [ ] Criar `apps/api/src/services/osm-import.ts`:
  - Fetch para Overpass API com query de `amenity=toilets` em SP
  - Parse do JSON de resposta
  - Mapeamento de campos OSM → schema (conforme tabela neste documento)
  - Batch INSERT com `ON CONFLICT (osm_id) DO UPDATE`
  - Log: total encontrado, inseridos, atualizados, erros
- [ ] Verificar: `pnpm --filter api osm:import` → banheiros no banco com `source='osm'`

### Passo 13 — Plugins de Infraestrutura Restantes

- [ ] Criar `apps/api/src/plugins/cors.ts` (separado para clareza)
- [ ] Criar `apps/api/src/plugins/rate-limit.ts` (global + helpers)
- [ ] Criar `apps/api/src/plugins/error-handler.ts` com `setErrorHandler` completo
- [ ] Verificar: request com body inválido retorna `VALIDATION_ERROR` no formato correto

### Passo 14 — Verificação End-to-End

Executar todos os checks de verificação do `docs/ARCHITECTURE.md`:

- [ ] `GET /bathrooms?lat=-23.5613&lng=-46.6564&radius=500` → retorna banheiros da Paulista
- [ ] Fluxo OAuth Google completo → cookie setado → `/auth/me` retorna user
- [ ] Avaliar banheiro → pontos incrementados → badge `first_flush` concedido
- [ ] Upload foto → Vision API → status `approved` ou `manual_review`
- [ ] `GET /ranking?period=week` → usuário com mais pontos no topo
- [ ] `GET /admin/moderation` sem cookie admin → 403
- [ ] `GET /admin/moderation` com cookie admin → lista de fotos

---

## Checklist de Deploy (Railway)

- [ ] Variáveis de ambiente configuradas no painel Railway
- [ ] `pnpm --filter api db:migrate` executado no banco de produção
- [ ] `pnpm --filter api osm:import` executado para dados iniciais
- [ ] `CORS_ORIGIN` apontando para o domínio Vercel correto
- [ ] `GOOGLE_CALLBACK_URL` atualizada para URL de produção do Railway
- [ ] Google OAuth: URL de callback autorizada no Google Cloud Console
- [ ] Primeiro admin promovido via SQL direto no Railway
