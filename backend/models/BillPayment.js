const pool = require('../config/database');

class BillPayment {
  /**
   * Create a new bill payment
   */
  static async create(billData) {
    const {
      user_id,
      service_type,
      service_provider,
      consumer_number,
      amount,
      bill_date,
      due_date,
      paid_from
    } = billData;

    // Calculate convenience fee and commission based on service type
    const fees = this.calculateFees(service_type, amount);

    const query = `
      INSERT INTO bill_payments 
      (user_id, service_type, service_provider, consumer_number, amount, 
       convenience_fee, commission, bill_date, due_date, paid_from, transaction_id, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const transactionId = `BILL${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const values = [
      user_id,
      service_type,
      service_provider,
      consumer_number,
      amount,
      fees.convenience_fee,
      fees.commission,
      bill_date || null,
      due_date || null,
      paid_from,
      transactionId,
      'pending'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Calculate fees based on service type and amount
   */
  static calculateFees(serviceType, amount) {
    let convenienceFee = 0;
    let commission = 0;

    switch (serviceType) {
      case 'mobile':
        convenienceFee = 2;
        commission = amount * 0.01; // 1% commission
        break;
      case 'electricity':
        convenienceFee = 5;
        commission = amount * 0.005; // 0.5% commission
        break;
      case 'water':
      case 'gas':
        convenienceFee = 3;
        commission = amount * 0.008; // 0.8% commission
        break;
      case 'dth':
        convenienceFee = 2;
        commission = amount * 0.012; // 1.2% commission
        break;
      case 'fastag':
        convenienceFee = 1;
        commission = amount * 0.015; // 1.5% commission
        break;
      case 'broadband':
        convenienceFee = 4;
        commission = amount * 0.01; // 1% commission
        break;
      case 'insurance':
        convenienceFee = 10;
        commission = amount * 0.005; // 0.5% commission
        break;
      default:
        convenienceFee = 5;
        commission = amount * 0.01;
    }

    // Cap commission at ₹100
    commission = Math.min(commission, 100);

    return {
      convenience_fee: Math.round(convenienceFee * 100) / 100,
      commission: Math.round(commission * 100) / 100
    };
  }

  /**
   * Get bill payment by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM bill_payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all bill payments for a user
   */
  static async findByUserId(userId, limit = 50) {
    const query = `
      SELECT * FROM bill_payments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * Update payment status
   */
  static async updateStatus(id, status, bbpsReference = null) {
    const query = `
      UPDATE bill_payments 
      SET payment_status = $1, bbps_reference = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, bbpsReference, id]);
    return result.rows[0];
  }

  /**
   * Get bill payment statistics
   */
  static async getStatistics(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(amount), 0) as total_amount_paid,
        COALESCE(SUM(convenience_fee), 0) as total_fees_paid,
        COUNT(CASE WHEN payment_status = 'success' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments
      FROM bill_payments
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Get recent bills by service type
   */
  static async findByServiceType(userId, serviceType) {
    const query = `
      SELECT * FROM bill_payments
      WHERE user_id = $1 AND service_type = $2
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const result = await pool.query(query, [userId, serviceType]);
    return result.rows;
  }

  /**
   * Get saved billers (frequent consumer numbers)
   */
  static async getSavedBillers(userId) {
    const query = `
      SELECT DISTINCT ON (service_type, consumer_number)
        service_type, service_provider, consumer_number,
        MAX(created_at) as last_paid
      FROM bill_payments
      WHERE user_id = $1 AND payment_status = 'success'
      GROUP BY service_type, service_provider, consumer_number
      ORDER BY service_type, consumer_number, last_paid DESC
      LIMIT 20
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Process payment (simulate BBPS integration)
   */
  static async processPayment(billPaymentId, paymentMethod, walletBalance = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get bill payment
      const billResult = await client.query('SELECT * FROM bill_payments WHERE id = $1 FOR UPDATE', [billPaymentId]);
      const bill = billResult.rows[0];

      if (!bill) {
        throw new Error('Bill payment not found');
      }

      if (bill.payment_status !== 'pending') {
        throw new Error('Bill payment already processed');
      }

      const totalAmount = parseFloat(bill.amount) + parseFloat(bill.convenience_fee);

      // Check wallet balance if paying from wallet
      if (paymentMethod === 'wallet') {
        const Wallet = require('./Wallet');
        const wallet = await Wallet.findByUserId(bill.user_id);
        
        if (parseFloat(wallet.balance) < totalAmount) {
          throw new Error('Insufficient wallet balance');
        }

        // Deduct from wallet
        await Wallet.deductMoney(bill.user_id, totalAmount, `Bill payment - ${bill.service_type}`, bill.transaction_id);
      }

      // Update bill status to success
      const bbpsRef = `BBPS${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      await client.query(
        `UPDATE bill_payments 
         SET payment_status = 'success', bbps_reference = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [bbpsRef, billPaymentId]
      );

      await client.query('COMMIT');
      return { success: true, bbps_reference: bbpsRef };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = BillPayment;
