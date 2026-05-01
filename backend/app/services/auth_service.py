from __future__ import annotations

import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, TokenPair


def get_user_repository(session: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(session)


class AuthService:
    def __init__(
        self, user_repo: UserRepository = Depends(get_user_repository)
    ) -> None:
        self._user_repo = user_repo

    async def register(self, payload: RegisterRequest) -> User:
        existing = await self._user_repo.get_by_email(payload.email)
        if existing is not None:
            msg = "Email already registered"
            raise ValueError(msg)
        hashed = hash_password(payload.password)
        return await self._user_repo.create(
            email=payload.email,
            hashed_password=hashed,
            full_name=payload.full_name,
        )

    async def login(self, email: str, password: str) -> TokenPair:
        user = await self._user_repo.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            msg = "Invalid credentials"
            raise ValueError(msg)
        if not user.is_active:
            msg = "Account is disabled"
            raise ValueError(msg)
        return TokenPair(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def refresh(self, refresh_token: str) -> TokenPair:
        from app.core.security import decode_token

        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            msg = "Invalid token type"
            raise ValueError(msg)
        user_id = uuid.UUID(payload["sub"])
        user = await self._user_repo.get_by_id(user_id)
        if user is None or not user.is_active:
            msg = "User not found or inactive"
            raise ValueError(msg)
        return TokenPair(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def get_current_user(self, access_token: str) -> User:
        from app.core.security import decode_token

        payload = decode_token(access_token)
        if payload.get("type") != "access":
            msg = "Invalid token type"
            raise ValueError(msg)
        user_id = uuid.UUID(payload["sub"])
        user = await self._user_repo.get_by_id(user_id)
        if user is None or not user.is_active:
            msg = "User not found or inactive"
            raise ValueError(msg)
        return user
