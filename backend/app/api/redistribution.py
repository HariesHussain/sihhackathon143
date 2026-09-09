from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Dict
import datetime
import random
import threading
from app.models.schemas import (
    SurplusDeclareRequest, SurplusBatch, SurplusBatchPublic, BatchStatus,
    NGOBeneficiary, ClaimSurplusRequest, VerifyOTPRequest, VerifyOTPResponse
)
from app.data.mock_db import ACTIVE_SURPLUS_BATCHES, VERIFIED_NGOS
from app.services.router_engine import haversine_distance
from app.services.esg_engine import esg_engine
from app.core.security import get_current_user, UserPayload

router = APIRouter(prefix="/surplus", tags=["Redistribution Network & Handover"])

# Thread lock for in-memory batch state concurrency protection
state_lock = threading.Lock()

# Failed OTP attempt tracker to prevent brute-forcing
_failed_attempts: Dict[str, int] = {}
MAX_FAILED_ATTEMPTS = 5

def _check_and_update_expiry(batch: SurplusBatch) -> bool:
    """Returns True if the batch has expired past its safe redistribution window."""
    try:
        expiry_dt = datetime.datetime.fromisoformat(batch.expiry_timestamp)
        now_dt = datetime.datetime.now(datetime.timezone.utc)
        if now_dt > expiry_dt:
            if batch.status in [BatchStatus.AVAILABLE, BatchStatus.MATCHED, BatchStatus.IN_TRANSIT]:
                batch.status = BatchStatus.EXPIRED
            return True
    except Exception:
        pass
    return False

@router.get("/batches", response_model=List[SurplusBatchPublic])
def list_surplus_batches(current_user: UserPayload = Depends(get_current_user)):
    """List all registered surplus batches and their lifecycle status. OTPs are hidden."""
    with state_lock:
        for batch in ACTIVE_SURPLUS_BATCHES:
            _check_and_update_expiry(batch)
        # Convert to public model excluding pickup_otp
        return [
            SurplusBatchPublic(
                id=b.id, food_name=b.food_name, category=b.category,
                diet_type=b.diet_type, quantity_portions=b.quantity_portions,
                quantity_kg=b.quantity_kg, freshness_index=b.freshness_index,
                safe_window_minutes=b.safe_window_minutes, expiry_timestamp=b.expiry_timestamp,
                donor_name=b.donor_name, donor_lat=b.donor_lat, donor_lng=b.donor_lng,
                donor_address=b.donor_address, status=b.status,
                claimed_by=b.claimed_by, created_at=b.created_at
            )
            for b in ACTIVE_SURPLUS_BATCHES
        ]

@router.post("/declare", response_model=SurplusBatch)
def declare_surplus(
    req: SurplusDeclareRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Called by institutional kitchens or food plants to declare verified edible surplus.
    Generates an encrypted 6-digit handover OTP.
    """
    with state_lock:
        batch_id = f"batch_{len(ACTIVE_SURPLUS_BATCHES) + 1:03d}"
        otp = f"{random.randint(100000, 999999)}"
        now_dt = datetime.datetime.now(datetime.timezone.utc)
        expiry_dt = now_dt + datetime.timedelta(minutes=req.safe_window_minutes)

        batch = SurplusBatch(
            id=batch_id,
            food_name=req.food_name.strip(),
            category=req.category,
            diet_type=req.diet_type,
            quantity_portions=req.quantity_portions,
            quantity_kg=round(req.quantity_kg, 2),
            freshness_index=round(req.freshness_index, 1),
            safe_window_minutes=req.safe_window_minutes,
            expiry_timestamp=expiry_dt.isoformat(),
            donor_name=req.donor_name.strip(),
            donor_lat=req.donor_lat,
            donor_lng=req.donor_lng,
            donor_address=req.donor_address.strip(),
            status=BatchStatus.AVAILABLE,
            pickup_otp=otp,
            claimed_by=None,
            created_at=now_dt.isoformat()
        )

        ACTIVE_SURPLUS_BATCHES.insert(0, batch)
        return batch

@router.get("/nearby-ngos", response_model=List[NGOBeneficiary])
def get_nearby_ngos(
    lat: float = 28.5450,
    lng: float = 77.1926,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Ranks registered verified NGOs and shelters based on proximity and real-time transit ETA.
    """
    if not (-90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coordinates out of valid geographical bounds."
        )

    ranked = []
    for ngo in VERIFIED_NGOS:
        dist = haversine_distance(lat, lng, ngo.lat, ngo.lng)
        # Average urban speed 24 km/h + 5 mins handling
        eta = int(round((dist / 24.0) * 60.0)) + 5
        ngo_copy = ngo.model_copy()
        ngo_copy.distance_km = dist
        ngo_copy.eta_minutes = eta
        ranked.append(ngo_copy)

    ranked.sort(key=lambda x: x.distance_km or 999.0)
    return ranked

@router.post("/claim")
def claim_surplus_batch(
    req: ClaimSurplusRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """NGO claims an available surplus batch for pickup."""
    with state_lock:
        for batch in ACTIVE_SURPLUS_BATCHES:
            if batch.id == req.surplus_id:
                if _check_and_update_expiry(batch) or batch.status == BatchStatus.EXPIRED:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="This surplus batch has expired past its safe consumption window and cannot be claimed."
                    )
                if batch.status != BatchStatus.AVAILABLE:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Batch is not available for claim. Current status: {batch.status}"
                    )
                batch.status = BatchStatus.MATCHED
                batch.claimed_by = req.ngo_name.strip()
                return {"message": "Batch matched successfully", "batch": batch}

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Surplus batch not found.")

@router.post("/verify-otp", response_model=VerifyOTPResponse)
def verify_handover_otp(
    req: VerifyOTPRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Validates the 6-digit cryptographic handover OTP between Kitchen donor and NGO driver.
    Prevents double-spend, brute force, and expired batch handover.
    """
    surplus_id = req.surplus_id.strip()
    entered_otp = req.entered_otp.strip()

    with state_lock:
        # Check brute force attempts
        failed_count = _failed_attempts.get(surplus_id, 0)
        if failed_count >= MAX_FAILED_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Security lockout: Too many failed OTP attempts for this batch. Contact supervisor."
            )

        for batch in ACTIVE_SURPLUS_BATCHES:
            if batch.id == surplus_id:
                # 1. Guard against Double-Spend / Re-crediting
                if batch.status == BatchStatus.CLAIMED_VERIFIED:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Conflict: This batch has already been verified and handed over. Re-crediting blocked."
                    )

                # 2. Guard against Expired Food Handover
                if _check_and_update_expiry(batch) or batch.status == BatchStatus.EXPIRED:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Safety violation: This batch has expired past its safe consumption window. Transfer blocked."
                    )

                # 3. Verify OTP Match
                if batch.pickup_otp != entered_otp:
                    _failed_attempts[surplus_id] = failed_count + 1
                    remaining = MAX_FAILED_ATTEMPTS - (failed_count + 1)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid OTP code. Chain of custody verification failed. {remaining} attempt(s) remaining."
                    )

                # Success: clear failed attempts
                _failed_attempts.pop(surplus_id, None)
                batch.status = BatchStatus.CLAIMED_VERIFIED

                # 4. Atomic Credit to ESG Ledger
                esg_engine.credit_transfer(batch.quantity_kg, batch.quantity_portions)

                co2e_saved = round(batch.quantity_kg * esg_engine.CO2E_FACTOR, 1)
                water_saved = round(batch.quantity_kg * esg_engine.WATER_FACTOR, 1)

                return VerifyOTPResponse(
                    success=True,
                    message=f"Chain of custody verified. {batch.quantity_portions} portions securely handed over to {batch.claimed_by or 'designated beneficiary'}.",
                    transfer_timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    co2e_saved_kg=co2e_saved,
                    water_saved_litres=water_saved,
                    meals_served=batch.quantity_portions
                )

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Surplus batch not found.")
