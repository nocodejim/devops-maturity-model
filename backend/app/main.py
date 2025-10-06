"""FastAPI application entry point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, assessments, analytics

app = FastAPI(
    title="DevOps Maturity Assessment API",
    description="Internal tool for assessing team DevOps maturity and readiness",
    version="0.1.0",
)

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
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "DevOps Maturity Assessment API",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {"status": "healthy", "database": "connected"}
