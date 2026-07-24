# SmartHome BLE — Setup Guide

Complete step-by-step instructions for running this project locally or deploying to Railway.

---

## Prerequisites

Install these tools before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 22+ | https://nodejs.org |
| Java | 21+ | https://adoptium.net |
| Maven | 3.9+ | https://maven.apache.org/download.cgi |
| Docker + Docker Compose | Latest | https://docs.docker.com/get-docker |
| Git | Latest | https://git-scm.com |

Verify your installs:
```bash
node --version       # v22.x.x
java --version       # 21.x.x
mvn --version        # Apache Maven 3.9.x
docker --version     # Docker 27.x.x
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/SmartCon.git
cd SmartCon
```

---

## 2. Supabase Setup (Database + Auth)

This project uses [Supabase](https://supabase.com) for both the PostgreSQL database and user authentication.

1. Go to https://supabase.com and create a free account
2. Create a new project (choose a strong database password)
3. Once the project is ready, go to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET`
5. Go to **Settings → Database → Connection string (URI)** and copy the connection string → `DATABASE_URL`

> **Important:** In the connection string, replace `[YOUR-PASSWORD]` with the database password you set when creating the project.

---

## 3. Frontend Setup

```bash
cd frontend

# Copy and fill in the environment file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:8080/api
```

Install dependencies and start the dev server:
```bash
npm install --legacy-peer-deps
npm run dev
```

The frontend will be available at **http://localhost:5173**

---

## 4. Backend Setup

```bash
cd backend

# Copy and fill in the environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SERVER_PORT=8080
CORS_ORIGINS=http://localhost:5173
```

Run the backend:
```bash
# Using Maven wrapper (recommended)
./mvnw spring-boot:run

# Or with Maven directly
mvn spring-boot:run

# Windows (cmd/PowerShell)
mvnw.cmd spring-boot:run
```

The API will be available at **http://localhost:8080**  
Swagger UI: **http://localhost:8080/swagger-ui.html**

> The backend auto-runs Flyway migrations on startup — your Supabase database schema is created automatically.

---

## 5. Run Everything with Docker Compose (Alternative)

If you prefer Docker:

```bash
# From the project root
cp .env.example .env
# Fill in the .env values as described in sections 2–4

docker compose up --build
```

This starts:
- PostgreSQL (local, port 5432)
- Spring Boot backend (port 8080)
- React frontend via nginx (port 80)

Access the app at **http://localhost**

---

## 6. BLE Device Requirements

Web Bluetooth is supported in **Chromium-based browsers only**:
- ✅ Google Chrome (desktop + Android)
- ✅ Microsoft Edge
- ✅ Opera
- ✅ Brave
- ❌ Firefox (not supported)
- ❌ Safari / iOS browsers (not supported)

### ESP32 Firmware UUIDs

Your ESP32 must advertise these UUIDs:

| | UUID |
|--|------|
| Service | `4FAFC201-1FB5-459E-8FCC-C5C9C331914B` |
| Characteristic | `BEB5483E-36E1-4688-B7F5-EA07361B26A8` |

### BLE Command Protocol

Send these UTF-8 strings over the characteristic:

```
LIGHT_1_ON / LIGHT_1_OFF
LIGHT_2_ON / LIGHT_2_OFF
LIGHT_3_ON / LIGHT_3_OFF
LIGHT_4_ON / LIGHT_4_OFF
FAN_0 / FAN_1 / FAN_2 / FAN_3
RGB_255_0_0   (red)
RGB_0_255_0   (green)
RGB_0_0_255   (blue)
SOCKET_1_ON / SOCKET_1_OFF
SOCKET_2_ON / SOCKET_2_OFF
CURTAIN_OPEN / CURTAIN_CLOSE
STATUS
ALL_OFF
```

---

## 7. Production Build

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend
```bash
cd backend
mvn package -DskipTests
# Output: backend/target/app.jar
java -jar target/app.jar
```

---

## 8. Railway Deployment

1. Push your code to GitHub
2. Go to https://railway.app and create a new project
3. Add two services from your GitHub repo: select the `backend` directory for one, the `frontend` directory for the other
4. Set environment variables in each service's Settings → Variables panel:

**Backend variables:**
```
DATABASE_URL=your-supabase-connection-string
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SERVER_PORT=8080
CORS_ORIGINS=https://your-frontend.railway.app
```

**Frontend variables:**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.railway.app/api
```

5. Deploy both services. Railway detects the `Dockerfile` in each directory automatically.

---

## 9. Troubleshooting

**`npm install` fails with peer dependency errors**
```bash
npm install --legacy-peer-deps
```

**Backend won't start — database connection refused**
- Verify `DATABASE_URL` is correct (use the Supabase session pooler URL for serverless: `db.xxx.supabase.co:5432`)
- Ensure your IP is not blocked in Supabase → Settings → Database → Network

**BLE scan button does nothing**
- You must be on Chrome, Edge, Opera, or Brave (desktop or Android)
- HTTPS is required in production (localhost is exempt)
- Check that your ESP32 is powered on and advertising

**"Check your email to confirm your account"**
- Supabase requires email confirmation by default. Go to Supabase → Authentication → Settings and disable "Confirm email" for development.

**Port already in use**
```bash
# Kill process on port 5173
npx kill-port 5173
# Kill process on port 8080
npx kill-port 8080
```
