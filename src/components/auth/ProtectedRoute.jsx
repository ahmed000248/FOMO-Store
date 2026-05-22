// ─── Route Guards ─────────────────────────────────────────────────────────────
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';

// ── Full-page loading splash ──────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-white font-display font-bold text-2xl">L</span>
        </motion.div>
        <p className="text-text-muted text-sm tracking-widest">LOADING...</p>
      </div>
    </div>
  );
}

// ── Protected route — requires login ─────────────────────────────────────────
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// ── Admin route — requires admin role ────────────────────────────────────────
export function AdminRoute({ children }) {
  const { user, userDoc, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login"    state={{ from: location }} replace />;
  if (userDoc?.role?.trim() !== 'admin') return <Navigate to="/" replace />;
  return children;
}

// ── Guest-only route — redirects if already logged in ────────────────────────
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user)    return <Navigate to="/" replace />;
  return children;
}
