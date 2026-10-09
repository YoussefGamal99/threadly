import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export default function AgentTimeline({ steps = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!steps.length) return null;

  const isRunning = steps.some(s => s.status === 'running');
  const lastStep = steps[steps.length - 1];

  return (
    <div style={{
      margin: '0.75rem 0',
      borderRadius: 'var(--radius-sm)',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      fontSize: '0.82rem',
    }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '0.55rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isRunning ? 'var(--accent-gold-dim)' : 'transparent',
          color: isRunning ? 'var(--text-gold)' : 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isRunning ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} color="var(--accent-gold)" />
          )}
          <span style={{ fontWeight: 500 }}>
            {isRunning ? (lastStep?.label || 'Stylist reasoning...') : `Completed ${steps.length} stylist action${steps.length > 1 ? 's' : ''}`}
          </span>
        </div>
        <button style={{ color: 'inherit' }}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{ padding: '0.5rem 0.85rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
          {steps.map((st, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: st.status === 'running' ? 'var(--text-gold)' : 'var(--text-muted)' }}>
              {st.status === 'running' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle2 size={12} color="var(--accent-green)" />
              )}
              <span>{st.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
