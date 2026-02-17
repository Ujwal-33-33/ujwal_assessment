# TaskFlow

A task management API with JWT auth and role-based permissions. Built with Express + MongoDB on the backend, React frontend for testing the API.

## What it does

Users can register, log in, and manage their own tasks. Admins can see and manage everyone's tasks. Pretty standard CRUD app with proper auth.

## Running it locally

You need Node.js and MongoDB installed (or use Docker for MongoDB).

```bash
# backend
cd server
npm install
cp ../.env.example .env
# edit .env if you need different values
npm run dev

# frontend (separate terminal)
cd client
npm install
npm run dev
```

Backend runs on `localhost:5000`, frontend on `localhost:5173`.

If you don't have MongoDB locally, just run:
```bash
docker compose up mongo -d
```

## API endpoints

**Auth:**
- `POST /api/auth/register` - create account
- `POST /api/auth/login` - get JWT token
- `GET /api/auth/me` - current user info (needs token)

**Tasks:**
- `GET /api/tasks` - list your tasks (or all if admin)
- `POST /api/tasks` - create task
- `GET /api/tasks/:id` - get one task
- `PUT /api/tasks/:id` - update task
- `DELETE /api/tasks/:id` - delete task

All task routes need a valid JWT in the `Authorization: Bearer <token>` header.

Check out the full API docs at `http://localhost:5000/api-docs` when the server is running.

## Tech stack

**Backend:** Node, Express, MongoDB (Mongoose), bcrypt, JWT, Zod validation, Swagger docs

**Frontend:** React, Vite, TailwindCSS, Axios, react-router, react-hot-toast

**Security:** Helmet, CORS, rate limiting

## Project structure

```
server/
  src/
    config/          # db connection, env vars, swagger
    controllers/     # route handlers
    middleware/      # auth, validation, errors
    models/          # mongoose schemas
    routes/          # API routes
    validators/      # zod schemas
    app.js
    server.js

client/
  src/
    api/             # axios setup
    components/      # navbar, modals, etc
    context/         # auth state
    pages/           # login, register, dashboard
```

## How it scales

Right now it's a monolith, but it's structured to split into microservices later if needed. Auth and tasks are already separate modules with their own controllers/routes/validation.

**Caching:** Add Redis for response caching and rate limiter state sharing across instances. Cache GET /tasks with a short TTL, invalidate on writes.

**Load balancing:** The API is stateless (JWT = no server sessions), so you can throw it behind nginx or AWS ALB and scale horizontally. Just run multiple instances.

**Database:** Use MongoDB replica sets for HA. Index on `assignedUser` and `status` fields for faster queries.

## Environment variables

Copy `.env.example` to `server/.env` and fill in:

- `PORT` - server port (default 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for signing tokens (change this!)
- `JWT_EXPIRES_IN` - token expiry (default 7d)
- `CLIENT_URL` - frontend URL for CORS

## Docker

Full stack (MongoDB + backend):
```bash
docker compose up --build
```

Just MongoDB:
```bash
docker compose up mongo -d
```

## Notes

The frontend is just for demo purposes. It shows all the API features work — auth flow, protected routes, CRUD operations, role-based UI changes (admin badge, etc).

JWT secret in `.env.example` is a placeholder. Generate a real one before deploying anywhere.
