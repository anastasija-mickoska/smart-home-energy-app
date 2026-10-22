from fastapi import APIRouter, Depends
from app.services.auth_service import register_user
from app.schemas.auth import RegisterRequest, AuthResponse
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter()

@router.get("/register")
def register():
    return {"message": "Register endpoint"}

@router.get("/login")
def login():
    return {"message": "Login endpoint"}

@router.post("/register", response_model=AuthResponse, status_code=201)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    return register_user(db, data)
    

@router.post("/login")
def login():
    return {"message": "Login endpoint"}