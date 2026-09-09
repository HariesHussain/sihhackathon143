from fastapi import APIRouter, Depends
from app.models.schemas import DemandForecastRequest, DemandForecastResponse
from app.services.demand_engine import demand_engine
from app.core.security import get_current_user, UserPayload

router = APIRouter(prefix="/demand", tags=["Demand & Production Planning"])

@router.post("/forecast", response_model=DemandForecastResponse)
def get_demand_forecast(
    req: DemandForecastRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Predicts meal demand and surplus generation risk before cooking starts,
    providing exact batch sizing and raw material procurement recommendations.
    """
    return demand_engine.predict(req)
