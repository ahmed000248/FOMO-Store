import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { logSiteVisit } from './firebase/firestore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import { ScrollProgress, BackToTop } from './components/ui/ScrollProgress';
import { RiWhatsappLine } from 'react-icons/ri';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import { Cart, Wishlist, Checkout } from './pages/CartCheckout';
import { Login, About, Contact, Orders } from './pages/OtherPages';

// Admin
import AdminLayout from './admin/AdminLayout';
import AdminOverview from './admin/AdminOverview';
import AdminProducts from './admin/AdminProducts';
import { AdminOrders, AdminCustomers } from './admin/AdminOrdersCustomers';
import AdminSettings from './admin/AdminSettings';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';

// Guards
import { ProtectedRoute, AdminRoute, GuestRoute, LoadingScreen } from './components/auth/ProtectedRoute';

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
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { settings } = useSettings();
  const { isAdmin } = useAuth() || {};

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
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
      <Routes>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index    element={<AdminOverview />} />
          <Route path="products"  element={<AdminProducts />} />
          <Route path="orders"    element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="min-h-screen noise-overlay">
      <ScrollProgress />
      <Navbar darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} onCartOpen={() => setCartOpen(true)} />
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          <Route path="/"              element={<Home />} />
          <Route path="/products"      element={<Products />} />
          <Route path="/products/:id"  element={<ProductDetail />} />
          <Route path="/about"         element={<About />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/login"         element={<GuestRoute><Login /></GuestRoute>} />

          {/* Protected routes */}
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
