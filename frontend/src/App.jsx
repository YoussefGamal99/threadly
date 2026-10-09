import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PreferenceWizard from './components/PreferenceWizard';
import ChatPanel from './components/ChatPanel';
import ProductModal from './components/ProductModal';
import ComparisonModal from './components/ComparisonModal';
import CartDrawer from './components/CartDrawer';
import HistorySidebar from './components/HistorySidebar';
import {
  fetchOptions,
  fetchCart,
  addToCart as apiAddToCart,
  updateCartQty as apiUpdateCartQty,
  removeFromCart as apiRemoveFromCart,
  fetchProfile,
  deleteProfile as apiDeleteProfile,
  fetchThreads,
  compareProducts as apiCompareProducts,
  streamChat,
} from './services/api';

// Anonymous persistent user ID in localStorage
function getUserId() {
  let uid = localStorage.getItem('threadly_user_id');
  if (!uid) {
    uid = 'usr_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('threadly_user_id', uid);
  }
  return uid;
}

export default function App() {
  const [userId] = useState(getUserId);
  const [threadId, setThreadId] = useState(() => 'th_' + Math.random().toString(36).substring(2, 10));

  const [options, setOptions] = useState(null);
  const [cart, setCart] = useState({ items: [], count: 0, total: 0 });
  const [profile, setProfile] = useState({});
  const [threads, setThreads] = useState([]);

  // UI Modals & Drawers
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparingIds, setComparingIds] = useState([]);

  // Chat & Stream State
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [agentSteps, setAgentSteps] = useState([]);
  const [notice, setNotice] = useState(null);

  // Initial Data Load
  useEffect(() => {
    fetchOptions().then(setOptions).catch(console.error);
    fetchCart(userId).then(setCart).catch(console.error);
    fetchProfile(userId).then(setProfile).catch(console.error);
    fetchThreads(userId).then(setThreads).catch(console.error);
  }, [userId]);

  // Handle Cart Operations
  const handleAddToCart = async (productId, size, qty = 1) => {
    try {
      const updatedCart = await apiAddToCart(userId, productId, size, qty);
      setCart(updatedCart);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateCartQty = async (productId, size, qty) => {
    try {
      const updatedCart = await apiUpdateCartQty(userId, productId, size, qty);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFromCart = async (productId, size) => {
    try {
      const updatedCart = await apiRemoveFromCart(userId, productId, size);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProfile = async () => {
    if (confirm("Reset remembered sizes and styling preferences?")) {
      await apiDeleteProfile(userId);
      setProfile({});
    }
  };

  // Compare Toggle
  const handleToggleCompare = (productId) => {
    if (comparingIds.includes(productId)) {
      setComparingIds(comparingIds.filter(id => id !== productId));
    } else {
      if (comparingIds.length >= 4) {
        alert("You can compare up to 4 items simultaneously.");
        return;
      }
      setComparingIds([...comparingIds, productId]);
    }
  };

  const handleOpenCompare = async () => {
    if (comparingIds.length < 2) return;
    try {
      const res = await apiCompareProducts(comparingIds);
      setComparisonData(res);
    } catch {
      alert("Could not load comparison.");
    }
  };

  // Send Chat Message or Wizard Submission
  const handleSendMessage = useCallback(async (text, preferences = null) => {
    if (isStreaming) return;

    // Display user bubble
    const userMsg = {
      role: 'user',
      content: text || (preferences ? "Consulting style preferences with Threadly..." : ""),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsStreaming(true);
    setAgentSteps([]);
    setNotice(null);

    let assistantContent = '';
    let currentProducts = [];
    let currentOutfit = null;
    let currentSizeAdvice = null;

    try {
      await streamChat({
        userId,
        threadId,
        message: text,
        preferences,
        onStatus: (step) => {
          setAgentSteps(prev => {
            const idx = prev.findIndex(s => s.tool === step.tool);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = step;
              return copy;
            }
            return [...prev, step];
          });
        },
        onToken: (delta) => {
          assistantContent += delta;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              const copy = [...prev];
              copy[copy.length - 1] = { ...last, content: assistantContent };
              return copy;
            }
            return [
              ...prev,
              {
                role: 'assistant',
                content: assistantContent,
                products: currentProducts,
                outfit: currentOutfit,
                sizeAdvice: currentSizeAdvice,
              },
            ];
          });
        },
        onProducts: (newProducts) => {
          currentProducts = newProducts;
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === 'assistant') {
              copy[copy.length - 1] = { ...last, products: newProducts };
            }
            return copy;
          });
        },
        onCustom: (eventType, data) => {
          if (eventType === 'cart') {
            setCart(data.cart);
          } else if (eventType === 'outfit') {
            currentOutfit = data;
            setMessages(prev => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.role === 'assistant') {
                copy[copy.length - 1] = { ...last, outfit: data };
              }
              return copy;
            });
          } else if (eventType === 'size_advice') {
            currentSizeAdvice = data;
            setMessages(prev => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.role === 'assistant') {
                copy[copy.length - 1] = { ...last, sizeAdvice: data };
              }
              return copy;
            });
          } else if (eventType === 'comparison') {
            setComparisonData(data);
          } else if (eventType === 'memory') {
            setProfile(data.profile || {});
          }
        },
        onNotice: (msg) => {
          setNotice(msg);
        },
        onError: (err) => {
          console.error("Stream error:", err);
        },
        onDone: () => {
          // Finalize assistant message with agentSteps snapshot
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === 'assistant') {
              copy[copy.length - 1] = { ...last, agentSteps };
            }
            return copy;
          });
          setIsStreaming(false);
          // Refresh thread list
          fetchThreads(userId).then(setThreads).catch(console.error);
        },
      });
    } catch (err) {
      console.error(err);
      setIsStreaming(false);
    }
  }, [userId, threadId, isStreaming, agentSteps]);

  // Wizard Complete Handler
  const handleWizardSubmit = (preferences) => {
    setIsWizardOpen(false);
    handleSendMessage(null, preferences);
  };

  // Complete Outfit Handler
  const handleCompleteOutfit = (product) => {
    handleSendMessage(`Please suggest a cohesive outfit that pairs with the [[${product.id}]] (${product.name}).`);
  };

  // New Consultation Session
  const handleNewThread = () => {
    setThreadId('th_' + Math.random().toString(36).substring(2, 10));
    setMessages([]);
    setAgentSteps([]);
    setComparingIds([]);
  };

  const hasStartedChat = messages.length > 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        cartCount={cart.count || 0}
      />

      <main style={{ flex: 1 }}>
        {!hasStartedChat ? (
          <Hero
            onStartWizard={() => setIsWizardOpen(true)}
            onQuickPrompt={(prompt) => handleSendMessage(prompt)}
          />
        ) : (
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            agentSteps={agentSteps}
            onSendMessage={handleSendMessage}
            onInspectProduct={setInspectedProduct}
            onAddToCart={handleAddToCart}
            onCompleteOutfit={handleCompleteOutfit}
            comparingIds={comparingIds}
            onToggleCompare={handleToggleCompare}
            onOpenCompare={handleOpenCompare}
            notice={notice}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      {isWizardOpen && (
        <PreferenceWizard
          options={options}
          initialProfile={profile}
          onClose={() => setIsWizardOpen(false)}
          onSubmit={handleWizardSubmit}
        />
      )}

      {inspectedProduct && (
        <ProductModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onAddToCart={handleAddToCart}
          onCompleteOutfit={handleCompleteOutfit}
        />
      )}

      {comparisonData && (
        <ComparisonModal
          comparison={comparisonData}
          onClose={() => setComparisonData(null)}
          onInspect={setInspectedProduct}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart({ items: [], count: 0, total: 0 })}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        threads={threads}
        currentThreadId={threadId}
        onSelectThread={(tid) => {
          setThreadId(tid);
          setMessages([]);
        }}
        onNewThread={handleNewThread}
        profile={profile}
        onDeleteProfile={handleDeleteProfile}
      />
    </div>
  );
}
