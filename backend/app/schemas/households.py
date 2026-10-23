from pydantic import BaseModel, Field

class HouseholdRequest(BaseModel):
    name: str
    household_size: int 
    city: str
    household_code: str = Field(min_length=6, max_length=6)

class HouseholdResponse(BaseModel): 
    household_id: int
    name: str
    household_size: int
    city: str
    household_code: str = Field(min_length=6, max_length=6)
    weekly_limit_kwh: float | None=None
    monthly_limit_kwh: float | None=None