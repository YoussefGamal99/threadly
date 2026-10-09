import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Shirt, Ruler } from 'lucide-react';

export default function Hero({ onStartWizard, onQuickPrompt }) {
  return (
    <section style={{
      padding: '4rem 2rem 3rem',
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Pill Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 1rem',
        borderRadius: 'var(--radius-full)',
        background: 'var(--accent-gold-dim)',
        border: '1px solid var(--border-gold)',
        color: 'var(--text-gold)',
        fontSize: '0.8rem',
        fontWeight: 500,
        marginBottom: '1.5rem',
        letterSpacing: '0.04em',
      }}>
        <Sparkles size={14} />
        <span>Autonomous Wardrobe Agent &bull; Powered by LangChain & Groq Llama 3.3 70B</span>
      </div>

      {/* Hero Headline */}
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
        fontWeight: 600,
        lineHeight: 1.15,
        color: 'var(--text-primary)',
        maxWidth: '850px',
        margin: '0 auto 1.25rem',
      }}>
        Your Personal AI Stylist. <br />
        <span style={{
          background: 'linear-gradient(135deg, #dfba73 30%, #f4ebd6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontStyle: 'italic',
        }}>
          Tailored to your exact taste.
        </span>
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1.1rem',
        maxWidth: '640px',
        margin: '0 auto 2.5rem',
        fontWeight: 300,
        lineHeight: 1.6,
      }}>
        Share your aesthetic, sizes, and occasion. Threadly searches our curated boutique catalog,
        harmonizes colors, recommends outfits, and remembers your style preferences.
      </p>

      {/* CTA Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '3.5rem',
      }}>
        <button
          onClick={onStartWizard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 2rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #dfba73, #ba9243)',
            color: '#0b0c10',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: 'var(--shadow-gold)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>Start Style Consultation</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={() => onQuickPrompt("What are your best classic autumn jackets under $150?")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontWeight: 500,
            fontSize: '0.95rem',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>Explore Autumn Outerwear</span>
        </button>
      </div>

      {/* Feature Pillar Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        textAlign: 'left',
      }}>
        <div className="glass" style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(223, 186, 115, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)',
            marginBottom: '1rem',
          }}>
            <Shirt size={20} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Complete Outfits
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Our styling algorithm coordinates complementary pieces based on color theory, occasion, and budget.
          </p>
        </div>

        <div className="glass" style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(112, 150, 209, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)',
            marginBottom: '1rem',
          }}>
            <Ruler size={20} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Fit & Size Advisor
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Provide height, weight, or fit preferences, and Threadly calculates your exact size with live stock verification.
          </p>
        </div>

        <div className="glass" style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(82, 183, 136, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)',
            marginBottom: '1rem',
          }}>
            <ShieldCheck size={20} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Zero Hallucinations
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Strict tool grounding ensures every cited piece is verified against SQLite inventory and pricing in real time.
          </p>
        </div>
      </div>
    </section>
  );
}
