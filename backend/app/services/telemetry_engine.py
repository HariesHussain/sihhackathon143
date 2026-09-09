import datetime
import random
import threading
from typing import List, Dict, Any
from app.data.mock_db import COLD_STORAGE_UNITS, PLANT_LOSSES
from app.models.schemas import StorageTelemetryItem, PlantLossItem, LossCategory

telemetry_lock = threading.Lock()

class TelemetrySentinelEngine:
    """
    Monitors food processing unit operational telemetry, cold chain storage stability,
    and flags industrial leaks (overproduction, machine downtime, raw material scrap).
    Thread-safe and guarded against extreme telemetry inputs.
    """

    def get_live_storage_telemetry(self) -> List[StorageTelemetryItem]:
        with telemetry_lock:
            updated_units = []
            now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

            for unit in COLD_STORAGE_UNITS:
                # Small sensor jitter (+- 0.15 deg C)
                jitter = round(random.uniform(-0.15, 0.15), 2)
                temp = round(unit.current_temp_celsius + jitter, 1)

                is_breach = False
                status = "NORMAL"

                if "freezer" in unit.unit_name.lower():
                    if temp > -12.0:
                        is_breach = True
                        status = "CRITICAL"
                else:
                    if temp > 6.0:
                        is_breach = True
                        status = "CRITICAL" if temp > 8.0 else "WARNING"

                unit.current_temp_celsius = temp
                unit.is_breached = is_breach
                unit.status = status
                unit.timestamp = now_str
                updated_units.append(unit)

            return list(updated_units)

    def simulate_temp_breach(self, unit_id: str, target_temp: float) -> StorageTelemetryItem:
        clamped_temp = max(-50.0, min(80.0, target_temp))
        with telemetry_lock:
            for unit in COLD_STORAGE_UNITS:
                if unit.unit_id == unit_id:
                    unit.current_temp_celsius = clamped_temp
                    unit.is_breached = True
                    unit.status = "CRITICAL" if clamped_temp > 8.0 else "WARNING"
                    unit.door_status = "BREACH"
                    unit.timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    return unit
        raise ValueError(f"Storage unit with ID '{unit_id}' not found.")

    def get_plant_loss_analytics(self) -> Dict[str, Any]:
        with telemetry_lock:
            total_loss_kg = sum(item.loss_kg for item in PLANT_LOSSES)
            total_cost_inr = sum(item.cost_inr for item in PLANT_LOSSES)
            total_downtime = sum(item.downtime_minutes for item in PLANT_LOSSES)
            total_energy_kwh = sum(item.energy_spike_kwh for item in PLANT_LOSSES)

            category_breakdown = {}
            for item in PLANT_LOSSES:
                category_breakdown[item.category] = round(category_breakdown.get(item.category, 0.0) + item.loss_kg, 1)

            return {
                "total_raw_material_loss_kg": round(total_loss_kg, 1),
                "total_financial_loss_inr": round(total_cost_inr, 2),
                "total_machine_downtime_minutes": total_downtime,
                "excess_energy_consumed_kwh": round(total_energy_kwh, 1),
                "category_distribution": category_breakdown,
                "recent_loss_events": list(PLANT_LOSSES)
            }

    def record_loss_event(
        self,
        line_name: str,
        category: LossCategory,
        loss_kg: float,
        cost_inr: float,
        downtime_mins: int,
        energy_kwh: float,
        desc: str
    ) -> PlantLossItem:
        with telemetry_lock:
            event = PlantLossItem(
                id=f"loss_{len(PLANT_LOSSES) + 1:03d}",
                line_name=line_name.strip(),
                category=category,
                loss_kg=round(max(0.0, loss_kg), 1),
                cost_inr=round(max(0.0, cost_inr), 2),
                downtime_minutes=max(0, downtime_mins),
                energy_spike_kwh=round(max(0.0, energy_kwh), 1),
                description=desc.strip(),
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
            )
            PLANT_LOSSES.insert(0, event)
            return event

telemetry_engine = TelemetrySentinelEngine()
