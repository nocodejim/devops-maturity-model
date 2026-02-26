"""Admin API endpoints for database backup and restore."""

import os
import subprocess
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.admin import require_admin
from app.config import settings
from app.core.logging_config import get_logger
from app.database import get_db
from app.models import User

router = APIRouter()
logger = get_logger("admin.backups")

BACKUP_DIR = Path("/app/backups")
BACKUP_DIR.mkdir(exist_ok=True)


class BackupInfo(BaseModel):
    filename: str
    size_bytes: int
    created_at: str


class BackupResult(BaseModel):
    filename: str
    size_bytes: int
    message: str


class RestoreResult(BaseModel):
    message: str


def _parse_db_url() -> dict:
    """Parse DATABASE_URL into components for pg_dump/pg_restore."""
    parsed = urlparse(settings.DATABASE_URL)
    return {
        "host": parsed.hostname or "postgres",
        "port": str(parsed.port or 5432),
        "user": parsed.username or "devops",
        "password": parsed.password or "devops123",
        "dbname": parsed.path.lstrip("/") or "devops_maturity",
    }


@router.get("/", response_model=list[BackupInfo])
async def list_backups(
    current_user: User = Depends(require_admin),
):
    """List all available backup files."""
    backups = []
    for f in sorted(BACKUP_DIR.glob("*.dump"), key=lambda p: p.stat().st_mtime, reverse=True):
        stat = f.stat()
        backups.append(
            BackupInfo(
                filename=f.name,
                size_bytes=stat.st_size,
                created_at=datetime.fromtimestamp(stat.st_mtime).isoformat(),
            )
        )
    logger.info("list_backups", admin=current_user.email, count=len(backups))
    return backups


@router.post("/", response_model=BackupResult, status_code=201)
async def create_backup(
    current_user: User = Depends(require_admin),
):
    """Create a new database backup using pg_dump."""
    db_config = _parse_db_url()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.dump"
    filepath = BACKUP_DIR / filename

    env = os.environ.copy()
    env["PGPASSWORD"] = db_config["password"]

    cmd = [
        "pg_dump",
        "-h", db_config["host"],
        "-p", db_config["port"],
        "-U", db_config["user"],
        "-Fc",  # Custom format (compressed, supports pg_restore)
        "-f", str(filepath),
        db_config["dbname"],
    ]

    logger.info("create_backup", admin=current_user.email, filename=filename)

    try:
        result = subprocess.run(
            cmd, env=env, capture_output=True, text=True, timeout=300
        )
        if result.returncode != 0:
            logger.error("backup_failed", stderr=result.stderr)
            raise HTTPException(status_code=500, detail=f"pg_dump failed: {result.stderr}")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Backup timed out after 5 minutes")

    size = filepath.stat().st_size
    logger.info("backup_created", filename=filename, size_bytes=size)
    return BackupResult(
        filename=filename,
        size_bytes=size,
        message=f"Backup created successfully ({size:,} bytes)",
    )


@router.get("/{filename}/download")
async def download_backup(
    filename: str,
    current_user: User = Depends(require_admin),
):
    """Download a backup file."""
    # Sanitize filename to prevent path traversal
    safe_name = Path(filename).name
    filepath = BACKUP_DIR / safe_name

    if not filepath.exists() or not filepath.suffix == ".dump":
        raise HTTPException(status_code=404, detail="Backup not found")

    logger.info("download_backup", admin=current_user.email, filename=safe_name)
    return FileResponse(
        path=str(filepath),
        filename=safe_name,
        media_type="application/octet-stream",
    )


@router.post("/restore", response_model=RestoreResult)
async def restore_backup(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Restore the database from an uploaded backup file.

    WARNING: This replaces all current data with the backup contents.
    """
    if not file.filename or not file.filename.endswith(".dump"):
        raise HTTPException(
            status_code=400, detail="Invalid file: expected a .dump file from pg_dump"
        )

    db_config = _parse_db_url()

    # Save uploaded file temporarily
    temp_path = BACKUP_DIR / f"_restore_temp_{file.filename}"
    try:
        content = await file.read()
        temp_path.write_bytes(content)

        env = os.environ.copy()
        env["PGPASSWORD"] = db_config["password"]

        cmd = [
            "pg_restore",
            "-h", db_config["host"],
            "-p", db_config["port"],
            "-U", db_config["user"],
            "-d", db_config["dbname"],
            "--clean",        # Drop existing objects before restoring
            "--if-exists",    # Don't error if objects don't exist yet
            "--no-owner",     # Don't set ownership
            "--no-privileges",  # Don't set privileges
            str(temp_path),
        ]

        logger.info("restore_backup", admin=current_user.email, filename=file.filename)

        result = subprocess.run(
            cmd, env=env, capture_output=True, text=True, timeout=300
        )

        # pg_restore returns non-zero for warnings too, so check stderr for actual errors
        if result.returncode != 0 and "ERROR" in result.stderr:
            logger.error("restore_failed", stderr=result.stderr)
            raise HTTPException(
                status_code=500, detail=f"Restore failed: {result.stderr[:500]}"
            )

        logger.info("restore_completed", admin=current_user.email)
        return RestoreResult(
            message=f"Database restored successfully from {file.filename}"
        )
    finally:
        if temp_path.exists():
            temp_path.unlink()


@router.delete("/{filename}", status_code=204)
async def delete_backup(
    filename: str,
    current_user: User = Depends(require_admin),
):
    """Delete a backup file."""
    safe_name = Path(filename).name
    filepath = BACKUP_DIR / safe_name

    if not filepath.exists() or not filepath.suffix == ".dump":
        raise HTTPException(status_code=404, detail="Backup not found")

    filepath.unlink()
    logger.info("delete_backup", admin=current_user.email, filename=safe_name)
