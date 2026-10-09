"""SQLAlchemy ORM models for the store database."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(8), primary_key=True)  # e.g. P0001
    name: Mapped[str] = mapped_column(String(120))
    brand: Mapped[str] = mapped_column(String(40), index=True)
    gender: Mapped[str] = mapped_column(String(10))
    category: Mapped[str] = mapped_column(String(20))
    subtype: Mapped[str | None] = mapped_column(String(20), nullable=True)
    style: Mapped[str] = mapped_column(String(20), index=True)
    fit: Mapped[str] = mapped_column(String(12))
    material: Mapped[str] = mapped_column(String(12))
    color: Mapped[str] = mapped_column(String(16), index=True)
    color_hex: Mapped[str] = mapped_column(String(8))
    price: Mapped[float] = mapped_column(Float, index=True)
    rating: Mapped[float] = mapped_column(Float)
    review_count: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)
    image: Mapped[str] = mapped_column(String(80))

    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (Index("ix_products_gender_category", "gender", "category"),)

    @property
    def sizes_in_stock(self) -> list[str]:
        return [v.size for v in self.variants if v.stock > 0]

    @property
    def total_stock(self) -> int:
        return sum(v.stock for v in self.variants)

    def to_card(self) -> dict:
        """Full card payload for the UI."""
        return {
            "id": self.id, "name": self.name, "brand": self.brand, "gender": self.gender,
            "category": self.category, "style": self.style, "fit": self.fit,
            "material": self.material, "color": self.color, "color_hex": self.color_hex,
            "price": self.price, "rating": self.rating, "review_count": self.review_count,
            "description": self.description, "image": self.image,
            "sizes": [{"size": v.size, "stock": v.stock} for v in self.variants],
            "in_stock": self.total_stock > 0,
        }

    def to_compact(self) -> dict:
        """Token-efficient payload for the LLM."""
        return {
            "id": self.id, "name": self.name, "price": self.price, "color": self.color,
            "style": self.style, "fit": self.fit, "material": self.material,
            "rating": self.rating, "sizes_in_stock": self.sizes_in_stock,
        }


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    size: Mapped[str] = mapped_column(String(10))
    stock: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped[Product] = relationship(back_populates="variants")

    __table_args__ = (UniqueConstraint("product_id", "size"),)


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    size: Mapped[str] = mapped_column(String(10))
    qty: Mapped[int] = mapped_column(Integer, default=1)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    product: Mapped[Product] = relationship(lazy="joined")

    __table_args__ = (UniqueConstraint("user_id", "product_id", "size"),)


class Thread(Base):
    __tablename__ = "threads"

    thread_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    title: Mapped[str] = mapped_column(String(120), default="New conversation")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
