import math
from typing import List
from app.models.schemas import (
    Waypoint, RouteStep, RouteOptimizationRequest, RouteOptimizationResponse
)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth (in km).
    Hardened against precision float overshoots and NaN edge cases.
    """
    if math.isnan(lat1) or math.isnan(lon1) or math.isnan(lat2) or math.isnan(lon2):
        return 0.0

    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    # Clamp 'a' to [0.0, 1.0] to prevent floating point math domain errors
    a = max(0.0, min(1.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

class LogisticsOptimizerEngine:
    """
    AI logistics planner optimizing multi-drop dispatch routes
    under real-time food expiry and safe-consumption constraints.
    """

    def __init__(self, avg_urban_speed_kmh: float = 24.0):
        self.avg_speed = max(5.0, avg_urban_speed_kmh)

    def optimize_route(self, req: RouteOptimizationRequest, safe_window_minutes: int = 180) -> RouteOptimizationResponse:
        origin = req.origin
        destinations = list(req.destinations[:25])  # Cap at 25 to prevent combinatorial lag

        if not destinations:
            return RouteOptimizationResponse(
                optimized_path=[],
                total_distance_km=0.0,
                total_transit_minutes=0.0,
                arrives_before_expiry=True,
                fuel_co2e_estimate_kg=0.0
            )

        ordered_steps: List[RouteStep] = [
            RouteStep(
                step_number=1,
                location_name=origin.label.strip() or "Origin Facility",
                lat=origin.lat,
                lng=origin.lng,
                eta_from_start_minutes=0,
                distance_from_prev_km=0.0
            )
        ]

        current_lat = origin.lat
        current_lng = origin.lng
        remaining = destinations[:]
        cumulative_dist = 0.0
        cumulative_mins = 0.0
        step_idx = 2

        while remaining:
            # Find nearest unvisited destination
            nearest_dest = min(
                remaining,
                key=lambda d: haversine_distance(current_lat, current_lng, d.lat, d.lng)
            )
            dist = haversine_distance(current_lat, current_lng, nearest_dest.lat, nearest_dest.lng)
            # 8 minutes dwell/handover time per stop
            transit_mins = (dist / self.avg_speed) * 60.0 + 8.0

            cumulative_dist += dist
            cumulative_mins += transit_mins

            ordered_steps.append(
                RouteStep(
                    step_number=step_idx,
                    location_name=nearest_dest.label.strip() or f"Stop {step_idx}",
                    lat=nearest_dest.lat,
                    lng=nearest_dest.lng,
                    eta_from_start_minutes=int(round(cumulative_mins)),
                    distance_from_prev_km=dist
                )
            )

            current_lat = nearest_dest.lat
            current_lng = nearest_dest.lng
            remaining.remove(nearest_dest)
            step_idx += 1

        total_distance = round(cumulative_dist, 2)
        total_time = round(cumulative_mins, 1)

        # Light commercial delivery van standard: ~0.15 kg CO2e per km
        fuel_co2 = round(total_distance * 0.15, 2)
        arrives_safe = total_time <= max(10, safe_window_minutes)

        return RouteOptimizationResponse(
            optimized_path=ordered_steps,
            total_distance_km=total_distance,
            total_transit_minutes=total_time,
            arrives_before_expiry=arrives_safe,
            fuel_co2e_estimate_kg=fuel_co2
        )

router_engine = LogisticsOptimizerEngine()
