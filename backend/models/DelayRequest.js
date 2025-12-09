const pool = require('../config/database');

class DelayRequest {
  /**
   * Create a new delay request
   */
  static async create(delayData) {
    const {
      loan_id,
      user_id,
      emi_month,
      original_due_date,
      new_due_date,
      delay_fee,
      extra_interest,
      total_charge,
      reason
    } = delayData;

    const query = `
      INSERT INTO delay_requests 
      (loan_id, user_id, emi_month, original_due_date, new_due_date, delay_fee, extra_interest, total_charge, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      loan_id,
      user_id,
      emi_month,
      original_due_date,
      new_due_date,
      delay_fee,
      extra_interest,
      total_charge,
      reason || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get delay request by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM delay_requests WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all delay requests for a loan
   */
  static async findByLoanId(loanId) {
    const query = `
      SELECT dr.*, u.full_name, u.email
      FROM delay_requests dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.loan_id = $1
      ORDER BY dr.created_at DESC
    `;
    const result = await pool.query(query, [loanId]);
    return result.rows;
  }

  /**
   * Get all delay requests for a user
   */
  static async findByUserId(userId) {
    const query = `
      SELECT dr.*, l.amount as loan_amount, l.status as loan_status
      FROM delay_requests dr
      JOIN loans l ON dr.loan_id = l.id
      WHERE dr.user_id = $1
      ORDER BY dr.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Approve delay request
   */
  static async approve(id) {
    const query = `
      UPDATE delay_requests 
      SET status = 'approved', processed_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Reject delay request
   */
  static async reject(id) {
    const query = `
      UPDATE delay_requests 
      SET status = 'rejected', processed_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get delay statistics for a user
   */
  static async getUserStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_delays,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_delays,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_delays,
        COALESCE(SUM(total_charge), 0) as total_charges_paid
      FROM delay_requests
      WHERE user_id = $1 AND status = 'approved'
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Calculate delay charges
   */
  static calculateCharges(emiAmount, delayDays, hasFlexSubscription) {
    // Delay fee: ₹10-30 based on EMI amount
    let delayFee = 10;
    if (emiAmount > 10000) delayFee = 30;
    else if (emiAmount > 5000) delayFee = 20;

    // Extra interest: 0.1-0.2% per day
    const dailyInterestRate = hasFlexSubscription ? 0.001 : 0.002; // 0.1% vs 0.2%
    const extraInterest = emiAmount * dailyInterestRate * delayDays;

    // Flex+ subscribers get 50% discount on delay fee
    if (hasFlexSubscription) {
      delayFee = delayFee / 2;
    }

    return {
      delay_fee: Math.round(delayFee * 100) / 100,
      extra_interest: Math.round(extraInterest * 100) / 100,
      total_charge: Math.round((delayFee + extraInterest) * 100) / 100
    };
  }
}

module.exports = DelayRequest;
