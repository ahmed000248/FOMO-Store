// ─── useReviews — product reviews with real-time updates ────────────────────
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  subscribeProductReviews,
  addReviewWithRatingUpdate,
  getUserProductReview,
  getFeaturedReviews,
} from '../firebase/firestore';
import { useAuth } from '../context/useAuth';

const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return key && key !== 'your_api_key_here' && key.length > 10;
};

const toastStyle = {
  style: { background: '#1e293b', color: '#f8fafc', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)' },
};

export function useReviews(productId) {
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!productId || !isFirebaseConfigured()) { setLoading(false); return; }
    const unsub = subscribeProductReviews(productId, data => {
      setReviews(data);
      setLoading(false);
    });
    return unsub;
  }, [productId]);

  useEffect(() => {
    if (!productId || !user || !isFirebaseConfigured()) return;
    getUserProductReview(productId, user.uid).then(setUserReview).catch(() => {});
  }, [productId, user]);

  const submitReview = async ({ rating, comment, name }) => {
    if (!user)        { toast.error('Please sign in to leave a review', toastStyle); return false; }
    if (userReview)   { toast.error('You have already reviewed this product', toastStyle); return false; }
    if (!comment?.trim()) { toast.error('Please write a comment', toastStyle); return false; }

    setSubmitting(true);
    try {
      await addReviewWithRatingUpdate(productId, user.uid, {
        rating,
        comment: comment.trim(),
        userName:  name?.trim() || user.displayName || 'Verified Buyer',
        userEmail: user.email,
        verified:  true,
      });
      toast.success('Review submitted! Thank you.', toastStyle);
      // Mark as reviewed locally
      setUserReview({ rating, comment });
      return true;
    } catch {
      toast.error('Failed to submit review. Please try again.', toastStyle);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.round(r.rating) === star).length;
    return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  return { reviews, loading, submitting, userReview, submitReview, avgRating, ratingDistribution };
}

export function useFeaturedReviews(limitCount = 3) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) { setLoading(false); return; }
    getFeaturedReviews(limitCount)
      .then(data => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [limitCount]);

  return { reviews, loading };
}
