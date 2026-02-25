# DevOps Maturity Assessment Platform

A comprehensive suite for assessing team DevOps maturity and readiness. This repository contains **two distinct applications** serving different use cases:

| Application | Purpose | Deployment |
|-------------|---------|------------|
| **Standalone Platform** | Full-featured consulting/scoring tool | Docker containers |
| **SpiraApp Widget** | Embedded assessment widget for Spira ALM | SpiraApp package |

## Quick Navigation

- [Standalone Platform](#standalone-platform) - Full-stack web application
- [SpiraApp Widget](#spiraapp-widget) - Embedded Spira dashboard widget
- [Assessment Frameworks](#assessment-frameworks) - Available frameworks
- [Documentation](#documentation) - Guides and references

---

## Standalone Platform

A full-stack web application for comprehensive DevOps maturity assessments, ideal for consulting engagements and detailed organizational assessments.

### Features

- **Multiple Assessment Frameworks**: MVP (40 questions), CALMS (28 questions), DORA (25 questions)
- **User Management**: Role-based access (admin/assessor/viewer)
- **Organization Tracking**: Group assessments by organization
- **Detailed Analytics**: Domain breakdown, strengths/gaps analysis, recommendations
- **Assessment History**: Track progress over time
- **API Access**: RESTful API with OpenAPI documentation

### Technology Stack

**Backend:**
- Python 3.11+ with FastAPI
- PostgreSQL 15+
- SQLAlchemy ORM with Alembic migrations
- JWT Authentication

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- React Query for data fetching

**Infrastructure:**
- Docker + Docker Compose
- Production-ready images on Docker Hub

### Quick Start

#### Prerequisites
- Docker Desktop (with WSL2 support on Windows)
- Git

#### Setup & Run

```bash
# Clone the repository
git clone <repository-url>
cd devops-maturity-model

# Start all services
docker-compose up -d
```

This starts:
- PostgreSQL database on port 8682
- Backend API on port 8680
- Frontend app on port 8673

#### Access the Application

- **Frontend**: http://localhost:8673
- **Backend API**: http://localhost:8680
- **API Docs**: http://localhost:8680/docs

#### First-Time Setup

The database initializes automatically on first startup. A default admin user is created:
- **Email**: admin@example.com
- **Password**: admin123

#### Stop Services

```bash
# Stop containers
docker-compose down

# Stop and remove data
docker-compose down -v
```

### Deployment with Docker Hub Images

For production deployment without source code, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## SpiraApp Widget

A lightweight client-side widget that runs inside **SpiraPlan**, **SpiraTeam**, or **SpiraTest**. Provides quick DevOps maturity assessments without leaving the ALM environment.

### Features

- **Embedded Experience**: Runs as a Product Dashboard widget
- **No External Dependencies**: Pure client-side, uses Spira's storage
- **Default Assessment**: 20 questions across 3 domains
- **Custom Frameworks**: Upload JSON frameworks (CALMS, custom assessments)
- **Assessment History**: Per-product tracking

### Quick Start

#### Build the SpiraApp

```bash
./build_spiraapp.sh
```

This creates a `.spiraapp` package in the `dist/` folder.

#### Install in Spira

1. **System Admin**: Upload `.spiraapp` file in System Admin > SpiraApps
2. **Enable**: Toggle the power button to enable system-wide
3. **Product Admin**: Enable for specific products in Product Admin > SpiraApps
4. **Dashboard**: Add the widget via "Add/Remove Items" on Product Home

### SpiraApp Source Files

```
src/spiraapp-mvp/
├── manifest.yaml          # SpiraApp configuration
├── widget.js              # Main application code
├── widget.css             # Widget styles
├── settings.js            # Settings page code
├── calms-framework.json   # CALMS assessment (28 questions)
└── example-framework.json # Template for custom frameworks
```

---

## Assessment Frameworks

### Available Frameworks

| Framework | Questions | Domains | Best For |
|-----------|-----------|---------|----------|
| **DevOps MVP** | 40 | 5 | Comprehensive technical assessment |
| **CALMS** | 28 | 5 | Organizational readiness |
| **DORA Metrics** | 25 | 5 | Software delivery performance |
| **SpiraApp Default** | 20 | 3 | Quick embedded assessment |

### Scoring System

All frameworks use a 0-5 scoring scale:

| Score | Level | Description |
|-------|-------|-------------|
| 0 | None | Practice not implemented |
| 1 | Initial | Ad-hoc, inconsistent |
| 2 | Developing | Basic implementation |
| 3 | Defined | Standardized, documented |
| 4 | Managed | Comprehensive automation |
| 5 | Optimizing | Industry-leading practices |

### Maturity Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| Level 1: Initial | 0-20% | Ad-hoc, manual processes |
| Level 2: Developing | 21-40% | Some repeatable processes |
| Level 3: Defined | 41-60% | Standardized processes |
| Level 4: Managed | 61-80% | Measured and controlled |
| Level 5: Optimizing | 81-100% | Continuous improvement |

---

## Project Structure

```
devops-maturity-model/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Business logic (security, scoring)
│   │   ├── scripts/           # Seed scripts for frameworks
│   │   ├── models.py          # Database models
│   │   └── schemas.py         # Pydantic schemas
│   ├── alembic/               # Database migrations
│   └── Dockerfile
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   └── types/             # TypeScript types
│   └── Dockerfile
├── src/spiraapp-mvp/          # SpiraApp widget source
│   ├── manifest.yaml          # SpiraApp manifest
│   ├── widget.js              # Widget application
│   └── calms-framework.json   # CALMS framework
├── docs/                       # Documentation
│   ├── USER-GUIDE.md          # Standalone platform guide
│   ├── USER-GUIDE-SPIRAAPP.md # SpiraApp widget guide
│   ├── SpiraApp_Information/  # SpiraApp development docs
│   ├── progress-tracker.md    # Development progress
│   └── lessons-learned.md     # Known issues and solutions
├── docker-compose.yml          # Development configuration
├── docker-compose.deploy.yml   # Production configuration
├── build_spiraapp.sh          # SpiraApp build script
└── DEPLOYMENT.md              # Production deployment guide
```

---

## Documentation

### User Guides

- **[Standalone Platform User Guide](docs/USER-GUIDE.md)** - Complete guide for the web application
- **[SpiraApp Widget User Guide](docs/USER-GUIDE-SPIRAAPP.md)** - Guide for the embedded widget
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions

### Technical Documentation

- **[API Documentation](http://localhost:8680/docs)** - Interactive Swagger UI (when running)
- **[Progress Tracker](docs/progress-tracker.md)** - Development status and milestones
- **[Lessons Learned](docs/lessons-learned.md)** - Known issues and solutions

### SpiraApp Development

- **[SpiraApps Overview](docs/SpiraApp_Information/SpiraApps-Overview.md)** - How SpiraApps work
- **[SpiraApps Tutorial](docs/SpiraApp_Information/SpiraApps-Tutorial.md)** - Building SpiraApps
- **[SpiraApps Manifest](docs/SpiraApp_Information/SpiraApps-Manifest.md)** - Manifest reference

---

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

# Seed a framework
python -m app.scripts.seed_calms_framework
```

### Frontend Development

```bash
# Enter frontend container
docker-compose exec frontend sh

# Type check
npm run build

# Run linter
npm run lint
```

### SpiraApp Development

```bash
# Build SpiraApp package
./build_spiraapp.sh

# Output: dist/DevOpsMaturityAssessment.spiraapp
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## API Reference

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/me` | GET | Current user info |
| `/api/frameworks/` | GET | List assessment frameworks |
| `/api/frameworks/{id}/structure` | GET | Framework with all questions |
| `/api/assessments/` | GET/POST | List/create assessments |
| `/api/assessments/{id}/responses` | POST | Save question responses |
| `/api/assessments/{id}/submit` | POST | Submit for scoring |
| `/api/assessments/{id}/report` | GET | Get assessment report |

Full API documentation available at http://localhost:8680/docs when running.

---

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | (see docker-compose) |
| `SECRET_KEY` | JWT secret key | (generated) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | 30 |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:8680 |

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# View database logs
docker-compose logs postgres
```

### Backend Issues

```bash
# Rebuild backend container
docker-compose build backend
docker-compose up -d backend

# Check logs
docker-compose logs backend
```

### Frontend Issues

```bash
# Rebuild frontend container
docker-compose build frontend
docker-compose up -d frontend

# Check logs
docker-compose logs frontend
```

### SpiraApp Issues

See the [SpiraApp User Guide troubleshooting section](docs/USER-GUIDE-SPIRAAPP.md#troubleshooting).

---

## Network Access

For accessing from other devices on your network:

| Service | Local | Network |
|---------|-------|---------|
| Frontend | http://localhost:8673 | http://YOUR-IP:8673 |
| Backend | http://localhost:8680 | http://YOUR-IP:8680 |
| Database | localhost:8682 | YOUR-IP:8682 |

---

## Contributing

This is an internal tool. For questions or issues:

1. Check the [Lessons Learned](docs/lessons-learned.md) document
2. Review existing [documentation](#documentation)
3. Contact the platform team

---

## License

Internal use only - All rights reserved
