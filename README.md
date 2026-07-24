# SmartHome BLE

A production-ready Smart Home Progressive Web App for controlling ESP32 devices via Bluetooth Low Energy.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + MUI v6 |
| PWA | vite-plugin-pwa + Workbox |
| State | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| BLE | Web Bluetooth API |
| Auth | JWT (backend) + Supabase (optional) |
| Backend | Java 21 + Spring Boot 3 |
| DB | PostgreSQL (Supabase) + Flyway |
| Deploy | Railway |

## BLE Protocol

| Field | Value |
|---|---|
| Service UUID | `4FAFC201-1FB5-459E-8FCC-C5C9C331914B` |
| Characteristic UUID | `BEB5483E-36E1-4688-B7F5-EA07361B26A8` |
| Transport | BLE GATT (Write + Notify) |
| Commands | See table below |

### Commands

```
LIGHT_1_ON / LIGHT_1_OFF   — Light 1
LIGHT_2_ON / LIGHT_2_OFF   — Light 2
LIGHT_3_ON / LIGHT_3_OFF   — Light 3
LIGHT_4_ON / LIGHT_4_OFF   — Light 4
FAN_0                       — Fan off
FAN_1                       — Fan low
FAN_2                       — Fan medium
FAN_3                       — Fan high
RGB_255_0_0                 — RGB red
RGB_0_255_0                 — RGB green
RGB_0_0_255                 — RGB blue
SOCKET_1_ON / SOCKET_1_OFF  — Socket 1
SOCKET_2_ON / SOCKET_2_OFF  — Socket 2
CURTAIN_OPEN / CURTAIN_CLOSE
STATUS                      — Request JSON status from ESP32
ALL_OFF                     — Turn everything off
```

ESP32 responds with JSON:
```json
{
  "temperature": 23.5,
  "humidity": 55,
  "lights": [true, false, false, false],
  "fan": 1,
  "sockets": [false, false]
}
```

## Local Development

### Prerequisites
- Node.js 22+
- Java 21
- Maven 3.9+
- Docker + Docker Compose (for full stack)
- PostgreSQL (or use Docker)
- Chrome/Chromium (Web Bluetooth requires Chrome on desktop/Android)

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
npm install --legacy-peer-deps
npm run dev
# Opens http://localhost:5173
```

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, etc.

# Option A: Docker Compose (database + backend together)
docker compose up postgres -d
mvn spring-boot:run

# Option B: Full Docker
docker compose up --build
```

Backend runs at `http://localhost:8080/api`  
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### Environment Variables

#### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default: `/api` via Vite proxy) |
| `VITE_SUPABASE_URL` | Supabase project URL (optional) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (optional) |

#### Backend

| Variable | Description |
|---|---|
| `DATABASE_URL` | JDBC PostgreSQL URL |
| `DATABASE_USERNAME` | DB username |
| `DATABASE_PASSWORD` | DB password |
| `JWT_SECRET` | ≥256-bit secret for signing JWTs |
| `JWT_EXPIRATION` | Access token TTL in ms (default: 86400000 = 24h) |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL in ms (default: 604800000 = 7d) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `PORT` | HTTP port (default: 8080) |

## Railway Deployment

### Frontend

1. Create a new Railway service from the `frontend/` directory
2. Set environment variables:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
3. Railway auto-detects the `Dockerfile` and builds/deploys

### Backend

1. Create a new Railway service from the `backend/` directory
2. Add a PostgreSQL database from Railway's marketplace
3. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}} (Railway variable reference)
   JWT_SECRET=<generate a 64-char random string>
   CORS_ORIGINS=https://your-frontend.up.railway.app
   ```
4. Railway builds via `backend/Dockerfile`

### Database

Flyway migrations run automatically on startup. The schema is defined in:
```
backend/src/main/resources/db/migration/V1__init_schema.sql
```

## BLE Permissions

### Chrome Desktop / Android

No special permissions needed. Web Bluetooth is available in Chrome 56+ when served over **HTTPS** (or `localhost`). The browser prompts the user to select a device when `navigator.bluetooth.requestDevice()` is called.

### iOS / Safari

Web Bluetooth is **not supported** on iOS Safari or Firefox. Use Chrome on Android or desktop. For a future native mobile extension, use React Native with `react-native-ble-plx`.

### Android Chrome Permissions

The device's location permission may be required on older Android versions (≤11) for BLE scanning. Chrome handles this automatically.

## Project Structure

```
SmartCon/
├── frontend/                    # React PWA
│   ├── src/
│   │   ├── pages/               # Route-level screens
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── rooms/           # Room management
│   │   │   ├── devices/         # Device list + detail
│   │   │   ├── ble/             # BLE scanner
│   │   │   ├── automation/      # Automation rules
│   │   │   ├── scenes/          # Scene presets
│   │   │   ├── notifications/   # Notification center
│   │   │   ├── profile/         # User profile
│   │   │   └── settings/        # App settings
│   │   ├── components/
│   │   │   ├── layout/          # AppLayout, AuthLayout
│   │   │   ├── devices/         # DeviceCard
│   │   │   └── ble/             # BLEStatusBadge
│   │   ├── services/
│   │   │   ├── ble.service.ts   # Web Bluetooth + auto-reconnect
│   │   │   ├── auth.service.ts  # Auth API
│   │   │   └── home.service.ts  # Homes/Rooms/Devices API
│   │   ├── store/
│   │   │   ├── authStore.ts     # Persisted auth state
│   │   │   ├── homeStore.ts     # Homes/rooms/devices
│   │   │   ├── bleStore.ts      # BLE connection state
│   │   │   └── themeStore.ts    # Dark/light mode
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios instance + interceptors
│   │   │   └── supabase.ts      # Supabase client
│   │   ├── theme/               # MUI theme (dark/light)
│   │   ├── router/              # React Router config
│   │   └── types/               # Shared TypeScript types
│   ├── nginx.conf               # Production nginx (SPA + proxy)
│   ├── Dockerfile
│   └── railway.json
│
├── backend/                     # Spring Boot API
│   └── src/main/java/com/smarthome/
│       ├── config/              # Security, OpenAPI, CORS
│       ├── security/jwt/        # JWT service + filter
│       ├── modules/
│       │   ├── auth/            # Register, Login, Refresh
│       │   ├── users/           # User entity + repo
│       │   ├── homes/           # CRUD homes
│       │   ├── rooms/           # CRUD rooms
│       │   └── devices/         # CRUD devices + status
│       └── shared/              # ApiResponse, AppException
│
├── docker-compose.yml
└── README.md
```

## Features

- **BLE Control** — Scan, connect, auto-reconnect (5 attempts, exponential backoff), send commands, receive JSON notifications
- **Dashboard** — Live stats: BLE signal, temp, humidity, device count, favorites, rooms
- **Device Cards** — Context-aware controls per device type (Light switch+brightness, Fan speed, RGB color picker, Curtain open/close)
- **6 Preset Scenes** — Movie Night, Good Morning, Sleep Mode, Party Mode, Work Focus, All Off
- **Automation** — Time, BLE connect/disconnect, device state triggers
- **Multiple Homes** — Create and switch between homes
- **Room Management** — Colored rooms with device assignment
- **Dark/Light Mode** — Persisted preference
- **PWA** — Installable on desktop and Android, works offline (cached UI)
- **JWT Auth** — Register, login, auto-refresh, secure storage

## Production Build

```bash
# Frontend
cd frontend
npm run build          # outputs to dist/
npm run preview        # test production build locally

# Backend
cd backend
mvn clean package -DskipTests
java -jar target/smarthome-api-1.0.0.jar
```
