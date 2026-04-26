# Konzert

Plataforma web que muestra eventos en Santiago de Chile en un mapa interactivo, permite comprar entradas y notifica a los usuarios cuando sus artistas favoritos anuncian shows en el país.

---

## Funcionalidades principales

- **Mapa georeferenciado** — eventos en Santiago filtrados por categoría, fecha, precio y distancia
- **Derivación a compra** — link directo a la plataforma de tickets (PuntoTicket, Ticketmaster, Passline, etc.)
- **Artistas favoritos** — sigue artistas y recibe un email cuando anuncian un evento en Chile o abren la venta de entradas
- **Backoffice** — panel de administración para gestionar eventos, artistas y monitorear el scraper

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend + API | Next.js 15 (App Router) · TypeScript |
| UI | Tailwind CSS · shadcn/ui |
| Mapa | Mapbox GL JS |
| Auth | Auth.js v5 (credentials) |
| ORM | Prisma |
| Base de datos | PostgreSQL + PostGIS |
| Cache / Queue | Redis · BullMQ |
| Scraper | Playwright · Cheerio |
| Email | Resend · React Email |
| Admin | Payload CMS v3 |
| Monorepo | Turborepo · pnpm workspaces |
| Deploy app | Vercel |
| Deploy workers + DB | Railway |
| CI/CD | GitHub Actions |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
│                    Next.js 15 (Vercel)                           │
│          /map · /events · /profile · /admin (Payload)            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ API Routes (Route Handlers)
┌──────────────────────▼──────────────────────────────────────────┐
│                      BASE DE DATOS                               │
│              PostgreSQL + PostGIS (Railway)                       │
│         users · events · artists · venues · notifications        │
└───────────┬──────────────────────────────┬──────────────────────┘
            │ Prisma Client                │ Prisma Client
┌───────────▼──────────┐       ┌───────────▼──────────────────────┐
│   WORKERS (Railway)  │       │         REDIS (Railway)           │
│   BullMQ Workers     │◄──────│   Job Queue · Cache               │
│   · scraper.worker   │       └──────────────────────────────────┘
│   · email.worker     │
└───────────┬──────────┘
            │ Playwright + Cheerio
┌───────────▼──────────────────────────────────────────────────────┐
│              PLATAFORMAS DE TICKETS (scraping)                    │
│   PuntoTicket · Ticketmaster CL · Passline · Joinnus · Fintix    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Estructura del monorepo

```
/
├── apps/
│   ├── web/                    # Next.js 15 + Payload CMS v3
│   │   ├── src/
│   │   │   ├── app/            # App Router (pages, layouts, API routes)
│   │   │   │   ├── (public)/   # Rutas públicas: mapa, evento, artista
│   │   │   │   ├── (auth)/     # Login, registro, recuperación
│   │   │   │   ├── (private)/  # Perfil, artistas seguidos
│   │   │   │   ├── admin/      # Payload CMS backoffice
│   │   │   │   └── api/        # Route handlers
│   │   │   ├── components/     # Componentes React
│   │   │   └── lib/            # Utilidades, hooks, validaciones
│   │   └── payload.config.ts   # Configuración Payload CMS
│   │
│   └── workers/                # BullMQ workers (always-on en Railway)
│       └── src/
│           ├── scraper.worker.ts
│           ├── email.worker.ts
│           └── scheduler.ts    # Programación de jobs
│
├── packages/
│   ├── database/               # Prisma schema + cliente compartido
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       └── index.ts        # Exporta prisma client singleton
│   │
│   ├── scraper/                # Lógica de scraping por plataforma
│   │   └── src/
│   │       ├── base-scraper.ts
│   │       ├── platforms/
│   │       │   ├── puntoticket.ts
│   │       │   ├── ticketmaster.ts
│   │       │   ├── passline.ts
│   │       │   ├── joinnus.ts
│   │       │   └── fintix.ts
│   │       └── utils/
│   │           ├── normalize.ts
│   │           ├── geocode.ts
│   │           └── artist-matcher.ts
│   │
│   ├── emails/                 # Templates React Email
│   │   └── src/
│   │       ├── event-announced.tsx
│   │       ├── sale-opened.tsx
│   │       ├── password-reset.tsx
│   │       └── account-locked.tsx
│   │
│   └── types/                  # Tipos TypeScript compartidos
│       └── src/
│           └── index.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # lint + typecheck + tests en cada PR
│       └── cd.yml              # deploy en merge a main
│
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## Prerrequisitos

| Herramienta | Versión mínima | Instalación |
|-------------|---------------|-------------|
| Node.js | 20.x | [nodejs.org](https://nodejs.org) |
| pnpm | 9.x | `npm install -g pnpm` |
| Docker | 24.x | [docker.com](https://docker.com) |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

> Docker es necesario solo para levantar PostgreSQL y Redis en local. Si ya tienes instancias propias, puedes saltarlo.

---

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/TU_USUARIO/eventosstgo.git
cd eventosstgo
pnpm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores. Las variables marcadas con `*` son obligatorias para el setup inicial:

```bash
# * Base de datos (Docker lo levanta automáticamente)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventosstgo"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/eventosstgo"

# * Redis (Docker lo levanta automáticamente)
REDIS_URL="redis://localhost:6379"

# * Auth — genera con: openssl rand -base64 32
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"

# * Mapbox — crea cuenta gratuita en mapbox.com
NEXT_PUBLIC_MAPBOX_TOKEN=""

# Spotify — necesario para importar artistas (opcional en desarrollo)
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""

# Email — necesario para notificaciones (opcional en desarrollo)
RESEND_API_KEY=""
EMAIL_FROM="noreply@eventosstgo.cl"

# Admin alerts
ADMIN_ALERT_EMAIL="admin@eventosstgo.cl"

# Scraper
SCRAPER_INTERVAL_HOURS=6
SCRAPER_REQUEST_DELAY_MS=3000
```

### 3. Levantar infraestructura local (PostgreSQL + Redis)

```bash
docker compose up -d
```

### 4. Inicializar la base de datos

```bash
pnpm db:migrate     # Crea las tablas
pnpm db:seed        # Carga datos de prueba (venues, artistas ejemplo)
```

### 5. Iniciar en modo desarrollo

```bash
pnpm dev
```

Esto inicia en paralelo:
- `apps/web` → [http://localhost:3000](http://localhost:3000)
- `apps/workers` → workers en background
- `apps/web/admin` → [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Scripts disponibles

Todos los scripts se ejecutan desde la raíz del monorepo con `pnpm <script>`.

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia todos los servicios en modo desarrollo |
| `pnpm build` | Build de producción de todos los workspaces |
| `pnpm lint` | Lint en todos los workspaces |
| `pnpm type-check` | Verificación de tipos TypeScript |
| `pnpm test` | Ejecuta tests unitarios |
| `pnpm db:migrate` | Aplica migraciones pendientes |
| `pnpm db:migrate:create` | Crea una nueva migración |
| `pnpm db:seed` | Carga datos de prueba |
| `pnpm db:studio` | Abre Prisma Studio en el navegador |
| `pnpm db:reset` | Resetea la BD y aplica migraciones + seed (⚠️ destructivo) |
| `pnpm scraper:run` | Ejecuta el scraper manualmente para todas las plataformas |
| `pnpm email:preview` | Previsualiza templates de email en el navegador |

---

## Base de datos

### Crear una migración nueva

```bash
# Después de modificar packages/database/prisma/schema.prisma
pnpm db:migrate:create --name descripcion_del_cambio
```

### Aplicar migraciones en producción

Las migraciones se ejecutan automáticamente en el pipeline CD antes del deploy, mediante el script de Railway:

```bash
pnpm db:migrate:deploy
```

### Explorar la BD en local

```bash
pnpm db:studio
# Abre http://localhost:5555
```

---

## Autenticación

El sistema usa **Auth.js v5** con credenciales (email + contraseña). Las contraseñas se hashean con **Argon2id** (costo factor 3, memoria 64MB).

Política de contraseñas:
- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
- Bloqueo de cuenta por 15 min tras 5 intentos fallidos

Crear el primer usuario admin:

```bash
pnpm tsx packages/database/src/scripts/create-admin.ts \
  --email admin@eventosstgo.cl \
  --password "TuContraseñaSegura1!"
```

---

## Scraper

El scraper corre como un worker en Railway ejecutándose cada 6 horas por plataforma. Para ejecutarlo manualmente en desarrollo:

```bash
# Todas las plataformas
pnpm scraper:run

# Una plataforma específica
pnpm scraper:run --platform puntoticket
```

Los logs de cada ejecución quedan en la tabla `ScraperRun` y son visibles en el backoffice en `/admin/scraper`.

### Agregar una nueva plataforma

1. Crea `packages/scraper/src/platforms/nueva-plataforma.ts` extendiendo `BaseScraper`
2. Agrega el valor al enum `Platform` en `schema.prisma` y crea la migración
3. Registra la plataforma en `packages/scraper/src/index.ts`
4. Agrega el job en `apps/workers/src/scheduler.ts`

---

## Despliegue

### Variables de entorno en producción

Configura las mismas variables de `.env.example` en:
- **Vercel** → Settings > Environment Variables (para `apps/web`)
- **Railway** → Variables de cada servicio (para `apps/workers`, PostgreSQL, Redis)

### Pipeline CD

Cada push a `main`:

1. GitHub Actions corre el CI (lint + typecheck + tests)
2. Si pasa, Vercel despliega `apps/web` automáticamente
3. Railway redespliega `apps/workers` automáticamente
4. Las migraciones se ejecutan como parte del build de `apps/web`

### Preview deployments

Cada PR genera automáticamente una URL de preview en Vercel con su propia base de datos efímera.

---

## Contribuir

1. Crea una rama desde `main`: `git checkout -b feat/nombre-feature`
2. Haz tus cambios y asegúrate que pasen `pnpm lint && pnpm type-check && pnpm test`
3. Abre un PR describiendo el cambio y enlaza el issue de GitHub Projects correspondiente
4. Espera code review; se requiere al menos 1 aprobación para hacer merge

### Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
chore:    cambios de configuración o dependencias
refactor: refactoring sin cambio de comportamiento
test:     agregar o corregir tests
docs:     cambios en documentación
```

---

## Licencia

MIT
