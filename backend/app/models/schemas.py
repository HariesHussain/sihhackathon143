from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum
import re

class StrictInputModel(BaseModel):
    """Base model that rejects unexpected fields to prevent mass-assignment attacks."""
    model_config = ConfigDict(extra="forbid")

# --- ENUMS ---
class MealType(str, Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    SNACKS = "SNACKS"

class FoodCategory(str, Enum):
    COOKED_GRAINS = "COOKED_GRAINS"
    GRAVIES_CURRIES = "GRAVIES_CURRIES"
    RAW_PRODUCE = "RAW_PRODUCE"
    DAIRY_PRODUCTS = "DAIRY_PRODUCTS"
    BAKERY_SNACKS = "BAKERY_SNACKS"

class DietType(str, Enum):
    VEGETARIAN = "VEGETARIAN"
    NON_VEGETARIAN = "NON_VEGETARIAN"
    VEGAN = "VEGAN"

class QualityGrade(str, Enum):
    GRADE_A = "GRADE_A"         # Pristine - Immediate human redistribution
    GRADE_B = "GRADE_B"         # Secondary processing / quick consumption (< 2h)
    INEDIBLE = "INEDIBLE"       # Divert to bio-gas / composting

class BatchStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    MATCHED = "MATCHED"
    IN_TRANSIT = "IN_TRANSIT"
    CLAIMED_VERIFIED = "CLAIMED_VERIFIED"
    EXPIRED = "EXPIRED"

class LossCategory(str, Enum):
    OVERPRODUCTION = "OVERPRODUCTION"
    RAW_MATERIAL_SPILL = "RAW_MATERIAL_SPILL"
    MACHINE_DOWNTIME = "MACHINE_DOWNTIME"
    ENERGY_SPIKE = "ENERGY_SPIKE"

# --- 1. DEMAND & PRODUCTION SCHEMAS ---
class DemandForecastRequest(StrictInputModel):
    facility_name: str = Field("Central Institutional Mess", min_length=2, max_length=120)
    date: str = Field("2026-09-10", min_length=8, max_length=20)
    meal_type: MealType = MealType.LUNCH
    registered_headcount: int = Field(800, ge=10, le=50000, description="Total registered diners/students")
    day_of_week: str = Field("Thursday", min_length=3, max_length=20)
    is_exam_period: bool = False
    is_holiday: bool = False
    weather_condition: str = Field("Rainy", min_length=2, max_length=50)

    @field_validator("day_of_week")
    @classmethod
    def validate_day_of_week(cls, v: str) -> str:
        cleaned = v.strip().capitalize()
        valid_days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
                      "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
        if cleaned not in valid_days:
            return "Thursday"
        return cleaned

class ProcurementItem(BaseModel):
    ingredient: str
    recommended_kg: float = Field(..., ge=0.0)
    unit: str = "kg"

class DemandForecastResponse(BaseModel):
    recommended_portions: int
    expected_attendance: int
    overproduction_risk_percentage: float
    confidence_score: float
    buffer_portions: int
    projected_waste_prevention_kg: float
    procurement_recommendations: List[ProcurementItem]
    ai_insights: str

# --- 2. QUALITY INSPECTION SCHEMAS ---
class QualityAnalysisRequest(StrictInputModel):
    food_name: str = Field("Mixed Vegetable Curry & Rice", min_length=2, max_length=150)
    category: FoodCategory = FoodCategory.GRAVIES_CURRIES
    holding_temp_celsius: float = Field(24.0, ge=-40.0, le=120.0)
    ambient_humidity_rh: float = Field(65.0, ge=0.0, le=100.0)
    hours_since_preparation: float = Field(2.5, ge=0.0, le=168.0)
    visual_notes: Optional[str] = Field(None, max_length=300)

class QualityAnalysisResponse(BaseModel):
    freshness_index: float  # 0 to 100
    quality_grade: QualityGrade
    safe_window_minutes: int
    safe_window_formatted: str
    is_safe_for_consumption: bool
    spoilage_risk_factors: List[str]
    action_directive: str

# --- 3. SURPLUS & REDISTRIBUTION SCHEMAS ---
class SurplusDeclareRequest(StrictInputModel):
    food_name: str = Field(..., min_length=2, max_length=150)
    category: FoodCategory
    diet_type: DietType
    quantity_portions: int = Field(..., ge=1, le=50000)
    quantity_kg: float = Field(..., gt=0.0, le=10000.0)
    freshness_index: float = Field(..., ge=0.0, le=100.0)
    safe_window_minutes: int = Field(..., ge=0, le=1440)
    donor_name: str = Field("IIT Mess Hall #2", min_length=2, max_length=150)
    donor_lat: float = Field(28.5450, ge=-90.0, le=90.0)
    donor_lng: float = Field(77.1926, ge=-180.0, le=180.0)
    donor_address: str = Field("Hauz Khas, New Delhi", min_length=3, max_length=250)

class SurplusBatch(BaseModel):
    id: str
    food_name: str
    category: FoodCategory
    diet_type: DietType
    quantity_portions: int
    quantity_kg: float
    freshness_index: float
    safe_window_minutes: int
    expiry_timestamp: str
    donor_name: str
    donor_lat: float
    donor_lng: float
    donor_address: str
    status: BatchStatus
    pickup_otp: str
    claimed_by: Optional[str] = None
    created_at: str

class SurplusBatchPublic(BaseModel):
    """Public-facing batch view that hides the OTP to prevent chain-of-custody leaks."""
    id: str
    food_name: str
    category: FoodCategory
    diet_type: DietType
    quantity_portions: int
    quantity_kg: float
    freshness_index: float
    safe_window_minutes: int
    expiry_timestamp: str
    donor_name: str
    donor_lat: float
    donor_lng: float
    donor_address: str
    status: BatchStatus
    claimed_by: Optional[str] = None
    created_at: str

class NGOBeneficiary(BaseModel):
    id: str
    name: str
    contact_person: str
    phone: str
    lat: float
    lng: float
    address: str
    beneficiary_capacity: int
    verified: bool = True
    distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None

class ClaimSurplusRequest(StrictInputModel):
    surplus_id: str = Field(..., min_length=3, max_length=50)
    ngo_id: str = Field(..., min_length=2, max_length=50)
    ngo_name: str = Field(..., min_length=2, max_length=120)

class VerifyOTPRequest(StrictInputModel):
    surplus_id: str = Field(..., min_length=3, max_length=50)
    entered_otp: str = Field(..., min_length=6, max_length=6, description="6-digit numeric OTP")

    @field_validator("entered_otp")
    @classmethod
    def validate_otp_format(cls, v: str) -> str:
        cleaned = v.strip()
        if not re.match(r"^\d{6}$", cleaned):
            raise ValueError("OTP must consist of exactly 6 numeric digits.")
        return cleaned

class VerifyOTPResponse(BaseModel):
    success: bool
    message: str
    transfer_timestamp: str
    co2e_saved_kg: float
    water_saved_litres: float
    meals_served: int

# --- 4. LOGISTICS & ROUTE OPTIMIZATION SCHEMAS ---
class Waypoint(StrictInputModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    label: str = Field(..., min_length=1, max_length=150)

class RouteOptimizationRequest(StrictInputModel):
    origin: Waypoint
    destinations: List[Waypoint] = Field(..., min_length=1, max_length=25)

class RouteStep(BaseModel):
    step_number: int
    location_name: str
    lat: float
    lng: float
    eta_from_start_minutes: int
    distance_from_prev_km: float

class RouteOptimizationResponse(BaseModel):
    optimized_path: List[RouteStep]
    total_distance_km: float
    total_transit_minutes: float
    arrives_before_expiry: bool
    fuel_co2e_estimate_kg: float

# --- 5. TELEMETRY & INDUSTRIAL LOSS SCHEMAS ---
class StorageTelemetryItem(BaseModel):
    unit_id: str
    unit_name: str
    facility: str
    current_temp_celsius: float
    setpoint_temp_celsius: float
    humidity_rh: float
    door_status: str  # "CLOSED", "OPEN", "BREACH"
    compressor_load_pct: float
    is_breached: bool
    status: str  # "NORMAL", "WARNING", "CRITICAL"
    timestamp: str

class SimulateBreachRequest(StrictInputModel):
    unit_id: str = Field(..., min_length=2, max_length=50)
    target_temp_celsius: float = Field(..., ge=-50.0, le=80.0)

class PlantLossItem(BaseModel):
    id: str
    line_name: str
    category: LossCategory
    loss_kg: float = Field(..., ge=0.0)
    cost_inr: float = Field(..., ge=0.0)
    downtime_minutes: int = Field(..., ge=0)
    energy_spike_kwh: float = Field(..., ge=0.0)
    description: str
    timestamp: str

# --- 6. ESG & COMPLIANCE SCHEMAS ---
class ESGMetricsResponse(BaseModel):
    total_food_diverted_kg: float
    total_meals_saved: int
    avoided_co2e_kg: float
    groundwater_conserved_litres: float
    total_institutions_participating: int
    total_ngos_active: int
    estimated_financial_value_inr: float
    sdg_alignment: Dict[str, str]

class ESGComplianceReport(BaseModel):
    report_id: str
    generated_at: str
    regulatory_body: str = "Ministry of Food Processing Industries (MoFPI)"
    compliance_standard: str = "MoFPI Institutional Food Waste Management Protocol 2026"
    reporting_period: str
    aggregate_metrics: ESGMetricsResponse
    audit_status: str = "CERTIFIED_COMPLIANT"
    verification_hash: str
