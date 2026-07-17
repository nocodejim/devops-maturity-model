# DevOps Maturity Assessment Platform - Deployment Guide

This guide explains how to deploy the platform using pre-built Docker images.

The deployment stack is **secure by default**: it refuses to start without real
secrets, never seeds a default login, runs both app containers as non-root
users, and serves the frontend as a static build behind nginx (which proxies
`/api` to the backend — no CORS configuration needed).

## Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose 2.0+
- At least 2GB available RAM
- Ports 8673 and 8680 available

## Quick Start

### 1. Get the compose file

```bash
mkdir devops-maturity-app && cd devops-maturity-app
curl -o docker-compose.yml https://raw.githubusercontent.com/nocodejim/devops-maturity-model/master/docker-compose.deploy.yml
```

### 2. Provide secrets

Create a `.env` file next to the compose file:

```bash
cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -hex 16)
SECRET_KEY=$(openssl rand -hex 32)
EOF
chmod 600 .env
```

The stack **will not start** without these — there are no insecure fallbacks.

### 3. Start the application

```bash
docker-compose up -d
```

Migrations and framework seeding run automatically via the backend entrypoint.
No default admin account is created.

### 4. Create the first admin (operator action)

```bash
docker-compose exec backend python -m app.scripts.create_admin --email you@company.com
```

You'll be prompted for a password (min 12 characters). For non-interactive
provisioning, set `ADMIN_PASSWORD` in the environment of the exec call.

### 5. Access the application

- **Frontend**: http://localhost:8673 (nginx serves the app and proxies `/api`)
- **Backend API** (optional direct access): http://localhost:8680
- **API Documentation**: http://localhost:8680/docs
- **Health check**: http://localhost:8680/health — returns 503 if the database is unreachable

## Production Checklist

1. **Secrets** — `.env` file with strong `POSTGRES_PASSWORD` and `SECRET_KEY`
   (already required; the stack won't boot without them).
2. **TLS** — put a reverse proxy (nginx, Traefik, Caddy) in front of port 8673
   for HTTPS. All app traffic, including `/api`, flows through that single port.
3. **Database exposure** — the deploy compose does not publish the PostgreSQL
   port; leave it that way unless you need external DB tooling.
4. **Backups** — schedule `pg_dump` (see Database Management below).
5. **Rotation** — rotating `SECRET_KEY` invalidates all active sessions;
   announce before rotating.

### TLS reverse proxy example (nginx on the host)

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    # ssl_certificate ...; ssl_certificate_key ...;

    location / {
        proxy_pass http://localhost:8673;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Only one upstream is needed — the frontend container already proxies `/api`
to the backend internally.

## Network Access

To reach the app from other devices on your network, use your host's IP:
`http://<your-ip>:8673`. The frontend calls the API same-origin, so no extra
backend configuration is required.

## Management Commands

### Status and logs
```bash
docker-compose ps
docker-compose logs -f            # all services
docker-compose logs -f backend    # one service
```

### Restart / stop
```bash
docker-compose restart            # restart all
docker-compose stop               # stop
docker-compose down               # stop and remove containers (data kept)
docker-compose down -v            # WARNING: deletes all data
```

### Update to a new version
```bash
docker-compose pull
docker-compose up -d              # migrations run automatically on startup
```

## Database Management

### Backup
```bash
docker-compose exec postgres pg_dump -U devops devops_maturity > backup.sql
```

### Restore
```bash
cat backup.sql | docker-compose exec -T postgres psql -U devops devops_maturity
```

### Console
```bash
docker-compose exec postgres psql -U devops -d devops_maturity
```

## Troubleshooting

### Stack refuses to start
The most common cause is missing secrets — compose prints which variable is
unset (e.g. `set SECRET_KEY in .env`). Create/fix the `.env` file.

### Application won't start
```bash
docker-compose ps
docker-compose logs
```
- Ports already in use: change the host-side port mappings
- Migration failure: the backend container exits with the alembic error in its logs

### Backend API not responding
```bash
curl http://localhost:8680/health     # 200 = healthy, 503 = database unreachable
docker-compose logs backend
docker-compose exec backend alembic current
```

### Frontend can't reach backend
The frontend proxies `/api` to the backend container over the compose network.
1. Ensure backend is up: `docker-compose ps backend`
2. Check its health: `curl http://localhost:8680/health`
3. Check the browser console / network tab for failing `/api` requests

### Reset everything
```bash
docker-compose down -v      # WARNING: deletes all data
docker-compose pull
docker-compose up -d        # migrations + seeding run automatically
```

## Building the images from source

```bash
# Backend
docker build -t <registry>/devops-maturity-backend:<tag> backend/

# Frontend (production build — static bundle behind unprivileged nginx)
docker build -f frontend/Dockerfile.prod -t <registry>/devops-maturity-frontend:<tag> frontend/
```

Set `BACKEND_IMAGE`/`FRONTEND_IMAGE` in `.env` to point the deploy compose at
your registry/tags.

## System Requirements

- Minimum: 2 CPU cores, 2GB RAM, 5GB disk
- Recommended: 4+ cores, 4GB+ RAM, SSD storage

## License

Internal use only - All rights reserved
