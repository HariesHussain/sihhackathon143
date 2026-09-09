from fastapi import APIRouter, Depends
from app.models.schemas import ESGMetricsResponse, ESGComplianceReport
from app.services.esg_engine import esg_engine
from app.core.security import get_current_user, UserPayload

router = APIRouter(prefix="/esg", tags=["ESG & Regulatory Compliance"])

@router.get("/metrics", response_model=ESGMetricsResponse)
def get_esg_metrics(current_user: UserPayload = Depends(get_current_user)):
    """
    Returns real-time environmental and social impact metrics
    aligned with MoFPI and UN Sustainable Development Goals (SDGs).
    """
    return esg_engine.get_metrics()

@router.get("/compliance-report", response_model=ESGComplianceReport)
def get_official_compliance_report(current_user: UserPayload = Depends(get_current_user)):
    """
    Generates an official, tamper-verifiable MoFPI ESG compliance audit report
    suitable for certification and regulatory review.
    """
    return esg_engine.generate_official_report()
