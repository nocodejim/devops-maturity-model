# DevOps Maturity Assessment - Backend

FastAPI backend for the DevOps Maturity Assessment Platform.

## Technology Stack

- Python 3.11+
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Alembic (migrations)
- JWT Authentication
- Poetry (dependency management)

## Setup

### Using Docker (Recommended)

The backend runs in a Docker container. See the main project README for instructions.

### Local Development (with venv)

If you need to run locally without Docker:

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Poetry
pip install poetry

# Install dependencies
poetry install

# Copy environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── api/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── assessments.py   # Assessment CRUD
│   │   └── analytics.py     # Analytics endpoints
│   ├── core/
│   │   ├── security.py      # JWT & password handling
│   │   └── scoring.py       # Scoring engine
│   └── utils/
│       └── report_generator.py  # PDF generation
├── alembic/                 # Database migrations
├── tests/                   # Test suite
├── Dockerfile
├── pyproject.toml           # Poetry dependencies
└── README.md
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Code Quality

```bash
# Format code
black .

# Lint code
ruff check .

# Run tests
pytest
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Environment Variables

See `.env.example` for required environment variables.

## Authentication

The API uses JWT bearer tokens. To authenticate:

1. POST to `/api/auth/login` with email/password
2. Include the returned token in subsequent requests: `Authorization: Bearer <token>`

## License

Internal use only.
