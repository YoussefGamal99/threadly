"""FastAPI application entry point for Threadly."""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.store.sqlite.aio import AsyncSqliteStore

from app.agent.agent import create_stylist_agent
from app.api.chat import router as chat_router
from app.api.store import router as store_router
from app.config import get_settings
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    init_db()

    # Initialize checkpointer and long-term memory store
    async with AsyncSqliteSaver.from_conn_string(str(settings.memory_db_path)) as saver:
        async with AsyncSqliteStore.from_conn_string(str(settings.memory_db_path)) as store:
            await saver.setup()
            await store.setup()

            # Compile agent graph with persistence and memory
            agent = create_stylist_agent(checkpointer=saver, store=store)

            app.state.saver = saver
            app.state.store = store
            app.state.agent = agent

            yield


app = FastAPI(
    title="Threadly AI Boutique Stylist API",
    description="Agentic personal stylist and clothes catalog service powered by LangChain and Groq",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(store_router)
app.include_router(chat_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "primary_model": settings.primary_model,
        "fallbacks": settings.fallback_model_list,
        "groq_configured": bool(settings.groq_api_key),
    }


# Mount static product images directory if it exists
import os
default_img_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "products"
product_img_dir = Path(os.getenv("PRODUCT_IMG_DIR", str(default_img_dir)))
product_img_dir.mkdir(parents=True, exist_ok=True)
app.mount("/products", StaticFiles(directory=str(product_img_dir)), name="products")


def main() -> None:
    """Run the FastAPI application via uvicorn."""
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()

