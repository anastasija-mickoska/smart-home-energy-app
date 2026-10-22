from fastapi import APIRouter

router = APIRouter()

@router.post("/create")
def create_household():
    pass

@router.get("/{household_id}")
def get_household(household_id: int):
    pass

@router.patch("{household_id}/join")
def join_household(household_id: int):
    pass

@router.patch("{household_id}/saveLimits")
def save_limits(household_id: int, weekly_limit: float, monthly_,limit: float):
    pass

