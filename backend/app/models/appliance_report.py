from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class ApplianceReport(Base):
    __tablename__ = "appliances_db"    
    __table_args__ = {"schema": "gold"}

    household_id: Mapped[int] = mapped_column(primary_key=True)
    appliance_type: Mapped[str] = mapped_column(String(100), primary_key=True)
    daily_low_kwh: Mapped[float] = mapped_column(nullable=False)
    daily_high_kwh: Mapped[float] = mapped_column(nullable=False)
    weekly_low_kwh: Mapped[float] = mapped_column(nullable=False)
    weekly_high_kwh: Mapped[float] = mapped_column(nullable=False)
    monthly_low_kwh: Mapped[float] = mapped_column(nullable=False)
    monthly_high_kwh: Mapped[float] = mapped_column(nullable=False)
    total_low_kwh: Mapped[float] = mapped_column(nullable=False)
    total_high_kwh: Mapped[float] = mapped_column(nullable=False)
