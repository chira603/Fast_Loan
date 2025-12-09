import api from './api';

export async function createRazorpayOrder(amount, purpose, notes = {}) {
  const res = await api.post('/payments/razorpay/order', { amount, purpose, notes });
  return res.data || res;
}

export async function verifyRazorpayPayment(payload) {
  const res = await api.post('/payments/razorpay/verify', payload);
  return res.data || res;
}

export function openRazorpayCheckout({ keyId, orderId, amount, currency = 'INR', name = 'FAST LOAN', description = 'Payment', prefill = {}, notes = {}, theme = { color: '#007BFF' } }) {
  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill,
      notes,
      theme,
      handler: function (response) {
        resolve(response); // contains razorpay_payment_id, razorpay_order_id, razorpay_signature
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
}
