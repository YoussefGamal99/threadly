import React from 'react';
import { X, Sparkles, Star, Award, DollarSign } from 'lucide-react';

export default function ComparisonModal({ comparison, onClose, onInspect }) {
  if (!comparison || !comparison.products?.length) return null;

  const { products, table, highlights } = comparison;

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
        maxWidth: '860px',
        maxHeight: '90vh',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-gold)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', letterSpacing: '0.12em', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              Side-by-Side Comparison
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600 }}>
              Evaluating {products.length} Garments
            </h2>
          </div>
          <button onClick={onClose} style={{ padding: '0.45rem', borderRadius: '50%', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div style={{ padding: '1.5rem', overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Specification</th>
                {products.map(p => (
                  <th key={p.id} style={{ padding: '0.75rem', verticalAlign: 'top', minWidth: '160px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {p.name}
                    </div>
                    {highlights?.cheapest === p.id && (
                      <span style={{ display: 'inline-block', fontSize: '0.7rem', background: 'var(--accent-green)', color: '#0b0c10', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', marginTop: '0.2rem' }}>
                        Best Price
                      </span>
                    )}
                    {highlights?.top_rated === p.id && (
                      <span style={{ display: 'inline-block', fontSize: '0.7rem', background: 'var(--accent-gold)', color: '#0b0c10', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', marginTop: '0.2rem' }}>
                        Top Rated
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['brand', 'price', 'rating', 'material', 'fit', 'style', 'color'].map(attr => (
                <tr key={attr} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 500 }}>
                    {attr}
                  </td>
                  {products.map(p => {
                    const val = table?.[attr]?.[p.id];
                    return (
                      <td key={p.id} style={{ padding: '0.75rem' }}>
                        {attr === 'price' && <strong style={{ color: 'var(--accent-gold)', fontSize: '1.05rem' }}>${Number(val).toFixed(2)}</strong>}
                        {attr === 'rating' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                            <Star size={13} fill="#f59e0b" />
                            <strong>{val}</strong>
                          </span>
                        )}
                        {attr !== 'price' && attr !== 'rating' && (
                          <span style={{ textTransform: 'capitalize' }}>{String(val || '—')}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
