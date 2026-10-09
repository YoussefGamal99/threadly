import React from 'react';
import { Sparkles } from 'lucide-react';

export default function OutfitBoard({ outfit, onInspect }) {
  if (!outfit || !outfit.items?.length) return null;

  const allItems = [outfit.anchor, ...outfit.items].filter(Boolean);

  return (
    <div className="glass" style={{
      margin: '1.25rem 0',
      padding: '1.25rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-gold)',
      background: 'linear-gradient(135deg, rgba(22, 25, 34, 0.9), rgba(15, 17, 23, 0.95))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
          <Sparkles size={16} />
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Curated Ensemble
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete Outfit:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
            ${outfit.total?.toFixed(2) || (allItems.reduce((a, b) => a + Number(b.price || 0), 0)).toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`,
        gap: '0.85rem',
      }}>
        {allItems.map((p, idx) => (
          <div
            key={p.id}
            onClick={() => onInspect(p)}
            style={{
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: idx === 0 ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
              padding: '0.65rem',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {idx === 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'var(--accent-gold)',
                color: '#0b0c10',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '0.15rem 0.4rem',
                borderRadius: 'var(--radius-full)',
              }}>
                ANCHOR
              </span>
            )}
            <div style={{
              width: '100%',
              paddingTop: '100%',
              position: 'relative',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '0.5rem',
              background: '#1a1c23',
            }}>
              <img
                src={p.image || '/products/men-t-shirts.jpg'}
                alt={p.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.currentTarget.src = '/products/men-t-shirts.jpg'; }}
              />
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              {p.brand}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.name}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              ${Number(p.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
