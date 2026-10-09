"""Semantic product index: local FastEmbed embeddings + persistent Chroma."""
from __future__ import annotations

from functools import lru_cache
from typing import Iterable

from langchain_chroma import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_core.documents import Document

from app.config import DATA_DIR, get_settings
from app.db.models import Product

COLLECTION = "products"


@lru_cache
def get_embeddings() -> FastEmbedEmbeddings:
    settings = get_settings()
    return FastEmbedEmbeddings(
        model_name=settings.embedding_model,
        cache_dir=str(DATA_DIR / "fastembed_cache"),
    )


@lru_cache
def get_vectorstore() -> Chroma:
    settings = get_settings()
    return Chroma(
        collection_name=COLLECTION,
        embedding_function=get_embeddings(),
        persist_directory=str(settings.chroma_dir),
        collection_metadata={"hnsw:space": "cosine"},
    )


def _product_document(p: Product) -> Document:
    text = (
        f"{p.name}. {p.gender} {p.category.replace('-', ' ')}, {p.style} style, "
        f"{p.fit} fit, {p.color} {p.material}. {p.description}"
    )
    return Document(
        page_content=text,
        id=p.id,
        metadata={
            "product_id": p.id,
            "gender": p.gender,
            "category": p.category,
            "price": float(p.price),
            "in_stock": p.total_stock > 0,
        },
    )


def rebuild_index(products: Iterable[Product]) -> int:
    vs = get_vectorstore()
    try:
        vs.delete_collection()
    except Exception:  # collection may not exist yet
        pass
    get_vectorstore.cache_clear()
    vs = get_vectorstore()
    docs = [_product_document(p) for p in products]
    vs.add_documents(docs, ids=[d.id for d in docs])
    return len(docs)


def semantic_search_ids(
    query: str,
    *,
    gender: str | None = None,
    category: str | None = None,
    max_price: float | None = None,
    in_stock_only: bool = True,
    k: int = 8,
) -> list[tuple[str, float]]:
    """Return [(product_id, similarity)] ordered by relevance."""
    clauses: list[dict] = []
    if gender:
        clauses.append({"gender": {"$in": [gender, "unisex"]} if gender in ("men", "women") else {"$eq": gender}})
    if category:
        clauses.append({"category": {"$eq": category}})
    if max_price is not None:
        clauses.append({"price": {"$lte": float(max_price)}})
    if in_stock_only:
        clauses.append({"in_stock": {"$eq": True}})

    where = None
    if len(clauses) == 1:
        where = clauses[0]
    elif clauses:
        where = {"$and": clauses}

    results = get_vectorstore().similarity_search_with_relevance_scores(query, k=k, filter=where)
    return [(doc.metadata["product_id"], round(score, 3)) for doc, score in results]
