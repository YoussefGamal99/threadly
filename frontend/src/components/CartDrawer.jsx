import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  _onClearCart,
}) {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const total = Number(cart?.total || 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(8, 9, 13, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 70,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--accent-gold)" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600 }}>
              Shopping Bag
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ({items.reduce((s, i) => s + i.qty, 0)})
            </span>
          </div>

          <button onClick={onClose} style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Your bag is empty
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                Consult Threadly or start the style wizard to discover pieces you love.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item, idx) => (
                <div
                  key={`${item.product_id}-${item.size}-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '0.9rem',
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    background: '#1a1c23',
                    flexShrink: 0,
                  }}>
                    <img
                      src={item.image || '/products/men-t-shirts.jpg'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.src = '/products/men-t-shirts.jpg'; }}
                    />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                          {item.brand}
                        </span>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.25 }}>
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product_id, item.size)}
                        title="Remove"
                        style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>
                      Size: <strong style={{ color: 'var(--text-primary)' }}>{item.size}</strong> &bull; Color: {item.color}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      {/* Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.15rem 0.4rem',
                      }}>
                        <button
                          onClick={() => onUpdateQty(item.product_id, item.size, item.qty - 1)}
                          disabled={item.qty <= 1}
                          style={{ padding: '0.2rem', color: item.qty <= 1 ? 'var(--text-muted)' : 'inherit' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.product_id, item.size, item.qty + 1)}
                          style={{ padding: '0.2rem' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-gold)' }}>
                        ${Number(item.line_total || item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(15, 17, 23, 0.95)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>AI Styling Consultation</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Complimentary ($0.00)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-gold)' }}>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => alert(`Thank you for shopping at Threadly Atelier! Checkout total: $${total.toFixed(2)}`)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #dfba73, #ba9243)',
                color: '#0b0c10',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
