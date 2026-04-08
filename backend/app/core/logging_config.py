"""Structured logging configuration using structlog."""

import logging
import sys
import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


def setup_logging(log_level: str = "INFO", log_format: str = "json") -> None:
    """Configure structlog with JSON or console output."""

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if log_format == "console":
        renderer = structlog.dev.ConsoleRenderer()
    else:
        renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
        foreign_pre_chain=shared_processors,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Quiet noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Get a structlog logger with the given name."""
    return structlog.get_logger(name)


# Track app start time for uptime calculation
_start_time = time.time()


def get_uptime_seconds() -> float:
    """Return seconds since the logging module was loaded (app start)."""
    return round(time.time() - _start_time, 1)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs every request with timing and request ID."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        logger = get_logger("http")

        start = time.time()
        response = None
        try:
            response = await call_next(request)
            return response
        except Exception:
            logger.exception(
                "request_error",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
            )
            raise
        finally:
            duration_ms = round((time.time() - start) * 1000, 1)
            status = response.status_code if response else 500

            # Skip noisy health check logs
            if request.url.path not in ("/health", "/health/ready", "/"):
                logger.info(
                    "request",
                    request_id=request_id,
                    method=request.method,
                    path=request.url.path,
                    status=status,
                    duration_ms=duration_ms,
                )

            if response is not None:
                response.headers["X-Request-ID"] = request_id
