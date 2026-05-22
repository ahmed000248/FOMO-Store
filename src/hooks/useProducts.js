// ─── useProducts hook ─────────────────────────────────────────────────────────
// Falls back to local data when Firestore is unavailable / not configured.
import { useState, useEffect, useMemo } from 'react';
import { subscribeProducts, getProduct as fbGetProduct } from '../firebase/firestore';
import { products as localProducts, categories as localCategories } from '../data/products';

const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return key && key !== 'your_api_key_here' && key.length > 10;
};

// ── Hook: all products with filters ──────────────────────────────────────────
export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // use local seed data
      setProducts(localProducts);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Normalize 'all' → undefined so every "show everything" query
    // uses the same Firestore query and hits the same cache bucket.
    const cat = (filters.category && filters.category !== 'all') ? filters.category : undefined;
    const unsub = subscribeProducts(
      (data) => { setProducts(data); setLoading(false); },
      { category: cat },
    );
    return unsub;
  }, [filters.category]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q),
      );
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(p =>
        (p.categorySlug || p.category?.toLowerCase().replace(/\s/g, '-')) === filters.category,
      );
    }

    if (filters.priceMax && filters.priceMax < 500) {
      result = result.filter(p => (p.price ?? Infinity) <= filters.priceMax);
    }

    if (filters.badge) {
      result = result.filter(p => p.badge === filters.badge);
    }

    switch (filters.sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'new':        result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew)); break;
      default: break;
    }

    return result;
  }, [products, filters.search, filters.category, filters.priceMax, filters.sort, filters.badge]);

  return { products: filtered, allProducts: products, loading, error };
};

// ── Hook: single product ──────────────────────────────────────────────────────
export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    if (!isFirebaseConfigured()) {
      // numeric id = local data; string id = Firestore doc id
      const found = localProducts.find(p => String(p.id) === String(id));
      setProduct(found || null);
      setLoading(false);
      return;
    }

    fbGetProduct(id)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(err  => { setError(err);   setLoading(false); });
  }, [id]);

  return { product, loading, error };
};
