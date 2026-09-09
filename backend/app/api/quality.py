from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from typing import Optional
from app.models.schemas import QualityAnalysisResponse, FoodCategory
from app.services.vision_engine import vision_engine
from app.core.security import get_current_user, UserPayload

router = APIRouter(prefix="/quality", tags=["Computer Vision Quality & Freshness"])

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

@router.post("/analyze", response_model=QualityAnalysisResponse)
async def analyze_food_quality(
    food_name: str = Form("Mixed Vegetable Curry & Rice"),
    category: FoodCategory = Form(FoodCategory.GRAVIES_CURRIES),
    holding_temp_celsius: float = Form(24.0),
    hours_since_preparation: float = Form(2.5),
    ambient_humidity_rh: float = Form(65.0),
    image_file: Optional[UploadFile] = File(None),
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Evaluates food freshness and safe redistribution window using Computer Vision
    and environmental sensor telemetry (temperature, humidity, time).
    Robust against oversized files, non-image formats, and extreme numerical inputs.
    """
    # 1. Bounds verification
    if not (-40.0 <= holding_temp_celsius <= 120.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Holding temperature must be within physical range [-40.0°C, 120.0°C]."
        )

    if not (0.0 <= hours_since_preparation <= 168.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hours since preparation must be between 0.0 and 168.0 (up to 7 days)."
        )

    if not (0.0 <= ambient_humidity_rh <= 100.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Relative humidity must be between 0.0% and 100.0%."
        )

    # 2. Image upload security & file-size checking
    image_bytes = None
    if image_file and image_file.filename:
        # Check MIME type
        content_type = (image_file.content_type or "").lower()
        if content_type not in ALLOWED_IMAGE_MIMES and not any(image_file.filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{content_type}'. Please upload JPEG, PNG, or WebP images."
            )

        # Safe read with size cap
        content = await image_file.read(MAX_IMAGE_SIZE_BYTES + 1024)
        if len(content) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Uploaded image exceeds the maximum permitted limit of 10 MB."
            )
        image_bytes = content

    return vision_engine.analyze_food(
        image_bytes=image_bytes,
        food_name=food_name.strip() or "Cooked Meal",
        category=category,
        holding_temp=holding_temp_celsius,
        hours_elapsed=hours_since_preparation,
        humidity=ambient_humidity_rh
    )
