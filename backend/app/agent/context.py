"""Runtime context holding user_id for agent tools and middleware."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class UserContext:
    user_id: str
