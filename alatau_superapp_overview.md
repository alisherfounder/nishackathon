# Alatau SuperApp — Project Overview

> Hackathon Technical Brief | 2026

---

## Summary

**Alatau SuperApp** is a city-scale civic intelligence platform designed to bridge citizens and municipal institutions through real-time geospatial data, AI-augmented decision support, and participatory urban infrastructure tooling.

The platform targets two distinct user classes — **Citizens** and **Institutions** — each with a dedicated feature surface, unified under a single application layer.

---

## System Architecture

```
                        ┌─────────────────┐
                        │   AI Provider   │
                        │  (Claude / OAI) │
                        └────────┬────────┘
                                 │  REST (tool-use / streaming)
                                 ▼
┌──────────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│  Mobile          │◄──►│   FastAPI       │◄──►│  Platform            │
│  (Next.js PWA /  │    │   Backend       │    │  (Next.js Web App)   │
│   React Native)  │REST│   :8000         │REST│  Institutions UI     │
│  Citizens UI     │    └────────┬────────┘    │  Header: Platform    │
│  Header: Mobile  │             │             └──────────────────────┘
└──────────────────┘             │ SQLAlchemy ORM
                                 ▼
                        ┌─────────────────┐
                        │    SQLite DB    │
                        │  (file-based,   │
                        │  zero-config)   │
                        └─────────────────┘
```

**Communication patterns:**
- Mobile ↔ API: bidirectional REST (JSON) + WebSocket for real-time notifications
- Platform ↔ API: bidirectional REST (JSON)
- API ↔ AI Provider: bidirectional (prompt + tool definitions → tool calls + text response)
- API ↔ Database: read/write via SQLAlchemy ORM

---

## Confirmed Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Platform Frontend** | Next.js (App Router) | Institutions UI — SSR for dashboard |
| **Mobile Frontend** | Next.js PWA or React Native | Citizens UI |
| **Backend** | FastAPI (Python) | Async; auto OpenAPI docs at `/docs` |
| **Database** | SQLite (via SQLAlchemy) | Zero-config for hackathon; swap to PostgreSQL + PostGIS post-hack |
| **AI Provider** | Claude API / OpenAI | Tool-use / function calling pattern |
| **Maps** | MapLibre GL JS | Open-source; use free OSM raster tiles |
| **Real-time** | FastAPI WebSockets or SSE | Built-in, no extra broker needed |
| **QR Generate** | `qrcode` (Python lib) | Server-side PNG generation |
| **QR Scan** | `html5-qrcode` (JS lib) | Client-side camera scanning |

---

## Repository Structure (Suggested)

```
alatau-superapp/
├── backend/                    # FastAPI
│   ├── main.py                 # App entrypoint, router registration
│   ├── database.py             # SQLAlchemy engine + session factory
│   ├── models/
│   │   ├── project.py          # ProjectCard ORM model
│   │   ├── notification.py     # Notification ORM model
│   │   └── sensor.py           # SmogSensor ORM model
│   ├── routers/
│   │   ├── projects.py         # CRUD  →  /projects
│   │   ├── notifications.py    # GET/POST  →  /notifications
│   │   ├── sensors.py          # GET  →  /sensors
│   │   ├── qr.py               # GET  →  /qr/{id}
│   │   └── ai.py               # POST  →  /ai/query
│   ├── services/
│   │   └── ai_agent.py         # LLM tool-use orchestration
│   └── requirements.txt
│
├── platform/                   # Next.js — Institutions
│   ├── app/
│   │   ├── dashboard/          # Planning & Overview page
│   │   ├── projects/           # Project Card list + CRUD
│   │   └── layout.tsx
│   └── package.json
│
├── mobile/                     # Next.js PWA — Citizens
│   ├── app/
│   │   ├── map/                # MapLibre GL JS map view
│   │   ├── qr/                 # Camera QR scanner
│   │   ├── notifications/      # Real-time notification feed
│   │   ├── ai/                 # AI chat interface
│   │   └── overview/           # Smog / AQI dashboard
│   └── package.json
│
└── README.md
```

---

## Backend: FastAPI Design

### API Endpoints

```
# Projects (Карточка проекта)
GET    /projects                    → list all project cards (with lat/lon for map)
POST   /projects                    → create project card  [Institution only]
GET    /projects/{id}               → get single project card
PUT    /projects/{id}               → update project card  [Institution only]
GET    /projects/{id}/qr            → returns QR code PNG for physical placement

# Notifications
GET    /notifications               → list (query param: ?type=POLL|DANGER|JAM)
POST   /notifications               → publish notification  [Institution only]
WS     /ws/notifications            → WebSocket — real-time push to citizens

# Environmental Sensors
GET    /sensors                     → AQI + smog readings (seeded / hardcoded)

# AI Agent
POST   /ai/query                    → { "prompt": "..." }  →  natural language response
```

### SQLite Schema

```sql
-- Project Cards
CREATE TABLE projects (
    id           TEXT PRIMARY KEY,        -- UUID4
    title        TEXT NOT NULL,
    description  TEXT,
    institution  TEXT NOT NULL,
    status       TEXT DEFAULT 'active',   -- active | planned | completed
    lat          REAL,                    -- map pin latitude
    lon          REAL,                    -- map pin longitude
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME
);

-- Notifications
CREATE TABLE notifications (
    id           TEXT PRIMARY KEY,
    type         TEXT NOT NULL,           -- POLL | DANGER | JAM
    title        TEXT NOT NULL,
    body         TEXT,
    lat          REAL,                    -- optional geo-anchor
    lon          REAL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sensors (seed data for hackathon)
CREATE TABLE sensors (
    id           TEXT PRIMARY KEY,
    name         TEXT,
    aqi          INTEGER,                 -- Air Quality Index (0-500)
    pm25         REAL,                    -- PM2.5 µg/m³
    lat          REAL,
    lon          REAL,
    recorded_at  DATETIME
);
```

---

## Frontend: Next.js Design

### Platform (Institutions — `/platform`)

```
/dashboard              → Overview: project count, notification stats, sensor summary
/projects               → Paginated table of all project cards + "New Project" CTA
/projects/[id]          → Project Card detail view + inline edit form
/projects/new           → Create new project card (title, description, map pin drop)
```

### Mobile PWA (Citizens — `/mobile`)

```
/map                    → MapLibre GL JS — project pins, AQI heatmap, JAM overlays
/qr                     → Camera QR scanner → on decode: redirect to /projects/[uuid]
/notifications          → WebSocket-connected feed (POLL / DANGER / JAM cards)
/ai                     → Chat UI → POST /ai/query → streamed AI response
/overview               → AQI stat cards from GET /sensors
```

---

## AI Agent: Tool-Use Pattern

The `/ai/query` endpoint wraps an LLM call with DB-backed tools, enabling citizens to query city data in natural language.

```python
# backend/services/ai_agent.py

TOOLS = [
    {
        "name": "get_projects",
        "description": "Fetch city infrastructure projects, filterable by status or institution",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["active", "planned", "completed"]},
                "institution": {"type": "string"}
            }
        }
    },
    {
        "name": "get_sensor_data",
        "description": "Get current AQI and PM2.5 smog readings",
        "input_schema": {
            "type": "object",
            "properties": {
                "district": {"type": "string"}
            }
        }
    },
    {
        "name": "get_notifications",
        "description": "Retrieve recent city alerts by type",
        "input_schema": {
            "type": "object",
            "properties": {
                "type": {"type": "string", "enum": ["POLL", "DANGER", "JAM"]}
            }
        }
    }
]

# Flow:
# 1. Receive citizen prompt
# 2. Send to Claude/OpenAI with TOOLS
# 3. LLM returns tool_use block → call matching DB query
# 4. Return tool result to LLM
# 5. LLM formats final natural language answer
# 6. Stream back to citizen UI
```

---

## Feature Breakdown

### 👤 Citizens

| # | Feature | Endpoint(s) | Stack |
|---|---------|------------|-------|
| 1 | **Maps** | `GET /projects`, `GET /sensors`, `GET /notifications?type=JAM` | MapLibre GL JS |
| 2 | **QR Scan** | `GET /projects/{id}` | html5-qrcode → Next.js router |
| 3 | **Notifications** | `WS /ws/notifications` | FastAPI WebSocket |
| 4 | **AI** | `POST /ai/query` | Claude API tool-use |
| 5 | **Overview** | `GET /sensors` | Hardcoded seed data |

### 🏛️ Institutions

| # | Feature | Endpoint(s) | Stack |
|---|---------|------------|-------|
| 1 | **Planning Dashboard** | `GET /projects`, `GET /notifications` | Next.js SSR |
| 2 | **Project Cards CRUD** | `POST/PUT /projects` | Next.js forms + FastAPI |
| 3 | **QR Generation** | `GET /projects/{id}/qr` | Python `qrcode` lib |
| 4 | **Push Notifications** | `POST /notifications` | FastAPI → WebSocket broadcast |

---

## End-to-End Data Flows

```
── CITIZEN: MAP VIEW ──────────────────────────────────────────────
  /mobile/map loads
    → GET /projects           (project pins: id, title, lat, lon, status)
    → GET /sensors            (AQI values → heatmap layer)
    → GET /notifications?type=JAM  (traffic incidents → overlay)
    → MapLibre renders all layers

── CITIZEN: QR SCAN ───────────────────────────────────────────────
  Camera opens → html5-qrcode decodes QR
    → extracts UUID from URL payload
    → Next.js router → /projects/{uuid}
    → GET /projects/{uuid}    → FastAPI → SQLite query
    → renders Project Card (title, institution, status, description)

── CITIZEN: AI QUERY ──────────────────────────────────────────────
  Types: "What roads are under construction near me?"
    → POST /ai/query { "prompt": "..." }
    → FastAPI → Claude API (with TOOLS)
    → Claude emits: tool_use { name: "get_projects", input: { status: "active" } }
    → FastAPI queries SQLite → returns rows as JSON
    → Claude formats: "There are 3 active projects near you: ..."
    → streamed text response → citizen chat UI

── INSTITUTION: PUBLISH DANGER ALERT ──────────────────────────────
  Fills alert form on Platform
    → POST /notifications { type: "DANGER", title: "Gas leak", body: "...", lat, lon }
    → FastAPI writes to SQLite
    → WebSocket broadcast → all connected citizen clients
    → DANGER card appears in citizen /notifications feed
```

---

## Hackathon MVP Build Order

| Priority | Task | Est. Time |
|----------|------|-----------|
| 🔴 **P0** | FastAPI skeleton + SQLite models + seed data | 1h |
| 🔴 **P0** | `GET /projects` + `GET /sensors` endpoints | 30m |
| 🔴 **P0** | Next.js map with MapLibre + project pins | 2h |
| 🟠 **P1** | Platform: Project Card CRUD UI | 1.5h |
| 🟠 **P1** | QR: server-side PNG generation + client scan | 1h |
| 🟠 **P1** | WebSocket notifications + citizen feed UI | 1.5h |
| 🟡 **P2** | AI agent endpoint + citizen chat UI | 2h |
| 🟡 **P2** | Smog overview page (AQI stat cards) | 45m |
| 🟢 **P3** | Polls notification type + voting UI | 1h |

**Estimated total: ~11h** — achievable in a 24h hackathon with 2–3 developers splitting frontend/backend.

---

## Open Questions

- [ ] Mobile: **Next.js PWA** (simpler, one codebase) or **React Native** (better native camera for QR)?
- [ ] Map tiles: **OSM** free tiles or a styled tile provider (Stadia Maps, Protomaps)?
- [ ] AI Provider: **Claude API** key or **OpenAI**?
- [ ] Institution auth: simple hardcoded token header for hackathon, or skip entirely?
- [ ] Sensor data: **fully static seed** or simulate live updates with a background task?

---

*Generated for Alatau SuperApp · Hackathon 2026*
