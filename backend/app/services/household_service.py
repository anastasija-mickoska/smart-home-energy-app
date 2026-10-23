
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_
from app.models.household import Household
from app.models.user import User
from app.schemas.households import (
    HouseholdRequest,
    HouseholdResponse)


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