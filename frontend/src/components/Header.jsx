import React from 'react';
import { Sparkles, ShoppingBag, History, Compass } from 'lucide-react';

export default function Header({ onOpenWizard, onOpenCart, onOpenHistory, cartCount = 0 }) {
  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.9rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #dfba73, #947132)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0b0c10',
          fontWeight: 700,
          boxShadow: 'var(--shadow-gold)',
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.45rem',
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            fontWeight: 600,
          }}>
            THREADLY
          </h1>
          <span style={{
            fontSize: '0.68rem',
            letterSpacing: '0.22em',
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            Atelier AI Stylist
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          onClick={onOpenWizard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(223, 186, 115, 0.22), rgba(223, 186, 115, 0.08))',
            border: '1px solid var(--border-gold)',
            color: 'var(--text-gold)',
            fontWeight: 500,
            fontSize: '0.88rem',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Compass size={16} />
          <span>Style Wizard</span>
        </button>

        <button
          onClick={onOpenHistory}
          title="History & Saved Preferences"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <History size={18} />
        </button>

        <button
          onClick={onOpenCart}
          title="Shopping Bag"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-gold)',
              color: '#0b0c10',
              fontSize: '0.72rem',
              fontWeight: 700,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-gold)',
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
