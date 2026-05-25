/**
 * AI Fashion Recommendation Service for FOMO Streetwear
 * 
 * Provides smart, dynamic outfitting and matching logic based on:
 * - Product Categories
 * - Color Harmonies & Matches
 * - Tags/Style indicators (extracted from descriptions/badges)
 * - Price ranges
 * - Recently viewed items
 * 
 * Extensible design allows standard client-side fallback or direct integration with
 * LLM API endpoints.
 */

// Helper to convert hex colors to visual group descriptors
const getColorGroup = (hex) => {
  if (!hex) return 'neutral';
  const h = hex.toLowerCase();
  if (['#1a1a1a', '#0a0a0a', '#2d2d2d', '#2d3748'].some(c => h.includes(c))) return 'dark';
  if (['#f5f5f0', '#e8e0d0', '#ffffff', '#fff'].some(c => h.includes(c))) return 'light';
  if (['#3d4a2d', '#2d4a3e', '#1a3d2e'].some(c => h.includes(c))) return 'earthy';
  if (['#8b5cf6', '#4a1942', '#accent', '#818cf8'].some(c => h.includes(c))) return 'vibrant';
  return 'neutral';
};

/**
 * Calculates similarities between two products.
 * Returns a score between 0 and 1.
 */
export const calculateSimilarity = (prodA, prodB) => {
  if (!prodA || !prodB || String(prodA.id) === String(prodB.id)) return 0;
  
  let score = 0;
  
  // 1. Same category match
  if (prodA.category === prodB.category) {
    score += 0.3;
  }
  
  // 2. Color affinity match (complimentary or matching color group)
  const colorsA = prodA.colors || [];
  const colorsB = prodB.colors || [];
  const hasColorOverlap = colorsA.some(cA => 
    colorsB.some(cB => getColorGroup(cA) === getColorGroup(cB))
  );
  if (hasColorOverlap) {
    score += 0.25;
  }
  
  // 3. Price range alignment (within 30%)
  const priceDiff = Math.abs(prodA.price - prodB.price);
  const avgPrice = (prodA.price + prodB.price) / 2;
  if (priceDiff / avgPrice <= 0.3) {
    score += 0.2;
  }
  
  // 4. Style Tag affinity (parsed from description & badges)
  const getTags = (p) => {
    const descWords = (p.description || '').toLowerCase().split(/\s+/);
    const tags = new Set();
    if (p.badge) tags.add(p.badge.toLowerCase());
    if (p.isTrending) tags.add('trending');
    if (p.isNew) tags.add('new');
    
    // Extract fashion keywords
    ['oversized', 'heavyweight', 'minimal', 'utility', 'denim', 'knit', 'streetwear', 'relaxed', 'premium'].forEach(word => {
      if (descWords.includes(word)) tags.add(word);
    });
    return tags;
  };
  
  const tagsA = getTags(prodA);
  const tagsB = getTags(prodB);
  
  let matchCount = 0;
  tagsA.forEach(t => {
    if (tagsB.has(t)) matchCount++;
  });
  
  if (tagsA.size > 0 && tagsB.size > 0) {
    score += (matchCount / Math.max(tagsA.size, tagsB.size)) * 0.25;
  }
  
  return Math.min(score, 1.0);
};

/**
 * Returns products styled specifically for the user.
 */
export const getStyledForYou = (currentProduct, allProducts, recentlyViewed = []) => {
  if (!currentProduct || !allProducts || allProducts.length === 0) return [];
  
  // Exclude current product
  const candidates = allProducts.filter(p => String(p.id) !== String(currentProduct.id));
  
  // Score candidates
  const scored = candidates.map(prod => {
    let baseScore = calculateSimilarity(currentProduct, prod);
    
    // Boost if similar to recently viewed items (user affinity)
    if (recentlyViewed.length > 0) {
      const recentBoosts = recentlyViewed
        .filter(r => String(r.id) !== String(currentProduct.id))
        .map(r => calculateSimilarity(r, prod));
      const maxRecentBoost = Math.max(...recentBoosts, 0);
      baseScore += maxRecentBoost * 0.15;
    }
    
    return { prod, score: baseScore };
  });
  
  // Sort descending and return top matches
  return scored
    .sort((a, b) => b.score - a.score)
    .map(x => x.prod)
    .slice(0, 6);
};

/**
 * Outfitting Logic: Returns items that complete the outfit with the current product.
 * Standard streetwear rulebook:
 * - If top (T-shirt, Shirt, Knitwear), recommend Bottoms & Outerwear.
 * - If bottom, recommend Tops, T-shirts & Outerwear.
 * - If outerwear, recommend Bottoms & T-shirts.
 */
export const getCompleteTheFit = (currentProduct, allProducts) => {
  if (!currentProduct || !allProducts || allProducts.length === 0) return [];
  
  const candidates = allProducts.filter(p => String(p.id) !== String(currentProduct.id));
  const cat = (currentProduct.category || '').toLowerCase();
  
  let targetCategories = [];
  if (['t-shirts', 'shirts', 'knitwear', 'tops'].some(c => cat.includes(c))) {
    targetCategories = ['bottoms', 'outerwear', 'accessories'];
  } else if (['bottoms', 'pants', 'jeans', 'cargos'].some(c => cat.includes(c))) {
    targetCategories = ['t-shirts', 'shirts', 'tops', 'outerwear', 'knitwear'];
  } else if (['outerwear', 'jackets', 'coats', 'bomber'].some(c => cat.includes(c))) {
    targetCategories = ['bottoms', 't-shirts', 'shirts', 'knitwear', 'tops'];
  } else {
    // Default fallback mixes matching outfits
    targetCategories = ['bottoms', 'outerwear', 't-shirts'];
  }
  
  // Score matching categories
  const scored = candidates.map(prod => {
    const prodCat = (prod.category || '').toLowerCase();
    let score = calculateSimilarity(currentProduct, prod);
    
    const categoryIndex = targetCategories.findIndex(tc => prodCat.includes(tc) || tc.includes(prodCat));
    if (categoryIndex !== -1) {
      // Massive weight boost for outfitting categories
      score += 0.5 - (categoryIndex * 0.1); 
    }
    
    return { prod, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .map(x => x.prod)
    .slice(0, 6);
};

/**
 * Recommended Essentials / You May Also Like
 * High ratings, trending tags, solid category overlap.
 */
export const getRecommendedEssentials = (currentProduct, allProducts) => {
  if (!currentProduct || !allProducts || allProducts.length === 0) return [];
  
  const candidates = allProducts.filter(p => String(p.id) !== String(currentProduct.id));
  
  const scored = candidates.map(prod => {
    let score = calculateSimilarity(currentProduct, prod) * 0.5; // weight similarity moderately
    
    // Weight ratings highly
    if (prod.rating) {
      score += (prod.rating / 5) * 0.3;
    }
    // Trending booster
    if (prod.isTrending || prod.badge === 'Trending') {
      score += 0.15;
    }
    // New booster
    if (prod.isNew || prod.badge === 'New') {
      score += 0.1;
    }
    
    return { prod, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .map(x => x.prod)
    .slice(0, 6);
};
