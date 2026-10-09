"""Request models shared by the HTTP routes."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class CartItemRequest(BaseModel):
    user_id: str = Field(default="guest", min_length=1)
    product_id: str = Field(min_length=1)
    size: str = Field(min_length=1)
    qty: int = Field(default=1, ge=1, le=10)


class CartQuantityRequest(BaseModel):
    user_id: str = Field(default="guest", min_length=1)
    product_id: str = Field(min_length=1)
    size: str = Field(min_length=1)
    qty: int = Field(ge=0, le=10)


class CompareRequest(BaseModel):
    product_ids: list[str] = Field(min_length=2, max_length=4)


class ChatRequest(BaseModel):
    message: str | None = Field(default=None, max_length=8000)
    thread_id: str | None = Field(default=None, min_length=1, max_length=64)
    user_id: str | None = Field(default=None, min_length=1, max_length=64)
    preferences: dict[str, Any] | None = None


class ProfileRequest(BaseModel):
    """Profile fields are intentionally open-ended; the service validates known fields."""

    model_config = {"extra": "allow"}

    gender: str | None = None
    clothing_size: str | None = None
    shoe_size: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    budget_max: float | None = None
    favorite_colors: list[str] | None = None
    styles: list[str] | None = None
    fits: list[str] | None = None
    materials: list[str] | None = None
    brands: list[str] | None = None
    categories: list[str] | None = None
    dislikes: list[str] | None = None
    notes: list[str] | None = None

    def updates(self) -> dict[str, Any]:
        return self.model_dump(exclude_none=True)
