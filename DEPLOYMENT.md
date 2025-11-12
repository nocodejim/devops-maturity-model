# DevOps Maturity Assessment Platform - Deployment Guide

This guide explains how to deploy the DevOps Maturity Assessment Platform using pre-built Docker images from Docker Hub.

## Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose 2.0+
- At least 2GB available RAM
- Ports 5173, 8000, and 5432 available

## Quick Start

### 1. Create Deployment Directory

```bash
mkdir devops-maturity-app
cd devops-maturity-app
```

### 2. Create Docker Compose File

**Option A: Download the deployment configuration file**

If you have access to the repository, you can copy the `docker-compose.deploy.yml` file:

```bash
# If you cloned the repo
cp docker-compose.deploy.yml docker-compose.yml

# Or download directly from GitHub
curl -o docker-compose.yml https://raw.githubusercontent.com/YOUR-ORG/devops-maturity-model/master/docker-compose.deploy.yml
```

**Option B: Create the file manually**

Create a file named `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: devops-maturity-db
    environment:
      POSTGRES_USER: devops
      POSTGRES_PASSWORD: devops123
      POSTGRES_DB: devops_maturity
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devops"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backend:
    image: buckeye90/devops-maturity-backend:1.0
    container_name: devops-maturity-backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://devops:devops123@postgres:5432/devops_maturity
      SECRET_KEY: change-this-to-a-secure-random-string-in-production
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
      DEBUG: "False"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: buckeye90/devops-maturity-frontend:1.0
    container_name: devops-maturity-frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Start the Application

```bash
docker-compose up -d
```

This will:
- Pull the images from Docker Hub (first time only)
- Start PostgreSQL database
- Start the backend API
- Start the frontend application

### 4. Initialize the Database

**Run database migrations:**
```bash
docker-compose exec backend alembic upgrade head
```

**Create an admin user:**
```bash
docker-compose exec backend python -c "
from app.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email='admin@example.com',
    full_name='Admin User',
    hashed_password=get_password_hash('admin123'),
    is_admin=True
)
db.add(admin)
db.commit()
print('Admin user created: admin@example.com / admin123')
"
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

**Default Login Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## Production Deployment

### Security Considerations

**IMPORTANT:** Before deploying to production, update these settings:

1. **Generate a secure SECRET_KEY:**
   ```bash
   # Generate a random 64-character string
   openssl rand -hex 32
   ```
   Update the `SECRET_KEY` in your docker-compose.yml

2. **Change default database credentials:**
   - Update `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`
   - Update the `DATABASE_URL` to match new credentials

3. **Change default admin password:**
   - Log in with the default credentials
   - Change the password through the application
   - Or create a new admin user and delete the default one

4. **Set DEBUG to False:**
   ```yaml
   DEBUG: "False"
   ```

5. **Restrict network access:**
   - Remove port mappings for PostgreSQL (5432) if not needed externally
   - Use a reverse proxy (nginx, Traefik) for SSL/TLS
   - Configure firewall rules

### Example Production docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: devops-maturity-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backend:
    image: buckeye90/devops-maturity-backend:1.0
    container_name: devops-maturity-backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 480
      DEBUG: "False"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  frontend:
    image: buckeye90/devops-maturity-frontend:1.0
    container_name: devops-maturity-frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

Create a `.env` file with your secrets:
```bash
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=devops_maturity
SECRET_KEY=your_64_character_random_string
```

## Network Access Configuration

### Local Network Access

To access the application from other devices on your local network:

1. Find your host machine's IP address:
   ```bash
   # Linux/Mac
   ip addr show

   # Windows
   ipconfig
   ```

2. Access the application using your host IP:
   - Frontend: `http://<your-ip>:5173`
   - Backend: `http://<your-ip>:8000`

3. Ensure your firewall allows connections on ports 5173 and 8000

### Using a Custom Domain/Reverse Proxy

For production deployments with SSL, use nginx or Traefik:

**Example nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Management Commands

### View Application Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop Application
```bash
docker-compose stop
```

### Stop and Remove Containers
```bash
docker-compose down
```

### Stop and Remove Everything (including data)
```bash
# WARNING: This will delete all data!
docker-compose down -v
```

### Update to Latest Version
```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d
```

## Database Management

### Backup Database
```bash
docker-compose exec postgres pg_dump -U devops devops_maturity > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U devops devops_maturity
```

### Access Database Console
```bash
docker-compose exec postgres psql -U devops -d devops_maturity
```

## Troubleshooting

### Application Won't Start

**Check container status:**
```bash
docker-compose ps
```

**View logs:**
```bash
docker-compose logs
```

**Common issues:**
- Ports already in use: Change port mappings in docker-compose.yml
- Database connection failed: Ensure postgres is healthy before backend starts
- Permission denied: Run with `sudo` or add user to docker group

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# View database logs
docker-compose logs postgres
```

### Backend API Not Responding

```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Verify database migrations
docker-compose exec backend alembic current
```

### Frontend Can't Reach Backend

The frontend auto-detects the backend URL based on the hostname. If you're having connection issues:

1. Ensure backend is running: `docker-compose ps backend`
2. Check backend is accessible: `curl http://localhost:8000/health`
3. Check browser console for errors
4. Verify no firewall is blocking connections

### Container Memory Issues

```bash
# Check Docker resource usage
docker stats

# Increase Docker Desktop memory allocation in settings
# Recommended: 4GB+ for optimal performance
```

### Reset Everything

If something goes wrong and you want to start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Pull latest images
docker-compose pull

# Start fresh
docker-compose up -d

# Re-initialize database
docker-compose exec backend alembic upgrade head
```

## System Requirements

### Minimum Requirements
- CPU: 2 cores
- RAM: 2GB
- Disk: 5GB free space
- Docker Engine 20.10+

### Recommended for Production
- CPU: 4+ cores
- RAM: 4GB+
- Disk: 20GB+ free space
- SSD storage
- Dedicated server or VPS

## Support

For issues or questions:
- Check the logs: `docker-compose logs`
- Review the troubleshooting section above
- Open an issue on the project repository

## Docker Hub Images

- **Backend**: `buckeye90/devops-maturity-backend:1.0`
- **Frontend**: `buckeye90/devops-maturity-frontend:1.0`
- **Latest**: Both images also tagged with `:latest`

To use a specific version, update the image tags in docker-compose.yml:
```yaml
image: buckeye90/devops-maturity-backend:1.0
```

## License

Internal use only - All rights reserved
