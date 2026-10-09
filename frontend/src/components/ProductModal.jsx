import React, { useState } from 'react';
import { X, Star, ShoppingBag, Sparkles, Check } from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart, onCompleteOutfit }) {
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstInStock = product?.sizes?.find(s => s.stock > 0);
    return firstInStock ? firstInStock.size : (product?.sizes?.[0]?.size || 'M');
  });
  const [qty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const inStock = product.in_stock !== false && product.sizes?.some(s => s.stock > 0);

  const handleAdd = async () => {
    if (!inStock) return;
    await onAddToCart(product.id, selectedSize, qty);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-overlay)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '1.25rem',
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-gold)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            background: 'rgba(11, 12, 16, 0.8)',
            padding: '0.45rem',
            borderRadius: '50%',
            color: 'var(--text-secondary)',
          }}
        >
          <X size={20} />
        </button>

        {/* Product Photo */}
        <div style={{
          flex: '1 1 340px',
          minHeight: '380px',
          background: 'var(--bg-secondary)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <img
            src={product.image || '/products/men-t-shirts.jpg'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.src = '/products/men-t-shirts.jpg'; }}
          />
        </div>

        {/* Product Details Panel */}
        <div style={{
          flex: '1 1 380px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <span style={{
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.35rem',
          }}>
            {product.brand} &bull; {product.category?.replace('-', ' ')}
          </span>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.65rem',
            fontWeight: 600,
            lineHeight: 1.25,
            marginBottom: '0.65rem',
          }}>
            {product.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ${Number(product.price).toFixed(2)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontSize: '0.88rem' }}>
              <Star size={14} fill="#f59e0b" />
              <span style={{ fontWeight: 600 }}>{product.rating}</span>
              <span style={{ color: 'var(--text-muted)' }}>({product.review_count} reviews)</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            {product.description}
          </p>

          {/* Garment Specifications Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
          }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Silhouette:</span> <strong style={{ textTransform: 'capitalize' }}>{product.fit} fit</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Style Vibe:</span> <strong style={{ textTransform: 'capitalize' }}>{product.style}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Material:</span> <strong style={{ textTransform: 'capitalize' }}>{product.material}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Color:</span> <strong style={{ textTransform: 'capitalize' }}>{product.color}</strong></div>
          </div>

          {/* Size Variant Picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Select Size:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {product.sizes?.map(sz => {
                const isSelected = selectedSize === sz.size;
                const outOfStock = sz.stock === 0;
                return (
                  <button
                    key={sz.size}
                    disabled={outOfStock}
                    onClick={() => setSelectedSize(sz.size)}
                    style={{
                      padding: '0.5rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--text-gold)' : outOfStock ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: outOfStock ? 'not-allowed' : 'pointer',
                      opacity: outOfStock ? 0.45 : 1,
                    }}
                  >
                    {sz.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleAdd}
              disabled={!inStock}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: isAdded ? 'var(--accent-green)' : 'linear-gradient(135deg, #dfba73, #ba9243)',
                color: isAdded ? '#ffffff' : '#0b0c10',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: 'var(--shadow-gold)',
                transition: 'var(--transition-fast)',
              }}
            >
              {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
              <span>{isAdded ? 'Added to Bag!' : inStock ? 'Add to Bag' : 'Out of Stock'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onCompleteOutfit(product);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-gold)',
                fontWeight: 500,
                fontSize: '0.88rem',
              }}
            >
              <Sparkles size={16} />
              <span>Style Outfit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
