// ─── useHomepageStats — real counts from Firestore ──────────────────────────
import { useState, useEffect } from 'react';
import { getHomepageCounts } from '../firebase/firestore';

const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return key && key !== 'your_api_key_here' && key.length > 10;
};

export function useHomepageStats() {
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount:   0,
    userCount:    0,
    reviewCount:  0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    getHomepageCounts()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { stats, loading };
}
