/**
 * AI Trend Analytics Service
 * 
 * Tracks storefront business intelligence events:
 * - Product Views
 * - Product Clicks
 * - Add to Cart actions
 * - Wishlist additions
 * - Purchases/Checkout successes
 * 
 * Integrates directly with Firestore (collection: 'analytics') with robust sandboxed offline fallbacks.
 */
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';

const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return key && key !== 'your_api_key_here' && key.length > 10;
};

// Local storage session key for analytic events tracking offline fallback
const LOCAL_ANALYTICS_KEY = 'fomo_local_analytics';

const getLocalEvents = () => {
  try {
    const list = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    return list ? JSON.parse(list) : [];
  } catch {
    return [];
  }
};

const saveLocalEvents = (events) => {
  try {
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(events));
  } catch {}
};

/**
 * Track an analytics event
 * @param {string} eventType - product_view, product_click, add_to_cart, wishlist_add, purchase
 * @param {object} metadata - { productId, productName, category, price, quantity, orderId }
 */
export const trackEvent = async (eventType, metadata = {}) => {
  const eventPayload = {
    eventType,
    ...metadata,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    sessionId: sessionStorage.getItem('fomo_analytics_session_id') || (() => {
      const sId = `session-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('fomo_analytics_session_id', sId);
      return sId;
    })()
  };

  // 1. If Firebase is active and user is authenticated, record in Firestore
  if (isFirebaseConfigured() && db && auth.currentUser) {
    try {
      const analyticsCollection = collection(db, 'analytics');
      await addDoc(analyticsCollection, {
        ...eventPayload,
        userId: auth.currentUser.uid, // associate with user
        timestamp: serverTimestamp() // use server side accurate timestamp
      });
      return;
    } catch (err) {
      console.warn("Failed to stream analytics event to Firestore, storing locally", err);
    }
  }

  // 2. Offline fallback (Local Storage logs)
  const localList = getLocalEvents();
  // Keep size constrained to avoid cluttering local storage
  if (localList.length > 300) localList.shift();
  localList.push(eventPayload);
  saveLocalEvents(localList);
};

/**
 * Retrieve compiled analytics logs (useful for initial dashboard hydrate)
 */
export const getAnalyticsLogs = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const analyticsCollection = collection(db, 'analytics');
      const snapshot = await getDocs(query(analyticsCollection, limit(150)));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Could not query Firestore analytics, returning local logs", err);
    }
  }

  return getLocalEvents();
};
