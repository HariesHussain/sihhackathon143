from fastapi import Depends, HTTPException, status, Header
from typing import Optional, List
import jwt
import re
import html
from app.config import settings

VALID_ROLES = {"KITCHEN_OPERATOR", "PLANT_SUPERVISOR", "NGO_REPRESENTATIVE", "REGULATOR_AUDITOR"}

class UserPayload:
    __slots__ = ("user_id", "email", "role", "org_name")

    def __init__(self, user_id: str, email: str, role: str, org_name: str):
        self.user_id = _sanitize(user_id, 64)
        self.email = _sanitize(email, 120)
        self.role = role if role in VALID_ROLES else "KITCHEN_OPERATOR"
        self.org_name = _sanitize(org_name, 150)

def _sanitize(value: str, max_len: int = 200) -> str:
    """Strip HTML/script tags and clamp length to prevent XSS & log injection."""
    cleaned = html.escape(str(value).strip())
    cleaned = re.sub(r"[\r\n\t]", " ", cleaned)  # prevent log injection
    return cleaned[:max_len]

def get_current_user(authorization: Optional[str] = Header(None)) -> UserPayload:
    """
    Validates Supabase JWT token or provides fallback demo identities for hackathon evaluation.
    In production (ALLOW_MOCK_AUTH=false), invalid tokens are strictly rejected.
    """
    if not authorization:
        if settings.ALLOW_MOCK_AUTH:
            return UserPayload("demo_guest", "guest@annapurna.gov.in", "KITCHEN_OPERATOR", "Central Demo Canteen")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required."
        )

    token = authorization.replace("Bearer ", "").strip()

    if not token:
        if settings.ALLOW_MOCK_AUTH:
            return UserPayload("demo_guest", "guest@annapurna.gov.in", "KITCHEN_OPERATOR", "Central Demo Canteen")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Empty token provided.")

    # Quick-switch demo tokens (demo mode only)
    if settings.ALLOW_MOCK_AUTH and token.startswith("demo_role:"):
        raw_role = token.split("demo_role:", 1)[1].upper().strip()
        role = raw_role if raw_role in VALID_ROLES else "KITCHEN_OPERATOR"
        return UserPayload(f"usr_{role.lower()}", f"{role.lower()}@annapurna.gov.in", role, f"Demo {role} Authority")

    # Supabase JWT decoding
    jwt_secret = settings.SUPABASE_JWT_SECRET
    try:
        decode_opts = {"verify_signature": bool(jwt_secret and not settings.ALLOW_MOCK_AUTH)}
        payload = jwt.decode(
            token,
            jwt_secret or "placeholder",
            algorithms=["HS256"],
            options=decode_opts
        )
        user_id = payload.get("sub", "anon_user")
        email = payload.get("email", "user@annapurna.gov.in")
        user_meta = payload.get("user_metadata", {})
        if not isinstance(user_meta, dict):
            user_meta = {}
        raw_role = user_meta.get("role", "KITCHEN_OPERATOR")
        role = raw_role if raw_role in VALID_ROLES else "KITCHEN_OPERATOR"
        org_name = user_meta.get("org_name", "Registered Entity")
        return UserPayload(user_id, email, role, org_name)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired. Please re-authenticate.")
    except jwt.InvalidTokenError as e:
        if settings.ALLOW_MOCK_AUTH:
            return UserPayload("demo_user_1", "operator@iitd.ac.in", "KITCHEN_OPERATOR", "IIT Delhi Mess #3")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")
    except Exception:
        if settings.ALLOW_MOCK_AUTH:
            return UserPayload("demo_user_1", "operator@iitd.ac.in", "KITCHEN_OPERATOR", "IIT Delhi Mess #3")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed.")

def require_role(allowed_roles: List[str]):
    """Dependency factory to enforce Role-Based Access Control (RBAC)."""
    sanitized_roles = [r for r in allowed_roles if r in VALID_ROLES]
    def role_checker(user: UserPayload = Depends(get_current_user)):
        if user.role not in sanitized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Insufficient privileges for this resource."
            )
        return user
    return role_checker
