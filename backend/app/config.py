import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "FoodResQ - MoFPI Smart Food Waste Ecosystem"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Supabase Auth - All secrets loaded from environment ONLY
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # Demo mode for hackathon evaluation (disable in production)
    ALLOW_MOCK_AUTH: bool = os.getenv("ALLOW_MOCK_AUTH", "true").lower() == "true"

    # Rate limiting
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_SENSITIVE: str = "10/minute"

    # Max request body size (bytes)
    MAX_BODY_SIZE: int = 15 * 1024 * 1024  # 15 MB

    # Allowed CORS origins for production (comma-separated env var)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    @property
    def cors_origin_list(self) -> list:
        raw = self.CORS_ORIGINS.strip()
        if raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]

settings = Settings()
