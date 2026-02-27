"""FastAPI application entry point"""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.core.logging_config import (
    RequestLoggingMiddleware,
    get_logger,
    get_uptime_seconds,
    setup_logging,
)
from app.database import get_db
from app.api import admin, admin_backups, admin_frameworks, auth, assessments, analytics, organizations, gates, frameworks, projects, insights

# Initialize structured logging before anything else
setup_logging(log_level=settings.LOG_LEVEL, log_format=settings.LOG_FORMAT)
logger = get_logger("app")

app = FastAPI(
    title="DevOps Maturity Assessment API",
    description="Internal tool for assessing team DevOps maturity and readiness",
    version=settings.VERSION,
)

# Request logging middleware (added before CORS so it wraps all requests)
app.add_middleware(RequestLoggingMiddleware)

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["Organizations"])
app.include_router(frameworks.router, prefix="/api/frameworks", tags=["Frameworks"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(insights.router, prefix="/api/analytics", tags=["Analytics - Insights"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(admin_frameworks.router, prefix="/api/admin/frameworks", tags=["Admin - Frameworks"])
app.include_router(admin_backups.router, prefix="/api/admin/backups", tags=["Admin - Backups"])


@app.on_event("startup")
async def startup_event():
    logger.info("app_startup", version=settings.VERSION, debug=settings.DEBUG)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "DevOps Maturity Assessment API",
        "version": settings.VERSION,
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Detailed health check with database connectivity."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    status = "healthy" if db_status == "connected" else "degraded"
    return {
        "status": status,
        "database": db_status,
        "version": settings.VERSION,
        "uptime_seconds": get_uptime_seconds(),
    }


@app.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe - checks DB connectivity and framework availability."""
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    framework_count = 0
    if db_ok:
        try:
            result = db.execute(text("SELECT COUNT(*) FROM frameworks"))
            framework_count = result.scalar() or 0
        except Exception:
            pass

    ready = db_ok and framework_count > 0
    return {
        "ready": ready,
        "database": "connected" if db_ok else "disconnected",
        "frameworks_loaded": framework_count,
        "version": settings.VERSION,
    }
