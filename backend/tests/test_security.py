from __future__ import annotations

import pytest

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password() -> None:
    hashed = hash_password("MyPassword1")
    assert verify_password("MyPassword1", hashed)
    assert not verify_password("WrongPassword", hashed)


def test_access_token_roundtrip() -> None:
    token = create_access_token("user-123")
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_refresh_token_roundtrip() -> None:
    token = create_refresh_token("user-456")
    payload = decode_token(token)
    assert payload["sub"] == "user-456"
    assert payload["type"] == "refresh"


def test_decode_invalid_token() -> None:
    with pytest.raises(ValueError, match="Invalid or expired token"):
        decode_token("not-a-valid-token")
