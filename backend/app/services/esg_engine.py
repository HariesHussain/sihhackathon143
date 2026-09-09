import datetime
import hashlib
from app.data.mock_db import ESG_LEDGER
from app.models.schemas import ESGMetricsResponse, ESGComplianceReport

class ESGComplianceEngine:
    """
    Sustainability auditor calculating carbon avoidance, water conservation,
    and generating formal MoFPI ESG compliance reports.
    """

    # Conversion Standards:
    # 1 kg edible food waste = ~2.5 kg CO2 equivalent emissions (IPCC & MoFPI standard)
    # 1 kg agricultural food = ~1,200 Litres embodied groundwater
    CO2E_FACTOR = 2.5
    WATER_FACTOR = 1200.0

    def get_metrics(self) -> ESGMetricsResponse:
        diverted_kg = ESG_LEDGER["total_food_diverted_kg"]
        meals_saved = ESG_LEDGER["total_meals_saved"]
        avoided_co2e = round(diverted_kg * self.CO2E_FACTOR, 1)
        water_saved = round(diverted_kg * self.WATER_FACTOR, 1)

        return ESGMetricsResponse(
            total_food_diverted_kg=diverted_kg,
            total_meals_saved=meals_saved,
            avoided_co2e_kg=avoided_co2e,
            groundwater_conserved_litres=water_saved,
            total_institutions_participating=ESG_LEDGER["total_institutions"],
            total_ngos_active=ESG_LEDGER["total_ngos"],
            estimated_financial_value_inr=ESG_LEDGER["estimated_value_inr"],
            sdg_alignment={
                "SDG_2": "Zero Hunger (Direct redistribution to low-income beneficiaries)",
                "SDG_12": "Responsible Consumption & Production (Target 12.3: 50% food waste reduction)",
                "SDG_13": "Climate Action (Methane mitigation from avoided organic landfill decay)"
            }
        )

    def credit_transfer(self, food_kg: float, portions: int):
        ESG_LEDGER["total_food_diverted_kg"] += food_kg
        ESG_LEDGER["total_meals_saved"] += portions
        ESG_LEDGER["estimated_value_inr"] += (food_kg * 40.0)

    def generate_official_report(self) -> ESGComplianceReport:
        metrics = self.get_metrics()
        now_dt = datetime.datetime.now(datetime.timezone.utc)
        report_id = f"MoFPI-ESG-{now_dt.strftime('%Y%m%d')}-09234"

        # Generate cryptographic integrity hash
        hash_payload = f"{report_id}:{metrics.total_food_diverted_kg}:{metrics.avoided_co2e_kg}:{now_dt.isoformat()}"
        sha_sig = hashlib.sha256(hash_payload.encode()).hexdigest()[:24]

        return ESGComplianceReport(
            report_id=report_id,
            generated_at=now_dt.isoformat(),
            regulatory_body="Ministry of Food Processing Industries (MoFPI)",
            compliance_standard="MoFPI Institutional Food Waste Management Protocol 2026",
            reporting_period=f"Quarter {((now_dt.month - 1) // 3) + 1} - FY 2026-27",
            aggregate_metrics=metrics,
            audit_status="CERTIFIED_COMPLIANT",
            verification_hash=f"SHA256:{sha_sig}"
        )

esg_engine = ESGComplianceEngine()
