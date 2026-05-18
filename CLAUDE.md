# To Apertado

PWA crowdsourced de mapeamento de banheiros em São Paulo com avaliações de qualidade em tempo real (limpeza, papel, sabão, acessibilidade).

Documentação completa: **docs/ARCHITECTURE.md** · **docs/BACKEND.md** · **docs/FRONTEND.md**

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Mapas | Leaflet + OpenStreetMap (`react-leaflet` v4, sempre `ssr: false`) |
| PWA | next-pwa v5 (CJS — usar `createRequire` em `.mjs`) |
| Auth | Backend JWT cookie httpOnly (sem NextAuth — ver seção Auth) |
| Backend | Node.js + Fastify v4 + TypeScript |
| Validação | Zod (endpoints + env vars no startup) |
| Banco | PostgreSQL + PostGIS (Railway) |
| Storage | Cloudflare R2 (fotos, API S3-compatível) |
| Moderação | Google Vision API SafeSearch + fila manual |
| Hospedagem | Vercel (web) + Railway (api + db) |
| Monorepo | pnpm workspaces + Turborepo |

---

## Estrutura

```
apps/web/        → Next.js PWA (frontend)
apps/api/        → Fastify API (backend)
packages/types/  → Tipos TypeScript compartilhados (DTOs da API)
docs/            → Documentação técnica detalhada
```

---

## Comandos

```bash
pnpm install               # Setup inicial
pnpm dev                   # Tudo junto (frontend + backend)
pnpm --filter web dev      # Só o frontend (localhost:3000)
pnpm --filter api dev      # Só o backend (localhost:3001)
pnpm build                 # Build de produção
pnpm typecheck             # Verificar tipos TypeScript
pnpm --filter api db:migrate  # Migrar banco de dados
pnpm --filter api osm:import  # Importar banheiros do OpenStreetMap
```

---

## Variáveis de Ambiente

`apps/web/.env.local` e `apps/api/.env` — ver `.env.example` em cada pasta.

**Backend (obrigatórias):**
- `DATABASE_URL` — PostgreSQL com PostGIS (Railway)
- `JWT_SECRET` — mínimo 32 caracteres
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL`
- `CLOUDFLARE_R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_URL`
- `GOOGLE_VISION_API_KEY`
- `CORS_ORIGIN`

**Frontend:**
- `NEXT_PUBLIC_API_URL` — URL do backend (ex: `http://localhost:3001`)
- `NEXT_PUBLIC_ADSENSE_CLIENT` — ID do AdSense (opcional)

---

## Autenticação

O backend gerencia 100% do OAuth — sem NextAuth no frontend para troca de tokens.

```
GET /auth/google           → redireciona para Google
GET /auth/google/callback  → UPSERT users → gera JWT → seta cookie httpOnly → redirect
GET /auth/logout           → limpa cookie
GET /me                    → retorna User diretamente (sem wrapper { data: User })
```

O frontend redireciona para `${API_URL}/auth/google?returnTo=${path}`. O cookie JWT httpOnly é enviado automaticamente em toda chamada `fetch` com `credentials: 'include'`.

---

## Convenções de Código

### Geral
- TypeScript strict mode em todos os pacotes
- Sem comentários óbvios — comentar apenas lógica não-trivial
- Named exports em componentes React (nunca `export default` em componentes)
- Arquivos de componentes em PascalCase (`LeafletMap.tsx`)

### Frontend
- Leaflet **sempre** com `dynamic(() => ..., { ssr: false })` no Next.js
- CSS do leaflet.markercluster: importar de `leaflet.markercluster/dist/` (não `react-leaflet-cluster`)
- Z-index sobre o Leaflet: usar `z-[1000]+` — Leaflet ocupa até ~700 internamente
- `BottomNav` e modals: `z-[9999]` para ficar acima de tudo
- Dark mode: `darkMode: 'class'` no Tailwind, classe `dark` no `<html>` via `ThemeContext`
- TanStack Query: `staleTime: 60_000`, `retry: false` em hooks de auth (`useUser`)

### Backend
- Zod valida **todas** as env vars no startup — app não sobe se faltar variável
- Rate limit: global 200 req/min + estrito 10 req/min nas rotas de escrita
- Erros sempre no shape `{ error: string, message: string, details?: [...] }`
- Nunca vazar stack traces em produção
- Queries geoespaciais via PostGIS (`ST_DWithin`, `ST_Distance`, `ST_MakePoint`)

---

## Banco de Dados

Tabelas: `users`, `bathrooms`, `ratings`, `photos`, `badges`, `user_badges`, `moderation_queue`, `reports`.

Índice crítico:
```sql
CREATE INDEX idx_bathrooms_location ON bathrooms USING GIST(location);
```

Query de busca: ver `docs/ARCHITECTURE.md` → "Query Geoespacial Principal".

---

## Gamificação

| Ação | Pontos |
|------|--------|
| Cadastrar banheiro | +50 |
| Avaliar | +10 |
| Foto aprovada | +20 |
| Report confirmado | +15 |

Badges: `first_flush`, `scout`, `explorer_10`, `explorer_50`, `critico_100`, `fotografo`, `guardiao_sp`.

---

## Moderação de Fotos

Vision API SafeSearch + Label Detection:
- score > 0.9 + label de banheiro presente → **approved**
- score 0.5–0.9 ou foto suspeita → **manual_review** (INSERT em `moderation_queue`)
- adult/violence/racy LIKELY → **rejected**

---

## Decisões Não-Óbvias

| Situação | Decisão |
|---------|---------|
| `GET /me` retorna | `User` diretamente, não `{ data: User }` |
| `opening_hours` no cadastro | Enviar `{ raw: string }` — campo JSONB no banco |
| Upload de foto | Presign → PUT direto no R2 → confirm (falha na foto não cancela a avaliação) |
| Clustering no mapa | zoom < 14: `leaflet.markercluster` / zoom ≥ 14: pins individuais |
| next-pwa em `.mjs` | Usar `createRequire(import.meta.url)` para importar o CJS |
| Ícones PWA | SVGs funcionam em browsers modernos; PNGs para produção |

---

## Fase Atual

Frontend e backend do MVP estão implementados. Próximos passos operacionais:

- [ ] Configurar Railway (banco de dados)
- [ ] Instalar PostgreSQL MCP (aguarda Railway)
- [ ] Executar migrations e import OSM em produção
- [ ] Configurar Google OAuth no Google Cloud Console
- [ ] Configurar Cloudflare R2
- [ ] Deploy no Vercel (frontend) + Railway (backend)
- [ ] Promover primeiro admin: `UPDATE users SET role = 'admin' WHERE provider_id = '...'`
