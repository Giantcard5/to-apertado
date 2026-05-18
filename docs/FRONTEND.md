# To Apertado — Planejamento Completo do Frontend

> **Referência de desenvolvimento.** Este arquivo define 100% das decisões de UX, arquitetura de componentes, convenções e passo a passo de implementação do frontend. Consultar sempre antes de criar ou modificar qualquer arquivo em `apps/web/`.
>
> Arquitetura geral (stack, schema SQL, endpoints, estrutura de pastas): ver `docs/ARCHITECTURE.md`.
> Contrato da API (tipos compartilhados): ver `packages/types/index.ts`.

---

## Stack e Versões

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Next.js | 14 (App Router) | Framework React + SSR/SSG |
| TypeScript | ^5 | Linguagem |
| Tailwind CSS | ^3 | Estilização utility-first |
| `react-leaflet` | ^4 | Mapa interativo (sempre `ssr: false`) |
| `leaflet` | ^1.9 | Dependência do react-leaflet |
| `leaflet.markercluster` | ^1.5 | Clustering abaixo do zoom 14 |
| `@types/leaflet` | ^1.9 | Tipos TypeScript do Leaflet |
| `next-pwa` | ^5 | Service Worker + manifest PWA |
| `next-auth` | ^4 | Autenticação Google OAuth |
| `@tanstack/react-query` | ^5 | Cache e estado de dados do servidor |
| `@tanstack/react-query-devtools` | ^5 | Devtools (só em dev) |
| `zod` | ^3 | Validação de formulários |
| `react-hook-form` | ^7 | Gerenciamento de formulários |
| `@hookform/resolvers` | ^3 | Integração Zod + react-hook-form |
| `framer-motion` | ^11 | Animações (bottom sheet, transitions) |
| `lucide-react` | latest | Ícones |
| `clsx` | ^2 | Utilitário condicional de classes |
| `tailwind-merge` | ^2 | Merge inteligente de classes Tailwind |
| `class-variance-authority` | ^0.7 | Variantes de componentes (cva) |
| `sonner` | ^1 | Toast notifications |

---

## Scripts `package.json`

```json
{
  "scripts": {
    "dev":       "next dev",
    "build":     "next build",
    "start":     "next start",
    "typecheck": "tsc --noEmit",
    "lint":      "next lint"
  }
}
```

---

## Variáveis de Ambiente (`apps/web/.env.local`)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL do backend Fastify (ex: `http://localhost:3001`) |
| `NEXTAUTH_URL` | URL do frontend (ex: `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret para assinar sessões NextAuth |
| `GOOGLE_CLIENT_ID` | OAuth Google (mesmas credenciais do backend) |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ID do AdSense (ex: `ca-pub-XXXXXXXX`) |

---

## Identidade Visual

### Tom e Personalidade
**Funcional + humor leve.** Interface limpa com pitadas de humor situacional — ícones expressivos, microcopy divertido, mas sem exageros. Tom: _"te ajudo rápido, sem frescura."_

Exemplos de microcopy:
- Empty state do mapa: _"Parece que ninguém mapeou banheiros aqui ainda. Seja o herói."_
- Confirmação de avaliação: _"Missão cumprida. Você ajudou quem realmente precisava."_
- Login gate: _"Para salvar sua avaliação, entra rápido — não precisa de senha."_

### Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#2563EB` (blue-600) | CTAs, pins ativos, links |
| `primary-hover` | `#1D4ED8` (blue-700) | Hover/pressed states |
| `accent` | `#F59E0B` (amber-500) | Badges urgentes, destaques |
| `background` | `#F9FAFB` (gray-50) | Fundo principal (light) |
| `surface` | `#FFFFFF` | Cards, sheets, modals |
| `text-primary` | `#111827` (gray-900) | Texto principal |
| `text-secondary` | `#6B7280` (gray-500) | Texto secundário |
| `success` | `#16A34A` (green-600) | Banheiro limpo, disponível |
| `warning` | `#D97706` (amber-600) | Banheiro com ressalvas |
| `error` | `#DC2626` (red-600) | Banheiro com problema |

Dark mode tokens (Tailwind `dark:` classes):

| Token light | Token dark |
|------------|------------|
| `bg-gray-50` | `dark:bg-gray-950` |
| `bg-white` | `dark:bg-gray-900` |
| `text-gray-900` | `dark:text-gray-50` |
| `text-gray-500` | `dark:text-gray-400` |

### Dark Mode
Toggle manual (botão no perfil) + respeita `prefers-color-scheme` do sistema. Persistido em `localStorage` via Context. Implementado com a classe `dark` no `<html>` — estratégia de Tailwind `darkMode: 'class'`.

### Tipografia
- **Font**: Inter (Google Fonts via `next/font/google`)
- **Pesos**: 400 (texto), 500 (labels), 600 (headings), 700 (CTAs)

### Pins do Mapa

| Status | Cor | Ícone |
|--------|-----|-------|
| Ativo + bem avaliado (≥4) | Azul primário | 🚻 |
| Ativo + avaliação média (2–4) | Âmbar | 🚻 |
| Ativo + mal avaliado (<2) | Vermelho | 🚻 |
| Ativo + sem avaliação | Cinza | 🚻 |
| Precisa revisão | Laranja + badge de alerta | ⚠️ |

---

## Navegação e Layout

### Bottom Navigation Bar

```
┌─────────────────────────────────────────┐
│  🗺 Mapa  │  🔍 Buscar  │  ➕  │  👤 Perfil  │
└─────────────────────────────────────────┘
```

- **Mapa**: tela principal com Leaflet (rota `/`)
- **Buscar**: busca por endereço/bairro (rota `/busca`)
- **➕**: cadastrar novo banheiro — abre bottom sheet de login se não autenticado (rota `/registrar`)
- **Perfil**: página de usuário ou tela de login se não autenticado (rota `/perfil`)

### Estrutura de Rotas (App Router)

```
app/
├── (map)/
│   └── page.tsx                      # Mapa principal (default)
├── (search)/
│   └── busca/page.tsx                # Busca por endereço
├── (auth)/
│   ├── login/page.tsx                # Login Google
│   └── perfil/page.tsx               # Perfil + badges + histórico
├── (contribute)/
│   ├── registrar/page.tsx            # Cadastrar banheiro (3 passos)
│   └── avaliar/[id]/page.tsx         # Avaliar banheiro (3 passos)
├── ranking/page.tsx                  # Leaderboard
├── banheiros-em/[bairro]/page.tsx    # SEO por bairro (SSG)
├── api/auth/[...nextauth]/route.ts   # NextAuth handler
├── sitemap.ts                        # Sitemap automático
└── layout.tsx                        # Root layout (providers, fonts, PWA)
```

---

## Arquitetura de Componentes

### Estrutura de Pastas

```
apps/web/
├── app/                              # Next.js App Router (rotas)
├── components/
│   ├── map/
│   │   ├── LeafletMap.tsx            # Wrapper principal (sempre dynamic ssr:false)
│   │   ├── BathroomPin.tsx           # Pin customizado com cor por rating
│   │   ├── MapCluster.tsx            # Clustering abaixo zoom 14
│   │   ├── MapFilters.tsx            # Chips horizontais no topo do mapa
│   │   └── LocateButton.tsx          # FAB "Usar minha localização"
│   ├── bathroom/
│   │   ├── BathroomSheet.tsx         # Bottom sheet 2 estágios (peek → full)
│   │   ├── BathroomDetail.tsx        # Conteúdo completo do bottom sheet
│   │   ├── BathroomCard.tsx          # Mini-card estágio 1 (peek)
│   │   ├── RatingStars.tsx           # Componente de estrelas (display)
│   │   ├── AttributeChips.tsx        # Chips de atributos (papel, sabão, etc.)
│   │   ├── PhotoGallery.tsx          # Galeria de fotos aprovadas
│   │   └── ReportButton.tsx          # Botão de reportar problema
│   ├── rating/
│   │   ├── RatingForm.tsx            # Wizard 3 passos de avaliação
│   │   ├── Step1Stars.tsx            # Passo 1: nota geral (1-5 estrelas)
│   │   ├── Step2Attributes.tsx       # Passo 2: atributos com ícones
│   │   └── Step3PhotoComment.tsx     # Passo 3: foto opcional + comentário
│   ├── registration/
│   │   ├── RegisterForm.tsx          # Wizard 3 passos de cadastro
│   │   ├── Step1Location.tsx         # Passo 1: mapa interativo + "Usar localização"
│   │   ├── Step2NameType.tsx         # Passo 2: nome e tipo de estabelecimento
│   │   └── Step3Details.tsx          # Passo 3: is_free, acessível, chave, horários
│   ├── gamification/
│   │   ├── BadgeGrid.tsx             # Grid 3 colunas de badges
│   │   ├── BadgeCard.tsx             # Badge individual (conquistado vs. bloqueado)
│   │   ├── PointsDisplay.tsx         # Total de pontos
│   │   └── NextBadgeProgress.tsx     # Progress bar próximo badge
│   ├── ranking/
│   │   ├── RankingTable.tsx          # Tabela do leaderboard
│   │   ├── RankingRow.tsx            # Linha do leaderboard
│   │   └── PeriodTabs.tsx            # Tabs: Semana | Mês | Geral
│   ├── auth/
│   │   ├── LoginSheet.tsx            # Bottom sheet de login (gate suave)
│   │   └── GoogleSignInButton.tsx    # Botão "Continuar com Google"
│   ├── ads/
│   │   └── AdBanner.tsx              # Banner AdSense dentro do BathroomDetail
│   └── ui/
│       ├── BottomSheet.tsx           # Componente genérico de bottom sheet
│       ├── BottomNav.tsx             # Barra de navegação inferior
│       ├── Chip.tsx                  # Chip/tag filtrável
│       ├── Button.tsx                # Botão primário/secundário/ghost
│       ├── ProgressBar.tsx           # Barra de progresso (formulários + badges)
│       ├── Avatar.tsx                # Avatar do usuário
│       ├── Skeleton.tsx              # Loading skeleton
│       └── ThemeToggle.tsx           # Toggle light/dark mode
├── lib/
│   ├── api.ts                        # Cliente HTTP para o backend (fetch + cookie)
│   ├── auth.ts                       # NextAuth config (Google provider)
│   ├── leaflet-config.ts             # Configuração global do Leaflet (icons, defaults)
│   ├── query-client.ts               # TanStack Query client config
│   └── utils.ts                      # cn() (clsx + tailwind-merge), formatters
├── hooks/
│   ├── useBathrooms.ts               # TanStack Query: GET /bathrooms
│   ├── useBathroomDetail.ts          # TanStack Query: GET /bathrooms/:id
│   ├── useGeolocation.ts             # navigator.geolocation com fallback
│   ├── useNearbyBathrooms.ts         # Combina geolocation + useBathrooms
│   ├── useRanking.ts                 # TanStack Query: GET /ranking
│   └── useUser.ts                    # TanStack Query: GET /me
├── contexts/
│   ├── AuthContext.tsx               # Usuário logado, logout, estado de auth
│   └── ThemeContext.tsx              # dark/light mode + toggle + localStorage
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── icons/                        # Ícones PWA (192x192, 512x512, maskable)
│   └── leaflet/                      # Ícones do Leaflet (marker icons)
└── next.config.js                    # next-pwa config + redirects
```

---

## Gerenciamento de Estado

### React Context (estado UI simples)

**`AuthContext`**: usuário autenticado, loading de auth, função de logout. Alimentado via NextAuth `useSession`. Expõe `requireAuth(action)` que, se não autenticado, abre o `LoginSheet` com mensagem contextual.

**`ThemeContext`**: `theme: 'light' | 'dark' | 'system'`, `toggleTheme()`, persiste em `localStorage`. Aplica classe `dark` no `<html>`. Inicializa respeitando `prefers-color-scheme` se não houver valor salvo.

### TanStack Query (dados do servidor)

```ts
// lib/query-client.ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,         // 1 minuto antes de revalidar
      gcTime: 5 * 60_000,        // 5 minutos no cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

Query keys padronizadas:

```ts
export const queryKeys = {
  bathrooms: (params: BathroomsParams) => ['bathrooms', params],
  bathroom:  (id: string)             => ['bathroom', id],
  rankings:  (period: string)         => ['rankings', period],
  user:      ()                       => ['user'],
}
```

---

## Integração com o Backend

### Cliente HTTP (`lib/api.ts`)

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) { super(message) }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',   // envia cookie httpOnly JWT
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new ApiError(res.status, err.error, err.message, err.details)
  }
  return res.json()
}
```

### Fluxo de Upload de Foto (`Step3PhotoComment.tsx`)

1. `POST /photos/presign` com `{ bathroom_id, content_type }` → recebe `{ presigned_url, object_key }`
2. `fetch(presigned_url, { method: 'PUT', body: file })` — upload direto para R2 (sem passar pelo backend)
3. `POST /photos/confirm` com `{ bathroom_id, object_key, rating_id? }` — backend modera e salva

### Autenticação

O backend já tem `/auth/google` e `/auth/google/callback` que recebem o redirect do Google OAuth diretamente, setam o cookie JWT httpOnly e redirecionam para o frontend. O frontend não usa NextAuth para a troca de tokens — apenas redireciona para o endpoint do backend.

`AuthContext` verifica o estado de auth chamando `GET /me` na inicialização. Se retornar 401, o usuário está deslogado.

---

## Componentes Críticos

### `LeafletMap.tsx`

```tsx
// SEMPRE usar dynamic import com ssr: false
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false })
```

Responsabilidades:
- `MapContainer` com tile layer OpenStreetMap
- Zoom ≥ 14: renderiza `BathroomPin` para cada banheiro
- Zoom < 14: `MapCluster` agrupa pins próximos
- Ao mover o mapa: debounce 300ms antes de re-buscar `/bathrooms`
- `LocateButton` no canto inferior direito

### `BathroomSheet.tsx` (Bottom Sheet 2 Estágios)

Usa `framer-motion` para animação de drag:

```
Estágio 0 (fechado):         translateY(100%)
Estágio 1 (peek, 30% tela):  snap em 30vh — mostra BathroomCard
Estágio 2 (full, 90% tela):  snap em 90vh — mostra BathroomDetail
```

Drag handle clicável no topo. Swipe down fecha. Swipe up expande. Backdrop escurece o mapa no estágio 2.

### `RatingForm.tsx` (Wizard 3 Passos)

| Passo | Componente | Campos |
|-------|-----------|--------|
| 1 | `Step1Stars` | `overall` (1–5) com animação de estrelas |
| 2 | `Step2Attributes` | `cleanliness` (3 chips), `has_paper`, `has_soap`, `has_dryer`, `smell` (3 chips) |
| 3 | `Step3PhotoComment` | Até 3 fotos via presigned URL + `comment` opcional |

Progress bar no topo: `[== ] Passo 1 de 3`. Submit no Passo 3 envia: `POST /ratings` → presign + upload + confirm para cada foto.

### `RegisterForm.tsx` (Wizard 3 Passos)

| Passo | Componente | Campos |
|-------|-----------|--------|
| 1 | `Step1Location` | Mapa clicável para marcar pin + botão "Usar minha localização" |
| 2 | `Step2NameType` | `name` (texto), `place_type` (chips: Público/Shopping/Restaurante/Posto/Outro) |
| 3 | `Step3Details` | `is_free`, `is_accessible`, `requires_key` (toggles) + `opening_hours` (textarea) |

### `BottomSheet.tsx` (Genérico)

```ts
interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  snapPoints?: number[]   // percentual da altura da tela, ex: [0.3, 0.9]
  initialSnap?: number
  children: React.ReactNode
}
```

### `LoginSheet.tsx` (Gate Suave)

Disparado por `AuthContext.requireAuth(action)`. Mostra título contextual ("Entre para avaliar" / "Entre para cadastrar") + botão Google + texto secundário "Sem senha. Só o Google."

---

## UX de Mapa

### Carregamento de Pins

1. App inicializa → `useGeolocation()` solicita permissão
2. Permitido: centraliza mapa no usuário, `GET /bathrooms?lat=&lng=&radius=1000`
3. Negado: centraliza em SP (`lat: -23.5505, lng: -46.6333`), busca por esse ponto
4. Ao mover o mapa: debounce 300ms → nova busca com centróide + raio pelo zoom
5. TanStack Query cacheia 60s — mover de volta não refaz a request

### Clustering

- Zoom ≥ 14: pins individuais `BathroomPin`
- Zoom < 14: `MapCluster` com `leaflet.markercluster`
- Clicar no cluster faz zoom para o grupo

### Filtros (`MapFilters.tsx`)

Chips horizontais deslizáveis, fixed position sobre o Leaflet:

```
[Gratuito] [Acessível] [Shopping] [Restaurante] [Público] [Posto]
```

Estado em `useState` local na página do mapa. Mudança de filtro invalida a query e refaz a busca.

---

## PWA (next-pwa + Workbox)

### `public/manifest.json`

```json
{
  "name": "To Apertado",
  "short_name": "To Apertado",
  "description": "Banheiros de SP — rápido, honesto, crowdsourced",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F9FAFB",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Estratégias de Cache (Workbox)

| Recurso | Estratégia | TTL |
|---------|-----------|-----|
| Assets estáticos (JS, CSS) | `CacheFirst` | 30 dias |
| Fontes Google | `CacheFirst` | 365 dias |
| Tiles OpenStreetMap | `NetworkFirst` com fallback | 7 dias |
| `GET /bathrooms` | `NetworkFirst` com fallback offline | 5 min |
| Imagens (R2) | `StaleWhileRevalidate` | 1 hora |

---

## Monetização (Google AdSense)

O anúncio aparece **dentro do `BathroomDetail`** (estágio 2 do bottom sheet), entre as fotos e as avaliações. Sem banner fixo permanente. Controlado por `sessionStorage` para exibir 1x por sessão.

```tsx
// app/layout.tsx
<Script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
  strategy="afterInteractive"
  crossOrigin="anonymous"
/>
```

---

## SEO por Bairro

`app/banheiros-em/[bairro]/page.tsx`:
- `generateStaticParams` com bairros com mais banheiros cadastrados
- `generateMetadata` dinâmico: `"Banheiros em Pinheiros, SP — To Apertado"`
- SSR com dados frescos do backend
- Links internos entre bairros próximos

---

## Sistema de Design — Convenções Tailwind

### Utilitário `cn()`

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Variantes com `cva`

```ts
// Exemplo: Button
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-600',
  {
    variants: {
      variant: {
        primary:   'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-50',
        ghost:     'text-gray-600 hover:bg-gray-100 dark:text-gray-400',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)
```

### Convenções de Classes

- Componentes UI genéricos (`ui/`): sem `dark:` embutido, recebem via `className`
- Componentes de feature: `dark:` incluído
- Bottom sheets: sempre `bg-white dark:bg-gray-900`
- Touch targets: mínimo `min-h-[44px]` (acessibilidade mobile)
- Foco: `focus-visible:ring-2 focus-visible:ring-blue-600 outline-none`

---

## Animações (Framer Motion)

| Elemento | Animação | Duração |
|----------|---------|---------|
| Bottom sheet abrir | `y: '100%' → 0` | 300ms ease-out |
| Bottom sheet fechar | `y: 0 → '100%'` | 250ms ease-in |
| Pin selecionado | scale 1 → 1.2 → 1 | 200ms spring |
| Chip de filtro ativar | background + color | 150ms |
| Estrelas (step 1) | fill sequencial | 100ms each |
| Badge conquistado | scale + glow | 400ms spring |
| Toast notification | slide-in de baixo | 250ms |
| Skeleton | pulse | infinito |
| Page transition | opacity 0 → 1 | 200ms |

---

## Guia de Uso das Skills e MCPs

### `emil-design-eng`
**Quando usar**: ao criar qualquer componente com animação ou micro-interação.
- Bottom sheet drag + snap points (`BathroomSheet.tsx`)
- Estrelas animadas (`Step1Stars.tsx`)
- Badge earn animation (`BadgeCard.tsx`)
- Pin pulse ao ser selecionado (`BathroomPin.tsx`)

**Comando**: `/emil` antes de implementar componentes com motion.

### `impeccable`
**Quando usar**: durante todo o desenvolvimento para enforcement de padrões de qualidade.
- Verificar contraste de texto (WCAG AA mínimo)
- Touch targets ≥ 44px em todos os elementos clicáveis
- Estados de loading/error/empty em todos os componentes async
- Hierarquia visual consistente

**Comando**: `/impeccable` antes de considerar qualquer componente como pronto.

### `taste-skill` (+ variantes `minimalist-ui`, `high-end-visual-design`, `design-taste-frontend`)
**Quando usar**: ao finalizar uma feature completa para verificar personalidade e qualidade visual.
- Verificar se o mapa + pins parece "feito com cuidado"
- Revisar se o RatingForm evita o visual genérico de formulário
- Checar se a página de perfil/badges transmite senso de conquista
- Validar se o app tem personalidade própria ou parece "template"

**Comando**: invocar a variante mais adequada ao contexto da revisão.

### `ui-refactor` (Refactoring-UI)
**Quando usar**: ao ajustar espaçamento, hierarquia tipográfica e contraste.
- Após gerar componentes iniciais, aplicar escala tipográfica e espaçamento consistente
- Revisar densidades do bottom sheet (uso com polegar)
- Verificar contraste em todos os estados (default/hover/disabled/error)

**Comando**: `/ui-refactor` em qualquer componente tecnicamente correto mas visualmente fraco.

---

### MCP `magic` (21st.dev)
**Quando usar**: para gerar os primeiros rascunhos de componentes UI complexos.
- `BathroomCard.tsx` — mini-card com rating visual
- `BadgeGrid.tsx` + `BadgeCard.tsx` — grade de conquistas
- `RankingTable.tsx` — leaderboard com posições
- `GoogleSignInButton.tsx` — botão branded Google
- `ProgressBar.tsx` — animado, com cor contextual

**Fluxo**: magic para rascunho → `ui-refactor` para refinamento → `impeccable` para revisão final.

### MCP `playwright`
**Quando usar**: verificação visual e testes E2E ao final de cada passo do checklist.
- Verificar mapa carregando e exibindo pins em `localhost:3000`
- Testar fluxo completo de avaliação (3 passos)
- Verificar bottom sheet drag (abrir/fechar/snap)
- Testar filtros alterando os pins exibidos
- Verificar PWA: manifest, service worker, install prompt
- Lighthouse PWA score (target > 90)
- Screenshots para comparação visual light/dark mode

**Quando rodar**: ao concluir cada passo do checklist abaixo.

### MCP `next-devtools`
**Quando usar**: dúvidas sobre APIs do Next.js 14 App Router.
- Configurar `generateStaticParams` para `/banheiros-em/[bairro]`
- Configurar `generateMetadata` dinâmico
- Dúvidas sobre `loading.tsx`, `error.tsx`, Route Handlers
- `browser_eval` para debugging de estado no runtime

**Quando rodar**: antes de implementar qualquer feature específica do App Router.

### MCP `tailwindcss`
**Quando usar**: dúvidas sobre utilities, configuração ou conversão de CSS.
- Configurar tema customizado no `tailwind.config.ts`
- Converter estilos CSS dos exemplos do Leaflet para Tailwind
- Buscar utilities para grids, animações, sombras
- Verificar se existe utility antes de escrever CSS custom

**Quando rodar**: sempre que for escrever CSS — verificar primeiro se existe utility Tailwind.

---

## Checklist de Implementação

### Passo 1 — Setup do Projeto Next.js
- [ ] Criar app: `pnpm create next-app apps/web --typescript --tailwind --app --no-src-dir`
- [ ] Instalar dependências: `react-leaflet leaflet @types/leaflet leaflet.markercluster framer-motion @tanstack/react-query @tanstack/react-query-devtools react-hook-form @hookform/resolvers zod lucide-react clsx tailwind-merge class-variance-authority sonner next-pwa next-auth`
- [ ] Configurar `tailwind.config.ts` com paleta de cores customizada e `darkMode: 'class'`
- [ ] Criar `lib/utils.ts` com `cn()`
- [ ] Criar `lib/query-client.ts` com configuração padrão e `queryKeys`
- [ ] Criar `lib/api.ts` com `apiFetch` e classe `ApiError`
- [ ] Criar `contexts/AuthContext.tsx` e `contexts/ThemeContext.tsx`
- [ ] Configurar `app/layout.tsx` com providers (QueryClient, Auth, Theme) + Inter font + AdSense script
- [ ] Configurar `next.config.js` com next-pwa
- [ ] Criar `apps/web/.env.local` com as 6 variáveis de ambiente

**Skills/MCPs**: `tailwindcss` para config do tema, `next-devtools` para estrutura do App Router.

### Passo 2 — Componentes UI Base
- [ ] `ui/Button.tsx` com variantes (primary, secondary, ghost) usando cva
- [ ] `ui/BottomSheet.tsx` com framer-motion e snap points
- [ ] `ui/BottomNav.tsx` com 4 tabs (Mapa, Buscar, +, Perfil)
- [ ] `ui/Chip.tsx` filtrável (selecionado/não-selecionado)
- [ ] `ui/Skeleton.tsx` com animação pulse
- [ ] `ui/ProgressBar.tsx` animado com cor configurável
- [ ] `ui/ThemeToggle.tsx`
- [ ] `ui/Avatar.tsx`

**Skills/MCPs**: `magic` para rascunços iniciais, `emil-design-eng` para animações, `impeccable` para revisão.

### Passo 3 — Mapa Principal
- [ ] `lib/leaflet-config.ts` com ícones e defaults
- [ ] `components/map/BathroomPin.tsx` com cor por rating
- [ ] `components/map/MapCluster.tsx` (leaflet.markercluster, zoom < 14)
- [ ] `components/map/MapFilters.tsx` (chips horizontais)
- [ ] `components/map/LocateButton.tsx` (FAB de localização)
- [ ] `components/map/LeafletMap.tsx` (integra tudo, dynamic ssr:false)
- [ ] `hooks/useGeolocation.ts`
- [ ] `hooks/useBathrooms.ts` (TanStack Query)
- [ ] `hooks/useNearbyBathrooms.ts` (geolocation + useBathrooms + debounce 300ms)
- [ ] `app/(map)/page.tsx` integrando mapa + filtros + bottom sheet

**Skills/MCPs**: `playwright` para verificar mapa no browser, `tailwindcss` para overlay dos filtros.

### Passo 4 — Bottom Sheet de Detalhes
- [ ] `components/bathroom/RatingStars.tsx` (display)
- [ ] `components/bathroom/AttributeChips.tsx`
- [ ] `components/bathroom/PhotoGallery.tsx`
- [ ] `components/bathroom/ReportButton.tsx`
- [ ] `components/bathroom/BathroomCard.tsx` (peek, estágio 1)
- [ ] `components/ads/AdBanner.tsx` (1 anúncio por sessão via sessionStorage)
- [ ] `components/bathroom/BathroomDetail.tsx` (estágio 2 com AdBanner)
- [ ] `components/bathroom/BathroomSheet.tsx` (integra 2 estágios)
- [ ] `hooks/useBathroomDetail.ts`

**Skills/MCPs**: `magic` para BathroomDetail, `emil-design-eng` para animação drag, `playwright` para testar snap points.

### Passo 5 — Autenticação
- [ ] `lib/auth.ts` — configurar redirecionamento para backend `/auth/google`
- [ ] `contexts/AuthContext.tsx` — verificar auth via `GET /me` na inicialização
- [ ] `app/(auth)/login/page.tsx`
- [ ] `components/auth/GoogleSignInButton.tsx`
- [ ] `components/auth/LoginSheet.tsx` (gate suave com mensagem contextual)
- [ ] Proteger `/registrar` e `/avaliar/[id]` via `requireAuth()`

**Skills/MCPs**: `next-devtools` para Route Handlers, `playwright` para testar fluxo OAuth end-to-end.

### Passo 6 — Formulário de Avaliação
- [ ] `components/rating/Step1Stars.tsx` (estrelas animadas com framer-motion)
- [ ] `components/rating/Step2Attributes.tsx` (chips de atributos com ícones)
- [ ] `components/rating/Step3PhotoComment.tsx` (3 fotos via presigned URL + comentário)
- [ ] `components/rating/RatingForm.tsx` (wizard 3 passos + progress bar)
- [ ] `app/(contribute)/avaliar/[id]/page.tsx`

**Skills/MCPs**: `magic` para rascunço dos chips, `emil-design-eng` para animação das estrelas, `impeccable` para touch targets.

### Passo 7 — Cadastro de Banheiro
- [ ] `components/registration/Step1Location.tsx` (mapa clicável + "Usar localização")
- [ ] `components/registration/Step2NameType.tsx` (nome + chips de tipo)
- [ ] `components/registration/Step3Details.tsx` (toggles + horários)
- [ ] `components/registration/RegisterForm.tsx` (wizard 3 passos)
- [ ] `app/(contribute)/registrar/page.tsx`

**Skills/MCPs**: `playwright` para testar fluxo completo end-to-end.

### Passo 8 — Gamificação (Perfil + Ranking)
- [ ] `components/gamification/BadgeCard.tsx` (conquistado vs. bloqueado)
- [ ] `components/gamification/BadgeGrid.tsx` (grid 3 colunas)
- [ ] `components/gamification/PointsDisplay.tsx`
- [ ] `components/gamification/NextBadgeProgress.tsx`
- [ ] `hooks/useUser.ts`
- [ ] `app/(auth)/perfil/page.tsx` (avatar + pontos + grid de badges)
- [ ] `components/ranking/RankingRow.tsx`, `RankingTable.tsx`, `PeriodTabs.tsx`
- [ ] `hooks/useRanking.ts`
- [ ] `app/ranking/page.tsx`

**Skills/MCPs**: `magic` para BadgeGrid e RankingTable, `taste-skill` para revisar senso de conquista na página de perfil.

### Passo 9 — PWA e Offline
- [ ] `public/manifest.json` completo
- [ ] Gerar ícones PWA (192, 512, maskable)
- [ ] Configurar Workbox runtime caching no `next.config.js` (tiles OSM + /bathrooms)
- [ ] `app/(search)/busca/page.tsx` com busca por endereço (Nominatim ou backend)
- [ ] Testar install prompt e "Adicionar à tela inicial"

**Skills/MCPs**: `playwright` para Lighthouse PWA score + verificar manifest.

### Passo 10 — SEO e Otimização
- [ ] `app/banheiros-em/[bairro]/page.tsx` com SSR + `generateStaticParams`
- [ ] `generateMetadata` dinâmico para páginas de bairro
- [ ] `app/sitemap.ts` automático
- [ ] `public/robots.txt`
- [ ] Verificar Core Web Vitals com Lighthouse

**Skills/MCPs**: `next-devtools` para `generateStaticParams` e metadata API, `playwright` para auditar Core Web Vitals.

---

## Verificação End-to-End

1. **Mapa**: `pnpm --filter web dev` → `localhost:3000` → pins aparecem → clicar abre BathroomCard → arrastar para cima abre BathroomDetail
2. **Filtros**: ativar "Gratuito" → pins de banheiros pagos desaparecem do mapa
3. **Auth**: clicar Avaliar sem login → LoginSheet aparece → clicar Google → redirect para backend → retorno com cookie JWT setado
4. **Avaliação**: autenticado → avaliar em 3 passos → confirmação → `GET /me` mostra pontos atualizados
5. **Foto**: no Passo 3 → escolher imagem → preview local → envio presigned → status `pending` visível no BathroomDetail
6. **Cadastro**: tab ➕ → marcar no mapa → 3 passos → banheiro aparece no mapa
7. **Ranking**: `localhost:3000/ranking` → usuário com avaliação aparece na lista
8. **PWA**: Chrome DevTools → Application → Manifest → ícone correto; Lighthouse PWA score > 90
9. **Dark mode**: toggle no perfil → interface muda para dark → reload persiste preferência via localStorage
10. **Offline**: service worker ativo → desligar rede → banheiros cacheados ainda aparecem no mapa
