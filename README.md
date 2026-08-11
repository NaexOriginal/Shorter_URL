# Acortador de URLs con Analíticas

Acortador de URLs con dashboard de analíticas en tiempo real: clics en vivo por WebSocket, ubicación aproximada por IP, dispositivo/navegador de cada visita y alias personalizados con código QR.

[![Backend](https://github.com/NaexOriginal/Shorter_URL/actions/workflows/backend.yml/badge.svg)](https://github.com/NaexOriginal/Shorter_URL/actions/workflows/backend.yml)
[![Frontend](https://github.com/NaexOriginal/Shorter_URL/actions/workflows/frontend.yml/badge.svg)](https://github.com/NaexOriginal/Shorter_URL/actions/workflows/frontend.yml)

## Funcionalidades

- **Cuentas de usuario**: registro, login con JWT, y ajustes de cuenta (cambiar email, cambiar contraseña, eliminar cuenta).
- **Links**: creación con código corto aleatorio o alias personalizado, listado con buscador, redirección con tracking de clics.
- **Código QR**: generado 100% en el cliente al crear un link, descargable como PNG.
- **Analíticas en tiempo real**: feed de clics en vivo por WebSocket, tanto por link individual como un feed global de todos los links del usuario.
- **Geolocalización y dispositivo**: país/ciudad aproximados por IP (MaxMind GeoLite2) y tipo de dispositivo/navegador/SO parseados del User-Agent en cada clic.
- **Dashboard**: resumen con métricas de los últimos 30 días, detalle de clics por link (por día, dispositivo, navegador, país), sidebar colapsable y responsive.
- **UX**: notificaciones toast, estados vacíos con call-to-action, buscador client-side.

## Stack

| | |
|---|---|
| **Backend** | Python + [FastAPI](https://fastapi.tiangolo.com/) (async), [SQLAlchemy](https://www.sqlalchemy.org/) async + Alembic, PostgreSQL, Redis (pub/sub para tiempo real), [GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) para geolocalización por IP, JWT (PyJWT + bcrypt). Gestor de paquetes: [uv](https://docs.astral.sh/uv/). Lint: [ruff](https://docs.astral.sh/ruff/). Tests: pytest + httpx. |
| **Frontend** | React 19 + TypeScript + [Vite](https://vite.dev/), gestionado con [Bun](https://bun.sh/). React Router v7, TailwindCSS v4, Recharts, `qrcode.react`. Lint: oxlint. |
| **Infra local** | Docker Compose (Postgres + Redis). |
| **CI** | GitHub Actions (lint + tests en cada push/PR, ver badges arriba). |

## Estructura

```
backend/
  app/
    core/      config, sesión de DB, seguridad (JWT/bcrypt), Redis, GeoIP, parseo de User-Agent
    api/       routers: auth, links, redirect, analytics, ws
    models/    modelos SQLAlchemy (User, Link, Click)
    schemas/   schemas Pydantic
  alembic/     migraciones
  tests/       pytest
frontend/
  src/
    pages/       páginas ruteadas (login, dashboard, links, crear link, ajustes)
    components/  UI reutilizable
    context/     auth y toasts
    hooks/       WebSocket hooks
    lib/         cliente de API, formateo, agregación de datos para charts
.github/workflows/  CI (backend.yml, frontend.yml)
docker-compose.yml  Postgres + Redis para desarrollo local
```

## Cómo levantar el proyecto

### Requisitos

- [Docker](https://www.docker.com/) (Postgres + Redis)
- Python 3.12 + [uv](https://docs.astral.sh/uv/)
- [Bun](https://bun.sh/)

### 1. Base de datos y cache

```
docker compose up -d
```

### 2. Backend

```
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Si tu terminal no reconoce `uv` (no está en el PATH), activá el entorno virtual que crea `uv sync` y corré los comandos directo:

```
.venv\Scripts\activate
alembic upgrade head
uvicorn app.main:app --reload
```

API disponible en `http://localhost:8000` (healthcheck en `/health`, docs interactivas en `/docs`).

### 3. Frontend

```
cd frontend
cp .env.example .env
bun install
bun run dev
```

App disponible en `http://localhost:5173`.

## Variables de entorno (backend)

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://shorter:shorter@localhost:5432/shorter_url` | Conexión a Postgres |
| `REDIS_URL` | `redis://localhost:6379/0` | Conexión a Redis (pub/sub de clics) |
| `JWT_SECRET_KEY` | clave de dev, **cambiar** fuera de local | Firma de los JWT. Generar una real: `openssl rand -hex 32` |
| `JWT_ALGORITHM` | `HS256` | Algoritmo de firma |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Expiración del token |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Orígenes permitidos |
| `GEOIP_DB_PATH` | `geoip/GeoLite2-City.mmdb` | Ruta al `.mmdb` de MaxMind. Si el archivo no existe, la geolocalización simplemente devuelve `null` (no rompe nada) |

El frontend solo necesita `VITE_BACKEND_ORIGIN` (ver `frontend/.env.example`), usado para armar la URL corta que se muestra en el dashboard.

## API

Todas las rutas bajo `/api` requieren `Authorization: Bearer <token>` salvo registro/login. Docs completas e interactivas en `/docs` (Swagger) una vez el backend está corriendo.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Crear cuenta |
| `POST` | `/api/auth/login` | Login, devuelve JWT |
| `GET` | `/api/auth/me` | Usuario actual |
| `PATCH` | `/api/auth/me/email` | Cambiar email (requiere contraseña actual) |
| `PATCH` | `/api/auth/me/password` | Cambiar contraseña (requiere contraseña actual) |
| `POST` | `/api/auth/me/delete` | Eliminar cuenta y todos sus links (requiere contraseña actual) |
| `POST` | `/api/links` | Crear link (alias personalizado opcional) |
| `GET` | `/api/links` | Listar links del usuario |
| `GET` | `/api/links/{short_code}` | Detalle de un link |
| `GET` | `/api/links/{short_code}/clicks` | Clics de un link |
| `GET` | `/api/analytics/overview` | Resumen de los últimos 30 días |
| `GET` | `/{short_code}` | Redirección pública + tracking del clic |
| `WS` | `/ws/links/{short_code}?token=` | Feed en vivo de clics de un link |
| `WS` | `/ws/me?token=` | Feed en vivo de todos los links del usuario |

## Tests y lint

```
# Backend
cd backend
uv run ruff check .
uv run pytest

# Frontend
cd frontend
bun run lint
bun run build
```

Estos son los mismos checks que corre CI en cada push/PR (ver `.github/workflows/`).

## Flujo de trabajo con git

- `main`: siempre estable, refleja lo que "funciona". Se actualiza solo en milestones, vía PR desde `develop`.
- `develop`: rama de integración donde se fusionan las features ya probadas.
- `feature/<nombre>`: una rama por feature, creada desde `develop`.

Antes de fusionar cualquier `feature/*` a `develop`:
1. Se corre el gate de verificación (backend: ruff + pytest; frontend: lint + build).
2. Se confirma que la funcionalidad fue probada manualmente y funciona como se espera.
3. Se fusiona con `git merge --no-ff` y se pushea `develop`.

## Notas

- El archivo GeoLite2 (`.mmdb`) no se versiona (ver `.gitignore`). Se descarga con una cuenta gratuita de MaxMind.
- El proyecto no está desplegado públicamente: el backend necesita un proceso persistente (WebSockets + subscriber de Redis), lo cual no encaja en el modelo serverless de free tiers como Vercel/Netlify Functions. Correría en algo como Render o Fly.io; el frontend sí es un SPA estático desplegable gratis en cualquiera de los dos.
