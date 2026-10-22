from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class User(Base):
    __tablename__ = "members"    
    __table_args__ = {"schema": "silver"}

    member_id: Mapped[str] = mapped_column(String(5), nullable=False)
    household_id: Mapped[int] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False, primary_key=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)