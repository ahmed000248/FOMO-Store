import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from './SettingsContext';

const COUPONS = {
  LUXE20: { type: 'percent', value: 20 },
  SAVE10: { type: 'fixed',   value: 10 },
};

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { settings } = useSettings();

  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('luxe_cart') || '[]'); } catch { return []; }
  });
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('luxe_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, size, color) => {
    const sz = size || product.sizes?.[0] || 'M';
    const qty = product.quantity || 1;
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === sz);
      if (existing) {
        toast.success(`${product.name} quantity updated`);
        return prev.map(i =>
          i.id === product.id && i.size === sz ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      toast.success(`${product.name} added to cart`);
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image || '',
        size: sz,
        color: color || product.color || '',
        quantity: qty,
      }];
    });
  }, []);

  const removeFromCart = useCallback((id, size) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)));
  }, []);

  const updateQuantity = useCallback((id, size, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => !(i.id === id && i.size === size)));
      return;
    }
    setItems(prev => prev.map(i =>
      i.id === id && i.size === size ? { ...i, quantity: qty } : i
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback((code) => {
    if (!code.trim()) return;
    const found = COUPONS[code.toUpperCase()];
    if (found) {
      setCoupon({ code: code.toUpperCase(), ...found });
      toast.success(`Coupon "${code.toUpperCase()}" applied!`);
    } else {
      toast.error('Invalid coupon code');
    }
  }, []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === 'percent') return Math.round(subtotal * coupon.value / 100 * 100) / 100;
    return Math.min(coupon.value, subtotal);
  }, [subtotal, coupon]);

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    const threshold = settings.freeShippingThreshold ?? 2000;
    const fee = settings.shippingFee ?? 200;
    return (subtotal - discount) >= threshold ? 0 : fee;
  }, [subtotal, discount, items.length, settings.freeShippingThreshold, settings.shippingFee]);

  const total = useMemo(() => Math.max(0, subtotal - discount + shipping), [subtotal, discount, shipping]);

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon,
      subtotal, discount, shipping, total, coupon, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
