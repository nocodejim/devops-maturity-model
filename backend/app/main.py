"""FastAPI application entry point"""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings
from app.database import SessionLocal
from app.api import auth, assessments, analytics, organizations, frameworks

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("app")

app = FastAPI(
    title="DevOps Maturity Assessment API",
    description="Assess team DevOps maturity and readiness",
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Last-resort handler: log with request context, return clean JSON.

    Without this, unexpected errors surface as raw 500s (with tracebacks
    when debug tooling is on). HTTPException is unaffected — Starlette
    handles it before this runs.
    """
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["Organizations"])
app.include_router(frameworks.router, prefix="/api/frameworks", tags=["Frameworks"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    """Liveness: the process is up and serving requests."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/health")
async def health_check():
    """Readiness: verifies dependencies. Returns 503 when the database is down."""
    checks = {}
    healthy = True

    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            checks["database"] = "connected"
        finally:
            db.close()
    except Exception as exc:
        logger.error("Health check: database unreachable: %s", exc)
        checks["database"] = "unreachable"
        healthy = False

    body = {"status": "healthy" if healthy else "unhealthy", **checks}
    if not healthy:
        return JSONResponse(status_code=503, content=body)
    return body
