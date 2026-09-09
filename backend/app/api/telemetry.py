from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.models.schemas import (
    StorageTelemetryItem, SimulateBreachRequest, PlantLossItem, LossCategory
)
from app.services.telemetry_engine import telemetry_engine
from app.core.security import get_current_user, UserPayload

router = APIRouter(tags=["Plant Telemetry & Industrial Inefficiencies"])

@router.get("/telemetry/live", response_model=List[StorageTelemetryItem])
def get_live_storage_telemetry(current_user: UserPayload = Depends(get_current_user)):
    """
    Returns real-time RTD sensor telemetry for cold storage chambers,
    silos, and freezers across food processing facilities.
    """
    return telemetry_engine.get_live_storage_telemetry()

@router.post("/telemetry/simulate-breach", response_model=StorageTelemetryItem)
def trigger_simulated_breach(
    req: SimulateBreachRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Simulates an instant thermal breach (e.g. temperature spike)
    to demonstrate real-time sentinel alerting for judges.
    """
    try:
        return telemetry_engine.simulate_temp_breach(req.unit_id, req.target_temp_celsius)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/plant/inefficiencies", response_model=Dict[str, Any])
def get_plant_inefficiencies(current_user: UserPayload = Depends(get_current_user)):
    """
    Detects and aggregates operational leaks: batch overproduction,
    raw material yield losses, machine downtime, and excessive energy spikes.
    """
    return telemetry_engine.get_plant_loss_analytics()
