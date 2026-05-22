import { useState, useEffect } from 'react';

const RECENTLY_VIEWED_KEY = 'luxe_recently_viewed';
const MAX_ITEMS = 8;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to load recently viewed from localStorage", err);
    }
  }, []);

  const addRecentlyViewed = (product) => {
    if (!product || !product.id) return;
    
    setRecentlyViewed((prev) => {
      // Remove if already exists to move it to the front
      const filtered = prev.filter(p => String(p.id) !== String(product.id));
      
      // We only store essential data to keep localStorage small
      const miniProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image || product.images?.[0],
        category: product.category,
        badge: product.badge
      };
      
      const updated = [miniProduct, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to save recently viewed to localStorage", err);
      }
      
      return updated;
    });
  };

  return { recentlyViewed, addRecentlyViewed };
};
