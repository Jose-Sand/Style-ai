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
├── components/
│   ├── auth/                     # componentes de los formularios de auth
│   ├── progress/                 # ProgressDashboard (stat cards + charts + form)
│   └── style-ai/                 # PhotoSlot, ResultsView, Analyzer, ReportActions, PrintableReport
├── lib/
│   ├── actions/
│   │   ├── auth.ts               # server actions: signIn, signUp, signOut
│   │   └── progress.ts           # server action: addProgressEntry
│   ├── anthropic.ts              # cliente de Anthropic (server-only)
│   ├── style-ai/                 # constants.ts, prompt.ts, export-pdf.ts
│   └── supabase/
│       ├── client.ts             # cliente browser (Client Components)
│       ├── server.ts             # cliente server (Server Components / Route Handlers)
│       └── middleware.ts         # refresco de sesión + protección de rutas
├── middleware.ts
└── types/database.ts             # tipos de las tablas de Supabase

supabase/migrations/
├── 0001_init.sql                 # schema: profiles, style_reports, storage bucket + RLS
└── 0002_analyses_and_progress.sql # schema: analyses (share), progress_entries + RLS
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
