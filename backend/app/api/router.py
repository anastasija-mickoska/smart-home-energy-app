from fastapi import APIRouter

from app.api.routes import auth, households

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=['Auth'])
api_router.include_router(households.router, prefix="/households", tags=['Households'])