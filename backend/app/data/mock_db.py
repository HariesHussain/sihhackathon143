from typing import List, Dict
import datetime
from app.models.schemas import (
    SurplusBatch, FoodCategory, DietType, BatchStatus,
    NGOBeneficiary, StorageTelemetryItem, PlantLossItem, LossCategory
)

# Verified NGOs with coordinates around Delhi-NCR / Central Hubs
VERIFIED_NGOS: List[NGOBeneficiary] = [
    NGOBeneficiary(
        id="ngo_1",
        name="Robin Hood Army - South Delhi Chapter",
        contact_person="Aman Verma",
        phone="+91 98112 34567",
        lat=28.5355,
        lng=77.2100,
        address="Saket Community Centre, New Delhi",
        beneficiary_capacity=150,
        verified=True
    ),
    NGOBeneficiary(
        id="ngo_2",
        name="Feeding India by Zomato Hub",
        contact_person="Priya Nair",
        phone="+91 98223 45678",
        lat=28.5672,
        lng=77.2435,
        address="Lajpat Nagar Ring Road, New Delhi",
        beneficiary_capacity=220,
        verified=True
    ),
    NGOBeneficiary(
        id="ngo_3",
        name="Delhi Night Shelter Care (DUSIB #14)",
        contact_person="Rajesh Kumar",
        phone="+91 98334 56789",
        lat=28.5200,
        lng=77.1850,
        address="Mehrauli Badarpur Road, New Delhi",
        beneficiary_capacity=90,
        verified=True
    ),
    NGOBeneficiary(
        id="ngo_4",
        name="Akshaya Chaitanya Food Relief",
        contact_person="Sneha Iyer",
        phone="+91 98445 67890",
        lat=28.5800,
        lng=77.1600,
        address="Chanakyapuri Service Lane, New Delhi",
        beneficiary_capacity=180,
        verified=True
    ),
    NGOBeneficiary(
        id="ngo_5",
        name="Annakshetra Foundation Hub",
        contact_person="Vikram Das",
        phone="+91 98556 78901",
        lat=28.5000,
        lng=77.2200,
        address="Tughlakabad Institutional Area, New Delhi",
        beneficiary_capacity=110,
        verified=True
    )
]

# Initial Surplus Batches
ACTIVE_SURPLUS_BATCHES: List[SurplusBatch] = [
    SurplusBatch(
        id="batch_001",
        food_name="Steamed Basmati Rice & Paneer Butter Masala",
        category=FoodCategory.GRAVIES_CURRIES,
        diet_type=DietType.VEGETARIAN,
        quantity_portions=140,
        quantity_kg=35.0,
        freshness_index=94.5,
        safe_window_minutes=240,
        expiry_timestamp=(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=4)).isoformat(),
        donor_name="IIT Delhi Central Dining Hall",
        donor_lat=28.5450,
        donor_lng=77.1926,
        donor_address="Hauz Khas, New Delhi",
        status=BatchStatus.AVAILABLE,
        pickup_otp="783921",
        claimed_by=None,
        created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    ),
    SurplusBatch(
        id="batch_002",
        food_name="Whole Wheat Roti & Dal Tadka",
        category=FoodCategory.COOKED_GRAINS,
        diet_type=DietType.VEGETARIAN,
        quantity_portions=85,
        quantity_kg=22.0,
        freshness_index=88.0,
        safe_window_minutes=180,
        expiry_timestamp=(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=3)).isoformat(),
        donor_name="AIIMS Hospital Staff Cafeteria",
        donor_lat=28.5670,
        donor_lng=77.2100,
        donor_address="Ansari Nagar, New Delhi",
        status=BatchStatus.AVAILABLE,
        pickup_otp="419852",
        claimed_by=None,
        created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
]

# Cold Storage Units Telemetry
COLD_STORAGE_UNITS: List[StorageTelemetryItem] = [
    StorageTelemetryItem(
        unit_id="unit_cr_01",
        unit_name="Cold Storage Chamber #1 (Cooked Inventory)",
        facility="Mega Canteen Cold Hub A",
        current_temp_celsius=3.2,
        setpoint_temp_celsius=4.0,
        humidity_rh=78.5,
        door_status="CLOSED",
        compressor_load_pct=64.0,
        is_breached=False,
        status="NORMAL",
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
    ),
    StorageTelemetryItem(
        unit_id="unit_cr_02",
        unit_name="Deep Freezer Chamber #2 (Dairy & Meats)",
        facility="Industrial Processing Unit Beta",
        current_temp_celsius=-18.4,
        setpoint_temp_celsius=-18.0,
        humidity_rh=62.0,
        door_status="CLOSED",
        compressor_load_pct=72.5,
        is_breached=False,
        status="NORMAL",
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
    ),
    StorageTelemetryItem(
        unit_id="unit_cr_03",
        unit_name="Vegetable Chill Silo #3 (Raw Agro Produce)",
        facility="MoFPI Agri-Logistics Park Hub",
        current_temp_celsius=7.8,
        setpoint_temp_celsius=6.0,
        humidity_rh=88.2,
        door_status="AJAR_WARNING",
        compressor_load_pct=88.0,
        is_breached=True,
        status="WARNING",
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
]

# Plant Inefficiency and Scrap Losses
PLANT_LOSSES: List[PlantLossItem] = [
    PlantLossItem(
        id="loss_001",
        line_name="Automated Packaging Line 2",
        category=LossCategory.MACHINE_DOWNTIME,
        loss_kg=48.5,
        cost_inr=5800.0,
        downtime_minutes=42,
        energy_spike_kwh=16.8,
        description="Pneumatic sealer jam caused thermal pouch burst and line halt",
        timestamp=(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat()
    ),
    PlantLossItem(
        id="loss_002",
        line_name="Grain Peeling & Cleaning Stage",
        category=LossCategory.RAW_MATERIAL_SPILL,
        loss_kg=32.0,
        cost_inr=3200.0,
        downtime_minutes=15,
        energy_spike_kwh=6.4,
        description="Hopper miscalibration resulting in excess husk reject spillage",
        timestamp=(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=6)).isoformat()
    ),
    PlantLossItem(
        id="loss_003",
        line_name="Bulk Steam Kettles #4",
        category=LossCategory.OVERPRODUCTION,
        loss_kg=60.0,
        cost_inr=7200.0,
        downtime_minutes=0,
        energy_spike_kwh=22.5,
        description="Unadjusted baseline batch prepared during local festival holiday",
        timestamp=(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=14)).isoformat()
    )
]

# Historical aggregates for ESG
ESG_LEDGER = {
    "total_food_diverted_kg": 18450.0,
    "total_meals_saved": 46125,
    "total_institutions": 34,
    "total_ngos": 58,
    "estimated_value_inr": 1845000.0
}
