import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDeleteBin6Line, RiAddLine, RiSubtractLine, RiArrowRightLine,
  RiGiftLine, RiShoppingBagLine, RiTruckLine, RiLockLine,
  RiCheckboxCircleLine, RiHeart2Fill,
} from 'react-icons/ri';
import { useCart } from '../context/useCart';
import { useWishlist } from '../context/useWishlist';
import { useAuth } from '../context/useAuth';
import { useOrders } from '../hooks/useOrders';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ui/ProductCard';
import SEO from '../components/ui/SEO';

// ─── Cart Page ────────────────────────────────────────────────────────────────
export function Cart() {
  const { items, removeFromCart, updateQuantity, applyCoupon, subtotal, discount, shipping, total, coupon } = useCart();
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const [couponInput, setCouponInput] = useState('');

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <SEO title="Your Cart" description="Review your selected luxury items." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="section-title">Your <span className="gradient-text italic">Cart</span></h1>
          <p className="text-text-muted mt-2">{items.length} items</p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
            <div className="w-24 h-24 rounded-full bg-accent-violet/10 flex items-center justify-center mx-auto mb-6">
              <RiShoppingBagLine className="text-accent-violet" size={40} />
            </div>
            <h3 className="text-text-primary text-2xl font-semibold mb-3">Your cart is empty</h3>
            <p className="text-text-muted mb-8">Start exploring our collections.</p>
            <Link to="/products" className="btn-primary text-white">Shop Now</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30, height: 0 }} layout
                    className="glass rounded-2xl p-5 flex gap-5 border border-white/5">
                    <Link to={`/products/${item.id}`}>
                      <img src={item.image} alt={item.name} className="w-24 h-28 object-cover rounded-xl flex-shrink-0" />
                    </Link>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-text-primary font-semibold">{item.name}</h3>
                          <p className="text-text-muted text-sm mt-0.5">Size: {item.size}</p>
                        </div>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeFromCart(item.id, item.size)} className="text-text-muted hover:text-accent-rose transition-colors">
                          <RiDeleteBin6Line size={18} />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 glass rounded-full px-3 py-2">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}><RiSubtractLine className="text-text-muted" size={14} /></motion.button>
                          <span className="text-text-primary font-medium w-6 text-center text-sm">{item.quantity}</span>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}><RiAddLine className="text-text-muted" size={14} /></motion.button>
                        </div>
                        <span className="text-text-primary font-bold text-lg">{sym} {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="text-text-primary font-semibold mb-5">Order Summary</h3>
                <form onSubmit={e => { e.preventDefault(); applyCoupon(couponInput); setCouponInput(''); }} className="flex gap-2 mb-5">
                  <div className="flex-1 relative">
                    <RiGiftLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input type="text" value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} placeholder="Promo code (LUXE20)"
                      className="w-full pl-9 pr-3 py-2.5 bg-bg-surface border border-white/10 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50" />
                  </div>
                  <button type="submit" className="px-4 py-2.5 rounded-xl bg-accent-violet/20 text-accent-violet text-sm font-semibold hover:bg-accent-violet/30 transition-colors">Apply</button>
                </form>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm"><span className="text-text-muted">Subtotal</span><span className="text-text-primary">{sym} {subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm"><span className="text-text-muted">Discount ({coupon?.code})</span><span className="text-accent-rose">−{sym} {discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-text-muted">Shipping</span><span className={shipping === 0 ? 'text-accent-emerald' : 'text-text-primary'}>{shipping === 0 ? 'FREE' : `${sym} ${shipping}`}</span></div>
                </div>
                <div className="border-t border-white/5 pt-4 flex justify-between font-bold text-xl mb-6">
                  <span>Total</span><span className="gradient-text">{sym} {total.toFixed(2)}</span>
                </div>
                <Link to="/checkout">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-semibold flex items-center justify-center gap-2 shadow-glow-violet">
                    Checkout <RiArrowRightLine size={18} />
                  </motion.button>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-text-muted text-xs justify-center">
                <RiTruckLine size={14} /><span>Free shipping on orders over {sym} {settings.freeShippingThreshold || 2000}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Wishlist Page ────────────────────────────────────────────────────────────
export function Wishlist() {
  const { items } = useWishlist();
  return (
    <main className="pt-28 pb-20 min-h-screen">
      <SEO title="Wishlist" description="Your saved premium fashion items." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="section-title">My <span className="gradient-text italic">Wishlist</span></h1>
          <p className="text-text-muted mt-2">{items.length} saved items</p>
        </motion.div>
        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
            <div className="w-24 h-24 rounded-full bg-accent-rose/10 flex items-center justify-center mx-auto mb-6">
              <RiHeart2Fill className="text-accent-rose" size={40} />
            </div>
            <h3 className="text-text-primary text-2xl font-semibold mb-3">Your wishlist is empty</h3>
            <p className="text-text-muted mb-8">Save items you love and come back later.</p>
            <Link to="/products" className="btn-primary text-white">Explore Products</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
export function Checkout() {
  const { items, subtotal, discount, shipping, total, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const { placeOrder, loading: orderLoading } = useOrders();
  const navigate = useNavigate();

  const [step,      setStep]      = useState(1);
  const [orderId,   setOrderId]   = useState(null);
  const [form,      setForm]      = useState({
    firstName: '', lastName: '', email: user?.email || '', phone: '',
    whatsapp: '', address: '', city: '', zip: '', country: 'PK', notes: '',
  });

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    try {
      const id = await placeOrder({
        items,
        subtotal,
        discount,
        shipping,
        total,
        coupon: coupon?.code || null,
        shippingAddress: { firstName: form.firstName, lastName: form.lastName, address: form.address, city: form.city, zip: form.zip, country: form.country },
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        notes: form.notes,
        paymentMethod: 'COD', // Cash on Delivery for local store
      });
      
      setOrderId(id);
      clearCart();

      // Generate WhatsApp Link
      const orderSummary = items.map(i => `${i.name} (x${i.quantity}) - ${i.size}`).join('%0A');
      const text = `*New Order: ${id}*%0A%0A*Customer:* ${form.firstName} ${form.lastName}%0A*Address:* ${form.address}, ${form.city}%0A*Phone:* ${form.phone}%0A%0A*Items:*%0A${orderSummary}%0A%0A*Total Amount:* ${sym} ${total.toFixed(2)}%0A*Method:* Cash on Delivery%0A${form.notes ? `%0A*Notes:* ${form.notes}` : ''}`;
      
      const storeWhatsAppNumber = (settings.whatsapp || '923001234567').replace(/\D/g, '');
      window.open(`https://wa.me/${storeWhatsAppNumber}?text=${text}`, '_blank');
      
    } catch (_) {}
  };

  if (orderId) return (
    <main className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto px-4">
        <motion.div animate={{ scale: [0.8, 1.1, 1] }} transition={{ duration: 0.5 }} className="w-24 h-24 rounded-full bg-accent-emerald/20 flex items-center justify-center mx-auto mb-6">
          <RiCheckboxCircleLine className="text-accent-emerald" size={48} />
        </motion.div>
        <h2 className="font-display text-3xl font-bold text-text-primary mb-3">Order Confirmed!</h2>
        <p className="text-text-muted mb-8">Thank you! You'll receive a confirmation email shortly.</p>
        <div className="glass rounded-2xl p-4 border border-white/5 mb-8">
          <p className="text-text-muted text-sm font-mono">{orderId}</p>
          <p className="text-accent-violet font-semibold text-2xl mt-1">{sym} {total.toFixed(2)}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-outline text-text-primary text-sm">View Orders</Link>
          <Link to="/products" className="btn-primary text-white text-sm">Continue Shopping</Link>
        </div>
      </motion.div>
    </main>
  );

  if (items.length === 0 && !orderId) return (
    <main className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RiShoppingBagLine className="text-accent-violet mx-auto mb-4" size={48} />
        <h3 className="text-text-primary text-xl font-semibold mb-3">Your cart is empty</h3>
        <Link to="/products" className="btn-primary text-white">Start Shopping</Link>
      </div>
    </main>
  );

  const steps = ['Shipping', 'Order Options', 'Review'];

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <SEO title="Secure Checkout" description="Complete your purchase safely and securely." />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-title mb-10">Checkout</motion.h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 <= step ? 'bg-accent-violet text-white' : 'glass text-text-muted'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i + 1 <= step ? 'text-text-primary' : 'text-text-muted'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-0.5 w-12 lg:w-24 transition-all ${i + 1 < step ? 'bg-accent-violet' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 border border-white/5">
                <h2 className="text-text-primary font-semibold text-xl mb-6">Shipping Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[['firstName','First Name',1],['lastName','Last Name',1],['email','Email','email',2],['phone','Phone',2],['address','Street Address',2],['city','City',1],['zip','ZIP Code',1]].map(([k,lbl,col,type]) => (
                    <div key={k} className={col === 2 ? 'col-span-2' : ''}>
                      <label className="text-text-muted text-xs mb-1.5 block">{lbl}</label>
                      <input type={type === 'email' ? 'email' : 'text'} value={form[k]} onChange={update(k)} required
                        className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors text-sm" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Order Options (WhatsApp & COD) */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 border border-white/5">
                <h2 className="text-text-primary font-semibold text-xl mb-6">Order Options</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-text-muted text-xs mb-1.5 block">WhatsApp Number (Optional, for updates)</label>
                    <input type="tel" value={form.whatsapp} onChange={update('whatsapp')} placeholder="+92 300 1234567"
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs mb-1.5 block">Order Notes (Optional)</label>
                    <textarea value={form.notes} onChange={update('notes')} placeholder="Any special instructions for delivery..." rows={3}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm resize-none" />
                  </div>
                  
                  <div className="mt-6 p-4 rounded-xl bg-accent-violet/10 border border-accent-violet/20 flex gap-4 items-start">
                    <div className="mt-0.5 text-accent-violet">
                      <RiCheckboxCircleLine size={20} />
                    </div>
                    <div>
                      <p className="text-text-primary font-medium text-sm">Cash on Delivery (COD)</p>
                      <p className="text-text-muted text-xs mt-1">As a premium local store, we currently support Cash on Delivery. You pay when you receive the package.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 border border-white/5">
                <h2 className="text-text-primary font-semibold text-xl mb-4">Review Your Order</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3 items-center">
                      <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-text-primary text-sm font-medium">{item.name}</p>
                        <p className="text-text-muted text-xs">Size: {item.size} × {item.quantity}</p>
                      </div>
                      <span className="text-text-primary font-semibold">{sym} {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-sm space-y-1">
                  <p className="text-text-muted">Ship to: <span className="text-text-secondary">{form.firstName} {form.lastName}, {form.address}, {form.city}</span></p>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-2xl glass text-text-secondary hover:text-text-primary border border-white/10">Back</button>}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                disabled={orderLoading || (step === 3 && !settings.codEnabled)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {orderLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : null}
                {step === 3 && !settings.codEnabled ? 'Orders Paused' : step === 3 ? 'Place Order' : 'Continue'} <RiArrowRightLine size={18} />
              </motion.button>
            </div>
          </form>

          {/* Summary */}
          <div className="glass rounded-2xl p-6 border border-white/5 h-fit">
            <h3 className="text-text-primary font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {items.slice(0, 3).map(item => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-text-muted truncate mr-2">{item.name} ×{item.quantity}</span>
                  <span className="text-text-primary shrink-0">{sym} {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-text-muted">Subtotal</span><span>{sym} {subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-accent-rose"><span>Discount</span><span>−{sym} {discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-text-muted">Shipping</span><span className={shipping === 0 ? 'text-accent-emerald' : ''}>{shipping === 0 ? 'FREE' : `${sym} ${shipping}`}</span></div>
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-lg mt-3">
              <span>Total</span><span className="gradient-text">{sym} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
