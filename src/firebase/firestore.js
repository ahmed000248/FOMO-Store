// ─── Firestore Helpers ────────────────────────────────────────────────────────
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  startAfter, onSnapshot, serverTimestamp, increment,
  writeBatch, arrayUnion, arrayRemove, Timestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Fetch all products, optionally filtered by category */
export const getProducts = async ({ category, sortField = 'createdAt', sortDir = 'desc', pageLimit = 20, lastDoc = null } = {}) => {
  let q = collection(db, 'products');
  const constraints = [orderBy(sortField, sortDir), limit(pageLimit)];
  if (category && category !== 'all') constraints.unshift(where('categorySlug', '==', category));
  if (lastDoc) constraints.push(startAfter(lastDoc));
  const snap = await getDocs(query(q, ...constraints));
  return {
    products: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageLimit,
  };
};

/** Real-time listener for products */
export const subscribeProducts = (callback, filters = {}) => {
  // Plain collection scan when no category — avoids excluding docs that lack createdAt
  if (!filters.category || filters.category === 'all') {
    return onSnapshot(collection(db, 'products'), snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      callback(docs);
    });
  }
  // Category filter: compound query (requires composite index if adding orderBy)
  return onSnapshot(
    query(collection(db, 'products'), where('categorySlug', '==', filters.category)),
    snap => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      callback(docs);
    },
  );
};

/** Get a single product by id */
export const getProduct = async (id) => {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/** Add a new product */
export const addProduct = async (data) =>
  addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

/** Update existing product */
export const updateProduct = async (id, data) =>
  updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });

/** Delete product */
export const deleteProduct = async (id) => deleteDoc(doc(db, 'products', id));

// ═══════════════════════════════════════════════════════════════════════════════
// CART  (stored per user in Firestore)
// ═══════════════════════════════════════════════════════════════════════════════

const cartRef = (uid) => doc(db, 'carts', uid);

export const getCart = async (uid) => {
  const snap = await getDoc(cartRef(uid));
  return snap.exists() ? snap.data().items || [] : [];
};

export const saveCart = (uid, items) =>
  setDoc(cartRef(uid), { items, updatedAt: serverTimestamp() }, { merge: true });

export const subscribeCart = (uid, callback) =>
  onSnapshot(cartRef(uid), snap => callback(snap.exists() ? snap.data().items || [] : []));

// ═══════════════════════════════════════════════════════════════════════════════
// WISHLIST
// ═══════════════════════════════════════════════════════════════════════════════

const wishlistRef = (uid) => doc(db, 'wishlists', uid);

export const getWishlist = async (uid) => {
  const snap = await getDoc(wishlistRef(uid));
  return snap.exists() ? snap.data().items || [] : [];
};

export const saveWishlist = (uid, items) =>
  setDoc(wishlistRef(uid), { items, updatedAt: serverTimestamp() }, { merge: true });

export const subscribeWishlist = (uid, callback) =>
  onSnapshot(wishlistRef(uid), snap => callback(snap.exists() ? snap.data().items || [] : []));

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a new order */
export const createOrder = async (uid, orderData) => {
  const orderId = `LUXE-${Date.now().toString(36).toUpperCase()}`;
  const ref = doc(db, 'orders', orderId);
  await setDoc(ref, {
    ...orderData,
    orderId,
    uid,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return orderId;
};

/** Get all orders for a user */
export const getUserOrders = async (uid) => {
  const snap = await getDocs(query(collection(db, 'orders'), where('uid', '==', uid)));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

/** Real-time user orders */
export const subscribeUserOrders = (uid, callback) => {
  return onSnapshot(query(collection(db, 'orders'), where('uid', '==', uid)), snap => {
    const docs = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(docs);
  });
};

/** Get all orders (admin) */
export const getAllOrders = async () => {
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Subscribe to all orders (admin live) */
export const subscribeAllOrders = (callback) =>
  onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

/** Update order status */
export const updateOrderStatus = (orderId, status) =>
  updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() });

/** Get single order */
export const getOrder = async (orderId) => {
  const snap = await getDoc(doc(db, 'orders', orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ═══════════════════════════════════════════════════════════════════════════════
// USERS (admin)
// ═══════════════════════════════════════════════════════════════════════════════

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateUserRole = (uid, role) =>
  updateDoc(doc(db, 'users', uid), { role });

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════

export const getProductReviews = async (productId) => {
  const snap = await getDocs(query(collection(db, 'reviews'), where('productId', '==', productId)));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

export const addReview = (productId, uid, data) =>
  addDoc(collection(db, 'reviews'), { ...data, productId, uid, createdAt: serverTimestamp() });

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN STATS
// ═══════════════════════════════════════════════════════════════════════════════

export const getAdminStats = async () => {
  const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'users')),
  ]);
  const orders = ordersSnap.docs.map(d => d.data());
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  return {
    totalOrders:   orders.length,
    totalProducts: productsSnap.size,
    totalUsers:    usersSnap.size,
    totalRevenue:  revenue,
    pendingOrders: pending,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEED — populate Firestore with local product data (run once from admin panel)
// ═══════════════════════════════════════════════════════════════════════════════

export const seedProducts = async (products) => {
  const batch = writeBatch(db);
  products.forEach(p => {
    const ref = doc(collection(db, 'products'));
    batch.set(ref, { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE STATS — efficient count queries (no full document reads)
// ═══════════════════════════════════════════════════════════════════════════════

export const getHomepageCounts = async () => {
  try {
    const [productSnap, orderSnap, userSnap, reviewSnap] = await Promise.all([
      getCountFromServer(collection(db, 'products')),
      getCountFromServer(collection(db, 'orders')),
      getCountFromServer(collection(db, 'users')),
      getCountFromServer(collection(db, 'reviews')),
    ]);
    return {
      productCount: productSnap.data().count,
      orderCount:   orderSnap.data().count,
      userCount:    userSnap.data().count,
      reviewCount:  reviewSnap.data().count,
    };
  } catch {
    return { productCount: 0, orderCount: 0, userCount: 0, reviewCount: 0 };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY STATS — real-time product counts per category
// ═══════════════════════════════════════════════════════════════════════════════

export const subscribeCategoryCounts = (callback) =>
  onSnapshot(collection(db, 'products'), snap => {
    const counts = {};
    snap.docs.forEach(d => {
      const slug = d.data().categorySlug || 'other';
      counts[slug] = (counts[slug] || 0) + 1;
    });
    callback(counts);
  });

export const getCategoryCountsOnce = async () => {
  const snap = await getDocs(collection(db, 'products'));
  const counts = {};
  snap.docs.forEach(d => {
    const slug = d.data().categorySlug || 'other';
    counts[slug] = (counts[slug] || 0) + 1;
  });
  return counts;
};

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEWS — real review system with rating updates
// ═══════════════════════════════════════════════════════════════════════════════

export const subscribeProductReviews = (productId, callback) => {
  const q = query(collection(db, 'reviews'), where('productId', '==', productId));
  return onSnapshot(q, snap => {
    const docs = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(docs);
  });
};

export const addReviewWithRatingUpdate = async (productId, uid, reviewData) => {
  await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    productId,
    uid,
    createdAt: serverTimestamp(),
  });
  // Recalculate average rating from all reviews for this product
  const reviewsSnap = await getDocs(
    query(collection(db, 'reviews'), where('productId', '==', productId))
  );
  const allReviews = reviewsSnap.docs.map(d => d.data());
  const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / allReviews.length;
  await updateDoc(doc(db, 'products', productId), {
    rating:   Math.round(avgRating * 10) / 10,
    reviews:  allReviews.length,
    updatedAt: serverTimestamp(),
  });
};

export const getUserProductReview = async (productId, uid) => {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    where('uid', '==', uid),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const getFeaturedReviews = async (limitCount = 6) => {
  const snap = await getDocs(collection(db, 'reviews'));
  const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return reviews
    .filter(r => (r.rating || 0) >= 4 && r.comment?.length > 20)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limitCount);
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ANALYTICS — real-time comprehensive stats
// ═══════════════════════════════════════════════════════════════════════════════

export const subscribeAdminStats = (callback) =>
  onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
    async ordersSnap => {
      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const revenue     = orders.reduce((s, o) => s + (o.total || 0), 0);
      const pending     = orders.filter(o => o.status === 'pending').length;
      const delivered   = orders.filter(o => o.status === 'delivered').length;
      const processing  = orders.filter(o => o.status === 'processing').length;
      const cancelled   = orders.filter(o => o.status === 'cancelled').length;
      const avgOrder    = orders.length ? revenue / orders.length : 0;

      // Revenue by day (last 7 days)
      const now = Date.now();
      const dayMs = 86400000;
      const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
        const dayStart = now - (6 - i) * dayMs;
        const dayEnd   = dayStart + dayMs;
        const total = orders
          .filter(o => {
            const ts = o.createdAt?.toDate?.()?.getTime?.() || 0;
            return ts >= dayStart && ts < dayEnd;
          })
          .reduce((s, o) => s + (o.total || 0), 0);
        return { day: new Date(dayStart).toLocaleDateString('en', { weekday: 'short' }), revenue: total };
      });

      try {
        const [productSnap, userSnap] = await Promise.all([
          getCountFromServer(collection(db, 'products')),
          getCountFromServer(collection(db, 'users')),
        ]);

        // Daily visits
        const today = new Date().toISOString().split('T')[0];
        const visitSnap = await getDoc(doc(db, 'analytics', `visits_${today}`));
        const todayVisits = visitSnap.exists() ? visitSnap.data().count : 0;

        callback({
          totalOrders:    orders.length,
          totalRevenue:   revenue,
          totalProducts:  productSnap.data().count,
          totalUsers:     userSnap.data().count,
          todayVisits:    todayVisits,
          pendingOrders:  pending,
          deliveredOrders: delivered,
          processingOrders: processing,
          cancelledOrders: cancelled,
          avgOrderValue:  avgOrder,
          dailyRevenue,
          recentOrders:   orders.slice(0, 10),
        });
      } catch {
        callback({
          totalOrders: orders.length, totalRevenue: revenue,
          totalProducts: 0, totalUsers: 0, todayVisits: 0,
          pendingOrders: pending, deliveredOrders: delivered,
          processingOrders: processing, cancelledOrders: cancelled,
          avgOrderValue: avgOrder, dailyRevenue,
          recentOrders: orders.slice(0, 10),
        });
      }
    }
  );

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS — basic daily visits tracking
// ═══════════════════════════════════════════════════════════════════════════════

export const logSiteVisit = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const ref = doc(db, 'analytics', `visits_${today}`);
    await setDoc(ref, {
      count: increment(1),
      date: today,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    // Ignore errors for analytics to prevent breaking UI
  }
};

// Top selling products — derived from order items
export const getTopSellingProducts = async (limitCount = 5) => {
  const ordersSnap = await getDocs(collection(db, 'orders'));
  const salesMap = {};
  ordersSnap.docs.forEach(d => {
    (d.data().items || []).forEach(item => {
      if (item.id) salesMap[item.id] = (salesMap[item.id] || 0) + (item.quantity || 1);
    });
  });
  const sorted = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, limitCount);
  const results = await Promise.all(
    sorted.map(([id, qty]) => getProduct(id).then(p => p ? { ...p, totalSold: qty } : null))
  );
  return results.filter(Boolean);
};

// Low stock products
export const getLowStockProducts = async (threshold = 5) => {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => typeof p.stock === 'number' && p.stock >= 0 && p.stock <= threshold);
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER — save subscribers to Firestore
// ═══════════════════════════════════════════════════════════════════════════════

export const subscribeNewsletter = async (email) => {
  const ref = doc(db, 'newsletter', email.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  await setDoc(ref, {
    email: email.toLowerCase(),
    subscribedAt: serverTimestamp(),
  }, { merge: true });
};

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY — stock management per product
// ═══════════════════════════════════════════════════════════════════════════════

export const updateProductStock = (productId, stock) =>
  updateDoc(doc(db, 'products', productId), { stock, updatedAt: serverTimestamp() });

// ═══════════════════════════════════════════════════════════════════════════════
// SITE SETTINGS — single document at settings/siteConfig
// ═══════════════════════════════════════════════════════════════════════════════

export const subscribeSettings = (callback, onError) =>
  onSnapshot(
    doc(db, 'settings', 'siteConfig'),
    snap => callback(snap.exists() ? snap.data() : null),
    err  => { console.warn('Settings listener error:', err.code); if (onError) onError(err); },
  );

export const getSettings = async () => {
  const snap = await getDoc(doc(db, 'settings', 'siteConfig'));
  return snap.exists() ? snap.data() : null;
};

export const updateSettings = async (data) => {
  await setDoc(
    doc(db, 'settings', 'siteConfig'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
};

export const decrementStock = (productId, qty = 1) =>
  updateDoc(doc(db, 'products', productId), {
    stock: increment(-qty),
    updatedAt: serverTimestamp(),
  });
