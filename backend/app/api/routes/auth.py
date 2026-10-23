from fastapi import APIRouter, Depends, Response, status, Cookie
from app.services.auth_service import register_user, login_user, get_user
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter()

@router.get("/register")
def register():
    return {"message": "Register endpoint"}

@router.get("/login")
def login():
    return {"message": "Login endpoint"}

@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    return register_user(db, data)
    

@router.post("/login")
def login(
    data:LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    auth = login_user(db, data)

    response.set_cookie(
        key="access_token",
        value=auth.access_token,
        httponly=True,
        secure=False,  # Local development only
        samesite="lax",
        max_age=1800,
        path="/",
    )

    return {
        "user": {
            "name": auth.user.name,
            "email": auth.user.email,
            "household_id": auth.user.household_id,
            "role": auth.user.role,
        }
    }

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False, 
        samesite="lax",
        path="/",
    )

@router.get("/me", response_model=UserResponse)
def get_current_member(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    return get_user(access_token, db)