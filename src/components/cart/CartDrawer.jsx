import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCloseLine, RiShoppingBagLine, RiDeleteBin6Line,
  RiAddLine, RiSubtractLine, RiArrowRightLine, RiGiftLine,
} from 'react-icons/ri';
import { useCart } from '../../context/useCart';
import { useSettings } from '../../context/SettingsContext';

export default function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, updateQuantity, applyCoupon, subtotal, discount, shipping, total, coupon } = useCart();
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const [couponInput, setCouponInput] = useState('');

  const handleCoupon = (e) => {
    e.preventDefault();
    applyCoupon(couponInput);
    setCouponInput('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[70] bg-bg-secondary border-l border-white/5 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <RiShoppingBagLine className="text-accent-violet" size={22} />
                <h2 className="font-display text-xl font-semibold text-text-primary">Your Cart</h2>
                <span className="w-6 h-6 rounded-full bg-accent-violet/20 text-accent-violet text-xs font-bold flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-text-secondary hover:text-text-primary"
              >
                <RiCloseLine size={20} />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full gap-4 py-20"
                  >
                    <div className="w-20 h-20 rounded-full bg-accent-violet/10 flex items-center justify-center">
                      <RiShoppingBagLine className="text-accent-violet" size={32} />
                    </div>
                    <p className="text-text-muted text-center">Your cart is empty.<br />Start exploring our collections.</p>
                    <button onClick={onClose} className="btn-primary text-white mt-2">
                      <Link to="/products">Shop Now</Link>
                    </button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      layout
                      className="flex gap-4 glass rounded-2xl p-3"
                    >
                      <Link to={`/products/${item.id}`} onClick={onClose}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-24 object-cover rounded-xl flex-shrink-0"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-text-primary text-sm font-medium truncate">{item.name}</h4>
                            <p className="text-text-muted text-xs mt-0.5">Size: {item.size}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-text-muted hover:text-accent-rose transition-colors flex-shrink-0"
                          >
                            <RiDeleteBin6Line size={16} />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 glass rounded-full px-2 py-1">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                              className="text-text-muted hover:text-text-primary w-5 h-5 flex items-center justify-center"
                            >
                              <RiSubtractLine size={12} />
                            </motion.button>
                            <span className="text-text-primary text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                              className="text-text-muted hover:text-text-primary w-5 h-5 flex items-center justify-center"
                            >
                              <RiAddLine size={12} />
                            </motion.button>
                          </div>
                          <span className="text-text-primary font-semibold text-sm">
                            {sym} {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5 space-y-4">
                {/* Coupon */}
                <form onSubmit={handleCoupon} className="flex gap-2">
                  <div className="flex-1 relative">
                    <RiGiftLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Promo code (LUXE20)"
                      className="w-full pl-9 pr-3 py-2.5 bg-bg-surface border border-white/10 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2.5 rounded-xl bg-accent-violet/20 text-accent-violet text-sm font-semibold hover:bg-accent-violet/30 transition-colors">
                    Apply
                  </button>
                </form>

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text-primary">{sym} {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Discount ({coupon?.code})</span>
                      <span className="text-accent-rose">−{sym} {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Shipping</span>
                    <span className={shipping === 0 ? 'text-accent-emerald' : 'text-text-primary'}>
                      {shipping === 0 ? 'FREE' : `${sym} ${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-white/5 pt-2 mt-2">
                    <span className="text-text-primary">Total</span>
                    <span className="gradient-text">{sym} {total.toFixed(2)}</span>
                  </div>
                </div>

                <Link to="/checkout" onClick={onClose}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-semibold flex items-center justify-center gap-2 shadow-glow-violet"
                  >
                    Checkout <RiArrowRightLine size={18} />
                  </motion.button>
                </Link>

                <Link to="/cart" onClick={onClose} className="block text-center text-sm text-text-muted hover:text-text-primary transition-colors">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
