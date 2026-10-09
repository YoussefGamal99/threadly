import React from 'react';
import { X, MessageSquare, Plus, Trash2, UserCheck } from 'lucide-react';

export default function HistorySidebar({
  isOpen,
  onClose,
  threads = [],
  currentThreadId,
  onSelectThread,
  onNewThread,
  profile = {},
  onDeleteProfile,
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(8, 9, 13, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 70,
      display: 'flex',
      justifyContent: 'flex-start',
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '380px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-subtle)',
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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600 }}>
            Styling Consultations
          </h2>
          <button onClick={onClose} style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: '1rem 1.5rem' }}>
          <button
            onClick={() => {
              onNewThread();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-gold-dim)',
              border: '1px solid var(--border-gold)',
              color: 'var(--text-gold)',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'var(--transition-fast)',
            }}
          >
            <Plus size={16} />
            <span>New Style Session</span>
          </button>
        </div>

        {/* Threads List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Recent Sessions
          </span>
          {threads.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
              No previous sessions yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {threads.map(t => {
                const active = t.thread_id === currentThreadId;
                return (
                  <button
                    key={t.thread_id}
                    onClick={() => {
                      onSelectThread(t.thread_id);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: active ? 'rgba(223, 186, 115, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: active ? '1px solid var(--border-gold)' : '1px solid transparent',
                      color: active ? 'var(--text-gold)' : 'var(--text-secondary)',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <MessageSquare size={14} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title || 'Personal Styling'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Long-Term Memory Section */}
          <div style={{ marginTop: '2rem', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
              <UserCheck size={16} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Remembered Preferences
              </span>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
            }}>
              {Object.keys(profile).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No preferences saved yet. Threadly remembers sizing and tastes as you chat.
                </p>
              ) : (
                <>
                  {profile.gender && <div><span style={{ color: 'var(--text-muted)' }}>Target:</span> {profile.gender}</div>}
                  {profile.clothing_size && <div><span style={{ color: 'var(--text-muted)' }}>Size:</span> {profile.clothing_size}</div>}
                  {profile.favorite_colors?.length > 0 && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Colors:</span> {profile.favorite_colors.join(', ')}</div>
                  )}
                  {profile.styles?.length > 0 && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Styles:</span> {profile.styles.join(', ')}</div>
                  )}
                  {profile.dislikes?.length > 0 && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Dislikes:</span> {profile.dislikes.join(', ')}</div>
                  )}

                  <button
                    onClick={onDeleteProfile}
                    style={{
                      marginTop: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--accent-red)',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0',
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Forget my preferences</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
