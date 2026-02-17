# TaskFlow

Full-stack task management app. Express + MongoDB backend with JWT auth, role-based access control, and Swagger docs. React frontend with a clean dark-themed dashboard.

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or use the Docker setup below)

### 1. Clone and install

```bash
git clone <your-repo-url> taskflow
cd taskflow

# backend
cd server
cp ../.env.example .env   # tweak values if needed
npm install

# frontend
cd ../client
npm install
```

### 2. Run with Docker (optional)

If you don't have MongoDB installed locally, spin it up with Docker:

```bash
docker compose up mongo -d
```

Or run the full stack (backend + MongoDB):

```bash
docker compose up --build
```

### 3. Start the dev servers

In two terminals:

```bash
# terminal 1 - backend
cd server
npm run dev

# terminal 2 - frontend
cd client
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

API docs: `http://localhost:5000/api-docs`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 5000 | Server port |
| `MONGO_URI` | mongodb://localhost:27017/taskflow | MongoDB connection string |
| `JWT_SECRET` | (change this) | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | 7d | Token expiry |
| `CLIENT_URL` | http://localhost:5173 | Allowed CORS origin |

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/auth/me` | Yes | Current user info |
| GET | `/api/tasks` | Yes | List tasks (own or all for admins) |
| GET | `/api/tasks/:id` | Yes | Get single task |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

## Project Structure

```
taskflow/
├── server/
│   └── src/
│       ├── config/          # db, env, swagger setup
│       ├── controllers/     # request handlers
│       ├── middleware/       # auth, rbac, validation, errors
│       ├── models/          # mongoose schemas
│       ├── routes/          # route definitions + swagger jsdoc
│       ├── validators/      # zod schemas
│       ├── app.js           # express app config
│       └── server.js        # entry point
├── client/
│   └── src/
│       ├── api/             # axios instance
│       ├── components/      # navbar, modal, protected route
│       ├── context/         # auth state
│       └── pages/           # login, register, dashboard
├── docker-compose.yml
└── .env.example
```

## Scalability & Architecture

This section covers how this architecture maps to a production environment at scale.

### Service Decomposition

The monolithic Express server is structured in a way that makes it straightforward to split into microservices later. The auth module and task module are already decoupled — they share a database but have separate controllers, routes, and validation schemas. In production, you'd break these into independent services behind an API gateway (e.g., Kong, AWS API Gateway, or Nginx), each with their own database to follow the database-per-service pattern.

The JWT-based auth makes this transition easy since tokens are stateless — any service can validate them independently without hitting a central session store.

### Caching Strategy

For a read-heavy workload like task listings, you'd add Redis as a caching layer:

- **Response caching**: Cache `GET /tasks` results per user with a short TTL (30-60s). Invalidate on write operations.
- **Session/token caching**: Store JWT blacklist entries in Redis for logout support (since JWTs are otherwise stateless until expiry).
- **Rate limiter backing**: The current in-memory rate limiter works for a single instance. In production, swap to `rate-limit-redis` so the counter is shared across all instances.

### Load Balancing

The backend is stateless by design (no server-side sessions, JWT for auth), so it scales horizontally without sticky sessions. A typical setup would be:

- **Nginx or AWS ALB** as a reverse proxy / load balancer in front of multiple Express instances
- **PM2 cluster mode** or **Kubernetes pods** for process management and autoscaling
- **MongoDB replica set** for database high availability

### Deployment Pipeline

A production deployment pipeline would look like:

1. CI runs linting + tests on PR
2. Docker image built and pushed to a registry (ECR, GHCR)
3. Blue-green or rolling deploy via Kubernetes or ECS
4. Health check endpoint (`/api/health`) used for readiness probes
