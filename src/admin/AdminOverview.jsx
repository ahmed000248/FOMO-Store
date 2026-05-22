// ─── Admin Overview — real-time analytics dashboard ────────────────────────────
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiMoneyDollarCircleLine, RiShoppingBagLine, RiUserLine,
  RiListOrdered, RiArrowUpLine, RiArrowRightLine,
  RiTimeLine, RiTruckLine, RiCheckboxCircleLine,
  RiCloseCircleLine, RiAlertLine, RiBarChartLine, RiEyeLine,
} from 'react-icons/ri';
import { subscribeAdminStats, getTopSellingProducts, getLowStockProducts } from '../firebase/firestore';
import { useSettings } from '../context/SettingsContext';
import { StatCardSkeleton } from '../components/ui/skeletons/Skeletons';

const statusColors = {
  pending:    'text-accent-amber   bg-accent-amber/10',
  processing: 'text-accent-sky    bg-accent-sky/10',
  shipped:    'text-accent-violet  bg-accent-violet/10',
  delivered:  'text-accent-emerald bg-accent-emerald/10',
  cancelled:  'text-accent-rose    bg-accent-rose/10',
};

// ── Mini bar chart for revenue trend ────────────────────────────────────────
function RevenueChart({ data }) {
  const { settings } = useSettings();
  const sym = settings?.currencySymbol || 'Rs.';
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-text-primary font-semibold">Revenue Trend</h3>
          <p className="text-text-muted text-xs mt-0.5">Last 7 days</p>
        </div>
        <RiBarChartLine className="text-accent-violet" size={20} />
      </div>
      <div className="flex items-end gap-2 h-28">
        {data.map(({ day, revenue }, i) => {
          const pct = (revenue / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="relative w-full flex items-end" style={{ height: '88px' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 4)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-accent-violet/40 to-accent-violet group-hover:from-accent-violet/70 group-hover:to-accent-sky transition-colors cursor-default"
                  style={{ position: 'absolute', bottom: 0 }}
                >
                  {revenue > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <span className="text-[10px] bg-accent-violet text-white px-1.5 py-0.5 rounded-md font-medium">
                        {sym} {revenue.toFixed(0)}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
              <span className="text-text-muted text-[10px]">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order status breakdown ───────────────────────────────────────────────────
function OrderStatusBreakdown({ stats }) {
  const items = [
    { label: 'Pending',    value: stats.pendingOrders,    icon: RiTimeLine,          color: '#f59e0b', bg: 'bg-accent-amber/10'  },
    { label: 'Processing', value: stats.processingOrders, icon: RiShoppingBagLine,   color: '#38bdf8', bg: 'bg-accent-sky/10'    },
    { label: 'Delivered',  value: stats.deliveredOrders,  icon: RiCheckboxCircleLine, color: '#10b981', bg: 'bg-accent-emerald/10' },
    { label: 'Cancelled',  value: stats.cancelledOrders,  icon: RiCloseCircleLine,   color: '#f43f5e', bg: 'bg-accent-rose/10'   },
  ];
  const total = stats.totalOrders || 1;

  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <h3 className="text-text-primary font-semibold mb-5">Order Breakdown</h3>
      <div className="space-y-3">
        {items.map(({ label, value, icon: Icon, color, bg }) => {
          const pct = Math.round((value / total) * 100);
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon size={12} style={{ color }} />
                  </div>
                  <span className="text-text-secondary text-sm">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-semibold text-sm">{value}</span>
                  <span className="text-text-muted text-xs">({pct}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Low stock alert list ─────────────────────────────────────────────────────
function LowStockAlerts({ items }) {
  if (!items.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-5 border border-accent-rose/20 bg-accent-rose/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <RiAlertLine className="text-accent-rose" size={18} />
        <h3 className="text-text-primary font-semibold text-sm">Low Stock Alerts</h3>
        <span className="ml-auto text-accent-rose text-xs font-semibold bg-accent-rose/10 px-2 py-0.5 rounded-full">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {items.map(product => (
          <div key={product.id} className="flex items-center gap-3">
            {product.image && (
              <img src={product.image} alt={product.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            )}
            <span className="text-text-secondary text-sm truncate flex-1">{product.name}</span>
            <span className="text-accent-rose text-xs font-semibold flex-shrink-0">
              {product.stock} left
            </span>
          </div>
        ))}
      </div>
      <Link to="/admin/products" className="flex items-center gap-1 text-accent-rose text-xs font-semibold hover:underline mt-4">
        Manage Inventory <RiArrowRightLine size={12} />
      </Link>
    </motion.div>
  );
}

// ── Top selling products ─────────────────────────────────────────────────────
function TopSellingProducts({ products }) {
  const { settings } = useSettings();
  const sym = settings?.currencySymbol || 'Rs.';
  if (!products.length) return null;
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-text-primary font-semibold">Top Selling</h3>
        <Link to="/admin/products" className="flex items-center gap-1 text-accent-violet text-xs hover:underline">
          All Products <RiArrowRightLine size={12} />
        </Link>
      </div>
      <div className="divide-y divide-white/5">
        {products.map((product, i) => (
          <div key={product.id} className="flex items-center gap-4 px-5 py-3">
            <span className="text-text-muted text-xs font-mono w-4">{i + 1}</span>
            {product.image && (
              <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{product.name}</p>
              <p className="text-text-muted text-xs">{product.category}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-text-primary font-semibold text-sm">{product.totalSold} sold</p>
              <p className="text-accent-emerald text-xs">{sym} {product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const [analytics,     setAnalytics]     = useState(null);
  const [topProducts,   setTopProducts]   = useState([]);
  const [lowStock,      setLowStock]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [resetting,     setResetting]     = useState(false);

  const handleResetOrders = async () => {
    if (!window.confirm("⚠️ DANGER ZONE: Are you sure you want to permanently delete and reset ALL store orders? This action cannot be undone.")) {
      return;
    }
    
    setResetting(true);
    try {
      const { db } = await import('../firebase/config');
      const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      
      const snap = await getDocs(collection(db, 'orders'));
      if (snap.size === 0) {
        alert("No orders found to delete.");
        setResetting(false);
        return;
      }

      let deletedCount = 0;
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, 'orders', docSnap.id));
        deletedCount++;
      }

      alert(`Success! Successfully purged ${deletedCount} test orders.`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete orders: ${err.message || err}\n\nNote: If this is a permission error, please update your Firestore rules to allow delete on orders (e.g., add 'allow delete: if isAdmin();' to the orders rules).`);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    const unsub = subscribeAdminStats(data => {
      setAnalytics(data);
      setLoading(false);
    });

    getTopSellingProducts(5).then(setTopProducts).catch(() => {});
    getLowStockProducts(5).then(setLowStock).catch(() => {});

    return unsub;
  }, []);

  const statCards = analytics ? [
    {
      label:  'Total Revenue',
      value:  `${sym} ${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon:   RiMoneyDollarCircleLine,
      color:  '#8b5cf6',
      sub:    `${sym} ${analytics.avgOrderValue.toFixed(2)} avg order`,
    },
    {
      label:  'Total Orders',
      value:  analytics.totalOrders,
      icon:   RiListOrdered,
      color:  '#38bdf8',
      sub:    `${analytics.pendingOrders} pending`,
    },
    {
      label:  'Products',
      value:  analytics.totalProducts,
      icon:   RiShoppingBagLine,
      color:  '#f59e0b',
      sub:    lowStock.length ? `${lowStock.length} low stock` : 'All stocked',
    },
    {
      label:  'Customers',
      value:  analytics.totalUsers,
      icon:   RiUserLine,
      color:  '#10b981',
      sub:    `${analytics.todayVisits || 0} visits today`,
    },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Dashboard Overview</h2>
          <p className="text-text-muted text-sm mt-1">Real-time store analytics</p>
        </div>
        <button
          onClick={handleResetOrders}
          disabled={resetting}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-xl hover:bg-accent-rose hover:text-white disabled:opacity-50 transition-all cursor-pointer self-start sm:self-auto"
        >
          {resetting ? 'Purging Orders...' : 'Reset Test Orders'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? [1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, color, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <span className="flex items-center gap-1 text-accent-emerald text-xs font-semibold bg-accent-emerald/10 px-2 py-1 rounded-full">
                  <RiArrowUpLine size={10} /> Live
                </span>
              </div>
              <p className="text-3xl font-display font-bold text-text-primary">{value}</p>
              <p className="text-text-muted text-sm mt-1">{label}</p>
              {sub && <p className="text-text-muted/70 text-xs mt-1">{sub}</p>}
            </motion.div>
          ))}
      </div>

      {/* Pending alert */}
      {analytics?.pendingOrders > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 border border-accent-amber/20 bg-accent-amber/5 flex items-center gap-3"
        >
          <RiTimeLine className="text-accent-amber flex-shrink-0" size={20} />
          <p className="text-text-secondary text-sm">
            You have{' '}
            <span className="text-accent-amber font-semibold">
              {analytics.pendingOrders} pending order{analytics.pendingOrders !== 1 ? 's' : ''}
            </span>{' '}
            awaiting processing.
          </p>
          <Link
            to="/admin/orders"
            className="ml-auto flex items-center gap-1 text-accent-amber text-xs font-semibold hover:underline whitespace-nowrap"
          >
            View <RiArrowRightLine size={14} />
          </Link>
        </motion.div>
      )}

      {/* Revenue chart + order breakdown */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={analytics.dailyRevenue} />
          <OrderStatusBreakdown stats={analytics} />
        </div>
      )}

      {/* Top selling + low stock */}
      {(topProducts.length > 0 || lowStock.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {topProducts.length > 0 && <TopSellingProducts products={topProducts} />}
          {lowStock.length > 0 && <LowStockAlerts items={lowStock} />}
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-text-primary font-semibold text-lg">Recent Orders</h3>
          <Link to="/admin/orders" className="flex items-center gap-1 text-accent-violet text-sm hover:underline">
            View all <RiArrowRightLine size={14} />
          </Link>
        </div>
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Customer</th>
                  <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!analytics || analytics.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-muted text-sm">No orders yet</td>
                  </tr>
                ) : analytics.recentOrders.map(order => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link to="/admin/orders" className="text-accent-violet font-mono text-sm hover:underline">
                        {order.orderId || order.id?.slice(0, 12)}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-text-primary text-sm">{order.userName || '—'}</p>
                      <p className="text-text-muted text-xs">{order.userEmail || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-text-muted text-sm">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-text-primary font-semibold text-sm">
                      {sym} {order.total?.toFixed(2) || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || statusColors.pending}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
