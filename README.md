# Acortador de URLs con Analíticas

Acortador de URLs con dashboard de analíticas en tiempo real: clics en vivo, ubicación aproximada por IP y dispositivo/navegador de cada visita.

## Stack

- **Backend**: Python + [FastAPI](https://fastapi.tiangolo.com/) (async), [SQLAlchemy](https://www.sqlalchemy.org/) + Alembic, PostgreSQL, Redis (pub/sub para tiempo real), [GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) para geolocalización por IP. Gestor de paquetes: [uv](https://docs.astral.sh/uv/).
- **Frontend**: React + TypeScript + [Vite](https://vite.dev/), gestionado con [Bun](https://bun.sh/). TailwindCSS para estilos.
- **Infra local**: Docker Compose (Postgres + Redis).

## Estructura

```
backend/    API FastAPI (app/core, app/api, app/models, app/schemas)
frontend/   SPA React + Vite
docker-compose.yml   Postgres + Redis para desarrollo local
```

## Cómo levantar el proyecto

1. Base de datos y cache:
   ```
   docker compose up -d
   ```
2. Backend:
   ```
   cd backend
   cp .env.example .env
   uv sync
   uv run uvicorn app.main:app --reload
   ```
   API disponible en `http://localhost:8000` (healthcheck en `/health`).
3. Frontend:
   ```
   cd frontend
   bun install
   bun run dev
   ```
   App disponible en `http://localhost:5173`.

## Flujo de trabajo con git

- `main`: siempre estable, refleja lo que "funciona".
- `develop`: rama de integración donde se fusionan las secciones ya probadas.
- `feature/<nombre>`: una rama por sección/feature (ej. `feature/auth`, `feature/link-crud`, `feature/click-tracking`, `feature/geolocation`, `feature/realtime-ws`, `feature/dashboard-ui`), creada desde `develop`.

Antes de fusionar cualquier `feature/*` a `develop`:
1. Se corre el gate de verificación (sin errores de compilación/ejecución):
   - Backend: `uv run ruff check .` y `uv run pytest`
   - Frontend: `bun run build` y `bun run lint`
2. Se confirma con el dueño del proyecto que la funcionalidad fue probada localmente y funciona como se espera.
3. Solo entonces se fusiona (`git merge --no-ff`).

## Notas

- El archivo GeoLite2 (`.mmdb`) no se versiona (ver `.gitignore`). Se descarga con una cuenta gratuita de MaxMind y se referencia vía variable de entorno cuando se implemente la sección de geolocalización.
- Las ejecuciones de `uvicorn --reload` y `bun run dev` (servidores locales) las corre el desarrollador; el asistente solo ejecuta comandos de verificación no interactivos (lint/build/test).
