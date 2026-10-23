from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class Household(Base):
    __tablename__ = "households"    
    __table_args__ = {"schema": "silver"}

    household_id: Mapped[int] = mapped_column(unique=True, index=True, nullable=False, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    household_size: Mapped[int] = mapped_column(nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=True)
    household_code: Mapped[str] = mapped_column(String(255), nullable=False)
    weekly_limit_kwh: Mapped[float] = mapped_column(nullable=True)
    monthly_limit_kwh: Mapped[float] = mapped_column(nullable=True)