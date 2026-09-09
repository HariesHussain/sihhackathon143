import logging
import time
from collections import defaultdict
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

# Import API Routers
from app.api.demand import router as demand_router
from app.api.quality import router as quality_router
from app.api.redistribution import router as redistribution_router
from app.api.logistics import router as logistics_router
from app.api.telemetry import router as telemetry_router
from app.api.esg import router as esg_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("annapurna.api")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Smart Food Waste Reduction and Sustainable Redistribution Ecosystem (MoFPI - SIH26234)",
    docs_url="/docs" if settings.ALLOW_MOCK_AUTH else None,
    redoc_url="/redoc" if settings.ALLOW_MOCK_AUTH else None,
)

# ──────────────────────────────────────────────────────────────
# 1. RATE LIMITER MIDDLEWARE (IP-based sliding window)
# ──────────────────────────────────────────────────────────────
class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    In-memory sliding-window rate limiter.
    Default: 120 requests per minute per IP.
    Sensitive paths (surplus/verify-otp, quality/analyze): 20 per minute.
    """
    def __init__(self, app, default_rpm: int = 120, sensitive_rpm: int = 20):
        super().__init__(app)
        self.default_rpm = default_rpm
        self.sensitive_rpm = sensitive_rpm
        self.requests: dict = defaultdict(list)
        self.sensitive_paths = {"/api/surplus/verify-otp", "/api/quality/analyze", "/api/surplus/declare"}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        now = time.time()
        window = 60.0

        is_sensitive = any(path.startswith(sp) for sp in self.sensitive_paths)
        limit = self.sensitive_rpm if is_sensitive else self.default_rpm

        key = f"{client_ip}:{path}" if is_sensitive else client_ip

        # Prune old entries
        self.requests[key] = [t for t in self.requests[key] if now - t < window]

        if len(self.requests[key]) >= limit:
            retry_after = int(window - (now - self.requests[key][0])) + 1
            logger.warning(f"Rate limit exceeded: {client_ip} on {path} ({len(self.requests[key])}/{limit})")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"error": "Rate limit exceeded", "message": f"Too many requests. Try again in {retry_after} seconds."},
                headers={"Retry-After": str(retry_after)}
            )

        self.requests[key].append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - len(self.requests[key])))
        return response

# ──────────────────────────────────────────────────────────────
# 2. SECURITY HEADERS MIDDLEWARE
# ──────────────────────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
        # Strip server identity if present
        if "server" in response.headers:
            del response.headers["server"]
        return response

# ──────────────────────────────────────────────────────────────
# 3. REQUEST BODY SIZE LIMITER
# ──────────────────────────────────────────────────────────────
class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.MAX_BODY_SIZE:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"error": "Payload too large", "message": f"Request body exceeds maximum of {settings.MAX_BODY_SIZE // (1024*1024)} MB."}
            )
        return await call_next(request)

# Apply middleware (order matters: outermost first)
app.add_middleware(RateLimitMiddleware, default_rpm=120, sensitive_rpm=20)
app.add_middleware(BodySizeLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
)

# ──────────────────────────────────────────────────────────────
# 4. EXCEPTION HANDLERS
# ──────────────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg", "Invalid value")
        error_details.append(f"{field}: {msg}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "One or more provided inputs are invalid or out of allowed bounds.",
            "details": error_details
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Never leak stack traces or internal details to the client
    logger.error(f"Unhandled exception on {request.method} {request.url.path}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. The system state remains protected."
        }
    )

# ──────────────────────────────────────────────────────────────
# 5. MOUNT ROUTERS
# ──────────────────────────────────────────────────────────────
app.include_router(demand_router, prefix=settings.API_PREFIX)
app.include_router(quality_router, prefix=settings.API_PREFIX)
app.include_router(redistribution_router, prefix=settings.API_PREFIX)
app.include_router(logistics_router, prefix=settings.API_PREFIX)
app.include_router(telemetry_router, prefix=settings.API_PREFIX)
app.include_router(esg_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ministry": "Ministry of Food Processing Industries (MoFPI)",
        "problem_statement": "SIH26234",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
