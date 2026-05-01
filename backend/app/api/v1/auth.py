from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenPair
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService, get_user_repository

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE_KWARGS = {
    "httponly": True,
    "secure": settings.ENVIRONMENT == "production",
    "samesite": "lax",
}


def _set_auth_cookies(response: Response, tokens: TokenPair) -> None:
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **_COOKIE_KWARGS,  # type: ignore[arg-type]
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        **_COOKIE_KWARGS,  # type: ignore[arg-type]
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def register(
    request: Request,  # required by slowapi
    payload: RegisterRequest,
    response: Response,
    user_repo: UserRepository = Depends(get_user_repository),
) -> UserResponse:
    service = AuthService(user_repo)
    try:
        user = await service.register(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc
    tokens = await service.login(payload.email, payload.password)
    _set_auth_cookies(response, tokens)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenPair)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login(
    request: Request,
    payload: LoginRequest,
    response: Response,
    user_repo: UserRepository = Depends(get_user_repository),
) -> TokenPair:
    service = AuthService(user_repo)
    try:
        tokens = await service.login(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc
    _set_auth_cookies(response, tokens)
    return tokens


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    payload: RefreshRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> TokenPair:
    repo = UserRepository(session)
    service = AuthService(repo)
    try:
        tokens = await service.refresh(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc
    _set_auth_cookies(response, tokens)
    return tokens


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
