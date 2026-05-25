import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { logSiteVisit } from './firebase/firestore';
import { RiWhatsappLine } from 'react-icons/ri';

// Layout shell — always in the initial bundle
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import { ScrollProgress, BackToTop } from './components/ui/ScrollProgress';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';

// Guards
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/auth/ProtectedRoute';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Home          = lazy(() => import('./pages/Home'));
const Products      = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

// Named exports wrapped so lazy() gets a default export
const Cart     = lazy(() => import('./pages/CartCheckout').then(m => ({ default: m.Cart })));
const Wishlist = lazy(() => import('./pages/CartCheckout').then(m => ({ default: m.Wishlist })));
const Checkout = lazy(() => import('./pages/CartCheckout').then(m => ({ default: m.Checkout })));
const Login    = lazy(() => import('./pages/OtherPages').then(m => ({ default: m.Login })));
const About    = lazy(() => import('./pages/OtherPages').then(m => ({ default: m.About })));
const Contact  = lazy(() => import('./pages/OtherPages').then(m => ({ default: m.Contact })));
const Orders   = lazy(() => import('./pages/OtherPages').then(m => ({ default: m.Orders })));

// ─── Lazy-loaded admin (never downloaded by regular users) ────────────────────
const AdminLayout    = lazy(() => import('./admin/AdminLayout'));
const AdminOverview  = lazy(() => import('./admin/AdminOverview'));
const AdminProducts  = lazy(() => import('./admin/AdminProducts'));
const AdminOrders    = lazy(() => import('./admin/AdminOrdersCustomers').then(m => ({ default: m.AdminOrders })));
const AdminCustomers = lazy(() => import('./admin/AdminOrdersCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminSettings  = lazy(() => import('./admin/AdminSettings'));

// ─── Floating widget — deferred after first paint ────────────────────────────
const AIChatbotStylist = lazy(() => import('./components/ui/AIChatbotStylist'));

// Minimal inline spinner used as Suspense fallback
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-accent-violet/30 border-t-accent-violet animate-spin" />
    </div>
  );
}

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function MaintenancePage({ storeName }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="text-center max-w-md">
        <motion.div animate={{ scale: [0.9, 1.05, 1] }} transition={{ duration: 0.6 }}
          className="w-20 h-20 rounded-2xl bg-accent-amber/15 border border-accent-amber/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔧</span>
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-3">{storeName || 'LUXE'}</h1>
        <p className="text-text-muted text-lg mb-2">We'll be back soon</p>
        <p className="text-text-muted text-sm">We're performing scheduled maintenance. Please check back shortly.</p>
      </div>
    </div>
  );
}

function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('luxe_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { settings } = useSettings();
  const { isAdmin } = useAuth() || {};

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('luxe_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);
  useEffect(() => { setCartOpen(false); }, [location]);

  useEffect(() => {
    if (!sessionStorage.getItem('luxe_visited')) {
      logSiteVisit();
      sessionStorage.setItem('luxe_visited', 'true');
    }
  }, []);

  if (settings.maintenanceMode && !isAdmin && !isAdminRoute) {
    return <MaintenancePage storeName={settings.storeName} />;
  }

  if (isAdminRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index          element={<AdminOverview />} />
            <Route path="products"  element={<AdminProducts />} />
            <Route path="orders"    element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings"  element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen noise-overlay">
      <ScrollProgress />
      <Navbar darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} onCartOpen={() => setCartOpen(true)} />
      <PageTransition>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"              element={<Home />} />
            <Route path="/products"      element={<Products />} />
            <Route path="/products/:id"  element={<ProductDetail />} />
            <Route path="/about"         element={<About />} />
            <Route path="/contact"       element={<Contact />} />
            <Route path="/login"         element={<GuestRoute><Login /></GuestRoute>} />

            <Route path="/cart"      element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/wishlist"  element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/checkout"  element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders"    element={<ProtectedRoute><Orders /></ProtectedRoute>} />

            <Route path="*" element={
              <main className="pt-28 min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-8xl font-display font-bold gradient-text mb-4">404</p>
                  <p className="text-text-muted mb-6">Page not found.</p>
                  <a href="/" className="btn-primary text-white">Go Home</a>
                </div>
              </main>
            } />
          </Routes>
        </Suspense>
      </PageTransition>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <BackToTop />
      {settings.whatsapp && (
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all md:hidden"
          aria-label="Order on WhatsApp"
        >
          <RiWhatsappLine size={28} />
        </a>
      )}
      <Suspense fallback={null}>
        <AIChatbotStylist />
      </Suspense>
      <Toaster position="bottom-right" toastOptions={{
        duration: 3000,
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', fontSize: '14px' },
      }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
