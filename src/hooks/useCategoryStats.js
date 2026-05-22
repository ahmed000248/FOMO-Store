// ─── useCategoryStats — real-time product counts per category ───────────────
import { useState, useEffect } from 'react';
import { subscribeCategoryCounts } from '../firebase/firestore';

const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return key && key !== 'your_api_key_here' && key.length > 10;
};

export function useCategoryStats() {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const unsub = subscribeCategoryCounts(counts => {
      setCategoryCounts(counts);
      setLoading(false);
    });
    return unsub;
  }, []);

  const getCount = (slugOrSlugs) => {
    if (Array.isArray(slugOrSlugs)) {
      return slugOrSlugs.reduce((sum, s) => sum + (categoryCounts[s] || 0), 0);
    }
    return categoryCounts[slugOrSlugs] || 0;
  };

  const totalProducts = Object.values(categoryCounts).reduce((s, n) => s + n, 0);

  return { categoryCounts, getCount, totalProducts, loading };
}
