from fastapi import APIRouter, Depends
from app.schemas.households import HouseholdRequest , HouseholdResponse, JoinHouseholdRequest, HouseholdReportResponse
from app.services.household_service import create_household, join_household, get_household_reports
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.routes.auth import get_current_member

router = APIRouter()

@router.post("/create", response_model=HouseholdResponse)
def create_household_endpoint(
    data: HouseholdRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return create_household(db, data, current_user)

@router.get("/{household_id}", response_model=HouseholdReportResponse)
def get_household(
    household_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return get_household_reports(db, household_id, current_user)

@router.post("/join", response_model=HouseholdResponse)
def join_household_endpoint(
    data: JoinHouseholdRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member)
):
    return join_household(db, data, current_user)

# @router.patch("{household_id}/saveLimits")
# def save_limits(household_id: int, weekly_limit: float, monthly_,limit: float):
#     pass
