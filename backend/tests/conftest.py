from __future__ import annotations

import os
import uuid

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Provide test env vars before importing app modules
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-at-least-32-chars-long!!")
os.environ.setdefault("ENVIRONMENT", "test")

from app.db.base import Base
from app.db.session import get_db
from app.main import app


def _make_test_db_url() -> str:
    # Use a unique in-memory file per test to ensure full isolation
    return f"sqlite+aiosqlite:///file:testdb_{uuid.uuid4().hex}?mode=memory&cache=shared&uri=true"


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:  # type: ignore[misc]
    url = _make_test_db_url()
    engine = create_async_engine(url, echo=False)
    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        async with session.begin():
            yield session  # type: ignore[misc]

    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncClient:  # type: ignore[misc]
    async def override_get_db() -> AsyncSession:  # type: ignore[misc]
        yield db_session  # type: ignore[misc]

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac  # type: ignore[misc]
    app.dependency_overrides.clear()
