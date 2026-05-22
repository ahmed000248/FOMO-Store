// ─── Admin Dashboard Layout ───────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine, RiShoppingBagLine, RiListOrdered,
  RiUserLine, RiMenuLine, RiLogoutBoxLine,
  RiStoreLine, RiSettings3Line,
} from 'react-icons/ri';
import { useAuth } from '../context/useAuth';
import { subscribeAllOrders } from '../firebase/firestore';

const navItems = [
  { icon: RiDashboardLine, label: 'Overview', href: '/admin' },
  { icon: RiShoppingBagLine, label: 'Products', href: '/admin/products' },
  { icon: RiListOrdered, label: 'Orders', href: '/admin/orders' },
  { icon: RiUserLine, label: 'Customers', href: '/admin/customers' },
  { icon: RiSettings3Line, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, userDoc, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribeAllOrders(orders => {
      setPendingCount(orders.filter(o => o.status === 'pending').length);
    });
    return unsub;
  }, []);

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center">
            <span className="text-white font-display font-bold">L</span>
          </div>
          <div>
            <p className="font-display font-bold gradient-text text-lg leading-none">FOMO</p>
            <p className="text-text-muted text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
          const showBadge = href === '/admin/orders' && pendingCount > 0;
          return (
            <Link key={href} to={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${active ? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/20' : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}>
              <Icon size={18} />
              {label}
              {showBadge && (
                <span className="ml-auto min-w-[20px] h-5 rounded-full bg-accent-amber text-black text-[10px] font-bold flex items-center justify-center px-1">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
              {active && !showBadge && <motion.div layoutId="admin-nav-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-violet" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all text-sm">
          <RiStoreLine size={16} /> View Store
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-text-muted hover:text-accent-rose hover:bg-accent-rose/5 transition-all text-sm">
          <RiLogoutBoxLine size={16} /> Sign Out
        </button>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-text-primary text-xs font-medium truncate">{user?.displayName || 'Admin'}</p>
            <p className="text-text-muted text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-bg-secondary border-r border-white/5 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-bg-secondary border-r border-white/5 z-50 lg:hidden flex flex-col">
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-dark border-b border-white/5 px-4 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary">
            <RiMenuLine size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-text-primary font-semibold capitalize">
              {navItems.find(n => location.pathname === n.href || (n.href !== '/admin' && location.pathname.startsWith(n.href)))?.label || 'Dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-accent-emerald text-xs font-medium">Live</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white text-sm font-bold">
              {(user?.displayName || 'A')[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
