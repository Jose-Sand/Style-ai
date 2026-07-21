# Style AI

Analizador de imagen personal con IA. Next.js 14 (App Router) + TypeScript + Supabase + Anthropic (Claude vision) + Tailwind CSS.

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                  # redirige a /dashboard o /login según sesión
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── auth/callback/route.ts    # intercambio de código OAuth / confirmación de email
│   ├── (app)/                    # grupo de rutas protegidas (requiere sesión)
│   │   ├── layout.tsx            # valida sesión server-side + nav
│   │   ├── dashboard/page.tsx    # flujo de subida de fotos + análisis
│   │   ├── historial/
│   │   │   ├── page.tsx          # lista de reportes guardados
│   │   │   └── [id]/page.tsx     # detalle de un reporte (fotos + secciones)
│   │   └── progreso/page.tsx     # tracker de peso / % grasa con gráficas
│   ├── share/[id]/page.tsx       # vista pública de solo lectura de un análisis compartido
│   └── api/analyze/route.ts      # sube fotos a Storage, llama a Claude, guarda el reporte
│   └── api/products/
│       ├── search/route.ts       # búsqueda directa por queries, agrupada por marca
│       └── recommend/route.ts    # análisis → queries (Claude) → búsqueda, agrupada por categoría
├── components/
│   ├── auth/                     # componentes de los formularios de auth
│   ├── products/ProductGrid.tsx  # grid de productos (skeleton / vacío / error)
│   ├── progress/                 # ProgressDashboard (stat cards + charts + form)
│   └── style-ai/                 # PhotoSlot, ResultsView, Analyzer, ReportActions, PrintableReport
├── lib/
│   ├── actions/
│   │   ├── auth.ts               # server actions: signIn, signUp, signOut
│   │   └── progress.ts           # server action: addProgressEntry
│   ├── anthropic.ts              # cliente de Anthropic (server-only)
│   ├── scrapers/                 # ver "Descubrimiento de productos" más abajo
│   ├── style-ai/                 # constants.ts, prompt.ts, export-pdf.ts, product-queries.ts
│   └── supabase/
│       ├── client.ts             # cliente browser (Client Components)
│       ├── server.ts             # cliente server (Server Components / Route Handlers)
│       └── middleware.ts         # refresco de sesión + protección de rutas
├── middleware.ts
└── types/database.ts             # tipos de las tablas de Supabase

supabase/migrations/
├── 0001_init.sql                 # schema: profiles, style_reports, storage bucket + RLS
├── 0002_analyses_and_progress.sql # schema: analyses (share), progress_entries + RLS
└── 0003_product_cache_and_scraper_errors.sql # schema: product_cache, scraper_errors (service-role only)
```

## Setup

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Corre `supabase/migrations/0001_init.sql` en el SQL Editor del proyecto (o vía `supabase db push` si usas el CLI).
3. Copia `.env.local.example` a `.env.local` y completa las claves (Project Settings → API para las de Supabase, [console.anthropic.com](https://console.anthropic.com) para la de Anthropic).
4. `npm install`
5. `npm run dev` y abre [http://localhost:3000](http://localhost:3000).

## Modelo de datos (Supabase)

- **profiles** — 1 fila por usuario (`auth.users`), creada automáticamente por un trigger al registrarse.
- **style_reports** — 1 fila por análisis: `input` (datos físicos del formulario), `result` (JSON de las 5 secciones que devuelve Claude), `photo_paths` (rutas en Storage), `status`, `analysis_id` (FK opcional a `analyses`).
- **analyses** — snapshot público-compartible de un análisis (`results` jsonb, `is_public`). Se crea junto con cada `style_reports` completado; es lo que se lee en `/share/[id]`. RLS permite lectura anónima cuando `is_public = true`.
- **progress_entries** — mediciones de peso / % grasa corporal / grasa visceral en el tiempo, una fila por registro del usuario.
- **storage: style-photos** — bucket privado. Cada archivo vive en `${user_id}/${report_id}/${slot}.jpg`; las policies de RLS restringen el acceso al dueño del folder.

Todas las tablas y el bucket tienen RLS activado: cada usuario solo puede leer/escribir sus propias filas y archivos.

## Autenticación

- Email + contraseña vía Supabase Auth, con confirmación de email antes de poder iniciar sesión.
- Server Actions (`src/lib/actions/auth.ts`) para signIn/signUp/signOut — sin JS extra en el cliente más allá del estado del formulario.
- `src/middleware.ts` refresca el token de sesión en cada request y protege `/dashboard` y `/historial`; redirige a usuarios autenticados fuera de `/login` y `/signup`.
- El layout de `(app)` vuelve a validar la sesión server-side antes de renderizar, como defensa adicional.

## Flujo de análisis

- `src/components/style-ai/analyzer.tsx` — puerto a React del prototipo (subida de fotos → datos físicos → análisis → resultados), pero llamando a `/api/analyze` en vez de a `api.anthropic.com` directo desde el navegador.
- `src/app/api/analyze/route.ts` — ruta server-side: valida sesión, sube las fotos al bucket `style-photos`, llama a Claude (`claude-opus-4-8`) con las imágenes en base64, parsea el JSON de la respuesta y guarda el reporte en `style_reports`. La `ANTHROPIC_API_KEY` nunca se expone al cliente.
- `src/components/style-ai/results-view.tsx` — vista de resultados por secciones (con tabs), reutilizada en el flujo de análisis, el detalle del historial y la página pública `/share/[id]`.

## Exportar PDF, compartir por link y tracker de progreso

- **Exportar PDF** (`src/components/style-ai/report-actions.tsx` + `printable-report.tsx` + `lib/style-ai/export-pdf.ts`): renderiza una versión "imprimible" del reporte (todas las secciones apiladas, sin tabs) fuera de pantalla, la captura con `html2canvas` y arma un PDF paginado con `jsPDF`. Nombre de archivo: `mi-analisis-estilo-[fecha].pdf`.
- **Compartir por link**: `/api/analyze` guarda una copia pública del resultado en `analyses` (además del registro privado en `style_reports`) y devuelve su `id`. El botón "Compartir" copia `[dominio]/share/[id]` al portapapeles. `/share/[id]` es una página pública (fuera del grupo `(app)`, sin auth) que muestra el reporte en modo solo-lectura o un 404 si no existe / no es público.
- **Mi Progreso** (`/progreso`, protegida): formulario para registrar peso / % grasa corporal / grasa visceral (`src/lib/actions/progress.ts`, Server Action), tarjetas de stats (valor actual + delta vs. la primera medición) y dos gráficas de línea con `recharts`. RLS en `progress_entries` restringe cada fila a su dueño.

## Descubrimiento de productos (marcas colombianas)

Cuando se muestra un análisis con `showProducts` (flujo de análisis + historial, **no** en `/share/[id]`), `ResultsView` llama a `/api/products/recommend` con el JSON del análisis. Esa ruta le pide a Claude 2–3 queries cortas de búsqueda por categoría (`src/lib/style-ai/product-queries.ts`) y las corre contra los adaptadores de marca en `src/lib/scrapers/`.

**Antes de escribir el código real** se revisó `robots.txt` y el comportamiento en vivo de las 3 marcas pedidas originalmente:

| Marca | Estado | Por qué |
|---|---|---|
| **Vélez** | ✅ Activa, vía **API pública de VTEX** (`velez.ts`) | Su `robots.txt` bloquea la página HTML de búsqueda (`/busca/` y query strings salvo una lista blanca que no incluye `?q=`), pero permite explícitamente los endpoints de API/GraphQL de VTEX — el mismo endpoint que usa el propio sitio para renderizar resultados. No usa Playwright: es un `fetch` a JSON. |
| **Punto Blanco** | ⛔ Placeholder (`puntoblanco.ts`), sin datos | Detrás de un challenge JS activo de Cloudflare — bloquea incluso `robots.txt` con un user-agent real de Chrome. No hay programa de afiliados público. Automatizar el paso de ese challenge sería evadir deliberadamente una protección anti-bot activa, y esta app no lo hace. Para activarlo: conseguir un acuerdo comercial directo con Grupo Crystal (dueño de la marca) para un feed/API de productos. |
| **H&M Colombia** | ⛔ Placeholder (`hm.ts`), sin datos | Bloqueo duro (403 Akamai) incluso en `robots.txt`. H&M sí tiene programa de afiliados vía **Rakuten Advertising** — es el camino legítimo, pero requiere darse de alta como afiliado y ser aprobados; no es algo que el código pueda completar por sí solo. Para activarlo: aplicar en Rakuten Advertising, y una vez aprobados, reemplazar `search()` en `hm.ts` con la integración real contra su feed. |

Por esto la instalación de Playwright + `@sparticuz/chromium` que se había planeado inicialmente **no se incluyó** — ninguna de las 3 marcas la necesita hoy (Vélez usa su API JSON; las otras dos están pendientes de acceso legítimo, no de mejores selectores). Si en el futuro se suma una marca sin API pública pero *sin* protección anti-bot activa, `src/lib/scrapers/base.ts` ya trae rate-limiting por dominio, reintentos, timeout de 15s y logging de errores, listo para un adaptador basado en Playwright.

**Arquitectura:**
- `types.ts` — `ScrapedProduct`, `SearchParams`, `BrandAdapter`.
- `base.ts` — `fetchJsonPolite()`: rate limit de 3s por dominio, User-Agent de Chrome real, timeout de 15s, hasta 3 reintentos, nunca lanza (devuelve `null` y loguea en `scraper_errors`).
- `velez.ts` / `puntoblanco.ts` / `hm.ts` — un adaptador por marca, mismo contrato `BrandAdapter`.
- `cache.ts` — caché en Supabase (`product_cache`, TTL 6h por defecto) por `{marca}:{query}:{categoría}:{género}`; lectura/escritura solo con la service-role key.
- `run-search.ts` / `index.ts` — orquestador: enruta categoría → marcas relevantes, corre en paralelo con `Promise.allSettled` (una marca caída no tumba las demás), deduplica, ordena por relevancia del título, respeta un presupuesto de tiempo (`SCRAPER_TIMEOUT_MS`, por defecto 4s) devolviendo resultados parciales (o vacíos) si se agota.

**Variables de entorno** (`.env.local` / Vercel): `SCRAPER_ENABLED`, `SCRAPER_TIMEOUT_MS`, `SCRAPER_RATE_LIMIT_MS`, `CACHE_TTL_HOURS`. `product_cache` y `scraper_errors` tienen RLS activado sin policies — son datos internos, no de usuario, y solo son accesibles con `SUPABASE_SERVICE_ROLE_KEY` (asegúrate de tenerla configurada, si no, la búsqueda sigue funcionando pero sin caché ni log de errores).

### Sobre el límite de tiempo de Vercel (504)

`/api/products/recommend` y `/api/products/search` declaran `maxDuration = 10` porque el plan **Hobby** de Vercel mata cualquier función serverless a los ~10s sin importar lo que el código declare — si eso pasa, el navegador ve un 504 crudo, sin la respuesta vacía "prolija" que el código intenta devolver. Por eso el segundo call a Claude (generación de queries, `product-queries.ts`) usa un modelo rápido (`claude-haiku-4-5`) con timeout de 4s, y la búsqueda por categoría tiene su propio presupuesto de 4s (`SCRAPER_TIMEOUT_MS`) — el objetivo es que el código *siempre* responda antes de que la plataforma lo corte. Si tienes plan Pro (o Fluid Compute) y quieres más margen para scrapers más lentos en el futuro, puedes subir `SCRAPER_TIMEOUT_MS` y `maxDuration` con confianza.
