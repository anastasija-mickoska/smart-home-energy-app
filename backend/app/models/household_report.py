from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class HouseholdReport(Base):
    __tablename__ = "households_db"    
    __table_args__ = {"schema": "gold"}

    household_id: Mapped[int] = mapped_column(unique=True, index=True, nullable=False, primary_key=True)
    total_high_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    total_low_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    daily_high_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    daily_low_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    daily_high_tariff_cost: Mapped[float] = mapped_column(nullable=False)
    daily_low_tariff_cost: Mapped[float] = mapped_column(nullable=False)
    weekly_high_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    weekly_low_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    weekly_high_tariff_cost: Mapped[float] = mapped_column(nullable=False)
    weekly_low_tariff_cost: Mapped[float] = mapped_column(nullable=False)
    monthly_high_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    monthly_low_tariff_kwh: Mapped[float] = mapped_column(nullable=False)
    monthly_high_tariff_cost: Mapped[float] = mapped_column(nullable=False)
    monthly_low_tariff_cost: Mapped[float] = mapped_column(nullable=False)
