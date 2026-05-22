// ─── useOrders hook ───────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { subscribeUserOrders, createOrder as fbCreateOrder } from '../firebase/firestore';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { sendOrderConfirmationEmail } from '../utils/email';

const toastOpts = { style: { background: '#1e293b', color: '#f8fafc', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)' } };

export const useOrders = () => {
  const { user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setOrders([]); return; }
    setLoading(true);
    const unsub = subscribeUserOrders(user.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const placeOrder = async (orderData) => {
    if (!user) throw new Error('Must be logged in to place an order');
    setLoading(true);
    try {
      const orderId = await fbCreateOrder(user.uid, {
        ...orderData,
        userEmail:   user.email,
        userName:    user.displayName || '',
      });
      
      // Send Email confirmation
      await sendOrderConfirmationEmail({ ...orderData, orderId, email: user.email });
      
      toast.success(`Order ${orderId} placed! 🎉`, toastOpts);
      return orderId;
    } catch (err) {
      toast.error('Failed to place order. Please try again.', toastOpts);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, placeOrder };
};
