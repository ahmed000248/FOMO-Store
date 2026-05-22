// ─── Review System — full reviews UI for product pages ──────────────────────
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiStarFill, RiStarLine, RiVerifiedBadgeFill,
  RiUserLine, RiCheckLine, RiEditLine,
} from 'react-icons/ri';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../context/useAuth';

// ── Star rating selector ─────────────────────────────────────────────────────
function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-2xl transition-transform hover:scale-110"
        >
          {star <= (hovered || value)
            ? <RiStarFill className="text-accent-amber" />
            : <RiStarLine className="text-text-muted/30" />}
        </button>
      ))}
    </div>
  );
}

// ── Individual review card ───────────────────────────────────────────────────
export function ReviewCard({ review }) {
  const date = review.createdAt?.toDate
    ? review.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  const initials = (review.userName || 'V B')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm">{review.userName || 'Verified Buyer'}</p>
            {review.verified && (
              <div className="flex items-center gap-1 mt-0.5">
                <RiVerifiedBadgeFill className="text-accent-emerald" size={11} />
                <span className="text-accent-emerald text-xs font-medium">Verified Purchase</span>
              </div>
            )}
          </div>
        </div>
        {date && <span className="text-text-muted text-xs flex-shrink-0">{date}</span>}
      </div>

      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <RiStarFill
            key={i}
            size={13}
            className={i < Math.round(review.rating) ? 'text-accent-amber' : 'text-text-muted/20'}
          />
        ))}
      </div>

      <p className="text-text-secondary text-sm leading-relaxed">{review.comment}</p>
    </motion.div>
  );
}

// ── Review submission form ───────────────────────────────────────────────────
function ReviewForm({ productId, onSuccess }) {
  const { user } = useAuth();
  const { submitReview, submitting, userReview } = useReviews(productId);
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [name,    setName]    = useState(user?.displayName || '');

  if (userReview) {
    return (
      <div className="glass rounded-2xl p-6 border border-accent-emerald/20 text-center">
        <div className="w-12 h-12 rounded-full bg-accent-emerald/20 flex items-center justify-center mx-auto mb-3">
          <RiCheckLine className="text-accent-emerald" size={22} />
        </div>
        <p className="text-text-primary font-semibold">Review Submitted</p>
        <p className="text-text-muted text-sm mt-1">Thank you for sharing your experience!</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/5 text-center">
        <RiUserLine className="text-text-muted mx-auto mb-3" size={28} />
        <p className="text-text-secondary mb-4">Sign in to leave a review</p>
        <Link to="/login" className="btn-primary text-white text-sm px-6">Sign In</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitReview({ rating, comment, name });
    if (success) { setComment(''); onSuccess?.(); }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <RiEditLine className="text-accent-violet" size={16} />
        <h4 className="text-text-primary font-semibold">Write a Review</h4>
      </div>

      <div>
        <label className="text-text-muted text-xs uppercase tracking-wider mb-2 block">Your Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="text-text-muted text-xs uppercase tracking-wider mb-2 block">Display Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm transition-colors"
        />
      </div>

      <div>
        <label className="text-text-muted text-xs uppercase tracking-wider mb-2 block">Your Review</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          required
          className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm resize-none transition-colors"
        />
      </div>

      <motion.button
        type="submit"
        disabled={submitting || !comment.trim()}
        whileHover={{ scale: submitting ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary text-white w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting
          ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Submitting...</>
          : 'Submit Review'}
      </motion.button>
    </form>
  );
}

// ── Full reviews section — used in ProductDetail ─────────────────────────────
export function ProductReviews({ productId }) {
  const { reviews, loading, avgRating, ratingDistribution } = useReviews(productId);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center">
            <div className="text-7xl font-display font-bold text-text-primary leading-none">
              {reviews.length ? avgRating.toFixed(1) : '—'}
            </div>
            <div className="flex justify-center gap-0.5 mt-3">
              {[...Array(5)].map((_, i) => (
                <RiStarFill
                  key={i}
                  size={18}
                  className={i < Math.round(avgRating) ? 'text-accent-amber' : 'text-text-muted/20'}
                />
              ))}
            </div>
            <p className="text-text-muted text-sm mt-2">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-text-muted text-xs w-2 text-right">{star}</span>
                <RiStarFill size={10} className="text-accent-amber flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full bg-accent-amber rounded-full"
                  />
                </div>
                <span className="text-text-muted text-xs w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write review toggle */}
      {!showForm && (
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 rounded-2xl glass border border-white/10 text-text-secondary hover:text-text-primary hover:border-accent-violet/30 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <RiEditLine size={15} /> Write a Review
        </motion.button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ReviewForm productId={productId} onSuccess={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full shimmer-skeleton" />
                <div className="h-4 shimmer-skeleton rounded-full w-1/3" />
              </div>
              <div className="h-3 shimmer-skeleton rounded-full w-1/4" />
              <div className="h-16 shimmer-skeleton rounded-xl" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-text-secondary font-semibold">No reviews yet</p>
          <p className="text-text-muted text-sm mt-1">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
