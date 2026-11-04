from pydantic import BaseModel, Field, ConfigDict, model_validator

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

class SaveLimitsRequest(BaseModel):
    household_id: int
    weekly_limit: float | None = Field(gt=0, le=100000, allow_inf_nan=False)
    monthly_limit: float | None = Field(gt=0, le=1000000, allow_inf_nan=False)

    @model_validator(mode="after")
    def monthly_not_below_weekly(self):
        if (
            self.weekly_limit is not None
            and self.monthly_limit is not None
            and self.monthly_limit < self.weekly_limit
        ):
            raise ValueError("The monthly limit can't be lower than the weekly limit.")
        return self

class HouseholdReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    household_id: int
    name: str
    weekly_limit_kwh: float | None
    monthly_limit_kwh: float | None
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

class ApplianceReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    household_id: int
    appliance_type: str
    daily_low_kwh: float
    daily_high_kwh: float
    weekly_low_kwh: float
    weekly_high_kwh: float
    monthly_low_kwh: float
    monthly_high_kwh: float
    total_low_kwh: float
    total_high_kwh: float