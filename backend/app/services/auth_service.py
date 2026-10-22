import os
from datetime import datetime, timedelta, timezone
from  dotenv import load_dotenv

import jwt
from fastapi import HTTPException, status
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
)

password_hash = PasswordHash.recommended()

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is not configured")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(email: str) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": email,
        "iat": now,
        "exp": now + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def register_user(
    db: Session,
    data: RegisterRequest,
) -> AuthResponse:
    email = str(data.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        member_id= '',
        household_id= 0,
        email=email,
        name=data.name,
        role=data.role,
        password_hash=password_hash.hash(data.password),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    token = create_access_token(email)

    return AuthResponse(
        access_token=token,
        user=UserResponse(
            name=user.name,
            email=user.email,
            role=user.role,
            household_id=user.household_id
        ),
    )


def login_user(
    db: Session,
    data: LoginRequest,
) -> AuthResponse:
    email = str(data.email).strip().lower()

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if (
        user is None
        or not password_hash.verify(
            data.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(email)

    return AuthResponse(
        access_token=token,
        user=UserResponse(
            name=user.name,
            email=user.email,
            role=user.role,
            household_id=user.household_id
        ),
    )