"""Application settings loaded from environment / .env file."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    groq_api_key: str = ""
    primary_model: str = "openai/gpt-oss-120b"
    fallback_models: str = "openai/gpt-oss-20b,qwen/qwen3.8-27b"
    summary_model: str = "openai/gpt-oss-20b"
    guard_model: str = "meta-llama/llama-prompt-guard-2-86m"
    summary_trigger_tokens: int = 6000
    summary_keep_messages: int = 12
    prompt_guard_enabled: bool = True
    prompt_guard_threshold: float = 0.9
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    store_db_path: Path = DATA_DIR / "store.db"
    memory_db_path: Path = DATA_DIR / "memory.db"
    chroma_dir: Path = DATA_DIR / "chroma"
    embedding_model: str = "BAAI/bge-small-en-v1.5"

    @property
    def fallback_model_list(self) -> list[str]:
        return [m.strip() for m in self.fallback_models.split(",") if m.strip()]

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return Settings()
