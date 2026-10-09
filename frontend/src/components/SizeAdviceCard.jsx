import React from 'react';
import { Ruler } from 'lucide-react';

export default function SizeAdviceCard({ advice }) {
  if (!advice) return null;

  return (
    <div className="glass" style={{
      margin: '1rem 0',
      padding: '1.15rem 1.35rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--accent-blue)',
      background: 'rgba(112, 150, 209, 0.08)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
    }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(112, 150, 209, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-blue)',
        flexShrink: 0,
      }}>
        <Ruler size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Fit & Size Recommendation
          </h4>
          <span style={{
            background: 'var(--accent-blue)',
            color: '#0b0c10',
            fontWeight: 700,
            fontSize: '0.75rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-full)',
          }}>
            SIZE {advice.recommended}
          </span>
          {advice.alternative && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              (Alt: {advice.alternative})
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          {advice.reasoning}
        </p>
      </div>
    </div>
  );
}
