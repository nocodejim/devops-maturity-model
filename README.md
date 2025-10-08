# DevOps Maturity Assessment Platform

Internal tool for assessing team DevOps maturity and readiness, focusing on the highest-impact practices that directly affect software delivery quality and velocity.

## Overview

This MVP focuses on **20 highest-impact questions** covering three core domains:
1. **Source Control & Development Practices** (7 questions) - 35% weight
2. **Security & Compliance** (6 questions) - 30% weight
3. **CI/CD & Deployment** (7 questions) - 35% weight

### Features

- Fast assessment completion (~15-20 minutes)
- Clear scoring and maturity levels (1-5)
- Actionable recommendations
- Track progress over time
- Simple internal authentication

## Technology Stack

**Backend:**
- Python 3.11+ with FastAPI
- PostgreSQL 15+
- SQLAlchemy ORM
- JWT Authentication
- Poetry for dependency management

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- React Query for data fetching
- React Hook Form + Zod validation
- Recharts for visualizations

**Infrastructure:**
- Docker + Docker Compose
- Containerized development environment

## Quick Start

### Prerequisites

- Docker Desktop (with WSL2 support on Windows)
- Git

### Setup & Run

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devops-maturity-model
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on port 8000
   - Frontend app on port 5173

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Initialize the database** (first time only)
   ```bash
   # Run migrations inside the backend container
   docker-compose exec backend alembic upgrade head

   # Create an admin user (optional - for development)
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

### Stop Services

```bash
docker-compose down
```

To remove all data (including database):
```bash
docker-compose down -v
```

## Project Structure

```
devops-maturity-model/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Business logic (security, scoring)
│   │   ├── models.py    # Database models
│   │   ├── schemas.py   # Pydantic schemas
│   │   └── main.py      # FastAPI app
│   ├── alembic/         # Database migrations
│   ├── tests/           # Backend tests
│   └── Dockerfile
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript types
│   └── Dockerfile
├── docs/                # Project documentation
│   ├── progress-tracker.md
│   └── lessons-learned.md
├── docker-compose.yml   # Docker services configuration
└── README.md
```

## Development

### Backend Development

```bash
# Enter backend container
docker-compose exec backend bash

# Run tests
pytest

# Create database migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Format code
black .

# Lint code
ruff check .
```

### Frontend Development

```bash
# Enter frontend container
docker-compose exec frontend sh

# Install new dependency
npm install <package-name>

# Run linter
npm run lint

# Format code
npm run format
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

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/assessments/` - List assessments
- `POST /api/assessments/` - Create assessment
- `POST /api/assessments/{id}/responses` - Save responses
- `POST /api/assessments/{id}/submit` - Submit for scoring
- `GET /api/assessments/{id}/report` - Get report

## Scoring System

### Maturity Levels

1. **Level 1: Initial** (0-20%) - Ad-hoc, manual processes
2. **Level 2: Developing** (21-40%) - Some automation, inconsistent
3. **Level 3: Defined** (41-60%) - Standardized, documented
4. **Level 4: Managed** (61-80%) - Metrics-driven, comprehensive automation
5. **Level 5: Optimizing** (81-100%) - Industry-leading, continuous improvement

### Calculation

- Each question scored 0-5 points
- Domain score = (total points / max possible) × 100
- Overall score = weighted average of domain scores

## Documentation

- **Spec Document**: `devops-maturity-spec-MVP.md`
- **Progress Tracker**: `docs/progress-tracker.md`
- **Lessons Learned**: `docs/lessons-learned.md`
- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`

## Testing

### Quick Test Execution

```bash
# Run all automated tests
./tests/run-all-tests.sh

# Run individual test phases
./tests/scripts/infrastructure.sh    # Verify containers and services
./tests/scripts/backend-api.sh      # Test all API endpoints
./tests/scripts/frontend-build.sh   # Verify frontend builds correctly
./tests/scripts/integration.sh      # Test complete workflows
```

### Manual Browser Testing

For comprehensive testing including actual user interactions:

```bash
# Follow the detailed browser testing guide
cat tests/manual/browser-testing.md

# Use debugging guide if issues found
cat tests/manual/debugging-guide.md
```

### Test Documentation

- **Complete Test Guide**: `tests/EXECUTION-GUIDE.md`
- **Browser Testing**: `tests/manual/browser-testing.md`
- **Debugging Guide**: `tests/manual/debugging-guide.md`
- **Test Results**: `tests/results/` (auto-generated)

## Troubleshooting

### Quick Diagnostics

```bash
# Run infrastructure tests to check system health
./tests/scripts/infrastructure.sh

# Check all container status
docker-compose ps

# View recent logs for all services
docker-compose logs --tail 50
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# View database logs
docker-compose logs postgres
```

### Backend Won't Start

```bash
# Rebuild backend container
docker-compose build backend
docker-compose up -d backend

# Check logs
docker-compose logs backend
```

### Frontend Hot Reload Not Working

```bash
# Restart frontend container
docker-compose restart frontend

# If issue persists, rebuild
docker-compose build frontend
docker-compose up -d frontend
```

### Login Issues

If you can't login after setup:

1. **Run backend API tests**: `./tests/scripts/backend-api.sh`
2. **Check browser console** for JavaScript errors
3. **Follow browser testing guide**: `tests/manual/browser-testing.md`
4. **Use debugging guide**: `tests/manual/debugging-guide.md`

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

See `.env.example` files in backend/ and frontend/ directories.

## Development Roadmap

See `docs/progress-tracker.md` for detailed development status.

### Current Phase: Phase 1 - Foundation
- [x] Project structure setup
- [x] Docker configuration
- [x] Backend API skeleton
- [x] Frontend structure
- [ ] Database migrations
- [ ] Authentication implementation
- [ ] Basic CRUD operations

### Next: Phase 2 - Core Assessment
- Assessment form implementation
- Scoring engine
- Response persistence

### Future: Phase 3-4
- Results visualization
- PDF reports
- Analytics
- Polish & deployment

## Contributing

This is an internal tool. For questions or issues, contact the platform team.

## License

Internal use only - All rights reserved
