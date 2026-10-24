
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_
from app.models.household import Household
from app.models.household_report import HouseholdReport
from app.models.user import User
from app.schemas.households import (
    HouseholdRequest,
    HouseholdResponse,
    JoinHouseholdRequest,
    HouseholdReportResponse
    )

def create_household(
    db: Session,
    data: HouseholdRequest,
    current_user: User,
) -> HouseholdResponse:

    if current_user.household_id != 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already belong to a household.",
        )

    try:

        exists = db.query(Household).filter(
            or_(
                Household.name == data.name,
                Household.household_code == data.household_code,
            )
        ).first()

        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A household with this name or household code already exists.",
            )
        household = Household(
            name=data.name,
            city=data.city,
            household_size=data.household_size,
            household_code=data.household_code,
        )

        db.add(household)

        db.flush()

        current_user.household_id = household.household_id
        current_user.member_id = f"{household.household_id}-1"
        current_user.role = "owner"

        db.commit()
        db.refresh(current_user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The household code already exists or a database constraint was violated.",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create the household.",
        )

    return HouseholdResponse(
        household_id=household.household_id,
        name=household.name,
        city=household.city,
        household_size=household.household_size,
        household_code=household.household_code,
        weekly_limit_kwh=None,
        monthly_limit_kwh=None
    )

def join_household(
    db: Session,
    data: JoinHouseholdRequest,
    current_user: User,
) -> HouseholdResponse:
    
    if current_user.household_id != 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already belong to a household.",
        )

    try:

        household = (
            db.query(Household)
            .filter(
                Household.name == data.name,
                Household.household_code == data.household_code,
            )
            .first()
        )

        if not household:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="A household with this name or household code cannot be found.",
            )

        household_size = household.household_size 

        num_members_joined = (
            db.query(User)
            .filter(User.household_id == household.household_id)
            .count()
        )

        if(num_members_joined >= household_size):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This household is already full.",
            )

        current_user.household_id = household.household_id
        current_user.member_id = f"{household.household_id}-{num_members_joined+1}"
        current_user.role = "member"

        db.commit()
        db.refresh(current_user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not join the household because of a database constraint.",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not join the household.",
        )

    return HouseholdResponse(
        household_id=household.household_id,
        name=household.name,
        city=household.city,
        household_size=household.household_size,
        household_code=household.household_code,
        weekly_limit_kwh=household.weekly_limit_kwh,
        monthly_limit_kwh=household.monthly_limit_kwh
    )

def get_household_reports(
    db: Session,
    household_id: int,
    current_user: User,
) -> HouseholdReportResponse:
    
    if current_user.household_id == 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You don't belong to a household.",
        )
    
    if current_user.household_id != household_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this household's report.",
        )
    
    try:

        household = (
            db.query(HouseholdReport)
            .filter(
                HouseholdReport.household_id == household_id
            )
            .first()
        )

        if not household:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="A household with this ID cannot be found.",
            )
        
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not find data about the household.",
        )
    
    return household