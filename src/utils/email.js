import emailjs from '@emailjs/browser';

// ─── EmailJS Configuration ────────────────────────────────────────────────────
// Replace these with your actual EmailJS credentials from https://www.emailjs.com/
const EMAILJS_SERVICE_ID = 'service_YOUR_ID';
const EMAILJS_TEMPLATE_ID = 'template_YOUR_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const templateParams = {
      to_name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
      to_email: orderData.email,
      order_id: orderData.orderId,
      order_total: `${orderData.currencySymbol || 'Rs.'} ${orderData.total.toFixed(2)}`,
      order_summary: orderData.items.map(item => `${item.name} (x${item.quantity}) - Size: ${item.size}`).join('\n'),
      shipping_address: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}`,
    };

    // Uncomment this when you add your keys!
    // await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    
    console.log('✅ Email ready to be sent (Add keys to utils/email.js):', templateParams);
    return true;
  } catch (error) {
    console.error('Email failed to send:', error);
    return false;
  }
};
