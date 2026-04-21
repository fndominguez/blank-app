from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user_repository import UserRepository


@pytest.mark.asyncio
async def test_create_and_get_user(db_session: AsyncSession) -> None:
    repo = UserRepository(db_session)
    user = await repo.create(
        email="repo@example.com",
        hashed_password="hashed",
        full_name="Repo User",
    )
    assert isinstance(user, User)
    assert user.email == "repo@example.com"

    fetched = await repo.get_by_id(user.id)
    assert fetched is not None
    assert fetched.email == "repo@example.com"


@pytest.mark.asyncio
async def test_get_by_email(db_session: AsyncSession) -> None:
    repo = UserRepository(db_session)
    await repo.create(email="find@example.com", hashed_password="hash")
    user = await repo.get_by_email("find@example.com")
    assert user is not None
    assert user.email == "find@example.com"


@pytest.mark.asyncio
async def test_update_user(db_session: AsyncSession) -> None:
    repo = UserRepository(db_session)
    user = await repo.create(email="update@example.com", hashed_password="hash")
    updated = await repo.update(user.id, full_name="Updated Name")
    assert updated is not None
    assert updated.full_name == "Updated Name"


@pytest.mark.asyncio
async def test_delete_user(db_session: AsyncSession) -> None:
    repo = UserRepository(db_session)
    user = await repo.create(email="delete@example.com", hashed_password="hash")
    deleted = await repo.delete(user.id)
    assert deleted is True
    assert await repo.get_by_id(user.id) is None


@pytest.mark.asyncio
async def test_delete_nonexistent_user(db_session: AsyncSession) -> None:
    import uuid

    repo = UserRepository(db_session)
    deleted = await repo.delete(uuid.uuid4())
    assert deleted is False
