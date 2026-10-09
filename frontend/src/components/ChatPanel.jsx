import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, ShoppingBag, ArrowUpRight } from 'lucide-react';
import AgentTimeline from './AgentTimeline';
import ProductCard from './ProductCard';
import OutfitBoard from './OutfitBoard';
import SizeAdviceCard from './SizeAdviceCard';

export default function ChatPanel({
  messages = [],
  isStreaming = false,
  agentSteps = [],
  onSendMessage,
  onInspectProduct,
  onAddToCart,
  onCompleteOutfit,
  comparingIds = [],
  onToggleCompare,
  onOpenCompare,
  notice = null,
}) {
  const [inputText, setInputText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentSteps, isStreaming]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText('');
    onSendMessage(text);
  };

  const suggestionChips = [
    "Complete this outfit",
    "Show something under $50",
    "What size should I wear for 180cm 75kg?",
    "Show these in navy or black",
    "Compare the recommended options",
  ];

  // Helper to render inline [[P0123]] as clickable stylish chips
  const renderMessageContent = (text, products = []) => {
    if (!text) return null;
    const parts = text.split(/(\[\[P\d{4}\]\])/g);
    const lookup = Object.fromEntries((products || []).map(p => [p.id, p]));

    return parts.map((part, i) => {
      const match = part.match(/\[\[(P\d{4})\]\]/);
      if (match) {
        const pid = match[1];
        const p = lookup[pid];
        return (
          <button
            key={i}
            onClick={() => p && onInspectProduct(p)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.15rem 0.5rem',
              margin: '0 0.2rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-gold-dim)',
              border: '1px solid var(--border-gold)',
              color: 'var(--text-gold)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: p ? 'pointer' : 'default',
            }}
          >
            <span>{p ? p.name : pid}</span>
            <ArrowUpRight size={12} />
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 1rem 6rem',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '75vh',
    }}>
      {/* Notice Banner */}
      {notice && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(223, 186, 115, 0.15)',
          border: '1px solid var(--border-gold)',
          color: 'var(--text-gold)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          <AlertCircle size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Comparing Banner Floating Action */}
      {comparingIds.length >= 2 && (
        <div style={{
          position: 'sticky',
          top: '80px',
          zIndex: 30,
          background: 'linear-gradient(135deg, rgba(223, 186, 115, 0.95), rgba(186, 146, 67, 0.95))',
          color: '#0b0c10',
          padding: '0.65rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0 auto 1.5rem',
          maxWidth: '500px',
          width: '90%',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
            {comparingIds.length} items selected for comparison
          </span>
          <button
            onClick={onOpenCompare}
            style={{
              background: '#0b0c10',
              color: 'var(--text-gold)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            Compare Now
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1 }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              {/* Sender Tag */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.35rem',
                padding: '0 0.5rem',
              }}>
                {!isUser && <Sparkles size={12} color="var(--accent-gold)" />}
                <span>{isUser ? 'You' : 'Threadly Stylist'}</span>
              </div>

              {/* Message Bubble */}
              <div
                className="glass"
                style={{
                  maxWidth: '85%',
                  padding: '1.15rem 1.45rem',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'rgba(223, 186, 115, 0.15)' : 'var(--bg-card)',
                  border: isUser ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.98rem',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {renderMessageContent(msg.content, msg.products)}
              </div>

              {/* Live Agent Timeline */}
              {!isUser && msg.agentSteps?.length > 0 && (
                <div style={{ width: '100%', maxWidth: '85%' }}>
                  <AgentTimeline steps={msg.agentSteps} />
                </div>
              )}

              {/* Rich Widget: Size Advice */}
              {!isUser && msg.sizeAdvice && (
                <div style={{ width: '100%', maxWidth: '85%' }}>
                  <SizeAdviceCard advice={msg.sizeAdvice} />
                </div>
              )}

              {/* Rich Widget: Outfit Board */}
              {!isUser && msg.outfit && (
                <div style={{ width: '100%', maxWidth: '85%' }}>
                  <OutfitBoard
                    outfit={msg.outfit}
                    onInspect={onInspectProduct}
                    onAddToCart={onAddToCart}
                  />
                </div>
              )}

              {/* Product Recommendations Grid */}
              {!isUser && msg.products?.length > 0 && (
                <div style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.25rem',
                }}>
                  {msg.products.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onInspect={onInspectProduct}
                      onAddToCart={onAddToCart}
                      onCompleteOutfit={onCompleteOutfit}
                      isComparing={comparingIds.includes(p.id)}
                      onToggleCompare={onToggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Current Streaming Message Steps */}
        {isStreaming && agentSteps.length > 0 && (
          <div style={{ width: '100%', maxWidth: '85%', alignSelf: 'flex-start' }}>
            <AgentTimeline steps={agentSteps} />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Floating Bottom Bar (Suggestions + Input) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(11, 12, 16, 0.98) 75%, transparent)',
        padding: '1rem 1rem 1.25rem',
        zIndex: 35,
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Suggestion Chips */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.65rem',
            scrollbarWidth: 'none',
          }}>
            {suggestionChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(chip)}
                disabled={isStreaming}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  cursor: isStreaming ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!isStreaming) {
                    e.currentTarget.style.borderColor = 'var(--border-focus)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.5rem 0.35rem 1.25rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <input
              type="text"
              placeholder="Ask for outfits, styles, sizes, or price adjustments (e.g. 'Show in black under $60')..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isStreaming}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isStreaming}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: inputText.trim() && !isStreaming ? 'linear-gradient(135deg, #dfba73, #ba9243)' : 'rgba(255, 255, 255, 0.08)',
                color: inputText.trim() && !isStreaming ? '#0b0c10' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                transition: 'var(--transition-fast)',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
