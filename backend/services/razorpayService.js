const Razorpay = require('razorpay');
const crypto = require('crypto');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;

if (!key_id || !key_secret) {
  console.warn('⚠️ RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are not set. Razorpay features will be disabled.');
} else {
  razorpay = new Razorpay({ key_id, key_secret });
}

/**
 * Create a Razorpay order
 * @param {number} amountInPaise - amount in paise
 * @param {string} receipt - unique receipt id
 * @param {object} notes - optional notes
 */
async function createOrder(amountInPaise, receipt, notes = {}) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
    payment_capture: 1,
  });
  return order;
}

/**
 * Verify payment signature from Razorpay Checkout
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 */
function verifySignature(orderId, paymentId, signature) {
  if (!key_secret) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_SECRET in environment variables.');
  }
  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  return generatedSignature === signature;
}

module.exports = { createOrder, verifySignature, key_id };
