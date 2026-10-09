/**
 * API client communicating with the FastAPI Threadly backend.
 */

export async function fetchOptions() {
  const res = await fetch('/api/options');
  if (!res.ok) throw new Error('Failed to load store options');
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function fetchCart(userId) {
  const res = await fetch(`/api/cart?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function addToCart(userId, productId, size, qty = 1) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, product_id: productId, size, qty }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Could not add to bag');
  }
  return res.json();
}

export async function updateCartQty(userId, productId, size, qty) {
  const res = await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, product_id: productId, size, qty }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Could not update bag');
  }
  return res.json();
}

export async function removeFromCart(userId, productId, size) {
  let url = `/api/cart/${productId}?user_id=${encodeURIComponent(userId)}`;
  if (size) url += `&size=${encodeURIComponent(size)}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Could not remove item');
  return res.json();
}

export async function fetchProfile(userId) {
  const res = await fetch(`/api/profile/${encodeURIComponent(userId)}`);
  if (!res.ok) return {};
  return res.json();
}

export async function deleteProfile(userId) {
  const res = await fetch(`/api/profile/${encodeURIComponent(userId)}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchThreads(userId) {
  const res = await fetch(`/api/threads/${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function compareProducts(productIds) {
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_ids: productIds }),
  });
  if (!res.ok) throw new Error('Comparison failed');
  return res.json();
}

/**
 * Stream a chat response via SSE. Dispatches typed callback events.
 */
export async function streamChat({
  userId,
  threadId,
  message,
  preferences,
  onStatus,
  onToken,
  onProducts,
  onCustom,
  onNotice,
  onError,
  onDone,
}) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      thread_id: threadId,
      message,
      preferences,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const chunk of lines) {
      if (!chunk.trim()) continue;
      const eventMatch = chunk.match(/^event:\s*(.+)$/m);
      const dataMatch = chunk.match(/^data:\s*(.+)$/m);

      if (eventMatch && dataMatch) {
        const eventType = eventMatch[1].trim();
        let data = {};
        try {
          data = JSON.parse(dataMatch[1].trim());
        } catch {
          data = dataMatch[1].trim();
        }

        switch (eventType) {
          case 'status':
            onStatus?.(data);
            break;
          case 'token':
            onToken?.(data.delta);
            break;
          case 'products':
            onProducts?.(data.products);
            break;
          case 'comparison':
          case 'outfit':
          case 'size_advice':
          case 'cart':
          case 'memory':
            onCustom?.(eventType, data);
            break;
          case 'notice':
            onNotice?.(data.message);
            break;
          case 'error':
            onError?.(data.message);
            break;
          case 'done':
            onDone?.(data);
            break;
          default:
            break;
        }
      }
    }
  }

  onDone?.();
}
