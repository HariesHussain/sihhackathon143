from fastapi import APIRouter, Depends
from app.models.schemas import RouteOptimizationRequest, RouteOptimizationResponse
from app.services.router_engine import router_engine
from app.core.security import get_current_user, UserPayload

router = APIRouter(prefix="/logistics", tags=["Logistics & Route Optimization"])

@router.post("/optimize-route", response_model=RouteOptimizationResponse)
def optimize_delivery_route(
    req: RouteOptimizationRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Computes an optimal pickup-and-delivery route under strict time constraints,
    ensuring all stops are reached before food freshness decays.
    """
    return router_engine.optimize_route(req)
