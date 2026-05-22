import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiMailLine, RiLockLine, RiUserLine, RiGoogleFill,
  RiAppleLine, RiEyeLine, RiEyeOffLine, RiMapPinLine,
  RiPhoneLine, RiSendPlaneLine, RiArrowLeftLine,
  RiBox3Line, RiTruckLine, RiCheckboxCircleLine, RiTimeLine, RiCloseLine,
} from 'react-icons/ri';
import { useAuth } from '../context/useAuth';
import { useSettings } from '../context/SettingsContext';
import { useOrders } from '../hooks/useOrders';
import { OrderSkeleton } from '../components/ui/skeletons/Skeletons';

// ─── Login / Register ─────────────────────────────────────────────────────────
export function Login() {
  const [mode,     setMode]     = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form,     setForm]     = useState({ name: '', email: '', password: '' });

  const { login, register, loginGoogle } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.name);
      }
      navigate(from, { replace: true });
    } catch (_) { /* toast handled in context */ }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginGoogle(mode);
      navigate(from, { replace: true });
    } catch (_) {}
    finally { setLoading(false); }
  };

  return (
    <main className="pt-20 min-h-screen flex items-center justify-center py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-violet/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-sky/5 blur-3xl pointer-events-none -z-10" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">L</span>
            </div>
            <span className="font-display text-2xl font-bold gradient-text">LUXE</span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-text-primary">
            {mode === 'login' ? 'Welcome Back' : 'Join LUXE'}
          </h2>
          <p className="text-text-muted mt-2 text-sm relative z-10">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-accent-violet hover:text-accent-sky transition-colors font-semibold px-2 py-1 -ml-1">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5">
          {/* Social */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGoogle} disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl glass border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all text-sm font-medium disabled:opacity-50">
              <RiGoogleFill size={18} className="text-[#4285F4]" /> Google
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled
              className="flex items-center justify-center gap-2 py-3 rounded-2xl glass border border-white/10 text-text-muted text-sm font-medium opacity-50 cursor-not-allowed">
              <RiAppleLine size={18} /> Apple
            </motion.button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-text-muted text-xs">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type="text" placeholder="Full Name" value={form.name} onChange={update('name')} required
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-surface border border-white/10 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors" />
              </div>
            )}
            <div className="relative">
              <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="email" placeholder="Email Address" value={form.email} onChange={update('email')} required
                className="w-full pl-12 pr-4 py-3.5 bg-bg-surface border border-white/10 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors" />
            </div>
            <div className="relative">
              <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={update('password')} required minLength={6}
                className="w-full pl-12 pr-12 py-3.5 bg-bg-surface border border-white/10 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showPass ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
              </button>
            </div>
            {mode === 'login' && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-accent-violet text-sm hover:text-accent-sky transition-colors">Forgot password?</Link>
              </div>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-semibold shadow-glow-violet mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────
export function About() {
  const values = [
    { title: 'Craftsmanship', desc: "Every piece is made with meticulous attention to detail, using premium materials sourced from the world's finest mills.", icon: '✦', color: '#8b5cf6' },
    { title: 'Sustainability', desc: 'We believe luxury and responsibility coexist. Our supply chain is transparent, ethical, and environmentally conscious.', icon: '◈', color: '#38bdf8' },
    { title: 'Innovation',    desc: 'We blend timeless elegance with contemporary design thinking, creating pieces that feel classic yet modern.',  icon: '◎', color: '#f59e0b' },
    { title: 'Community',     desc: 'LUXE is more than a brand — a community of individuals who believe in the power of intentional dressing.',       icon: '◐', color: '#10b981' },
  ];
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <section className="relative overflow-hidden mb-24">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-4">Our Story</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-7xl font-bold text-text-primary leading-[1.05] mb-8">
            Fashion as a <span className="gradient-text italic">Philosophy</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
            LUXE was born from a simple belief: that truly great clothing should feel as meaningful as it looks. We create pieces for the thoughtful individual.
          </motion.p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-3 gap-4 h-80">
          {['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'].map((src,i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`overflow-hidden rounded-2xl ${i===1?'-mt-8':''}`}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12"><h2 className="section-title">What We <span className="gradient-text italic">Stand For</span></h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ title, desc, icon, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-accent-violet/20 transition-all group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block" style={{ color }}>{icon}</div>
              <h3 className="text-text-primary font-semibold text-lg mb-3">{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
export function Contact() {
  const [sent, setSent] = useState(false);
  const { settings } = useSettings();

  const contactItems = [
    { icon: RiMapPinLine, title: 'Visit Us',  lines: [settings.address || '123 Fashion Ave'] },
    { icon: RiMailLine,   title: 'Email Us',  lines: [settings.supportEmail || settings.email || 'hello@luxe.com'] },
    { icon: RiPhoneLine,  title: 'Call Us',   lines: [settings.phone, settings.businessHours].filter(Boolean) },
  ];

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-3">Get in Touch</p>
          <h1 className="section-title">We'd Love to <span className="gradient-text italic">Hear from You</span></h1>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {contactItems.map(({ icon: Icon, title, lines }) => (
              <motion.div key={title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-violet/10 flex items-center justify-center flex-shrink-0"><Icon className="text-accent-violet" size={22} /></div>
                <div><p className="text-text-primary font-semibold mb-1">{title}</p>{lines.map(l => <p key={l} className="text-text-muted text-sm">{l}</p>)}</div>
              </motion.div>
            ))}
            {settings.whatsapp && (
              <motion.a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/15 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#25D366] text-xl">💬</span>
                </div>
                <div>
                  <p className="text-text-primary font-semibold mb-0.5">WhatsApp Us</p>
                  <p className="text-text-muted text-sm">{settings.whatsapp}</p>
                </div>
              </motion.a>
            )}
            {settings.googleMapsUrl && (
              <div className="rounded-2xl overflow-hidden border border-white/10 h-48">
                <iframe src={settings.googleMapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Store location" />
              </div>
            )}
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-8 border border-white/5">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-accent-emerald/20 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                <h3 className="text-text-primary font-semibold text-xl mb-2">Message Sent!</h3>
                <p className="text-text-muted text-sm">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <h2 className="text-text-primary font-semibold text-xl mb-6">Send a Message</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" required className="px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
                  <input type="text" placeholder="Last Name" required className="px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
                </div>
                <input type="email" placeholder="Email Address" required className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
                <textarea placeholder="Your message..." rows={4} required className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm resize-none" />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-semibold flex items-center justify-center gap-2">
                  Send Message <RiSendPlaneLine size={18} />
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────

const statusConfig = {
  pending:    { label: 'Pending',    color: 'text-accent-amber',   bg: 'bg-accent-amber/10',   icon: RiTimeLine              },
  processing: { label: 'Processing', color: 'text-accent-sky',     bg: 'bg-accent-sky/10',     icon: RiBox3Line           },
  shipped:    { label: 'Shipped',    color: 'text-accent-violet',  bg: 'bg-accent-violet/10',  icon: RiTruckLine             },
  delivered:  { label: 'Delivered',  color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', icon: RiCheckboxCircleLine    },
  cancelled:  { label: 'Cancelled',  color: 'text-accent-rose',    bg: 'bg-accent-rose/10',    icon: RiCloseLine             },
};

export function Orders() {
  const { orders, loading } = useOrders();
  const { settings } = useSettings();
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="section-title">My <span className="gradient-text italic">Orders</span></h1>
          <p className="text-text-muted mt-2">{orders.length} orders</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <OrderSkeleton key={i} />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 rounded-full bg-accent-violet/10 flex items-center justify-center mx-auto mb-6">
              <RiBox3Line className="text-accent-violet" size={40} />
            </div>
            <h3 className="text-text-primary text-2xl font-semibold mb-3">No orders yet</h3>
            <p className="text-text-muted mb-8">Start shopping to see your orders here.</p>
            <Link to="/products" className="btn-primary text-white">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const s = statusConfig[order.status] || statusConfig.pending;
              const Icon = s.icon;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedOrder(order)}
                  className="glass rounded-2xl p-6 border border-white/5 hover:border-accent-violet/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <p className="text-accent-violet font-mono text-sm font-semibold">{order.orderId || order.id}</p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : 'Date pending'}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
                      <Icon size={13} />{s.label}
                    </div>
                  </div>

                  {order.items && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {order.items.slice(0, 3).map((item, j) => (
                        <div key={j} className="flex items-center gap-2">
                          {item.image && <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg" />}
                          <div>
                            <p className="text-text-primary text-xs font-medium">{item.name}</p>
                            <p className="text-text-muted text-xs">×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && <span className="text-text-muted text-xs self-center">+{order.items.length - 3} more</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-text-muted text-sm">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                    <span className="text-text-primary font-bold text-lg gradient-text">{settings.currencySymbol || 'Rs.'} {order.total?.toFixed(2) || '—'}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Invoice/Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
              <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
                className="fixed bottom-0 left-0 right-0 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 bg-bg-secondary border border-white/5 md:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                  <div>
                    <h3 className="text-text-primary text-lg font-semibold">Order Details</h3>
                    <p className="text-accent-violet font-mono text-xs">{selectedOrder.orderId || selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-text-muted hover:text-text-primary">
                    <RiCloseLine size={18} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Info Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4 border border-white/5">
                      <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Order Date</p>
                      <p className="text-text-primary text-sm">
                        {selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : 'Pending'}
                      </p>
                    </div>
                    <div className="glass rounded-xl p-4 border border-white/5">
                      <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Status</p>
                      {(() => {
                        const s = statusConfig[selectedOrder.status] || statusConfig.pending;
                        const Icon = s.icon;
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
                            <Icon size={14} />{s.label}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="glass rounded-xl p-4 border border-white/5">
                      <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Shipping Details</p>
                      <p className="text-text-primary text-sm font-medium">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p className="text-text-muted text-sm">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zip}</p>
                      <p className="text-text-muted text-sm mt-1">{selectedOrder.phone || selectedOrder.whatsapp}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, i) => (
                        <div key={i} className="flex gap-3 items-center glass rounded-xl p-3 border border-white/5">
                          {item.image && <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                            <p className="text-text-muted text-xs">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <p className="text-text-primary text-sm font-semibold">{settings?.currencySymbol || 'Rs.'} {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="glass rounded-xl p-4 border border-white/5 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-text-muted">Subtotal</span><span className="text-text-primary">{settings?.currencySymbol || 'Rs.'} {selectedOrder.subtotal?.toFixed(2) || '—'}</span></div>
                    {selectedOrder.discount > 0 && <div className="flex justify-between text-sm"><span className="text-text-muted">Discount</span><span className="text-accent-rose">−{settings?.currencySymbol || 'Rs.'} {selectedOrder.discount?.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-text-muted">Shipping</span><span className="text-text-primary">{selectedOrder.shipping === 0 ? 'FREE' : `${settings?.currencySymbol || 'Rs.'} ${selectedOrder.shipping}`}</span></div>
                    <div className="flex justify-between font-bold text-base border-t border-white/5 pt-2 mt-2">
                      <span className="text-text-primary">Total</span>
                      <span className="gradient-text">{settings?.currencySymbol || 'Rs.'} {selectedOrder.total?.toFixed(2) || '—'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-4 border-t border-white/5 flex gap-3">
                   <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl glass text-text-secondary hover:text-text-primary border border-white/10 transition-colors text-sm font-medium">
                     Print Invoice
                   </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
