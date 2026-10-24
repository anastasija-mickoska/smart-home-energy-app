from pydantic import BaseModel, Field, ConfigDict

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

class JoinHouseholdRequest(BaseModel):
    name: str
    household_code: str = Field(min_length=6, max_length=6)

class HouseholdReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    household_id: int
    total_high_tariff_kwh: float
    total_low_tariff_kwh: float
    daily_high_tariff_kwh: float
    daily_low_tariff_kwh: float
    daily_high_tariff_cost: float
    daily_low_tariff_cost: float
    weekly_high_tariff_kwh: float
    weekly_low_tariff_kwh: float
    weekly_high_tariff_cost: float
    weekly_low_tariff_cost: float
    monthly_high_tariff_kwh: float
    monthly_low_tariff_kwh: float
    monthly_high_tariff_cost: float
    monthly_low_tariff_cost: float
