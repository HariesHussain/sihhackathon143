import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_system_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["problem_statement"] == "SIH26234"

def test_demand_forecast():
    payload = {
        "facility_name": "IIT Delhi Dining Complex",
        "date": "2026-09-10",
        "meal_type": "LUNCH",
        "registered_headcount": 850,
        "day_of_week": "Thursday",
        "is_exam_period": False,
        "is_holiday": False,
        "weather_condition": "Rainy"
    }
    response = client.post("/api/demand/forecast", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_portions"] > 0
    assert data["expected_attendance"] > 0
    assert len(data["procurement_recommendations"]) > 0
    assert "waste_prevention" in str(data)

def test_quality_analysis():
    form_data = {
        "food_name": "Steamed Rice & Lentils",
        "category": "COOKED_GRAINS",
        "holding_temp_celsius": 24.0,
        "hours_since_preparation": 2.0,
        "ambient_humidity_rh": 60.0
    }
    response = client.post("/api/quality/analyze", data=form_data)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["freshness_index"] <= 100
    assert "safe_window_minutes" in data
    assert data["is_safe_for_consumption"] is True

def test_surplus_lifecycle_and_otp():
    # 1. Declare Surplus
    declare_payload = {
        "food_name": "Paneer Makhani & Rotis",
        "category": "GRAVIES_CURRIES",
        "diet_type": "VEGETARIAN",
        "quantity_portions": 90,
        "quantity_kg": 22.5,
        "freshness_index": 92.0,
        "safe_window_minutes": 210,
        "donor_name": "Hostel 4 Canteen",
        "donor_lat": 28.5450,
        "donor_lng": 77.1926,
        "donor_address": "Hauz Khas, New Delhi"
    }
    declare_resp = client.post("/api/surplus/declare", json=declare_payload)
    assert declare_resp.status_code == 200
    batch = declare_resp.json()
    batch_id = batch["id"]
    otp = batch["pickup_otp"]
    assert len(otp) == 6

    # 2. Match Nearby NGOs
    ngo_resp = client.get(f"/api/surplus/nearby-ngos?lat={batch['donor_lat']}&lng={batch['donor_lng']}")
    assert ngo_resp.status_code == 200
    ngos = ngo_resp.json()
    assert len(ngos) > 0
    selected_ngo = ngos[0]

    # 3. Claim Batch
    claim_payload = {
        "surplus_id": batch_id,
        "ngo_id": selected_ngo["id"],
        "ngo_name": selected_ngo["name"]
    }
    claim_resp = client.post("/api/surplus/claim", json=claim_payload)
    assert claim_resp.status_code == 200

    # 4. Verify Handover OTP
    verify_payload = {
        "surplus_id": batch_id,
        "entered_otp": otp
    }
    verify_resp = client.post("/api/surplus/verify-otp", json=verify_payload)
    assert verify_resp.status_code == 200
    v_data = verify_resp.json()
    assert v_data["success"] is True
    assert v_data["co2e_saved_kg"] > 0
    assert v_data["water_saved_litres"] > 0

def test_route_optimization():
    payload = {
        "origin": {"lat": 28.5450, "lng": 77.1926, "label": "Donor Kitchen"},
        "destinations": [
            {"lat": 28.5355, "lng": 77.2100, "label": "Robin Hood Army Saket"},
            {"lat": 28.5672, "lng": 77.2435, "label": "Feeding India Lajpat Nagar"}
        ]
    }
    response = client.post("/api/logistics/optimize-route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["optimized_path"]) == 3
    assert data["total_distance_km"] > 0
    assert data["arrives_before_expiry"] is True

def test_cold_storage_telemetry_and_breach():
    # 1. Get Live Telemetry
    resp = client.get("/api/telemetry/live")
    assert resp.status_code == 200
    units = resp.json()
    assert len(units) >= 3

    # 2. Simulate Thermal Breach on Unit 1
    breach_payload = {
        "unit_id": "unit_cr_01",
        "target_temp_celsius": 11.5
    }
    breach_resp = client.post("/api/telemetry/simulate-breach", json=breach_payload)
    assert breach_resp.status_code == 200
    b_data = breach_resp.json()
    assert b_data["is_breached"] is True
    assert b_data["status"] == "CRITICAL"

def test_plant_inefficiencies():
    resp = client.get("/api/plant/inefficiencies")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_raw_material_loss_kg" in data
    assert "total_financial_loss_inr" in data
    assert len(data["recent_loss_events"]) > 0

def test_esg_metrics_and_report():
    # Metrics
    m_resp = client.get("/api/esg/metrics")
    assert m_resp.status_code == 200
    m_data = m_resp.json()
    assert m_data["avoided_co2e_kg"] > 0
    assert m_data["groundwater_conserved_litres"] > 0

    # Official Report
    r_resp = client.get("/api/esg/compliance-report")
    assert r_resp.status_code == 200
    r_data = r_resp.json()
    assert r_data["audit_status"] == "CERTIFIED_COMPLIANT"
    assert r_data["verification_hash"].startswith("SHA256:")
