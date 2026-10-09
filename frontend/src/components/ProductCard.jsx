import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Sparkles, Check } from 'lucide-react';

export default function ProductCard({
  product,
  onInspect,
  onAddToCart,
  onCompleteOutfit,
  isComparing,
  onToggleCompare,
}) {
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstInStock = product.sizes?.find(s => s.stock > 0);
    return firstInStock ? firstInStock.size : (product.sizes?.[0]?.size || 'M');
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await onAddToCart(product.id, selectedSize, 1);
    } finally {
      setTimeout(() => setIsAdding(false), 600);
    }
  };

  const inStock = product.in_stock !== false && product.sizes?.some(s => s.stock > 0);

  return (
    <div
      className="glass"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--transition-base)',
        position: 'relative',
        border: isComparing ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--border-focus)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isComparing ? 'var(--accent-gold)' : 'var(--border-subtle)';
      }}
    >
      {/* Compare Checkbox */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(product.id);
          }}
          title="Compare this item"
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: isComparing ? 'var(--accent-gold)' : 'rgba(11, 12, 16, 0.75)',
            color: isComparing ? '#0b0c10' : 'var(--text-secondary)',
            fontSize: '0.72rem',
            fontWeight: 600,
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          {isComparing ? <Check size={12} /> : null}
          <span>{isComparing ? 'Comparing' : 'Compare'}</span>
        </button>
      </div>

      {/* Product Image */}
      <div
        onClick={() => onInspect(product)}
        style={{
          position: 'relative',
          paddingTop: '95%',
          cursor: 'pointer',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
        }}
      >
        <img
          src={product.image || '/products/men-t-shirts.jpg'}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onError={e => {
            e.currentTarget.src = '/products/men-t-shirts.jpg';
          }}
        />

        {/* Color Pill */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(11, 12, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.72rem',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
        }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: product.color_hex || '#888',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }} />
          <span style={{ textTransform: 'capitalize' }}>{product.color?.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Info Block */}
      <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.3rem',
        }}>
          <span style={{
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            {product.brand}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.8rem' }}>
            <Star size={12} fill="#f59e0b" />
            <span style={{ fontWeight: 600 }}>{product.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({product.review_count})</span>
          </div>
        </div>

        <h3
          onClick={() => onInspect(product)}
          style={{
            fontSize: '0.98rem',
            fontWeight: 600,
            marginBottom: '0.4rem',
            lineHeight: 1.35,
            cursor: 'pointer',
          }}
          title={product.name}
        >
          {product.name}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.5rem',
          marginBottom: '0.85rem',
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${Number(product.price).toFixed(2)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            &bull; {product.fit} fit &bull; {product.material}
          </span>
        </div>

        {/* Size Selection & Add to Cart */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
          <select
            value={selectedSize}
            onChange={e => setSelectedSize(e.target.value)}
            style={{
              padding: '0.5rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {product.sizes?.map(s => (
              <option key={s.size} value={s.size} disabled={s.stock === 0}>
                {s.size} {s.stock === 0 ? '(Sold Out)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            disabled={!inStock || isAdding}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: inStock ? 'linear-gradient(135deg, #dfba73, #ba9243)' : 'rgba(255, 255, 255, 0.05)',
              color: inStock ? '#0b0c10' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: inStock ? 'pointer' : 'not-allowed',
              transition: 'var(--transition-fast)',
            }}
          >
            <ShoppingBag size={14} />
            <span>{isAdding ? 'Added!' : inStock ? 'Add to Bag' : 'Sold Out'}</span>
          </button>
        </div>

        {/* Quick Stylist Action */}
        <button
          onClick={() => onCompleteOutfit(product)}
          style={{
            marginTop: '0.5rem',
            padding: '0.35rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid transparent',
            color: 'var(--text-gold)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-gold-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Sparkles size={12} />
          <span>Style Complete Outfit with this</span>
        </button>
      </div>
    </div>
  );
}
