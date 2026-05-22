// ─── Admin Orders ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiEyeLine, RiCloseLine, RiCheckLine, RiSearchLine } from 'react-icons/ri';
import { subscribeAllOrders, updateOrderStatus } from '../firebase/firestore';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusConfig = {
  pending:    { label: 'Pending',    bg: 'bg-accent-amber/10',   text: 'text-accent-amber'   },
  processing: { label: 'Processing', bg: 'bg-accent-sky/10',     text: 'text-accent-sky'     },
  shipped:    { label: 'Shipped',    bg: 'bg-accent-violet/10',  text: 'text-accent-violet'  },
  delivered:  { label: 'Delivered',  bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-accent-rose/10',    text: 'text-accent-rose'    },
};

const toastOpts = { style: { background: '#1e293b', color: '#f8fafc', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)' } };

export function AdminOrders() {
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => {
    const unsub = subscribeAllOrders(data => { setOrders(data); setLoading(false); });
    return unsub;
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`, toastOpts);
      if (selected?.id === orderId) setSelected(s => ({ ...s, status }));
    } catch {
      toast.error('Update failed', toastOpts);
    }
    setUpdating(null);
  };

  const visible = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search ||
      (o.orderId || o.id)?.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-text-primary">Orders</h2>
        <p className="text-text-muted text-sm mt-0.5">{orders.length} total orders</p>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
            className="pl-9 pr-4 py-2.5 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...ALL_STATUSES].map(s => {
            const cfg = statusConfig[s];
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  filter === s ? (cfg ? `${cfg.bg} ${cfg.text}` : 'bg-accent-violet/15 text-accent-violet') : 'glass text-text-muted hover:text-text-primary'
                }`}>
                {s === 'all' ? 'All' : cfg?.label || s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {['Order ID','Customer','Date','Items','Total','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 shimmer-skeleton rounded-full" /></td></tr>)
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-text-muted text-sm">No orders found</td></tr>
              ) : visible.map(order => {
                const cfg = statusConfig[order.status] || statusConfig.pending;
                return (
                  <tr key={order.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-accent-violet text-xs">{order.orderId || order.id?.slice(0,14)}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-text-primary text-sm truncate max-w-[120px]">{order.userName || '—'}</p>
                      <p className="text-text-muted text-xs truncate max-w-[120px]">{order.userEmail || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted text-sm whitespace-nowrap">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-text-muted text-sm">{order.items?.length || 0}</td>
                    <td className="px-5 py-3.5 text-text-primary font-semibold text-sm">{sym} {order.total?.toFixed(2) || '—'}</td>
                    <td className="px-5 py-3.5">
                      <select value={order.status || 'pending'} onChange={e => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 focus:outline-none cursor-pointer disabled:opacity-50 ${cfg.bg} ${cfg.text}`}>
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelected(order)}
                        className="p-1.5 rounded-lg glass text-text-muted hover:text-accent-violet transition-colors">
                        <RiEyeLine size={15} />
                      </motion.button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-bg-secondary border-l border-white/5 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  <p className="text-accent-violet font-mono text-sm">{selected.orderId || selected.id}</p>
                  <p className="text-text-muted text-xs mt-0.5">{selected.createdAt?.toDate ? selected.createdAt.toDate().toLocaleString() : ''}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-text-muted hover:text-text-primary">
                  <RiCloseLine size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Status */}
                <div>
                  <p className="text-text-muted text-xs mb-2">Status</p>
                  <select value={selected.status || 'pending'} onChange={e => handleStatusUpdate(selected.id, e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-surface border border-white/10 rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-violet/50">
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
                  </select>
                </div>

                {/* Customer */}
                <div className="glass rounded-xl p-4 border border-white/5 space-y-1">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Customer</p>
                  <p className="text-text-primary text-sm font-medium">{selected.userName || '—'}</p>
                  <p className="text-text-muted text-sm">{selected.userEmail || '—'}</p>
                  {selected.shippingAddress && <p className="text-text-muted text-sm">{selected.shippingAddress.address}, {selected.shippingAddress.city}</p>}
                </div>

                {/* Items */}
                {selected.items && (
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-3">
                      {selected.items.map((item, i) => (
                        <div key={i} className="flex gap-3 items-center glass rounded-xl p-3 border border-white/5">
                          {item.image && <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                            <p className="text-text-muted text-xs">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <p className="text-text-primary text-sm font-semibold">{sym} {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="glass rounded-xl p-4 border border-white/5 space-y-2">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Order Summary</p>
                  <div className="flex justify-between text-sm"><span className="text-text-muted">Subtotal</span><span className="text-text-primary">{sym} {selected.subtotal?.toFixed(2) || '—'}</span></div>
                  {selected.discount > 0 && <div className="flex justify-between text-sm"><span className="text-text-muted">Discount</span><span className="text-accent-rose">−{sym} {selected.discount?.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-text-muted">Shipping</span><span className="text-text-primary">{selected.shipping === 0 ? 'FREE' : `${sym} ${selected.shipping}`}</span></div>
                  <div className="flex justify-between font-bold text-base border-t border-white/5 pt-2 mt-2">
                    <span className="text-text-primary">Total</span>
                    <span className="gradient-text">{sym} {selected.total?.toFixed(2) || '—'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Admin Customers ──────────────────────────────────────────────────────────
import { getAllUsers, updateUserRole } from '../firebase/firestore';

export function AdminCustomers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  const toggleRole = async (uid, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change user role to ${newRole}?`)) return;
    await updateUserRole(uid, newRole);
    setUsers(us => us.map(u => u.id === uid ? { ...u, role: newRole } : u));
    toast.success(`Role updated to ${newRole}`, toastOpts);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-text-primary">Customers</h2>
        <p className="text-text-muted text-sm mt-0.5">{users.length} registered users</p>
      </div>
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {['User','Email','Role','Joined','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 shimmer-skeleton rounded-full" /></td></tr>)
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-text-muted text-sm">No customers yet</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white text-xs font-bold">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <p className="text-text-primary text-sm">{user.displayName || '—'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted text-sm">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-accent-violet/15 text-accent-violet' : 'bg-white/5 text-text-muted'
                    }`}>{user.role || 'customer'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted text-sm">
                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleRole(user.id, user.role)}
                      className="px-3 py-1.5 rounded-lg glass text-text-muted hover:text-accent-violet transition-colors text-xs border border-white/10">
                      {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
