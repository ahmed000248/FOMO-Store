import { products as localSeedProducts } from '../data/products';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// ─── System prompt injected as Gemini system_instruction ──────────────────────
function buildSystemPrompt(productsList, settings) {
  const storeName = settings?.storeName || 'LUXE';
  const currency  = settings?.currencySymbol || 'Rs.';
  const freeAt    = settings?.freeShippingThreshold || 3000;

  const catalog = productsList
    .map(p =>
      `ID:${p.id} | ${p.name} | ${p.category || p.categorySlug || 'General'} | ` +
      `${currency}${p.price} | Colors: ${Array.isArray(p.colors) ? p.colors.join(', ') : 'various'} | ` +
      `Sizes: ${Array.isArray(p.sizes) ? p.sizes.join(', ') : 'various'} | ` +
      `${p.stock === 0 ? 'Out of Stock' : 'In Stock'}`
    )
    .join('\n');

  return `You are Nova, a smart and friendly AI shopping assistant for ${storeName}.

Policies:
- Shipping: 3–5 business days. Free shipping on orders over ${currency}${freeAt}.
- Returns: 30-day free returns, no questions asked.
- Payments: Cash on Delivery, Bank Transfer, JazzCash, EasyPaisa.

Product Catalog (use ONLY these IDs when recommending products):
${catalog}

Rules:
1. When a customer asks to see products, browse, or find items — output a PRODUCTS block:
   PRODUCTS: [{"id":"1"},{"id":"3"}]
   Then add a short helpful sentence after the block.
2. Use only valid IDs from the catalog above. Never invent products.
3. Keep every reply warm, concise (2–3 sentences max after any PRODUCTS block).
4. If asked about topics unrelated to shopping, politely redirect.`;
}

// ─── Parse Gemini response for PRODUCTS block ─────────────────────────────────
function parseResponse(rawText, productsList) {
  const match = rawText.match(/PRODUCTS:\s*(\[[\s\S]*?\])/);
  let text = rawText.trim();
  let recommendedProducts = [];

  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      recommendedProducts = parsed
        .map(p => productsList.find(prod => String(prod.id) === String(p.id)))
        .filter(Boolean)
        .slice(0, 4);
    } catch {
      /* malformed JSON — silently skip product cards */
    }
    text = rawText.replace(/PRODUCTS:\s*\[[\s\S]*?\]/g, '').trim();
  }

  return {
    text: text || 'Here are some options for you!',
    recommendedProducts,
  };
}

// ─── Gemini API call with full conversation history ───────────────────────────
async function callGemini(userMessage, conversationHistory, productsList, settings) {
  const systemInstruction = buildSystemPrompt(productsList, settings);

  // conversationHistory already ends with the current user message.
  // Build prior context (everything before it), then append the current message cleanly.
  const priorMsgs = conversationHistory.slice(0, -1).filter(m => m.id !== 'welcome' && m.text);
  const contents = priorMsgs.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    // Strip PRODUCTS blocks from prior bot messages so history stays clean
    parts: [{ text: msg.text.replace(/PRODUCTS:\s*\[[\s\S]*?\]/g, '').trim() || '...' }],
  }));

  // Current user message (the last entry in conversationHistory)
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${err?.error?.message || 'API error'}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── Local fallback (no API key or Gemini unreachable) ────────────────────────
function localFallback(message, productsList) {
  const msg = message.toLowerCase();

  if (msg.includes('ship') || msg.includes('deliver')) {
    return {
      text: 'We offer standard shipping in 3–5 business days. Orders over Rs.3000 ship free! Express delivery is also available at checkout.',
      recommendedProductIds: [],
    };
  }
  if (msg.includes('return') || msg.includes('refund') || msg.includes('exchange')) {
    return {
      text: 'We have a hassle-free 30-day return policy. Just reach out to our support team and we\'ll take care of everything.',
      recommendedProductIds: [],
    };
  }
  if (msg.includes('pay') || msg.includes('cash') || msg.includes('cod') || msg.includes('card')) {
    return {
      text: 'We accept Cash on Delivery, Bank Transfer, JazzCash, and EasyPaisa. Choose whatever is most convenient for you!',
      recommendedProductIds: [],
    };
  }

  const byCat = (...cats) =>
    productsList.filter(p =>
      cats.some(c => (p.category || p.categorySlug || '').toLowerCase().includes(c))
    ).slice(0, 3);

  if (msg.includes('jacket') || msg.includes('outer') || msg.includes('coat')) {
    return { text: 'Here are some great outerwear picks for you!', recommendedProductIds: byCat('outer', 'jacket').map(p => p.id) };
  }
  if (msg.includes('pant') || msg.includes('bottom') || msg.includes('jean') || msg.includes('cargo')) {
    return { text: 'Check out these bottom wear options!', recommendedProductIds: byCat('bottom').map(p => p.id) };
  }
  if (msg.includes('shirt') || msg.includes('tee') || msg.includes('top')) {
    return { text: 'Here are some shirts and tops you might love!', recommendedProductIds: byCat('shirt', 'top', 't-shirt').map(p => p.id) };
  }
  if (msg.includes('knit') || msg.includes('sweater') || msg.includes('sweat')) {
    return { text: 'Cosy knitwear picks just for you!', recommendedProductIds: byCat('knit').map(p => p.id) };
  }
  if (msg.includes('sale') || msg.includes('discount') || msg.includes('deal') || msg.includes('cheap')) {
    const sale = productsList.filter(p => p.isSale || p.badge === 'Sale').slice(0, 3);
    return { text: 'Here are our current sale items — great value on premium pieces!', recommendedProductIds: sale.map(p => p.id) };
  }
  if (msg.includes('new') || msg.includes('latest') || msg.includes('arrival') || msg.includes('fresh')) {
    const newest = productsList.filter(p => p.isNew || p.badge === 'New').slice(0, 3);
    return { text: 'Fresh new arrivals just dropped!', recommendedProductIds: newest.map(p => p.id) };
  }

  const featured = productsList.slice(0, 3);
  return {
    text: "Here are some of our most popular pieces to get you started. Let me know what style or size you're looking for!",
    recommendedProductIds: featured.map(p => p.id),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const generateStylistResponse = async (
  userMessage,
  conversationHistory = [],
  activeProducts = [],
  settings = null,
) => {
  const productsList = activeProducts?.length > 0 ? activeProducts : localSeedProducts;

  if (GEMINI_API_KEY) {
    try {
      const rawText = await callGemini(userMessage, conversationHistory, productsList, settings);
      if (rawText) return parseResponse(rawText, productsList);
    } catch (e) {
      console.warn('Gemini call failed — using local fallback:', e.message);
    }
  }

  const fallback = localFallback(userMessage, productsList);
  return {
    text: fallback.text,
    recommendedProducts: productsList.filter(p => fallback.recommendedProductIds.includes(p.id)),
  };
};
