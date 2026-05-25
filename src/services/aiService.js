/**
 * AI Fashion Stylist Service
 * 
 * Core intelligence hub supporting:
 * 1. External LLM Integration (Gemini / OpenAI) via environment variables
 * 2. Intelligent, highly robust Local Streetwear NLP model for real-time brand answers
 *    and clickable product parsing.
 * 
 * Supports dynamic product injection from active Firestore streams.
 */
import { products as localSeedProducts } from '../data/products';

// Retrieve keys securely from Vite env context
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

/**
 * Generates dynamic system prompt with active products list injected.
 */
const getSystemPrompt = (productsList) => `
You are the FOMO AI Personal Stylist, a luxury streetwear hype curator. 
Your tone is Gen Z, confident, minimal, modern, and highly fashion-fluent. 
Keep answers brief (2-4 sentences), incredibly stylish, and use terms like "go hard", "clean", "drip", "premium cut", "if you know you know" (IYKYK).
Suggest products from the catalog that match the style. 
Here is a list of catalog items:
${productsList.map(p => `- "${p.name}" (ID: ${p.id}, Category: ${p.category}, Price: ${p.price}, colors: ${p.colors?.join(', ') || ''})`).join('\n')}
`;

/**
 * Call Gemini API endpoint
 */
async function callGemini(message, productsList) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${getSystemPrompt(productsList)}\n\nUser request: "${message}"` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      })
    });
    
    if (!response.ok) throw new Error(`Gemini API responded with status ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    console.warn("Gemini API call failed, falling back to local engine", err);
    throw err;
  }
}

/**
 * Call OpenAI API endpoint
 */
async function callOpenAI(message, productsList) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: getSystemPrompt(productsList) },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    if (!response.ok) throw new Error(`OpenAI API responded with status ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.warn("OpenAI API call failed, falling back to local engine", err);
    throw err;
  }
}

/**
 * High-fidelity local streetwear styling model fallback.
 * Processes keywords, applies fashion heuristics, and recommends products dynamically.
 */
function localStylistFallback(message, productsList) {
  const msg = message.toLowerCase();
  
  // Custom response pools depending on style keywords
  if (msg.includes('hoodie') || msg.includes('tee') || msg.includes('shirt') || msg.includes('top')) {
    const matchingTee = productsList.find(p => (p.category || '').toLowerCase().includes('shirt') || (p.category || '').toLowerCase().includes('top')) || productsList[0];
    const matchingCargo = productsList.find(p => p.name.toLowerCase().includes('cargo') || (p.category || '').toLowerCase().includes('bottom')) || productsList[1];
    const matchingJacket = productsList.find(p => (p.category || '').toLowerCase().includes('outer') || (p.category || '').toLowerCase().includes('jacket')) || productsList[0];
    
    return {
      text: `An oversized silhouette is the baseline of modern luxury streetwear. Pairing the premium ${matchingTee?.name || 'T-Shirt'} with sleek ${matchingCargo?.name || 'Bottoms'} would go absolutely hard. Throw on the ${matchingJacket?.name || 'Jacket'} for that ultimate layered structural detail. If you know, you know.`,
      recommendedProductIds: [matchingTee?.id, matchingCargo?.id, matchingJacket?.id].filter(Boolean)
    };
  }
  
  if (msg.includes('cargo') || msg.includes('pants') || msg.includes('bottom') || msg.includes('jean')) {
    const matchingCargo = productsList.find(p => (p.category || '').toLowerCase().includes('bottom') || p.name.toLowerCase().includes('pants')) || productsList[1];
    const matchingTee = productsList.find(p => (p.category || '').toLowerCase().includes('shirt') || (p.category || '').toLowerCase().includes('top')) || productsList[0];
    const matchingSweater = productsList.find(p => (p.category || '').toLowerCase().includes('knit') || (p.category || '').toLowerCase().includes('sweater')) || productsList[0];
    
    return {
      text: `Cargo pants and utility bottoms dictate the modern urban stance. Keep the bottom heavy and layer up with the ${matchingTee?.name || 'Tee'} or our Cloud-like ${matchingSweater?.name || 'Sweater'}. It creates a premium drape ratio that commands absolute presence in the room.`,
      recommendedProductIds: [matchingCargo?.id, matchingTee?.id, matchingSweater?.id].filter(Boolean)
    };
  }

  if (msg.includes('winter') || msg.includes('cold') || msg.includes('jacket') || msg.includes('sweater') || msg.includes('knit')) {
    const matchingJacket = productsList.find(p => (p.category || '').toLowerCase().includes('outer') || p.name.toLowerCase().includes('jacket')) || productsList[0];
    const matchingSweater = productsList.find(p => (p.category || '').toLowerCase().includes('knit') || (p.category || '').toLowerCase().includes('sweater')) || productsList[1];
    const matchingTee = productsList.find(p => (p.category || '').toLowerCase().includes('shirt') || (p.category || '').toLowerCase().includes('top')) || productsList[0];

    return {
      text: `Cold weather dictates heavyweight structures and high-end textures. Layer our technical ${matchingJacket?.name || 'Jacket'} over the merino-blend ${matchingSweater?.name || 'Sweater'} to establish structured luxury. Absolute protection with standard setting street aesthetics.`,
      recommendedProductIds: [matchingJacket?.id, matchingSweater?.id, matchingTee?.id].filter(Boolean)
    };
  }

  if (msg.includes('minimal') || msg.includes('clean') || msg.includes('silent')) {
    const matchingTee = productsList.find(p => p.name.toLowerCase().includes('obsidian') || p.name.toLowerCase().includes('stealth') || (p.category || '').toLowerCase().includes('shirt')) || productsList[0];
    const matchingPants = productsList.find(p => p.name.toLowerCase().includes('stealth') || (p.category || '').toLowerCase().includes('bottom')) || productsList[1];
    
    return {
      text: `Dressed in silence is the ultimate sophistication. Our top pick for a minimal fit is the ${matchingTee?.name || 'Obsidian Tee'} paired back with the ${matchingPants?.name || 'Stealth Pants'}. Uncompromising premium fabrics, sleek monochrome lines, zero visual noise. Perfect simplicity.`,
      recommendedProductIds: [matchingTee?.id, matchingPants?.id].filter(Boolean)
    };
  }

  if (msg.includes('trend') || msg.includes('hype') || msg.includes('new') || msg.includes('drop')) {
    const trendingList = productsList.filter(p => p.isTrending || p.badge === 'Trending' || p.isNew).slice(0, 3);
    const listToUse = trendingList.length > 0 ? trendingList : productsList.slice(0, 3);
    const names = listToUse.map(p => p.name).join(', ');
    
    return {
      text: `The streets are moving fast, and right now the focus is fully on heavy custom fabrics and raw finishes. The hot items this drop are ${names || 'our essentials collection'}. Complete sellouts are close, so secure yours while the cart is open. IYKYK.`,
      recommendedProductIds: listToUse.map(p => p.id)
    };
  }

  // Default elegant fashion response
  const featured = productsList.slice(0, 3);
  return {
    text: `Streetwear is not just about what you wear — it is about the posture and narrative of your style. For a timeless silhouette, you can't go wrong with our custom-engineered essentials. Start with the ${featured[0]?.name || 'Premium Silhouette'} and let the fabric do the talking.`,
    recommendedProductIds: featured.map(p => p.id)
  };
}

/**
 * Extracts product IDs mentioned in a response string, to allow the UI
 * to render beautiful product recommendation shortcuts under the chat bubble.
 */
export const extractProductIds = (text, productsList) => {
  const ids = [];
  productsList.forEach(p => {
    // If the text contains the product's name
    if (text.toLowerCase().includes(p.name.toLowerCase())) {
      ids.push(p.id);
    }
  });
  return [...new Set(ids)];
};

/**
 * Generate Styling Response
 */
export const generateStylistResponse = async (userMessage, activeProducts = []) => {
  const result = {
    text: '',
    recommendedProducts: []
  };

  // Fallback to local seeds if the active database list has no products yet
  const productsList = activeProducts && activeProducts.length > 0 ? activeProducts : localSeedProducts;

  // If external credentials exist, try them
  if (GEMINI_API_KEY) {
    try {
      const apiText = await callGemini(userMessage, productsList);
      if (apiText) {
        result.text = apiText;
        const matchedIds = extractProductIds(apiText, productsList);
        result.recommendedProducts = productsList.filter(p => matchedIds.includes(p.id));
        return result;
      }
    } catch (e) {
      console.warn("Gemini call fell back to local calculations.");
    }
  }

  if (OPENAI_API_KEY && !result.text) {
    try {
      const apiText = await callOpenAI(userMessage, productsList);
      if (apiText) {
        result.text = apiText;
        const matchedIds = extractProductIds(apiText, productsList);
        result.recommendedProducts = productsList.filter(p => matchedIds.includes(p.id));
        return result;
      }
    } catch (e) {
      console.warn("OpenAI call fell back to local calculations.");
    }
  }

  // Local model fallback execution
  const fallback = localStylistFallback(userMessage, productsList);
  result.text = fallback.text;
  result.recommendedProducts = productsList.filter(p => fallback.recommendedProductIds.includes(p.id));
  
  return result;
};
